import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export function getDb() {
    if (!getApps().length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
    return getFirestore(getApp());
}

export async function saveMonsterToFirestore(userId: string, monsterId: string, monster: any) {
    const db = getDb();
    await db.collection('users').doc(userId).collection('monsters').doc(monsterId).set(monster);
}

export async function getMonsterFromFirestore(userId: string, monsterId: string) {
    const db = getDb();
    const doc = await db.collection('users').doc(userId).collection('monsters').doc(monsterId).get();
    return doc.exists ? doc.data() : null;
}

export async function listMonstersFromFirestore(userId: string) {
    const db = getDb();
    const snapshot = await db.collection('users').doc(userId).collection('monsters').get();
    return snapshot.docs.map(doc => ({ id: doc.id, monster: doc.data() }));
}

export async function deleteMonsterFromFirestore(userId: string, monsterId: string) {
    const db = getDb();
    await db.collection('users').doc(userId).collection('monsters').doc(monsterId).delete();
}

export async function getMonstersUsingFeature(userId: string, featureId: string) {
    const db = getDb();
    const snapshot = await db
        .collection('users')
        .doc(userId)
        .collection('monsters')
        .where('FeatureIds', 'array-contains', featureId)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, monster: doc.data() }));
}

// ─── Image extraction daily rate limit ───────────────────────────────────────

const DAILY_IMAGE_LIMIT = 20;

function todayUTC(): string {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function imageUsageRef(db: FirebaseFirestore.Firestore, userId: string, date: string) {
    return db
        .collection('users')
        .doc(userId)
        .collection('usage')
        .doc(`image-extraction-${date}`);
}

/**
 * Atomically increments the user's daily image extraction counter.
 * Returns { allowed: true, used: number } if under the limit,
 * or { allowed: false, used: number, limit: number } if the limit is reached.
 */
export async function checkAndIncrementImageUsage(
    userId: string,
): Promise<{ allowed: true; used: number } | { allowed: false; used: number; limit: number }> {
    const db = getDb();
    const date = todayUTC();
    const ref = imageUsageRef(db, userId, date);

    const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const current: number = snap.exists ? (snap.data()?.count ?? 0) : 0;

        if (current >= DAILY_IMAGE_LIMIT) {
            return { allowed: false as const, used: current, limit: DAILY_IMAGE_LIMIT };
        }

        tx.set(ref, { count: current + 1, date, updatedAt: new Date().toISOString() }, { merge: true });
        return { allowed: true as const, used: current + 1 };
    });

    return result;
}

/**
 * Returns the current daily image extraction usage for a user (read-only).
 */
export async function getImageUsageToday(userId: string): Promise<{ used: number; limit: number }> {
    const db = getDb();
    const snap = await imageUsageRef(db, userId, todayUTC()).get();
    const used: number = snap.exists ? (snap.data()?.count ?? 0) : 0;
    return { used, limit: DAILY_IMAGE_LIMIT };
}
