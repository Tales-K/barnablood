import { Storage } from '@google-cloud/storage';
import type { Monster } from '@/types/monster';

// Initialize GCS client (only if credentials are available)
let storage: Storage | null = null;
let bucket: ReturnType<Storage['bucket']> | null = null;

// Initialize GCS from individual GCS_* env vars
if (process.env.GCS_BUCKET_NAME) {
    try {
        storage = new Storage({
            projectId: process.env.GCS_PROJECT_ID,
            credentials: {
                type: process.env.GCS_TYPE,
                project_id: process.env.GCS_PROJECT_ID,
                private_key_id: process.env.GCS_PRIVATE_KEY_ID,
                private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.GCS_CLIENT_EMAIL,
                client_id: process.env.GCS_CLIENT_ID,
                universe_domain: process.env.GCS_UNIVERSE_DOMAIN,
            },
        });
        bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
        console.log(`GCS bucket configured: ${process.env.GCS_BUCKET_NAME}`);
    } catch (error) {
        console.error('Failed to initialize GCS client:', error);
    }
} else {
    console.warn('GCS not configured: Missing GCS_BUCKET_NAME');
}

function ensureGCS() {
    if (!bucket) {
        throw new Error(
            'Google Cloud Storage is not configured. ' +
            'Please ensure GCS_BUCKET_NAME and GCS_* credentials are set in your environment.'
        );
    }
    return bucket;
}

/**
 * Save a monster to GCS
 * Path: users/{userEmail}/monsters/{monsterId}.json
 */
export async function saveMonster(
    userEmail: string,
    monsterId: string,
    monster: Monster
): Promise<void> {
    const gcs = ensureGCS();
    const filePath = `users/${userEmail}/monsters/${monsterId}.json`;
    const file = gcs.file(filePath);

    await file.save(JSON.stringify(monster, null, 2), {
        contentType: 'application/json',
        metadata: {
            cacheControl: 'no-cache',
        },
    });
}

/**
 * Get a monster from GCS
 */
export async function getMonster(
    userEmail: string,
    monsterId: string
): Promise<Monster | null> {
    const gcs = ensureGCS();
    const filePath = `users/${userEmail}/monsters/${monsterId}.json`;
    const file = gcs.file(filePath);

    try {
        const [contents] = await file.download();
        return JSON.parse(contents.toString('utf8'));
    } catch (error: any) {
        if (error.code === 404) {
            return null;
        }
        throw error;
    }
}

/**
 * List all monsters for a user
 */
export async function listMonsters(
    userEmail: string
): Promise<Array<{ id: string; monster: Monster }>> {
    const gcs = ensureGCS();
    const prefix = `users/${userEmail}/monsters/`;
    const [files] = await gcs.getFiles({ prefix });

    const monsters = await Promise.all(
        files
            .filter((file) => file.name.endsWith('.json'))
            .map(async (file) => {
                const [contents] = await file.download();
                const monster = JSON.parse(contents.toString('utf8'));
                const id = file.name.split('/').pop()?.replace('.json', '') || '';
                return { id, monster };
            })
    );

    return monsters;
}

/**
 * Delete a monster from GCS
 */
export async function deleteMonster(
    userEmail: string,
    monsterId: string
): Promise<void> {
    const gcs = ensureGCS();
    const filePath = `users/${userEmail}/monsters/${monsterId}.json`;
    const file = gcs.file(filePath);

    await file.delete();
}

/**
 * Save combat session to GCS
 * Path: users/{userEmail}/combat-sessions/{sessionId}.json
 */
export async function saveCombatSession(
    userEmail: string,
    sessionId: string,
    session: any
): Promise<void> {
    const gcs = ensureGCS();
    const filePath = `users/${userEmail}/combat-sessions/${sessionId}.json`;
    const file = gcs.file(filePath);

    await file.save(JSON.stringify(session, null, 2), {
        contentType: 'application/json',
        metadata: {
            cacheControl: 'no-cache',
        },
    });
}

/**
 * Get combat session from GCS
 */
export async function getCombatSession(
    userEmail: string,
    sessionId: string
): Promise<any | null> {
    const gcs = ensureGCS();
    const filePath = `users/${userEmail}/combat-sessions/${sessionId}.json`;
    const file = gcs.file(filePath);

    try {
        const [contents] = await file.download();
        return JSON.parse(contents.toString('utf8'));
    } catch (error: any) {
        if (error.code === 404) {
            return null;
        }
        throw error;
    }
}

/**
 * List all combat sessions for a user
 */
export async function listCombatSessions(
    userEmail: string
): Promise<Array<{ id: string; session: any }>> {
    const gcs = ensureGCS();
    const prefix = `users/${userEmail}/combat-sessions/`;
    const [files] = await gcs.getFiles({ prefix });

    const sessions = await Promise.all(
        files
            .filter((file) => file.name.endsWith('.json'))
            .map(async (file) => {
                const [contents] = await file.download();
                const session = JSON.parse(contents.toString('utf8'));
                const id = file.name.split('/').pop()?.replace('.json', '') || '';
                return { id, session };
            })
    );

    return sessions;
}
