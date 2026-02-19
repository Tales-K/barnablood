import { listMonsters } from './gcs';
import { saveMonsterToFirestore, listMonstersFromFirestore } from './firestore';
import { saveFeature } from './firestoreFeatures';
import { getFirestore } from 'firebase-admin/firestore';
import type { FeatureCategory } from '@/types/feature';

// ---------------------------------------------------------------------------
// Migrate embedded features (Traits/Actions/Reactions/LegendaryActions) from
// all of the user's monsters into the dedicated features collection.
// Each unique feature entry is assigned a stable UUID. The monster is then
// updated with FeatureIds pointing to those docs.
// Runs at most once per user (guarded by the `featuresMigrated` flag).
// ---------------------------------------------------------------------------
export async function migrateEmbeddedFeaturesToCollection(userEmail: string) {
    const db = getFirestore();
    const userRef = db.collection('users').doc(userEmail);
    const userDoc = await userRef.get();

    if (userDoc.data()?.featuresMigrated) {
        return; // already done
    }

    console.log(`[MIGRATION] Extracting embedded features for user: ${userEmail}`);
    const monsters = await listMonstersFromFirestore(userEmail);

    const CATEGORIES: FeatureCategory[] = ['Traits', 'Actions', 'Reactions', 'LegendaryActions'];

    let totalFeatures = 0;
    for (const { id: monsterId, monster } of monsters) {
        // Skip monsters that already use the new FeatureIds model.
        if (Array.isArray((monster as any).FeatureIds)) continue;

        const featureIds: string[] = [];

        for (const category of CATEGORIES) {
            const entries: Array<{ Name: string; Content: string; Usage?: string }> =
                (monster as any)[category] ?? [];

            for (const entry of entries) {
                const featureId = crypto.randomUUID();
                await saveFeature(userEmail, featureId, {
                    Name: entry.Name ?? '',
                    Content: entry.Content ?? '',
                    ...(entry.Usage ? { Usage: entry.Usage } : {}),
                    Category: category,
                });
                featureIds.push(featureId);
                totalFeatures++;
            }
        }

        await saveMonsterToFirestore(userEmail, monsterId, {
            ...(monster as object),
            FeatureIds: featureIds,
        });
        console.log(
            `[MIGRATION] Monster ${monsterId}: extracted ${featureIds.length} feature(s).`
        );
    }

    await userRef.set({ featuresMigrated: true }, { merge: true });
    console.log(
        `[MIGRATION] Features extraction done for ${userEmail}. Total: ${totalFeatures}.`
    );
}

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
