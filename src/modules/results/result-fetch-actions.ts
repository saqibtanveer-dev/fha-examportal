'use server';

import {
  getResultsByExam,
  getExamDetailedAnalytics,
  getResultsByStudent,
  getStudentAnalytics,
} from '@/modules/results/result-queries';
import { requireRole } from '@/lib/auth-utils';
import { assertExamAccess } from '@/lib/authorization-guards';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/utils/serialize';
import { safeFetchAction } from '@/lib/safe-action';

export const fetchTeacherExamsAction = safeFetchAction(async () => {
  const session = await requireRole('TEACHER', 'ADMIN', 'PRINCIPAL');
  if (session.user.role === 'TEACHER') {
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
  const exams = await prisma.exam.findMany({
    where: { deletedAt: null },
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

export const fetchResultsByExamAction = safeFetchAction(async (examId: string) => {
  const session = await requireRole('TEACHER', 'ADMIN', 'PRINCIPAL');
  if (session.user.role === 'TEACHER') {
    await assertExamAccess(session.user.id, session.user.role, examId);
  }
  const results = await getResultsByExam(examId);
  return serialize(results);
});

export const fetchExamAnalyticsAction = safeFetchAction(async (examId: string) => {
  const session = await requireRole('TEACHER', 'ADMIN', 'PRINCIPAL');
  if (session.user.role === 'TEACHER') {
    await assertExamAccess(session.user.id, session.user.role, examId);
  }
  const analytics = await getExamDetailedAnalytics(examId);
  return serialize(analytics);
});

export const fetchStudentResultsAction = safeFetchAction(async () => {
  const session = await requireRole('STUDENT');
  const results = await getResultsByStudent(session.user.id);
  const analytics = await getStudentAnalytics(session.user.id);
  return serialize({ results, analytics });
});
