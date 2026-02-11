'use server';

import { prisma } from '@/lib/prisma';
import { requireRole, getAuthSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { autoGradeMcqAnswers, isSessionFullyGraded, calculateResult } from '@/modules/grading/grading-engine';

type ActionResult = { success: boolean; error?: string; data?: unknown };

// ============================================
// Start Exam Session
// ============================================

export async function startSessionAction(examId: string): Promise<ActionResult> {
  const session = await requireRole('STUDENT');
  const userId = session.user.id;

  const exam = await prisma.exam.findUnique({
    where: { id: examId, deletedAt: null },
    include: { examQuestions: true },
  });

  if (!exam) return { success: false, error: 'Exam not found' };
  if (!['PUBLISHED', 'ACTIVE'].includes(exam.status)) return { success: false, error: 'Exam not available' };

  const existing = await prisma.examSession.findFirst({
    where: { examId, studentId: userId, status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } },
  });
  if (existing) return { success: true, data: { sessionId: existing.id } };

  const attemptCount = await prisma.examSession.count({ where: { examId, studentId: userId } });
  if (exam.maxAttempts && attemptCount >= exam.maxAttempts) {
    return { success: false, error: 'Maximum attempts reached' };
  }

  const newSession = await prisma.examSession.create({
    data: {
      examId,
      studentId: userId,
      attemptNumber: attemptCount + 1,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
  });

  revalidatePath('/student/exams');
  return { success: true, data: { sessionId: newSession.id } };
}

// ============================================
// Submit Answer
// ============================================

export async function submitAnswerAction(
  sessionId: string,
  questionId: string,
  answer: string,
  selectedOptionId?: string | null,
): Promise<ActionResult> {
  await requireRole('STUDENT');

  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { include: { examQuestions: true } } },
  });

  if (!session) return { success: false, error: 'Session not found' };
  if (session.status !== 'IN_PROGRESS') return { success: false, error: 'Session not active' };

  const examQuestion = session.exam.examQuestions.find((eq) => eq.questionId === questionId);
  if (!examQuestion) return { success: false, error: 'Question not in exam' };

  await prisma.studentAnswer.upsert({
    where: {
      sessionId_examQuestionId: { sessionId, examQuestionId: examQuestion.id },
    },
    create: {
      sessionId,
      examQuestionId: examQuestion.id,
      answerText: answer,
      selectedOptionId: selectedOptionId ?? null,
      answeredAt: new Date(),
    },
    update: {
      answerText: answer,
      selectedOptionId: selectedOptionId ?? null,
      answeredAt: new Date(),
    },
  });

  return { success: true };
}

// ============================================
// Submit Session (finish exam)
// ============================================

export async function submitSessionAction(sessionId: string): Promise<ActionResult> {
  await requireRole('STUDENT');

  const session = await prisma.examSession.findUnique({ where: { id: sessionId } });
  if (!session) return { success: false, error: 'Session not found' };
  if (session.status !== 'IN_PROGRESS') return { success: false, error: 'Session not active' };

  await prisma.examSession.update({
    where: { id: sessionId },
    data: { status: 'SUBMITTED', submittedAt: new Date() },
  });

  // Auto-grade MCQ answers immediately on submission
  await autoGradeMcqAnswers(sessionId);
  const fullyGraded = await isSessionFullyGraded(sessionId);
  if (fullyGraded) {
    await calculateResult(sessionId);
  }

  revalidatePath('/student/exams');
  revalidatePath('/student/results');
  revalidatePath('/teacher/grading');
  return { success: true };
}
