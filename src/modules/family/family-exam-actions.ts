'use server';

// ============================================
// Family Module — Child Exam Fetch Actions
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Fetch upcoming exams for a child.
 */
export const fetchChildUpcomingExamsAction = safeFetchAction(async (
  studentProfileId: string,
): Promise<ActionResult<{ examId: string; title: string; subject: string; type: string; scheduledAt: string; totalMarks: number }[]>> => {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { classId: true, sectionId: true },
  });

  if (!studentProfile) {
    return { success: false, error: 'Student not found' };
  }

  const now = new Date();

  const exams = await prisma.exam.findMany({
    where: {
      examClassAssignments: { some: { classId: studentProfile.classId } },
      status: { in: ['PUBLISHED', 'ACTIVE'] },
      scheduledStartAt: { gte: now },
    },
    select: {
      id: true,
      title: true,
      type: true,
      scheduledStartAt: true,
      totalMarks: true,
      subject: { select: { name: true } },
    },
    orderBy: { scheduledStartAt: 'asc' },
    take: 20,
  });

  return {
    success: true,
    data: exams.map((e) => ({
      examId: e.id,
      title: e.title,
      subject: e.subject.name,
      type: e.type,
      scheduledAt: e.scheduledStartAt?.toISOString() ?? '',
      totalMarks: Number(e.totalMarks),
    })),
  };
});
