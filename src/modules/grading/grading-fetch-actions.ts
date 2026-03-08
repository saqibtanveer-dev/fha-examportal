'use server';

import { getSessionsForGrading, getSessionById } from '@/modules/sessions/session-queries';
import { requireRole } from '@/lib/auth-utils';
import { assertGradingAccess } from '@/lib/authorization-guards';
import { serialize } from '@/utils/serialize';
import { safeFetchAction } from '@/lib/safe-action';
import { prisma } from '@/lib/prisma';

/**
 * Server action wrapper for React Query to fetch grading sessions.
 */
export const fetchGradingSessionsAction = safeFetchAction(async () => {
  const session = await requireRole('TEACHER', 'ADMIN');
  const isAdmin = session.user.role === 'ADMIN';

  // For teachers, get their section assignments for broader visibility
  let teacherSectionFilter: Array<{ classId: string; sectionId: string }> | undefined;
  if (!isAdmin) {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (teacherProfile) {
      teacherSectionFilter = await prisma.teacherSubject.findMany({
        where: { teacherId: teacherProfile.id },
        select: { classId: true, sectionId: true },
      });
    }
  }

  const sessions = await getSessionsForGrading(session.user.id, isAdmin, teacherSectionFilter);
  return serialize(sessions);
});

/**
 * Server action for fetching a single session by ID (with access check).
 */
export const fetchGradingSessionDetailAction = safeFetchAction(async (sessionId: string) => {
  const authSession = await requireRole('TEACHER', 'ADMIN');

  const session = await getSessionById(sessionId);
  if (!session) return null;

  // Verify access: must have grading access to the exam
  await assertGradingAccess(authSession.user.id, authSession.user.role, session.exam.id);

  return serialize(session);
});
