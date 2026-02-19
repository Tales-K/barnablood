import { db } from './firestore';

const ACTIVE_SESSION_ID = 'active';

export async function saveCombatSession(userId: string, session: object) {
    await db
        .collection('users')
        .doc(userId)
        .collection('combatSessions')
        .doc(ACTIVE_SESSION_ID)
        .set(session);
}

export async function getCombatSession(userId: string) {
    const doc = await db
        .collection('users')
        .doc(userId)
        .collection('combatSessions')
        .doc(ACTIVE_SESSION_ID)
        .get();
    return doc.exists ? doc.data() : null;
}

export async function deleteCombatSession(userId: string) {
    await db
        .collection('users')
        .doc(userId)
        .collection('combatSessions')
        .doc(ACTIVE_SESSION_ID)
        .delete();
}
