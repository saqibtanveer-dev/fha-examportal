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
 * Assert that a TEACHER user is assigned to a specific class (via TeacherSubject).
 * Throws if no assignment exists. Skips check for ADMIN/PRINCIPAL roles.
 */
export async function assertTeacherClassAccess(
  userId: string,
  role: string,
  classId: string,
): Promise<void> {
  if (role === 'ADMIN' || role === 'PRINCIPAL') return;
  if (role !== 'TEACHER') throw new Error('Access denied');

  const assignment = await prisma.teacherSubject.findFirst({
    where: {
      teacher: { userId },
      classId,
    },
  });
  if (!assignment) {
    throw new Error('You are not assigned to this class.');
  }
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
