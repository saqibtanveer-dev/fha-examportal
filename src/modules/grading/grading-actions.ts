'use server';

import { prisma } from '@/lib/prisma';
import { requireRole, canAccessSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { autoGradeMcqAnswers, isSessionFullyGraded, calculateResult } from './grading-engine';
import { createNotification } from '@/modules/notifications/notification-queries';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

/** Notify student when their session is fully graded */
async function notifyStudentIfGraded(sessionId: string) {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { select: { title: true } } },
  });
  if (!session) return;
  await createNotification(
    session.studentId,
    'RESULT_PUBLISHED',
    'Result Available',
    `Your result for "${session.exam.title}" is now available.`,
    '/student/results',
  );
}

// ============================================
// Auto-grade MCQs for a session
// ============================================

export async function autoGradeSessionAction(sessionId: string): Promise<ActionResult<{ mcqMarks: number; fullyGraded: boolean }>> {
  const authSession = await requireRole('TEACHER', 'ADMIN');

  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { select: { createdById: true } } },
  });
  if (!session) return { success: false, error: 'Session not found' };

  // Verify teacher owns this exam
  if (!canAccessSession(authSession.user.role, authSession.user.id, session.exam.createdById)) {
    return { success: false, error: 'You can only grade exams you created' };
  }

  if (!['SUBMITTED', 'GRADING'].includes(session.status)) {
    return { success: false, error: 'Session is not in a gradable state' };
  }

  const mcqMarks = await autoGradeMcqAnswers(sessionId);
  const fullyGraded = await isSessionFullyGraded(sessionId);

  if (fullyGraded) {
    // All answers are MCQ and auto-graded — finalize
    await calculateResult(sessionId);
    await notifyStudentIfGraded(sessionId);
  } else {
    // Has non-MCQ answers that need manual/AI grading
    await prisma.examSession.update({
      where: { id: sessionId },
      data: { status: 'GRADING' },
    });
  }

  createAuditLog(authSession.user.id, 'AUTO_GRADE_SESSION', 'EXAM_SESSION', sessionId, { mcqMarks, fullyGraded }).catch(() => {});
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
): Promise<ActionResult> {
  const authSession = await requireRole('TEACHER', 'ADMIN');
  const graderId = authSession.user.id;

  const answer = await prisma.studentAnswer.findUnique({
    where: { id: answerId },
    include: {
      examQuestion: {
        include: { exam: { select: { createdById: true } } },
      },
    },
  });

  if (!answer) return { success: false, error: 'Answer not found' };

  // Verify teacher owns this exam
  if (!canAccessSession(authSession.user.role, graderId, answer.examQuestion.exam.createdById)) {
    return { success: false, error: 'You can only grade exams you created' };
  }

  if (marksAwarded < 0) return { success: false, error: 'Marks cannot be negative' };
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

  createAuditLog(authSession.user.id, 'GRADE_ANSWER', 'ANSWER', answerId, { marksAwarded, feedback }).catch(() => {});
  revalidatePath('/teacher/grading');
  revalidatePath('/teacher/results');
  return { success: true };
}

// ============================================
// Batch grade multiple answers at once
// ============================================

type BatchGradeItem = {
  answerId: string;
  marksAwarded: number;
  feedback: string;
};

export async function batchGradeAnswersAction(
  sessionId: string,
  grades: BatchGradeItem[],
  autoFinalize = false,
): Promise<ActionResult<{ graded: number; errors: string[] }>> {
  const authSession = await requireRole('TEACHER', 'ADMIN');
  const graderId = authSession.user.id;

  if (grades.length === 0) {
    return { success: false, error: 'No grades provided' };
  }

  // Validate session exists and is in a gradable state
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exam: { select: { createdById: true } } },
  });
  if (!session) return { success: false, error: 'Session not found' };

  // Verify teacher owns this exam
  if (!canAccessSession(authSession.user.role, graderId, session.exam.createdById)) {
    return { success: false, error: 'You can only grade exams you created' };
  }

  if (!['SUBMITTED', 'GRADING'].includes(session.status)) {
    return { success: false, error: 'Session is not in a gradable state' };
  }

  // Fetch all answers for validation
  const answers = await prisma.studentAnswer.findMany({
    where: { sessionId, id: { in: grades.map((g) => g.answerId) } },
    include: { examQuestion: true },
  });

  const answerMap = new Map(answers.map((a) => [a.id, a]));
  let graded = 0;
  const errors: string[] = [];

  // Process all grades in a transaction
  await prisma.$transaction(async (tx) => {
    for (const grade of grades) {
      const answer = answerMap.get(grade.answerId);
      if (!answer) {
        errors.push(`Answer ${grade.answerId} not found`);
        continue;
      }

      const maxMarks = Number(answer.examQuestion.marks);
      if (grade.marksAwarded < 0 || grade.marksAwarded > maxMarks) {
        errors.push(`Invalid marks for answer ${grade.answerId}: must be 0-${maxMarks}`);
        continue;
      }

      await tx.answerGrade.upsert({
        where: { studentAnswerId: grade.answerId },
        create: {
          studentAnswerId: grade.answerId,
          gradedBy: 'TEACHER',
          graderId,
          marksAwarded: grade.marksAwarded,
          maxMarks,
          feedback: grade.feedback,
        },
        update: {
          gradedBy: 'TEACHER',
          graderId,
          marksAwarded: grade.marksAwarded,
          feedback: grade.feedback,
        },
      });

      graded++;
    }
  });

  // Auto-grade remaining MCQs
  await autoGradeMcqAnswers(sessionId);

  // If autoFinalize is true, check if fully graded and calculate result
  if (autoFinalize) {
    const fullyGraded = await isSessionFullyGraded(sessionId);
    if (fullyGraded) {
      await calculateResult(sessionId);
      // Notify student
      const sessionData = await prisma.examSession.findUnique({
        where: { id: sessionId },
        include: { exam: { select: { title: true } } },
      });
      if (sessionData) {
        await createNotification(
          sessionData.studentId,
          'RESULT_PUBLISHED',
          'Result Available',
          `Your result for "${sessionData.exam.title}" is now available.`,
          '/student/results',
        );
      }
    }
  } else {
    // Set session to GRADING status if not auto-finalizing
    await prisma.examSession.update({
      where: { id: sessionId },
      data: { status: 'GRADING' },
    });
  }

  createAuditLog(authSession.user.id, 'BATCH_GRADE_ANSWERS', 'EXAM_SESSION', sessionId, { graded, errors }).catch(() => {});
  revalidatePath('/teacher/grading');
  revalidatePath('/teacher/results');
  return { success: true, data: { graded, errors } };
}

// ============================================
// Batch auto-grade all submitted sessions for an exam
// ============================================

export async function batchAutoGradeAction(examId: string): Promise<ActionResult<{ totalSessions: number; fullyGraded: number }>> {
  const authSession = await requireRole('TEACHER', 'ADMIN');

  const sessions = await prisma.examSession.findMany({
    where: { examId, status: { in: ['SUBMITTED', 'GRADING'] } },
  });

  let graded = 0;
  for (const session of sessions) {
    await autoGradeMcqAnswers(session.id);
    const fullyGraded = await isSessionFullyGraded(session.id);
    if (fullyGraded) {
      await calculateResult(session.id);
      await notifyStudentIfGraded(session.id);
      graded++;
    } else {
      // Set to GRADING - has non-MCQ answers needing manual/AI grading
      await prisma.examSession.update({
        where: { id: session.id },
        data: { status: 'GRADING' },
      });
    }
  }

  createAuditLog(authSession.user.id, 'BATCH_AUTO_GRADE', 'EXAM', examId, { totalSessions: sessions.length, fullyGraded: graded }).catch(() => {});
  revalidatePath('/teacher/grading');
  return { success: true, data: { totalSessions: sessions.length, fullyGraded: graded } };
}
