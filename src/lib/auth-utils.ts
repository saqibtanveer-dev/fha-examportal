import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
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

/**
 * Check if the current user can access a session for grading.
 * ADMIN can access all sessions, TEACHER can only access sessions for exams they created.
 */
export function canAccessSession(
  userRole: string,
  userId: string,
  examCreatedById: string,
): boolean {
  if (userRole === 'ADMIN') return true;
  return userId === examCreatedById;
}

/**
 * Assert that a FAMILY user is linked to a specific student.
 * Throws if the link doesn't exist or is inactive.
 */
export async function assertFamilyStudentAccess(
  userId: string,
  studentProfileId: string,
): Promise<void> {
  const link = await prisma.familyStudentLink.findFirst({
    where: {
      familyProfile: { userId },
      studentProfileId,
      isActive: true,
    },
  });
  if (!link) {
    throw new Error('You do not have access to this student.');
  }
}
