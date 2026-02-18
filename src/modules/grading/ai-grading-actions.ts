'use server';

import { prisma } from '@/lib/prisma';
import { requireRole, canAccessSession } from '@/lib/auth-utils';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { aiGradeAnswer } from './ai-grading-engine';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';

type AiGradeStats = {
  total: number;
  graded: number;
  failed: number;
  needsReview: number;
};

/**
 * AI grade all non-MCQ, ungraded answers in a session.
 * MCQ answers are skipped (handled by deterministic auto-grade).
 */
export async function aiGradeSessionAction(
  sessionId: string,
): Promise<ActionResult<AiGradeStats>> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: {
      exam: { include: { subject: true } },
      studentAnswers: {
        include: {
          examQuestion: {
            include: { question: true },
          },
          answerGrade: true,
        },
      },
    },
  });

  if (!examSession) {
    return { success: false, error: 'Session not found' };
  }

  // Verify teacher owns this exam (admin bypasses)
  if (!canAccessSession(session.user.role, session.user.id, examSession.exam.createdById)) {
    return { success: false, error: 'You can only grade exams you created' };
  }

  // Filter: non-MCQ, ungraded answers
  const answersToGrade = examSession.studentAnswers.filter(
    (a) =>
      a.examQuestion.question.type !== 'MCQ' &&
      !a.answerGrade,
  );

  if (answersToGrade.length === 0) {
    return {
      success: true,
      data: { total: 0, graded: 0, failed: 0, needsReview: 0 },
    };
  }

  const stats: AiGradeStats = {
    total: answersToGrade.length,
    graded: 0,
    failed: 0,
    needsReview: 0,
  };

  // Set session to GRADING status while AI processes
  await prisma.examSession.update({
    where: { id: sessionId },
    data: { status: 'GRADING' },
  });

  // Wrap AI grading in try/catch to prevent session getting stuck in GRADING on crash
  try {
    for (const answer of answersToGrade) {
      const q = answer.examQuestion.question;
      const result = await aiGradeAnswer({
        studentAnswerId: answer.id,
        answerText: answer.answerText ?? '',
        questionType: q.type as 'SHORT_ANSWER' | 'LONG_ANSWER',
        questionTitle: q.title,
        questionDescription: q.description,
        modelAnswer: q.modelAnswer,
        subjectName: examSession.exam.subject.name,
        difficulty: q.difficulty,
        maxMarks: Number(answer.examQuestion.marks),
      });

      if (result.success) {
        stats.graded++;
        if (result.needsReview) stats.needsReview++;
      } else {
        stats.failed++;
      }
    }
  } catch (error) {
    // AI grading crashed — revert to SUBMITTED so teacher can retry
    await prisma.examSession.update({
      where: { id: sessionId },
      data: { status: 'SUBMITTED' },
    });
    return { success: false, error: 'AI grading encountered an unexpected error. Session reverted for retry.' };
  }

  // Only calculate result if ALL answers are graded and no failures
  // If any AI grading failed, keep session in GRADING status for teacher review
  if (stats.failed > 0) {
    // Revert to SUBMITTED so teacher can re-attempt or manually grade failed ones
    await prisma.examSession.update({
      where: { id: sessionId },
      data: { status: 'SUBMITTED' },
    });
  } else {
    // Check if fully graded (including MCQs)
    const { autoGradeMcqAnswers, isSessionFullyGraded } = await import('./grading-engine');
    await autoGradeMcqAnswers(sessionId);
    const fullyGraded = await isSessionFullyGraded(sessionId);

    if (fullyGraded) {
      // Don't auto-finalize — set to GRADING so teacher can review AI grades first
      await prisma.examSession.update({
        where: { id: sessionId },
        data: { status: 'GRADING' },
      });
    } else {
      // Some answers still ungraded, keep in SUBMITTED
      await prisma.examSession.update({
        where: { id: sessionId },
        data: { status: 'SUBMITTED' },
      });
    }
  }

  createAuditLog(session.user.id, 'AI_GRADE_SESSION', 'EXAM_SESSION', sessionId, {
    stats,
  }).catch(() => {});

  revalidatePath('/teacher/grading');
  return { success: true, data: stats };
}

/**
 * AI grade a single answer.
 */
export async function aiGradeSingleAnswerAction(
  studentAnswerId: string,
): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const answer = await prisma.studentAnswer.findUnique({
    where: { id: studentAnswerId },
    include: {
      examQuestion: {
        include: {
          question: true,
          exam: { include: { subject: true } },
        },
      },
    },
  });

  if (!answer) {
    return { success: false, error: 'Answer not found' };
  }

  const q = answer.examQuestion.question;
  if (q.type === 'MCQ') {
    return { success: false, error: 'MCQ answers are auto-graded, not AI-graded' };
  }

  const result = await aiGradeAnswer({
    studentAnswerId: answer.id,
    answerText: answer.answerText ?? '',
    questionType: q.type as 'SHORT_ANSWER' | 'LONG_ANSWER',
    questionTitle: q.title,
    questionDescription: q.description,
    modelAnswer: q.modelAnswer,
    subjectName: answer.examQuestion.exam.subject.name,
    difficulty: q.difficulty,
    maxMarks: Number(answer.examQuestion.marks),
  });

  if (!result.success) {
    return { success: false, error: result.error ?? 'AI grading failed' };
  }

  createAuditLog(session.user.id, 'AI_GRADE_ANSWER', 'STUDENT_ANSWER', studentAnswerId, {
    confidence: result.confidence,
    marksAwarded: result.marksAwarded,
  }).catch(() => {});

  revalidatePath('/teacher/grading');
  return { success: true };
}

/**
 * Teacher approves AI grade (marks as reviewed).
 * Optionally allows modifying marks and feedback.
 */
export async function approveAiGradeAction(
  gradeId: string,
  overrides?: { marksAwarded?: number; feedback?: string },
): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const grade = await prisma.answerGrade.findUnique({
    where: { id: gradeId },
    include: { studentAnswer: { include: { examQuestion: true } } },
  });

  if (!grade) return { success: false, error: 'Grade not found' };

  const updateData: Record<string, unknown> = {
    isReviewed: true,
    reviewedAt: new Date(),
    graderId: session.user.id,
  };

  // Allow teacher to override AI marks/feedback
  if (overrides?.marksAwarded !== undefined) {
    const maxMarks = Number(grade.studentAnswer.examQuestion.marks);
    if (overrides.marksAwarded < 0 || overrides.marksAwarded > maxMarks) {
      return { success: false, error: `Marks must be between 0 and ${maxMarks}` };
    }
    updateData.marksAwarded = overrides.marksAwarded;
  }
  if (overrides?.feedback !== undefined) {
    updateData.feedback = overrides.feedback;
  }

  await prisma.answerGrade.update({
    where: { id: gradeId },
    data: updateData,
  });

  createAuditLog(session.user.id, 'APPROVE_AI_GRADE', 'ANSWER_GRADE', gradeId, {
    overrides: overrides ?? null,
  }).catch(() => {});
  revalidatePath('/teacher/grading');
  revalidatePath('/teacher/results');
  return { success: true };
}

/**
 * Teacher explicitly finalizes a session after reviewing AI grades.
 * Calculates the final result and publishes it.
 */
export async function finalizeSessionAction(
  sessionId: string,
): Promise<ActionResult> {
  const authSession = await requireRole('TEACHER', 'ADMIN');

  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { select: { title: true, createdById: true } } },
  });

  if (!examSession) return { success: false, error: 'Session not found' };

  // Verify teacher owns this exam
  if (!canAccessSession(authSession.user.role, authSession.user.id, examSession.exam.createdById)) {
    return { success: false, error: 'You can only finalize exams you created' };
  }

  if (!['SUBMITTED', 'GRADING'].includes(examSession.status)) {
    return { success: false, error: 'Session is not in a gradable state' };
  }

  // Import grading engine
  const { autoGradeMcqAnswers, isSessionFullyGraded, calculateResult } = await import('./grading-engine');
  const { createNotification } = await import('@/modules/notifications/notification-queries');

  // Auto-grade any remaining MCQs
  await autoGradeMcqAnswers(sessionId);

  // Check if all answers are graded
  const fullyGraded = await isSessionFullyGraded(sessionId);
  if (!fullyGraded) {
    return { success: false, error: 'Not all answers are graded yet. Please grade remaining answers first.' };
  }

  // Calculate and save result
  const result = await calculateResult(sessionId);

  if (result) {
    // Notify student
    await createNotification(
      examSession.studentId,
      'RESULT_PUBLISHED',
      'Result Available',
      `Your result for "${examSession.exam.title}" is now available.`,
      '/student/results',
    );
  }

  createAuditLog(authSession.user.id, 'FINALIZE_SESSION', 'EXAM_SESSION', sessionId, {
    obtainedMarks: result ? Number(result.obtainedMarks) : null,
    percentage: result ? Number(result.percentage) : null,
  }).catch(() => {});

  revalidatePath('/teacher/grading');
  revalidatePath('/teacher/results');
  return { success: true };
}

/**
 * Reopen an already graded session for re-grading/editing.
 * Resets session status back to GRADING.
 */
export async function reopenSessionAction(
  sessionId: string,
): Promise<ActionResult> {
  const authSession = await requireRole('TEACHER', 'ADMIN');

  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { select: { title: true, createdById: true } } },
  });

  if (!examSession) return { success: false, error: 'Session not found' };

  // Verify teacher owns this exam
  if (!canAccessSession(authSession.user.role, authSession.user.id, examSession.exam.createdById)) {
    return { success: false, error: 'You can only reopen exams you created' };
  }

  if (examSession.status !== 'GRADED') {
    return { success: false, error: 'Only graded sessions can be reopened' };
  }

  // Use transaction to atomically reopen session and remove result
  await prisma.$transaction([
    prisma.examSession.update({
      where: { id: sessionId },
      data: { status: 'GRADING' },
    }),
    prisma.examResult.deleteMany({
      where: { sessionId },
    }),
  ]);

  createAuditLog(authSession.user.id, 'REOPEN_SESSION', 'EXAM_SESSION', sessionId).catch(() => {});

  revalidatePath('/teacher/grading');
  revalidatePath('/teacher/results');
  return { success: true };
}
