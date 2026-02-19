import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMonsterFromFirestore, saveMonsterToFirestore, deleteMonsterFromFirestore } from '@/lib/firestore';
import { monsterSchema } from '@/types/monster';
import { z } from 'zod';

// GET /api/monsters/[id] - Get a specific monster
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: monsterId } = await params;
        const monster = await getMonsterFromFirestore(session.user.email, monsterId);

        if (!monster) {
            return NextResponse.json({ error: 'Monster not found' }, { status: 404 });
        }

        return NextResponse.json({ id: monsterId, monster });
    } catch (error) {
        console.error('[GET /api/monsters/[id]] Error getting monster:', error);
        return NextResponse.json(
            { error: 'Failed to get monster' },
            { status: 500 }
        );
    }
}

// PUT /api/monsters/[id] - Update a monster
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: monsterId } = await params;
        const body = await request.json();

        // Validate monster data
        const validatedMonster = monsterSchema.parse(body);

        // Check if monster exists
        const existingMonster = await getMonsterFromFirestore(session.user.email, monsterId);
        if (!existingMonster) {
            return NextResponse.json({ error: 'Monster not found' }, { status: 404 });
        }

        // Save updated monster
        await saveMonsterToFirestore(session.user.email, monsterId, validatedMonster);

        return NextResponse.json({ id: monsterId, monster: validatedMonster });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.warn('[PUT /api/monsters/[id]] Validation error:', error.issues);
            return NextResponse.json(
                { error: 'Invalid monster data', details: error.issues },
                { status: 400 }
            );
        }

        console.error('[PUT /api/monsters/[id]] Internal error:', error);
        return NextResponse.json(
            { error: 'Failed to update monster' },
            { status: 500 }
        );
    }
}

// DELETE /api/monsters/[id] - Delete a specific monster
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: monsterId } = await params;

        // Check if monster exists
        const existingMonster = await getMonsterFromFirestore(session.user.email, monsterId);
        if (!existingMonster) {
            return NextResponse.json({ error: 'Monster not found' }, { status: 404 });
        }

        await deleteMonsterFromFirestore(session.user.email, monsterId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/monsters/[id]] Error deleting monster:', error);
        return NextResponse.json(
            { error: 'Failed to delete monster' },
            { status: 500 }
        );
    }
}