'use server';

import { prisma } from '@/lib/prisma';
import { requireRole, getAuthSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { autoGradeMcqAnswers, isSessionFullyGraded, calculateResult } from '@/modules/grading/grading-engine';
import type { ActionResult } from '@/types/action-result';

// ============================================
// Start Exam Session
// ============================================

export async function startSessionAction(examId: string): Promise<ActionResult<{ sessionId: string }>> {
  const session = await requireRole('STUDENT');
  const userId = session.user.id;

  const exam = await prisma.exam.findUnique({
    where: { id: examId, deletedAt: null },
    include: { examQuestions: true, examClassAssignments: true },
  });

  if (!exam) return { success: false, error: 'Exam not found' };
  if (!['PUBLISHED', 'ACTIVE'].includes(exam.status)) return { success: false, error: 'Exam not available' };

  // Enforce exam time window
  const now = new Date();
  if (exam.scheduledStartAt && now < exam.scheduledStartAt) {
    return { success: false, error: 'Exam has not started yet' };
  }
  if (exam.scheduledEndAt && now > exam.scheduledEndAt) {
    return { success: false, error: 'Exam deadline has passed' };
  }

  // Verify student is assigned to exam's class
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { classId: true, sectionId: true },
  });
  if (!studentProfile) return { success: false, error: 'Student profile not found. Contact admin.' };

  const isAssigned = exam.examClassAssignments.some(
    (a) => a.classId === studentProfile.classId && (!a.sectionId || a.sectionId === studentProfile.sectionId),
  );
  if (!isAssigned) return { success: false, error: 'This exam is not assigned to your class' };

  // Use serializable transaction to prevent race condition on maxAttempts
  try {
    const newSession = await prisma.$transaction(async (tx) => {
      // Check for existing active session inside transaction
      const existing = await tx.examSession.findFirst({
        where: { examId, studentId: userId, status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } },
      });
      if (existing) return existing;

      // Count attempts inside transaction to prevent race condition
      const attemptCount = await tx.examSession.count({ where: { examId, studentId: userId } });
      if (exam.maxAttempts && attemptCount >= exam.maxAttempts) {
        throw new Error('Maximum attempts reached');
      }

      return tx.examSession.create({
        data: {
          examId,
          studentId: userId,
          attemptNumber: attemptCount + 1,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    }, {
      isolationLevel: 'Serializable',
    });

    revalidatePath('/student/exams');
    return { success: true, data: { sessionId: newSession.id } };
  } catch (err) {
    if (err instanceof Error && err.message === 'Maximum attempts reached') {
      return { success: false, error: 'Maximum attempts reached' };
    }
    throw err;
  }
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
  const authSession = await requireRole('STUDENT');

  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { include: { examQuestions: true } } },
  });

  if (!session) return { success: false, error: 'Session not found' };
  if (session.studentId !== authSession.user.id) return { success: false, error: 'Access denied' };
  if (session.status !== 'IN_PROGRESS') return { success: false, error: 'Session not active' };

  // Enforce exam duration — reject answers after time expires
  if (session.startedAt && session.exam.duration) {
    const elapsedMinutes = (Date.now() - new Date(session.startedAt).getTime()) / 60000;
    if (elapsedMinutes > session.exam.duration) {
      await prisma.examSession.update({ where: { id: sessionId }, data: { status: 'TIMED_OUT', submittedAt: new Date() } });
      return { success: false, error: 'Exam time has expired' };
    }
  }

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
  const authSession = await requireRole('STUDENT');

  const session = await prisma.examSession.findUnique({ where: { id: sessionId } });
  if (!session) return { success: false, error: 'Session not found' };
  if (session.studentId !== authSession.user.id) return { success: false, error: 'Access denied' };
  if (session.status !== 'IN_PROGRESS') return { success: false, error: 'Session not active' };

  await prisma.examSession.update({
    where: { id: sessionId },
    data: { status: 'SUBMITTED', submittedAt: new Date() },
  });

  // Auto-grade MCQ answers immediately on submission
  await autoGradeMcqAnswers(sessionId);
  const fullyGraded = await isSessionFullyGraded(sessionId);
  if (fullyGraded) {
    // All answers were MCQ — auto-finalize result
    await calculateResult(sessionId);
  } else {
    // Has non-MCQ answers — set to GRADING so it appears in teacher's grading queue
    await prisma.examSession.update({
      where: { id: sessionId },
      data: { status: 'GRADING' },
    });
  }

  revalidatePath('/student/exams');
  revalidatePath('/student/results');
  revalidatePath('/teacher/grading');
  return { success: true };
}
