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

const MARKS_PATH = '/teacher/exams';

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
    await assertGradingAccess(session.user.id, session.user.role, examSession.exam.id);
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

    let totalObtained = 0;

    await prisma.$transaction(async (tx) => {
      const studentAnswers = await tx.studentAnswer.findMany({
        where: { sessionId },
        select: { id: true, examQuestionId: true },
      });
      const answerMap = new Map(studentAnswers.map((a) => [a.examQuestionId, a.id]));

      for (const entry of marks) {
        const answerId = answerMap.get(entry.examQuestionId);
        if (!answerId) continue;

        const maxMarks = questionMap.get(entry.examQuestionId)!;
        totalObtained += entry.marksAwarded;

        await tx.answerGrade.upsert({
          where: { studentAnswerId: answerId },
          create: {
            studentAnswerId: answerId,
            gradedBy: 'TEACHER',
            graderId: session.user.id,
            marksAwarded: entry.marksAwarded,
            maxMarks,
            feedback: entry.feedback ?? null,
          },
          update: {
            marksAwarded: entry.marksAwarded,
            maxMarks,
            feedback: entry.feedback ?? null,
            graderId: session.user.id,
          },
        });
      }

      const answeredIds = marks
        .map((e) => answerMap.get(e.examQuestionId))
        .filter((id): id is string => !!id);
      if (answeredIds.length > 0) {
        await tx.studentAnswer.updateMany({
          where: { id: { in: answeredIds } },
          data: { answeredAt: new Date() },
        });
      }
    });

    const gradedCount = await prisma.answerGrade.count({
      where: { studentAnswer: { sessionId } },
    });
    const sessionComplete = gradedCount >= examQuestions.length;
    const newStatus = sessionComplete ? 'SUBMITTED' : 'IN_PROGRESS';

    await prisma.examSession.update({
      where: { id: sessionId },
      data: { status: newStatus },
    });

    revalidatePath(MARKS_PATH);
    return { success: true, data: { totalObtained, sessionComplete } };
  },
);
