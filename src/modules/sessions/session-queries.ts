import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export type SessionWithDetails = Prisma.ExamSessionGetPayload<{
  include: {
    exam: {
      include: {
        subject: { select: { id: true; name: true; code: true } };
        examQuestions: {
          include: { question: { include: { mcqOptions: true } } };
        };
      };
    };
    studentAnswers: { include: { examQuestion: { include: { question: true } }; answerGrade: true } };
    student: { select: { id: true; firstName: true; lastName: true } };
  };
}>;

export async function getSessionById(id: string): Promise<SessionWithDetails | null> {
  return prisma.examSession.findUnique({
    where: { id },
    include: {
      exam: {
        include: {
          subject: { select: { id: true, name: true, code: true } },
          examQuestions: {
            orderBy: { sortOrder: 'asc' },
            include: { question: { include: { mcqOptions: true } } },
          },
        },
      },
      studentAnswers: { include: { examQuestion: { include: { question: true } }, answerGrade: true } },
      student: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function getActiveSessionForStudent(examId: string, studentId: string) {
  return prisma.examSession.findFirst({
    where: { examId, studentId, status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } },
    include: {
      exam: {
        include: {
          examQuestions: {
            orderBy: { sortOrder: 'asc' },
            include: {
              question: {
                include: {
                  mcqOptions: {
                    // SECURITY: Exclude isCorrect to prevent answer leakage during active exams
                    select: {
                      id: true,
                      text: true,
                      label: true,
                      imageUrl: true,
                      sortOrder: true,
                    },
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
      studentAnswers: true,
    },
  });
}

export async function getStudentSessions(studentId: string) {
  return prisma.examSession.findMany({
    where: { studentId },
    orderBy: { startedAt: 'desc' },
    include: {
      exam: {
        include: { subject: { select: { id: true, name: true, code: true } } },
      },
    },
  });
}

export async function getSessionsForGrading(teacherId: string, isAdmin = false) {
  return prisma.examSession.findMany({
    where: {
      status: { in: ['SUBMITTED', 'GRADING'] },
      ...(isAdmin ? {} : { exam: { createdById: teacherId } }),
    },
    orderBy: { submittedAt: 'asc' },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      exam: { include: { subject: { select: { id: true, name: true } } } },
      _count: {
        select: { studentAnswers: true },
      },
    },
    // Ensure anti-cheat fields are included (they are part of the model)
  });
}
