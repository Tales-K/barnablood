import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listMonstersFromFirestore, saveMonsterToFirestore, deleteMonsterFromFirestore } from '@/lib/firestore';
import { monsterSchema } from '@/types/monster';
import { z } from 'zod';

// GET /api/monsters - List all monsters for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const monsters = await listMonstersFromFirestore(session.user.email);

        return NextResponse.json({ monsters });
    } catch (error) {
        console.error('[GET /api/monsters] Error listing monsters:', error);
        return NextResponse.json(
            { error: 'Failed to list monsters' },
            { status: 500 }
        );
    }
}

// POST /api/monsters - Create a new monster
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate monster data (body should be the monster directly)
        const validatedMonster = monsterSchema.parse(body);

        // Generate unique ID
        const monsterId = crypto.randomUUID();

        // Save to Firestore
        await saveMonsterToFirestore(session.user.email, monsterId, validatedMonster);

        return NextResponse.json({ id: monsterId, monster: validatedMonster });
    } catch (error) {
        // Validation errors (4xx) - show details to user
        if (error instanceof z.ZodError) {
            console.warn('[POST /api/monsters] Validation error:', error.issues);
            return NextResponse.json(
                { error: 'Invalid monster data', details: error.issues },
                { status: 400 }
            );
        }

        // Internal errors (5xx) - log on server, hide from user
        console.error('[POST /api/monsters] Internal error:', error);
        return NextResponse.json(
            { error: 'Failed to create monster' },
            { status: 500 }
        );
    }
}

// DELETE /api/monsters?id=xxx - Delete a monster
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const monsterId = searchParams.get('id');

        if (!monsterId) {
            return NextResponse.json(
                { error: 'Monster ID is required' },
                { status: 400 }
            );
        }

        await deleteMonsterFromFirestore(session.user.email, monsterId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/monsters] Error deleting monster:', error);
        return NextResponse.json(
            { error: 'Failed to delete monster' },
            { status: 500 }
        );
    }
}
