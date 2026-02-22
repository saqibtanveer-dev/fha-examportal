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

/**
 * Server action for fetching teacher's exams for the results list.
 */
export async function fetchTeacherExamsAction() {
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
}

/**
 * Server action for fetching results by exam.
 */
export async function fetchResultsByExamAction(examId: string) {
  await requireRole('TEACHER', 'ADMIN');
  const results = await getResultsByExam(examId);
  return serialize(results);
}

/**
 * Server action for fetching detailed exam analytics.
 */
export async function fetchExamAnalyticsAction(examId: string) {
  await requireRole('TEACHER', 'ADMIN');
  const analytics = await getExamDetailedAnalytics(examId);
  return serialize(analytics);
}

/**
 * Server action for fetching student's own results.
 */
export async function fetchStudentResultsAction() {
  const session = await requireRole('STUDENT');
  const results = await getResultsByStudent(session.user.id);
  const analytics = await getStudentAnalytics(session.user.id);
  return serialize({ results, analytics });
}
