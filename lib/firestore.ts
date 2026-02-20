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
