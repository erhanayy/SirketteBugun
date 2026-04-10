import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from './lib/db';
import { users } from './lib/db/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function getUser(identifier: string) {
    try {
        const user = await db.select().from(users).where(
            eq(users.email, identifier)
        ).limit(1);
        return user[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

const nextAuthResult = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ identifier: z.string(), password: z.string().min(4) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { identifier, password } = parsedCredentials.data;
                    const user = await getUser(identifier);
                    if (!user) return null;
                    if (!user.password) return null; // No password set

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.forcePasswordChange = user.forcePasswordChange;
                token.id = user.id ?? ""; // Ensure ID is passed
                token.isApplicationAdmin = user.isApplicationAdmin ?? false;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.forcePasswordChange = token.forcePasswordChange as boolean;
                session.user.id = token.id as string;
                session.user.isApplicationAdmin = token.isApplicationAdmin as boolean;
            }
            return session;
        }
    },
});

export const { auth, signIn, signOut, handlers } = nextAuthResult;
