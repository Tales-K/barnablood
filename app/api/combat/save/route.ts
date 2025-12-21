import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveCombatSession, getCombatSession } from '@/lib/gcs';
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
    sessionId: z.string().max(200),
    monsters: z.array(combatMonsterSchema).max(100), // Max 100 monsters in combat
    version: z.number().int().min(0),
});

// POST /api/combat/save - Save combat session to GCS
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate combat session data
        const validatedData = combatSessionSchema.parse(body);
        const { sessionId, monsters, version } = validatedData;

        const combatSession = { sessionId, monsters, version };

        // Check version for conflict resolution
        const currentSession = await getCombatSession(
            session.user.email,
            sessionId
        );

        // Only conflict if client is more than 1 version behind (allows for sync delay)
        if (currentSession && currentSession.version > version + 1) {
            return NextResponse.json(
                {
                    conflict: true,
                    currentVersion: currentSession,
                    message: 'Newer version exists. Reload to sync.',
                },
                { status: 409 }
            );
        }

        // Increment version and save (use max of current versions)
        const newVersion = Math.max(currentSession?.version || 0, version) + 1;
        const sessionToSave = {
            sessionId,
            monsters,
            version: newVersion,
            lastModified: Date.now(),
        };

        await saveCombatSession(
            session.user.email,
            sessionId,
            sessionToSave
        );

        return NextResponse.json({
            success: true,
            version: newVersion,
        });
    } catch (error) {
        // Validation errors (4xx) - show details to user
        if (error instanceof z.ZodError) {
            console.warn('[POST /api/combat/save] Validation error:', error.issues);
            return NextResponse.json(
                { error: 'Invalid combat session data', details: error.issues },
                { status: 400 }
            );
        }

        // Internal errors (5xx) - log on server, hide from user
        console.error('[POST /api/combat/save] Error saving combat session:', error);
        return NextResponse.json(
            { error: 'Failed to save combat session' },
            { status: 500 }
        );
    }
}

// GET /api/combat/save?sessionId=xxx - Load combat session from GCS
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const combatSession = await getCombatSession(session.user.email, sessionId);

        if (!combatSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({ session: combatSession });
    } catch (error) {
        console.error('Error loading combat session:', error);
        return NextResponse.json(
            { error: 'Failed to load combat session' },
            { status: 500 }
        );
    }
}
