'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { autoGradeMcqAnswers, isSessionFullyGraded, calculateResult } from './grading-engine';

type ActionResult = { success: boolean; error?: string; data?: unknown };

// ============================================
// Auto-grade MCQs for a session
// ============================================

export async function autoGradeSessionAction(sessionId: string): Promise<ActionResult> {
  await requireRole('TEACHER', 'ADMIN');

  const session = await prisma.examSession.findUnique({ where: { id: sessionId } });
  if (!session) return { success: false, error: 'Session not found' };
  if (session.status !== 'SUBMITTED') return { success: false, error: 'Session not submitted' };

  const mcqMarks = await autoGradeMcqAnswers(sessionId);
  const fullyGraded = await isSessionFullyGraded(sessionId);

  if (fullyGraded) {
    await calculateResult(sessionId);
  }

  revalidatePath('/teacher/grading');
  return { success: true, data: { mcqMarks, fullyGraded } };
}

// ============================================
// Manual grade a single answer
// ============================================

export async function gradeAnswerAction(
  answerId: string,
  marksAwarded: number,
  feedback: string,
  graderId: string,
): Promise<ActionResult> {
  await requireRole('TEACHER', 'ADMIN');

  const answer = await prisma.studentAnswer.findUnique({
    where: { id: answerId },
    include: { examQuestion: true },
  });

  if (!answer) return { success: false, error: 'Answer not found' };
  if (marksAwarded > Number(answer.examQuestion.marks)) {
    return { success: false, error: `Max marks: ${String(answer.examQuestion.marks)}` };
  }

  await prisma.answerGrade.upsert({
    where: { studentAnswerId: answerId },
    create: {
      studentAnswerId: answerId,
      gradedBy: 'TEACHER',
      graderId,
      marksAwarded,
      maxMarks: Number(answer.examQuestion.marks),
      feedback,
    },
    update: {
      gradedBy: 'TEACHER',
      graderId,
      marksAwarded,
      feedback,
    },
  });

  // Auto-grade any remaining MCQ answers so the session can be fully graded
  await autoGradeMcqAnswers(answer.sessionId);

  // Check if session is now fully graded
  const fullyGraded = await isSessionFullyGraded(answer.sessionId);
  if (fullyGraded) {
    await calculateResult(answer.sessionId);
  }

  revalidatePath('/teacher/grading');
  return { success: true };
}

// ============================================
// Batch auto-grade all submitted sessions for an exam
// ============================================

export async function batchAutoGradeAction(examId: string): Promise<ActionResult> {
  await requireRole('TEACHER', 'ADMIN');

  const sessions = await prisma.examSession.findMany({
    where: { examId, status: 'SUBMITTED' },
  });

  let graded = 0;
  for (const session of sessions) {
    await autoGradeMcqAnswers(session.id);
    const fullyGraded = await isSessionFullyGraded(session.id);
    if (fullyGraded) {
      await calculateResult(session.id);
      graded++;
    }
  }

  revalidatePath('/teacher/grading');
  return { success: true, data: { totalSessions: sessions.length, fullyGraded: graded } };
}
