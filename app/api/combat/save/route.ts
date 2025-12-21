import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveCombatSession, getCombatSession } from '@/lib/gcs';

// POST /api/combat/save - Save combat session to GCS
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, monsters, version } = body;

        if (!sessionId || !monsters || version === undefined) {
            return NextResponse.json(
                { error: 'Invalid session data' },
                { status: 400 }
            );
        }

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
        console.error('Error saving combat session:', error);
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
