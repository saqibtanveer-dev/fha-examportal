'use server';

import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/utils/serialize';

export type StudentDashboardStats = {
  newExams: number;
  inProgress: number;
  completed: number;
  avgScore: number;
};

/**
 * Server action to fetch student dashboard statistics.
 */
export async function fetchStudentDashboardStatsAction(): Promise<StudentDashboardStats> {
  const session = await requireRole('STUDENT');
  const userId = session.user.id;

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { classId: true, sectionId: true },
  });

  const [completed, inProgress, avgScore, attemptedExamIds] = await Promise.all([
    prisma.examSession.count({ 
      where: { studentId: userId, status: { in: ['SUBMITTED', 'GRADED'] } } 
    }),
    prisma.examSession.count({ 
      where: { studentId: userId, status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } } 
    }),
    prisma.examResult.aggregate({ 
      where: { studentId: userId }, 
      _avg: { percentage: true } 
    }),
    prisma.examSession.findMany({
      where: { studentId: userId },
      select: { examId: true },
      distinct: ['examId'],
    }),
  ]);

  // Calculate new exams (assigned but never attempted)
  let newExams = 0;
  if (studentProfile?.classId) {
    const attemptedIds = new Set(attemptedExamIds.map((s) => s.examId));
    const assignedExams = await prisma.exam.findMany({
      where: {
        deletedAt: null,
        status: { in: ['PUBLISHED', 'ACTIVE'] },
        examClassAssignments: {
          some: {
            classId: studentProfile.classId,
            OR: [
              { sectionId: null }, 
              { sectionId: studentProfile.sectionId ?? undefined }
            ],
          },
        },
      },
      select: { id: true },
    });
    newExams = assignedExams.filter((e) => !attemptedIds.has(e.id)).length;
  }

  return serialize({
    newExams,
    inProgress,
    completed,
    avgScore: avgScore._avg.percentage ?? 0,
  });
}
