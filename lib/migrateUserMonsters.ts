import { listMonsters } from './gcs';
import { saveMonsterToFirestore, listMonstersFromFirestore } from './firestore';
import { getFirestore } from 'firebase-admin/firestore';

export async function migrateUserMonstersIfNeeded(userEmail: string) {
    const firestoreMonsters = await listMonstersFromFirestore(userEmail);
    if (firestoreMonsters.length > 0) {
        console.log(`[MIGRATION] User ${userEmail} already migrated to Firestore.`);
        return;
    }
    console.log(`[MIGRATION] Migrating monsters for user: ${userEmail}`);
    const gcsMonsters = await listMonsters(userEmail);
    if (gcsMonsters.length === 0) {
        console.log(`[MIGRATION] No monsters found in GCS for user: ${userEmail}`);
        return;
    }
    for (const { id, monster } of gcsMonsters) {
        await saveMonsterToFirestore(userEmail, id, monster);
        console.log(`[MIGRATION] Migrated monster ${id} for user ${userEmail}`);
    }
    // Optionally, mark user as migrated (e.g., set a flag in Firestore)
    try {
        const db = getFirestore();
        await db.collection('users').doc(userEmail).set({ migrated: true }, { merge: true });
        console.log(`[MIGRATION] Marked user ${userEmail} as migrated.`);
    } catch (err) {
        console.warn(`[MIGRATION] Could not mark user as migrated: ${userEmail}`, err);
    }
}
