'use server';

// ============================================
// Family Module — Child Exam Fetch Actions
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';
import { safeFetchAction } from '@/lib/safe-action';
import { getStudentVisibleSubjectIds } from '@/lib/enrollment-helpers';

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

  if (!studentProfile || !studentProfile.classId || !studentProfile.sectionId) {
    return { success: false, error: 'Student not found or no class assigned' };
  }

  const academicSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const now = new Date();

  const exams = await prisma.exam.findMany({
    where: {
      examClassAssignments: { some: { classId: studentProfile.classId, sectionId: studentProfile.sectionId } },
      status: { in: ['PUBLISHED', 'ACTIVE'] },
      scheduledStartAt: { gte: now },
    },
    select: {
      id: true,
      title: true,
      type: true,
      subjectId: true,
      scheduledStartAt: true,
      totalMarks: true,
      subject: { select: { name: true } },
    },
    orderBy: { scheduledStartAt: 'asc' },
    take: 20,
  });

  // Filter out exams for elective subjects the child is not enrolled in
  let filteredExams = exams;
  if (academicSession) {
    const visibleSubjects = await getStudentVisibleSubjectIds(
      studentProfileId,
      studentProfile.classId,
      academicSession.id,
    );
    filteredExams = exams.filter((e) => visibleSubjects.has(e.subjectId));
  }

  return {
    success: true,
    data: filteredExams.map((e) => ({
      examId: e.id,
      title: e.title,
      subject: e.subject.name,
      type: e.type,
      scheduledAt: e.scheduledStartAt?.toISOString() ?? '',
      totalMarks: Number(e.totalMarks),
    })),
  };
});
