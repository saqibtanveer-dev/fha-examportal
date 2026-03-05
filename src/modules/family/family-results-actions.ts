'use server';

// ============================================
// Family Module — Child Results Fetch Actions
// Reuses shared result queries (getResultsByStudent, getStudentAnalytics, getStudentResultDetail)
// ============================================

import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/utils/serialize';
import {
  getResultsByStudent,
  getStudentAnalytics,
  getStudentResultDetail,
} from '@/modules/results/result-queries';

/**
 * Fetch child's results + analytics for family view.
 * Same data shape as student's own results — enables full component reuse.
 */
export async function fetchChildResultsWithAnalyticsAction(studentProfileId: string) {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { userId: true },
  });
  if (!studentProfile) return null;

  const [results, analytics] = await Promise.all([
    getResultsByStudent(studentProfile.userId),
    getStudentAnalytics(studentProfile.userId),
  ]);

  return serialize({ results, analytics });
}

/**
 * Fetch detailed result for a child — same shape as student detail page.
 * AI metadata is stripped (uses student-view query).
 */
export async function fetchChildResultDetailAction(
  studentProfileId: string,
  resultId: string,
) {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { userId: true },
  });
  if (!studentProfile) return null;

  const result = await getStudentResultDetail(resultId, studentProfile.userId);
  return result ? serialize(result) : null;
}
