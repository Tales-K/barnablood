import { getDb } from './firestore';

const ACTIVE_SESSION_ID = 'active';

export async function saveCombatSession(userId: string, session: object) {
    const db = getDb();
    await db
        .collection('users')
        .doc(userId)
        .collection('combatSessions')
        .doc(ACTIVE_SESSION_ID)
        .set(session);
}

export async function getCombatSession(userId: string) {
    const db = getDb();
    const doc = await db
        .collection('users')
        .doc(userId)
        .collection('combatSessions')
        .doc(ACTIVE_SESSION_ID)
        .get();
    return doc.exists ? doc.data() : null;
}

export async function deleteCombatSession(userId: string) {
    const db = getDb();
    await db
        .collection('users')
        .doc(userId)
        .collection('combatSessions')
        .doc(ACTIVE_SESSION_ID)
        .delete();
}
