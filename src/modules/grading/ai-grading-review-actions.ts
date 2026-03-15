'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { assertGradingAccess } from '@/lib/authorization-guards';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import { safeAction } from '@/lib/safe-action';
import type { ActionResult } from '@/types/action-result';

import { logger } from '@/lib/logger';
/**
 * Teacher approves AI grade (marks as reviewed).
 * Optionally allows modifying marks and feedback.
 */
export const approveAiGradeAction = safeAction(async function approveAiGradeAction(
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

  await prisma.answerGrade.update({ where: { id: gradeId }, data: updateData });

  createAuditLog(session.user.id, 'APPROVE_AI_GRADE', 'ANSWER_GRADE', gradeId, {
    overrides: overrides ?? null,
  }).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath('/teacher/grading');
  revalidatePath('/teacher/results');
  return { success: true };
});

/**
 * Teacher explicitly finalizes a session after reviewing AI grades.
 * Calculates the final result and publishes it.
 */
export const finalizeSessionAction = safeAction(async function finalizeSessionAction(sessionId: string): Promise<ActionResult> {
  const authSession = await requireRole('TEACHER', 'ADMIN');

  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { select: { id: true, title: true, createdById: true } } },
  });

  if (!examSession) return { success: false, error: 'Session not found' };

  await assertGradingAccess(authSession.user.id, authSession.user.role as 'TEACHER' | 'ADMIN', examSession.exam.id);

  if (!['SUBMITTED', 'GRADING'].includes(examSession.status)) {
    return { success: false, error: 'Session is not in a gradable state' };
  }

  const { autoGradeMcqAnswers, isSessionFullyGraded, calculateResult } = await import('./grading-engine');
  const { createNotification } = await import('@/modules/notifications/notification-queries');

  await autoGradeMcqAnswers(sessionId);

  const fullyGraded = await isSessionFullyGraded(sessionId);
  if (!fullyGraded) {
    return { success: false, error: 'Not all answers are graded yet. Please grade remaining answers first.' };
  }

  const result = await calculateResult(sessionId);

  if (result) {
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
  }).catch((err) => logger.error({ err }, 'Audit log failed'));

  revalidatePath('/teacher/grading');
  revalidatePath('/teacher/results');
  return { success: true };
});

/**
 * Reopen an already graded session for re-grading/editing.
 */
export const reopenSessionAction = safeAction(async function reopenSessionAction(sessionId: string): Promise<ActionResult> {
  const authSession = await requireRole('TEACHER', 'ADMIN');

  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { select: { id: true, title: true, createdById: true } } },
  });

  if (!examSession) return { success: false, error: 'Session not found' };

  await assertGradingAccess(authSession.user.id, authSession.user.role as 'TEACHER' | 'ADMIN', examSession.exam.id);

  if (examSession.status !== 'GRADED') {
    return { success: false, error: 'Only graded sessions can be reopened' };
  }

  await prisma.$transaction([
    prisma.examSession.update({ where: { id: sessionId }, data: { status: 'GRADING' } }),
    prisma.examResult.deleteMany({ where: { sessionId } }),
  ]);

  createAuditLog(authSession.user.id, 'REOPEN_SESSION', 'EXAM_SESSION', sessionId).catch((err) => logger.error({ err }, 'Audit log failed'));

  revalidatePath('/teacher/grading');
  revalidatePath('/teacher/results');
  return { success: true };
});
