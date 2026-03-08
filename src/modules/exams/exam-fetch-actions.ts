'use server';

import { listExams, getExamById, getExamsForStudent } from '@/modules/exams/exam-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import type { PaginationParams } from '@/utils/pagination';
import type { ExamListFilters } from '@/modules/exams/exam-queries';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Server action wrapper for client-side React Query to fetch exams.
 */
export const fetchExamsAction = safeFetchAction(async (
  params: PaginationParams,
  filters: ExamListFilters,
) => {
  const session = await requireRole('TEACHER', 'ADMIN');
  const scopedFilters = {
    ...filters,
    createdById: session.user.role === 'TEACHER' ? session.user.id : filters.createdById,
  };
  const result = await listExams(params, scopedFilters);
  return serialize(result);
});

/**
 * Server action to fetch a single exam detail.
 */
export const fetchExamDetailAction = safeFetchAction(async (id: string) => {
  await requireRole('TEACHER', 'ADMIN');
  const result = await getExamById(id);
  if (!result) return null;
  return serialize(result);
});

/**
 * Server action to fetch exams for the current student.
 * Filters by subject enrollment if elective enrollments are configured.
 */
export const fetchStudentExamsAction = safeFetchAction(async () => {
  const session = await requireRole('STUDENT');
  const userId = session.user.id;

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true, classId: true, sectionId: true },
  });

  if (!studentProfile?.classId) {
    return { exams: [], profile: null };
  }

  // Get current academic session for enrollment filtering
  const academicSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const exams = await getExamsForStudent(
    userId,
    studentProfile.classId,
    studentProfile.sectionId ?? undefined,
    studentProfile.id,
    academicSession?.id,
  );

  return serialize({ exams, profile: studentProfile });
});
