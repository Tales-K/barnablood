
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { migrateUserMonstersIfNeeded } from './migrateUserMonsters';



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
            if (user?.email) {
                // Run migration on login
                await migrateUserMonstersIfNeeded(user.email);
            }
            return true;
        },
    },
});
