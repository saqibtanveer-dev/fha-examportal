import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

// Re-validate user from DB every 5 minutes instead of trusting stale JWT for 30 days.
// This catches deactivated users, role changes, and deleted accounts promptly.
const REVALIDATION_INTERVAL_MS = 5 * 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.isActive || user.deletedAt) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) return null;

        // Update lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // Initial sign-in: populate token from user object
      if (user) {
        token.id = user.id!;
        token.email = user.email!;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.isActive = user.isActive;
        token.lastChecked = Date.now();
        return token;
      }

      // Subsequent requests: periodically re-validate from DB
      const lastChecked = (token.lastChecked as number) ?? 0;
      if (Date.now() - lastChecked > REVALIDATION_INTERVAL_MS) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, role: true, deletedAt: true, firstName: true, lastName: true },
          });

          if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
            // Force sign-out by marking token as inactive
            token.isActive = false;
          } else {
            token.isActive = dbUser.isActive;
            token.role = dbUser.role;
            token.firstName = dbUser.firstName;
            token.lastName = dbUser.lastName;
          }
        } catch {
          // DB unreachable — keep existing token data, retry next interval
        }
        token.lastChecked = Date.now();
      }

      return token;
    },
  },
});
