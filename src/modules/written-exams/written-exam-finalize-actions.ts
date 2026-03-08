'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';
import {
  bulkEnterWrittenMarksSchema,
  markAbsentSchema,
  type BulkEnterWrittenMarksInput,
  type MarkAbsentInput,
} from '@/validations/written-exam-schemas';



const MARKS_PATH = '/teacher/exams';

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
    if (session.user.role === 'TEACHER' && exam.createdById !== session.user.id) {
      return { success: false, error: 'Access denied' };
    }

    // Pre-load question max marks for validation
    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId },
      select: { id: true, marks: true },
    });
    const questionMaxMap = new Map(examQuestions.map((q) => [q.id, Number(q.marks)]));

    // Validate all entries
    for (const entry of entries) {
      const maxMarks = questionMaxMap.get(entry.examQuestionId);
      if (maxMarks === undefined) {
        return { success: false, error: `Invalid question ID: ${entry.examQuestionId}` };
      }
      if (entry.marksAwarded > maxMarks) {
        return { success: false, error: `Marks exceed maximum (${maxMarks})` };
      }
    }

    // Collect all affected session IDs
    const affectedSessionIds = [...new Set(entries.map((e) => e.sessionId))];

    const savedCount = await prisma.$transaction(async (tx) => {
      // 1) Batch fetch ALL student answers for affected sessions (1 query)
      const studentAnswers = await tx.studentAnswer.findMany({
        where: { sessionId: { in: affectedSessionIds } },
        select: { id: true, sessionId: true, examQuestionId: true },
      });

      // Build lookup: "sessionId:examQuestionId" → answerId
      const answerLookup = new Map(
        studentAnswers.map((a) => [`${a.sessionId}:${a.examQuestionId}`, a.id]),
      );

      // 2) Upsert grades (still individual due to Prisma upsert limitations, but
      //    we eliminated the findUnique + update per entry — down from 3 queries to 1 per entry)
      let count = 0;
      for (const entry of entries) {
        const answerId = answerLookup.get(`${entry.sessionId}:${entry.examQuestionId}`);
        if (!answerId) continue;

        const maxMarks = questionMaxMap.get(entry.examQuestionId)!;
        await tx.answerGrade.upsert({
          where: { studentAnswerId: answerId },
          create: {
            studentAnswerId: answerId,
            gradedBy: 'TEACHER',
            graderId: session.user.id,
            marksAwarded: entry.marksAwarded,
            maxMarks,
          },
          update: {
            marksAwarded: entry.marksAwarded,
            maxMarks,
            graderId: session.user.id,
          },
        });
        count++;
      }

      // 3) Batch update all answered timestamps at once (1 query instead of N)
      const answeredIds = entries
        .map((e) => answerLookup.get(`${e.sessionId}:${e.examQuestionId}`))
        .filter((id): id is string => !!id);
      if (answeredIds.length > 0) {
        await tx.studentAnswer.updateMany({
          where: { id: { in: answeredIds } },
          data: { answeredAt: new Date() },
        });
      }

      // 4) Batch update session statuses (inside transaction for atomicity)
      //    Fetch graded counts per session, then batch update
      const sessionsWithStatus = await tx.examSession.findMany({
        where: { id: { in: affectedSessionIds }, status: { notIn: ['GRADED', 'ABSENT'] } },
        select: { id: true, _count: { select: { studentAnswers: { where: { answerGrade: { isNot: null } } } } } },
      });

      const totalQCount = examQuestions.length;
      const completedIds = sessionsWithStatus
        .filter((s) => s._count.studentAnswers >= totalQCount)
        .map((s) => s.id);
      const inProgressIds = sessionsWithStatus
        .filter((s) => s._count.studentAnswers < totalQCount)
        .map((s) => s.id);

      if (completedIds.length > 0) {
        await tx.examSession.updateMany({
          where: { id: { in: completedIds } },
          data: { status: 'SUBMITTED' },
        });
      }
      if (inProgressIds.length > 0) {
        await tx.examSession.updateMany({
          where: { id: { in: inProgressIds } },
          data: { status: 'IN_PROGRESS' },
        });
      }

      return count;
    });

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
    if (session.user.role === 'TEACHER' && examSession.exam.createdById !== session.user.id) {
      return { success: false, error: 'Access denied' };
    }
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
      include: {
        exam: { select: { deliveryMode: true, createdById: true } },
      },
    });
    if (!examSession) return { success: false, error: 'Session not found' };
    if (examSession.exam.deliveryMode !== 'WRITTEN') return { success: false, error: 'Not a written exam' };
    if (session.user.role === 'TEACHER' && examSession.exam.createdById !== session.user.id) {
      return { success: false, error: 'Access denied' };
    }
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

