'use server';

import { 
  getResultsByExam, 
  getExamDetailedAnalytics, 
  getResultsByStudent, 
  getStudentAnalytics 
} from '@/modules/results/result-queries';
import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/utils/serialize';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Server action for fetching teacher's exams for the results list.
 */
export const fetchTeacherExamsAction = safeFetchAction(async () => {
  const session = await requireRole('TEACHER', 'ADMIN');
  const exams = await prisma.exam.findMany({
    where: { createdById: session.user.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      subject: { select: { code: true } },
      _count: { select: { examResults: true } },
    },
  });
  return serialize(exams);
});

/**
 * Server action for fetching results by exam.
 */
export const fetchResultsByExamAction = safeFetchAction(async (examId: string) => {
  await requireRole('TEACHER', 'ADMIN');
  const results = await getResultsByExam(examId);
  return serialize(results);
});

/**
 * Server action for fetching detailed exam analytics.
 */
export const fetchExamAnalyticsAction = safeFetchAction(async (examId: string) => {
  await requireRole('TEACHER', 'ADMIN');
  const analytics = await getExamDetailedAnalytics(examId);
  return serialize(analytics);
});

/**
 * Server action for fetching student's own results.
 */
export const fetchStudentResultsAction = safeFetchAction(async () => {
  const session = await requireRole('STUDENT');
  const results = await getResultsByStudent(session.user.id);
  const analytics = await getStudentAnalytics(session.user.id);
  return serialize({ results, analytics });
});
