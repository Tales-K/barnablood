
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import {
    migrateUserMonstersIfNeeded,
    migrateEmbeddedFeaturesToCollection,
} from './migrateUserMonsters';



export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login page
            return !!auth;
        },
        signIn: async ({ user }) => {
            console.log('[AUTH] signIn callback triggered. user.email:', user?.email ?? '(none)');
            if (user?.email) {
                try {
                    console.log('[AUTH] Starting migrations for:', user.email);
                    // Run GCS → Firestore migration first (idempotent).
                    await migrateUserMonstersIfNeeded(user.email);
                    // Extract embedded features into the features collection (idempotent).
                    await migrateEmbeddedFeaturesToCollection(user.email);
                    console.log('[AUTH] Migrations completed for:', user.email);
                } catch (err) {
                    console.error('[AUTH] Migration error during signIn:', err);
                }
            } else {
                console.warn('[AUTH] signIn callback: no user email, skipping migrations.');
            }
            return true;
        },
    },
});
