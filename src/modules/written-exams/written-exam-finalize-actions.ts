'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { assertGradingAccess } from '@/lib/authorization-guards';
import { safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';
import {
  bulkEnterWrittenMarksSchema,
  markAbsentSchema,
  type BulkEnterWrittenMarksInput,
  type MarkAbsentInput,
} from '@/validations/written-exam-schemas';
import { batchUpsertAnswerGrades, updateSessionStatuses } from './written-exam-db-utils';

const MARKS_PATH = '/teacher/exams';
const TX_TIMEOUT = 30_000;
const TX_MAX_WAIT = 10_000;

// ============================================
// Bulk Enter Marks (Spreadsheet View)
// ============================================

export const bulkEnterWrittenMarksAction = safeAction(
  async function bulkEnterWrittenMarks(
    input: BulkEnterWrittenMarksInput,
  ): Promise<ActionResult<{ totalEntriesSaved: number }>> {
    const session = await requireRole('TEACHER', 'ADMIN');
    const parsed = bulkEnterWrittenMarksSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const { examId, entries } = parsed.data;

    const exam = await prisma.exam.findUnique({
      where: { id: examId, deletedAt: null },
      select: { id: true, deliveryMode: true, createdById: true },
    });
    if (!exam) return { success: false, error: 'Exam not found' };
    if (exam.deliveryMode !== 'WRITTEN') return { success: false, error: 'Not a written exam' };
    await assertGradingAccess(session.user.id, session.user.role, examId, exam.createdById);

    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId },
      select: { id: true, marks: true },
    });
    const questionMaxMap = new Map(examQuestions.map((q) => [q.id, Number(q.marks)]));

    for (const entry of entries) {
      const maxMarks = questionMaxMap.get(entry.examQuestionId);
      if (maxMarks === undefined) {
        return { success: false, error: `Invalid question ID: ${entry.examQuestionId}` };
      }
      if (entry.marksAwarded > maxMarks) {
        return { success: false, error: `Marks exceed maximum (${maxMarks})` };
      }
    }

    const affectedSessionIds = [...new Set(entries.map((e) => e.sessionId))];
    const studentAnswers = await prisma.studentAnswer.findMany({
      where: { sessionId: { in: affectedSessionIds } },
      select: { id: true, sessionId: true, examQuestionId: true },
    });
    const answerLookup = new Map(
      studentAnswers.map((a) => [`${a.sessionId}:${a.examQuestionId}`, a.id]),
    );

    const unresolvedEntries = entries.filter(
      (entry) => !answerLookup.has(`${entry.sessionId}:${entry.examQuestionId}`),
    );
    if (unresolvedEntries.length > 0) {
      return {
        success: false,
        error: `${unresolvedEntries.length} entries could not be mapped to exam answers. Export a fresh template and try again.`,
      };
    }

    const gradeEntries = entries.map((entry) => ({
      studentAnswerId: answerLookup.get(`${entry.sessionId}:${entry.examQuestionId}`)!,
      graderId: session.user.id,
      marksAwarded: entry.marksAwarded,
      maxMarks: questionMaxMap.get(entry.examQuestionId)!,
    }));

    const savedCount = await prisma.$transaction(async (tx) => {
      const count = await batchUpsertAnswerGrades(tx, gradeEntries);

      // Batch update answered timestamps
      const answeredIds = [...new Set(gradeEntries.map((e) => e.studentAnswerId))];
      if (answeredIds.length > 0) {
        await tx.studentAnswer.updateMany({
          where: { id: { in: answeredIds } },
          data: { answeredAt: new Date() },
        });
      }

      await updateSessionStatuses(tx, affectedSessionIds, examQuestions.length);
      return count;
    }, { timeout: TX_TIMEOUT, maxWait: TX_MAX_WAIT });

    revalidatePath(MARKS_PATH);
    return { success: true, data: { totalEntriesSaved: savedCount } };
  },
);

// ============================================
// Mark Student Absent
// ============================================

export const markStudentAbsentAction = safeAction(
  async function markStudentAbsent(
    input: MarkAbsentInput,
  ): Promise<ActionResult> {
    const session = await requireRole('TEACHER', 'ADMIN');
    const parsed = markAbsentSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const examSession = await prisma.examSession.findUnique({
      where: { id: parsed.data.sessionId },
      include: {
        exam: { select: { id: true, deliveryMode: true, createdById: true } },
        studentAnswers: { select: { id: true } },
      },
    });
    if (!examSession) return { success: false, error: 'Session not found' };
    if (examSession.exam.deliveryMode !== 'WRITTEN') return { success: false, error: 'Not a written exam' };
    await assertGradingAccess(session.user.id, session.user.role, examSession.exam.id, examSession.exam.createdById);
    if (examSession.status === 'GRADED') {
      return { success: false, error: 'Cannot mark absent after finalization' };
    }

    await prisma.$transaction(async (tx) => {
      // Delete grades for this session's answers
      const answerIds = examSession.studentAnswers.map((a) => a.id);
      if (answerIds.length > 0) {
        await tx.answerGrade.deleteMany({
          where: { studentAnswerId: { in: answerIds } },
        });
      }

      // Reset answer timestamps
      await tx.studentAnswer.updateMany({
        where: { sessionId: parsed.data.sessionId },
        data: { answeredAt: null },
      });

      // Delete result if exists
      await tx.examResult.deleteMany({
        where: { sessionId: parsed.data.sessionId },
      });

      // Mark as absent
      await tx.examSession.update({
        where: { id: parsed.data.sessionId },
        data: { status: 'ABSENT' },
      });
    });

    revalidatePath(MARKS_PATH);
    return { success: true };
  },
);

// ============================================
// Unmark Student Absent
// ============================================

export const unmarkStudentAbsentAction = safeAction(
  async function unmarkStudentAbsent(
    input: MarkAbsentInput,
  ): Promise<ActionResult> {
    const session = await requireRole('TEACHER', 'ADMIN');
    const parsed = markAbsentSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const examSession = await prisma.examSession.findUnique({
      where: { id: parsed.data.sessionId },
      include: { exam: { select: { id: true, deliveryMode: true, createdById: true } } },
    });
    if (!examSession) return { success: false, error: 'Session not found' };
    if (examSession.exam.deliveryMode !== 'WRITTEN') return { success: false, error: 'Not a written exam' };
    await assertGradingAccess(session.user.id, session.user.role, examSession.exam.id, examSession.exam.createdById);
    if (examSession.status !== 'ABSENT') {
      return { success: false, error: 'Student is not marked as absent' };
    }

    await prisma.examSession.update({
      where: { id: parsed.data.sessionId },
      data: { status: 'NOT_STARTED' },
    });

    revalidatePath(MARKS_PATH);
    return { success: true };
  },
);

