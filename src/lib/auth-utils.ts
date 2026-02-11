import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import type { UserRole } from '@prisma/client';

/**
 * Get the current authenticated session or redirect to login.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect(ROUTES.LOGIN);
  return session;
}

/**
 * Require a specific role or redirect to the user's dashboard.
 */
export async function requireRole(...roles: UserRole[]) {
  const session = await requireAuth();
  const { role } = session.user;

  if (!roles.includes(role)) {
    const dashboard = ROUTES.DASHBOARD[role as keyof typeof ROUTES.DASHBOARD];
    redirect(dashboard ?? ROUTES.LOGIN);
  }

  return session;
}

/**
 * Get the authenticated session for API routes (returns null instead of redirecting).
 */
export async function getAuthSession() {
  return auth();
}
