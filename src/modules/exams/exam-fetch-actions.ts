'use server';

import { listExams, getExamById, getExamsForStudent } from '@/modules/exams/exam-queries';
import { requireRole } from '@/lib/auth-utils';
import { assertExamAccess } from '@/lib/authorization-guards';
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
  // Teachers see exams they created OR exams assigned to their sections
  if (session.user.role === 'TEACHER') {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    const assignments = teacherProfile
      ? await prisma.teacherSubject.findMany({
          where: { teacherId: teacherProfile.id },
          select: { subjectId: true, classId: true, sectionId: true },
        })
      : [];
    const result = await listExams(params, filters, {
      createdById: session.user.id,
      sectionAssignments: assignments,
    });
    return serialize(result);
  }
  const result = await listExams(params, filters);
  return serialize(result);
});

/**
 * Server action to fetch a single exam detail.
 */
export const fetchExamDetailAction = safeFetchAction(async (id: string) => {
  const session = await requireRole('TEACHER', 'ADMIN', 'PRINCIPAL');
  await assertExamAccess(session.user.id, session.user.role, id);
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

  if (!studentProfile?.classId || !studentProfile?.sectionId) {
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
    studentProfile.sectionId,
    studentProfile.id,
    academicSession?.id,
  );

  return serialize({ exams, profile: studentProfile });
});
