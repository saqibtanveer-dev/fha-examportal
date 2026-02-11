import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@prisma/client';
// line to triger fake update

/**
 * Lightweight auth config — NO Prisma, NO bcrypt.
 * Safe to import in Edge middleware (< 1 MB).
 * Full provider logic lives in auth.ts.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [], // populated in auth.ts (providers need Node runtime deps)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.email = user.email!;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email!,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
        role: token.role as UserRole,
        isActive: token.isActive as boolean,
      };
      return session;
    },
  },
} satisfies NextAuthConfig;
