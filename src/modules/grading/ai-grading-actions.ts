'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { aiGradeAnswer } from './ai-grading-engine';
import { calculateResult } from './grading-engine';
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

  // Recalculate result if all answers now graded
  await calculateResult(sessionId);

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
 */
export async function approveAiGradeAction(
  gradeId: string,
): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  await prisma.answerGrade.update({
    where: { id: gradeId },
    data: {
      isReviewed: true,
      reviewedAt: new Date(),
      graderId: session.user.id,
    },
  });

  createAuditLog(session.user.id, 'APPROVE_AI_GRADE', 'ANSWER_GRADE', gradeId).catch(() => {});
  revalidatePath('/teacher/grading');
  return { success: true };
}
