import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveCombatSession, getCombatSession, deleteCombatSession } from '@/lib/firestoreCombat';
import { z } from 'zod';

// Combat monster validation schema
const combatMonsterSchema = z.object({
    id: z.string().max(200),
    monster: z.any(), // Already validated when created
    currentHP: z.number().int().min(-10000).max(100000),
    maxHP: z.number().int().min(1).max(100000),
    conditions: z.array(z.string().max(100)).max(50),
    notes: z.string().max(5000).optional(),
});

const combatSessionSchema = z.object({
    monsters: z.array(combatMonsterSchema).max(100),
});

// POST /api/combat/save - Save the user's active combat session
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { monsters } = combatSessionSchema.parse(body);

        await saveCombatSession(session.user.email, {
            monsters,
            lastModified: Date.now(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.warn('[POST /api/combat/save] Validation error:', error.issues);
            return NextResponse.json(
                { error: 'Invalid combat session data', details: error.issues },
                { status: 400 }
            );
        }

        console.error('[POST /api/combat/save] Error saving combat session:', error);
        return NextResponse.json(
            { error: 'Failed to save combat session' },
            { status: 500 }
        );
    }
}

// GET /api/combat/save - Load the user's active combat session
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const combatSession = await getCombatSession(session.user.email);

        if (!combatSession) {
            return NextResponse.json({ session: null });
        }

        return NextResponse.json({ session: combatSession });
    } catch (error) {
        console.error('[GET /api/combat/save] Error loading combat session:', error);
        return NextResponse.json(
            { error: 'Failed to load combat session' },
            { status: 500 }
        );
    }
}

// DELETE /api/combat/save - Delete the user's active combat session
export async function DELETE() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await deleteCombatSession(session.user.email);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/combat/save] Error deleting combat session:', error);
        return NextResponse.json(
            { error: 'Failed to delete combat session' },
            { status: 500 }
        );
    }
}
