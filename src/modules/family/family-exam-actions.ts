'use server';

// ============================================
// Family Module — Child Exam & Results Fetch Actions
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';
import type { ChildExamResult } from './family.types';

/**
 * Fetch exam results for a child.
 */
export async function fetchChildExamResultsAction(
  studentProfileId: string,
): Promise<ActionResult<ChildExamResult[]>> {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  // Resolve studentProfile → userId for ExamResult (which uses User.id)
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { userId: true },
  });

  if (!studentProfile) {
    return { success: false, error: 'Student not found' };
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const results = await prisma.examResult.findMany({
    where: {
      studentId: studentProfile.userId,
      ...(currentSession ? { exam: { academicSessionId: currentSession.id } } : {}),
    },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          type: true,
          scheduledEndAt: true,
          totalMarks: true,
          subject: { select: { name: true } },
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  });

  return {
    success: true,
    data: results.map((r) => ({
      examId: r.exam.id,
      examTitle: r.exam.title,
      subjectName: r.exam.subject.name,
      examType: r.exam.type,
      date: r.exam.scheduledEndAt?.toISOString() ?? '',
      totalMarks: Number(r.exam.totalMarks),
      obtainedMarks: Number(r.obtainedMarks),
      percentage: Number(r.percentage),
      grade: r.grade,
      status: r.publishedAt ? 'Graded' : 'Pending',
    })),
  };
}

/**
 * Fetch upcoming exams for a child.
 */
export async function fetchChildUpcomingExamsAction(
  studentProfileId: string,
): Promise<ActionResult<{ examId: string; title: string; subject: string; type: string; scheduledAt: string; totalMarks: number }[]>> {
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
}
