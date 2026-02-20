import { getDb } from './firestore';
import type { Feature } from '@/types/feature';

export async function saveFeature(userId: string, featureId: string, feature: Feature) {
    const db = getDb();
    await db
        .collection('users')
        .doc(userId)
        .collection('features')
        .doc(featureId)
        .set(feature);
}

export async function getFeature(userId: string, featureId: string) {
    const db = getDb();
    const doc = await db
        .collection('users')
        .doc(userId)
        .collection('features')
        .doc(featureId)
        .get();
    return doc.exists ? { id: doc.id, ...(doc.data() as Feature) } : null;
}

export async function listFeatures(userId: string) {
    const db = getDb();
    const snapshot = await db
        .collection('users')
        .doc(userId)
        .collection('features')
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Feature) }));
}

export async function deleteFeature(userId: string, featureId: string) {
    const db = getDb();
    await db
        .collection('users')
        .doc(userId)
        .collection('features')
        .doc(featureId)
        .delete();
}
