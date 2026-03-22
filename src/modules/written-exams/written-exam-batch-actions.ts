'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { assertGradingAccess } from '@/lib/authorization-guards';
import { safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';
import {
  batchEnterWrittenMarksSchema,
  type BatchEnterWrittenMarksInput,
} from '@/validations/written-exam-schemas';
import { batchUpsertAnswerGrades, updateSessionStatuses } from './written-exam-db-utils';

const MARKS_PATH = '/teacher/exams';
const TX_TIMEOUT = 30_000;
const TX_MAX_WAIT = 10_000;

export const batchEnterWrittenMarksAction = safeAction(
  async function batchEnterWrittenMarks(
    input: BatchEnterWrittenMarksInput,
  ): Promise<ActionResult<{ totalObtained: number; sessionComplete: boolean }>> {
    const session = await requireRole('TEACHER', 'ADMIN');
    const parsed = batchEnterWrittenMarksSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const { sessionId, marks } = parsed.data;

    const examSession = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: { select: { id: true, deliveryMode: true, createdById: true } },
      },
    });
    if (!examSession) return { success: false, error: 'Session not found' };
    if (examSession.exam.deliveryMode !== 'WRITTEN') return { success: false, error: 'Not a written exam' };
    await assertGradingAccess(session.user.id, session.user.role, examSession.exam.id, examSession.exam.createdById);
    if (['GRADED', 'ABSENT'].includes(examSession.status)) {
      return { success: false, error: 'Cannot modify marks in current status' };
    }

    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId: examSession.examId },
      select: { id: true, marks: true },
    });
    const questionMap = new Map(examQuestions.map((q) => [q.id, Number(q.marks)]));

    for (const entry of marks) {
      const maxMarks = questionMap.get(entry.examQuestionId);
      if (maxMarks === undefined) {
        return { success: false, error: `Question ${entry.examQuestionId} not in this exam` };
      }
      if (entry.marksAwarded > maxMarks) {
        return { success: false, error: `Marks for a question exceed maximum (${maxMarks})` };
      }
    }

    const studentAnswers = await prisma.studentAnswer.findMany({
      where: { sessionId },
      select: { id: true, examQuestionId: true },
    });
    const answerMap = new Map(studentAnswers.map((a) => [a.examQuestionId, a.id]));

    const unresolved = marks.filter((entry) => !answerMap.has(entry.examQuestionId));
    if (unresolved.length > 0) {
      return {
        success: false,
        error: `${unresolved.length} marks could not be mapped to answers. Reinitialize sessions and try again.`,
      };
    }

    const gradeEntries = marks.map((entry) => ({
      studentAnswerId: answerMap.get(entry.examQuestionId)!,
      graderId: session.user.id,
      marksAwarded: entry.marksAwarded,
      maxMarks: questionMap.get(entry.examQuestionId)!,
      feedback: entry.feedback ?? null,
    }));

    const totalObtained = gradeEntries.reduce((sum, entry) => sum + entry.marksAwarded, 0);

    await prisma.$transaction(async (tx) => {
      await batchUpsertAnswerGrades(tx, gradeEntries);

      const answeredIds = [...new Set(gradeEntries.map((e) => e.studentAnswerId))];
      if (answeredIds.length > 0) {
        await tx.studentAnswer.updateMany({
          where: { id: { in: answeredIds } },
          data: { answeredAt: new Date() },
        });
      }

      await updateSessionStatuses(tx, [sessionId], examQuestions.length);
    }, { timeout: TX_TIMEOUT, maxWait: TX_MAX_WAIT });

    const gradedCount = await prisma.answerGrade.count({
      where: { studentAnswer: { sessionId } },
    });
    const sessionComplete = gradedCount >= examQuestions.length;

    revalidatePath(MARKS_PATH);
    return { success: true, data: { totalObtained, sessionComplete } };
  },
);
