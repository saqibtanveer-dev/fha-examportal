'use server';

import { listExams, getExamById, getExamsForStudent } from '@/modules/exams/exam-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import type { PaginationParams } from '@/utils/pagination';
import type { ExamListFilters } from '@/modules/exams/exam-queries';

/**
 * Server action wrapper for client-side React Query to fetch exams.
 */
export async function fetchExamsAction(
  params: PaginationParams,
  filters: ExamListFilters,
) {
  const session = await requireRole('TEACHER', 'ADMIN');
  const scopedFilters = {
    ...filters,
    createdById: session.user.role === 'TEACHER' ? session.user.id : filters.createdById,
  };
  const result = await listExams(params, scopedFilters);
  return serialize(result);
}

/**
 * Server action to fetch a single exam detail.
 */
export async function fetchExamDetailAction(id: string) {
  await requireRole('TEACHER', 'ADMIN');
  const result = await getExamById(id);
  if (!result) return null;
  return serialize(result);
}

/**
 * Server action to fetch exams for the current student.
 */
export async function fetchStudentExamsAction() {
  const session = await requireRole('STUDENT');
  const userId = session.user.id;

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { classId: true, sectionId: true },
  });

  if (!studentProfile?.classId) {
    return { exams: [], profile: null };
  }

  const exams = await getExamsForStudent(
    userId,
    studentProfile.classId,
    studentProfile.sectionId ?? undefined,
  );

  return serialize({ exams, profile: studentProfile });
}
