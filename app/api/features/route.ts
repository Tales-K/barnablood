import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listFeatures, saveFeature } from '@/lib/firestoreFeatures';
import { listMonstersFromFirestore } from '@/lib/firestore';
import { featureSchema } from '@/types/feature';
import { z } from 'zod';

// GET /api/features - List all features for the authenticated user
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [features, monsters] = await Promise.all([
            listFeatures(session.user.email),
            listMonstersFromFirestore(session.user.email),
        ]);

        // Build featureId -> monster count map
        const countMap: Record<string, number> = {};
        for (const { monster } of monsters) {
            const ids: string[] = (monster as { FeatureIds?: string[] }).FeatureIds ?? [];
            for (const id of ids) {
                countMap[id] = (countMap[id] ?? 0) + 1;
            }
        }

        const featuresWithCounts = features.map(f => ({
            ...f,
            monsterCount: countMap[f.id] ?? 0,
        }));

        return NextResponse.json({ features: featuresWithCounts });
    } catch (error) {
        console.error('[GET /api/features]', error);
        return NextResponse.json({ error: 'Failed to list features' }, { status: 500 });
    }
}

// POST /api/features - Create a new feature
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validated = featureSchema.parse(body);
        const featureId = crypto.randomUUID();
        await saveFeature(session.user.email, featureId, validated);

        return NextResponse.json({ id: featureId, ...validated });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid feature data', details: error.issues }, { status: 400 });
        }
        console.error('[POST /api/features]', error);
        return NextResponse.json({ error: 'Failed to create feature' }, { status: 500 });
    }
}
