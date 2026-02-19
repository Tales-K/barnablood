import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getFeature, saveFeature, deleteFeature } from '@/lib/firestoreFeatures';
import {
    getMonstersUsingFeature,
    saveMonsterToFirestore,
} from '@/lib/firestore';
import { featureSchema } from '@/types/feature';
import type { FeatureWithId } from '@/types/feature';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Helper: rebuild a monster's embedded category arrays from its FeatureIds.
// This fetches every feature doc and re-buckets them in FeatureIds order.
// ---------------------------------------------------------------------------
async function rebuildEmbeddedArrays(userId: string, monster: Record<string, unknown>) {
    const featureIds: string[] = (monster.FeatureIds as string[]) ?? [];

    const features = (
        await Promise.all(featureIds.map((id) => getFeature(userId, id)))
    ).filter(Boolean) as FeatureWithId[];

    const pick = (f: FeatureWithId) => ({
        Name: f.Name,
        Content: f.Content,
        ...(f.Usage ? { Usage: f.Usage } : {}),
    });

    return {
        ...monster,
        Traits: features.filter((f) => f.Category === 'Traits').map(pick),
        Actions: features.filter((f) => f.Category === 'Actions').map(pick),
        Reactions: features.filter((f) => f.Category === 'Reactions').map(pick),
        LegendaryActions: features
            .filter((f) => f.Category === 'LegendaryActions')
            .map(pick),
    };
}

// ---------------------------------------------------------------------------
// GET /api/features/[id]
// Returns the feature plus the count of monsters that reference it.
// ---------------------------------------------------------------------------
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const feature = await getFeature(session.user.email, id);
        if (!feature) {
            return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
        }

        const affectedMonsters = await getMonstersUsingFeature(session.user.email, id);

        return NextResponse.json({ feature, monsterCount: affectedMonsters.length });
    } catch (error) {
        console.error('[GET /api/features/[id]]', error);
        return NextResponse.json({ error: 'Failed to get feature' }, { status: 500 });
    }
}

// ---------------------------------------------------------------------------
// PUT /api/features/[id]
// Body: { feature: Feature, scope: 'all' | 'this', monsterId?: string }
//
//   scope='all'  → update the feature doc + sync every monster's embedded arrays.
//   scope='this' → create a brand-new feature doc + swap the old ID with the new
//                   one in the specified monster only.
// ---------------------------------------------------------------------------
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = featureSchema.parse(body.feature);
        const scope: 'all' | 'this' = body.scope ?? 'all';
        const monsterId: string | undefined = body.monsterId;
        const userId = session.user.email;

        if (scope === 'all') {
            // 1. Persist updated feature.
            await saveFeature(userId, id, validated);

            // 2. Rebuild embedded arrays in every monster that references this feature.
            const affected = await getMonstersUsingFeature(userId, id);
            await Promise.all(
                affected.map(async ({ id: monId, monster }) => {
                    const updated = await rebuildEmbeddedArrays(
                        userId,
                        monster as Record<string, unknown>
                    );
                    await saveMonsterToFirestore(userId, monId, updated);
                })
            );

            return NextResponse.json({
                success: true,
                newFeatureId: id,
                updatedMonsters: affected.length,
            });
        } else {
            // scope === 'this'
            if (!monsterId) {
                return NextResponse.json(
                    { error: 'monsterId is required when scope is "this"' },
                    { status: 400 }
                );
            }

            // 1. Create a new feature document with a new ID.
            const newFeatureId = crypto.randomUUID();
            await saveFeature(userId, newFeatureId, validated);

            // 2. Update only the specified monster: swap old ID → new ID.
            const { getMonsterFromFirestore } = await import('@/lib/firestore');
            const monsterData = (await getMonsterFromFirestore(
                userId,
                monsterId
            )) as Record<string, unknown> | null;

            if (!monsterData) {
                return NextResponse.json({ error: 'Monster not found' }, { status: 404 });
            }

            const oldFeatureIds: string[] = (monsterData.FeatureIds as string[]) ?? [];
            const newFeatureIds = oldFeatureIds.map((fid) =>
                fid === id ? newFeatureId : fid
            );

            const withNewIds = { ...monsterData, FeatureIds: newFeatureIds };
            const rebuilt = await rebuildEmbeddedArrays(userId, withNewIds);
            await saveMonsterToFirestore(userId, monsterId, rebuilt);

            return NextResponse.json({ success: true, newFeatureId });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid feature data', details: error.issues },
                { status: 400 }
            );
        }
        console.error('[PUT /api/features/[id]]', error);
        return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 });
    }
}

// ---------------------------------------------------------------------------
// DELETE /api/features/[id]
// Deletes the feature doc and removes the ID from every monster's FeatureIds.
// ---------------------------------------------------------------------------
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = session.user.email;

        // Grab affected monsters BEFORE deleting the feature doc.
        const affected = await getMonstersUsingFeature(userId, id);

        // 1. Delete the feature document.
        await deleteFeature(userId, id);

        // 2. Remove the feature ID from each monster's FeatureIds + rebuild embedded arrays.
        await Promise.all(
            affected.map(async ({ id: monId, monster }) => {
                const m = monster as Record<string, unknown>;
                const newFeatureIds = ((m.FeatureIds as string[]) ?? []).filter(
                    (fid) => fid !== id
                );
                const withoutId = { ...m, FeatureIds: newFeatureIds };
                const rebuilt = await rebuildEmbeddedArrays(userId, withoutId);
                await saveMonsterToFirestore(userId, monId, rebuilt);
            })
        );

        return NextResponse.json({ success: true, updatedMonsters: affected.length });
    } catch (error) {
        console.error('[DELETE /api/features/[id]]', error);
        return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 });
    }
}
