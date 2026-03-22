'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { assertGradingAccess } from '@/lib/authorization-guards';
import { safeAction } from '@/lib/safe-action';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import { calculateScore } from '@/modules/grading/grading-core';
import type { ActionResult } from '@/types/action-result';
import {
  batchUpsertExamResults,
  recomputeExamRanks,
} from '@/modules/written-exams/written-exam-db-utils';
import {
  finalizeWrittenExamSchema,
  type FinalizeWrittenExamInput,
} from '@/validations/written-exam-schemas';

import { logger } from '@/lib/logger';
const MARKS_PATH = '/teacher/exams';
const RESULTS_PATH = '/teacher/results';
const TX_TIMEOUT = 30_000;
const TX_MAX_WAIT = 10_000;
export const finalizeWrittenExamAction = safeAction(
  async function finalizeWrittenExam(
    input: FinalizeWrittenExamInput,
  ): Promise<
    ActionResult<{
      resultsCreated: number;
      absentCount: number;
      incompleteStudents: Array<{ studentName: string; questionsRemaining: number }>;
    }>
  > {
    const session = await requireRole('TEACHER', 'ADMIN');
    const parsed = finalizeWrittenExamSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const { examId } = parsed.data;
    const exam = await prisma.exam.findUnique({
      where: { id: examId, deletedAt: null },
      select: {
        id: true,
        deliveryMode: true,
        createdById: true,
        status: true,
        totalMarks: true,
        passingMarks: true,
        showResultAfter: true,
      },
    });
    if (!exam) return { success: false, error: 'Exam not found' };
    if (exam.deliveryMode !== 'WRITTEN') return { success: false, error: 'Not a written exam' };
    await assertGradingAccess(session.user.id, session.user.role, examId, exam.createdById);

    const totalQuestions = await prisma.examQuestion.count({ where: { examId } });

    const sessions = await prisma.examSession.findMany({
      where: { examId },
      include: {
        student: { select: { firstName: true, lastName: true } },
        studentAnswers: { include: { answerGrade: true } },
      },
    });

    const absentSessions = sessions.filter((s) => s.status === 'ABSENT');
    const activeSessions = sessions.filter((s) => s.status !== 'ABSENT');

    // Check for incomplete sessions
    const incompleteStudents: Array<{ studentName: string; questionsRemaining: number }> = [];
    for (const s of activeSessions) {
      const gradedCount = s.studentAnswers.filter((a) => a.answerGrade).length;
      if (gradedCount < totalQuestions) {
        incompleteStudents.push({
          studentName: `${s.student.firstName} ${s.student.lastName}`,
          questionsRemaining: totalQuestions - gradedCount,
        });
      }
    }

    if (incompleteStudents.length > 0) {
      return {
        success: false,
        error: `${incompleteStudents.length} student(s) have incomplete marks`,
        data: { resultsCreated: 0, absentCount: absentSessions.length, incompleteStudents },
      };
    }

    const totalMarks = Number(exam.totalMarks);
    const passingMarks = Number(exam.passingMarks);
    const now = new Date();
    const publishedAt = exam.showResultAfter === 'MANUAL' ? null : now;

    const resultEntries = activeSessions.map((s) => {
      const obtainedMarks = s.studentAnswers.reduce(
        (sum, a) => sum + (a.answerGrade ? Number(a.answerGrade.marksAwarded) : 0),
        0,
      );
      const score = calculateScore({ totalMarks, obtainedMarks, passingMarks });
      return {
        sessionId: s.id,
        examId,
        studentId: s.studentId,
        obtainedMarks: score.obtainedMarks,
        totalMarks: score.totalMarks,
        percentage: score.percentage,
        isPassed: score.isPassed,
        grade: score.grade,
        publishedAt,
      };
    });

    await prisma.$transaction(async (tx) => {
      const now = new Date();
      await batchUpsertExamResults(tx, resultEntries);

      // Batch update all active sessions to GRADED
      const sessionIds = activeSessions.map((s) => s.id);
      if (sessionIds.length > 0) {
        await tx.examSession.updateMany({
          where: { id: { in: sessionIds } },
          data: { status: 'GRADED', submittedAt: now },
        });
      }

      await recomputeExamRanks(tx, examId);

      // Mark exam as completed
      await tx.exam.update({
        where: { id: examId },
        data: { status: 'COMPLETED' },
      });

    }, { timeout: TX_TIMEOUT, maxWait: TX_MAX_WAIT });

    createAuditLog(session.user.id, 'FINALIZE_WRITTEN_EXAM', 'EXAM', examId, {
      resultsCreated: resultEntries.length,
      absentCount: absentSessions.length,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidatePath(MARKS_PATH);
    revalidatePath(RESULTS_PATH);

    return {
      success: true,
      data: {
        resultsCreated: resultEntries.length,
        absentCount: absentSessions.length,
        incompleteStudents: [],
      },
    };
  },
);

export const refinalizeWrittenExamAction = safeAction(
  async function refinalizeWrittenExam(
    input: FinalizeWrittenExamInput,
  ): Promise<ActionResult<{ resultsUpdated: number }>> {
    const session = await requireRole('TEACHER', 'ADMIN');
    const parsed = finalizeWrittenExamSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const { examId } = parsed.data;

    const exam = await prisma.exam.findUnique({
      where: { id: examId, deletedAt: null },
      select: {
        id: true,
        deliveryMode: true,
        createdById: true,
        totalMarks: true,
        passingMarks: true,
        showResultAfter: true,
      },
    });
    if (!exam) return { success: false, error: 'Exam not found' };
    if (exam.deliveryMode !== 'WRITTEN') return { success: false, error: 'Not a written exam' };
    await assertGradingAccess(session.user.id, session.user.role, examId, exam.createdById);

    const gradedSessions = await prisma.examSession.findMany({
      where: { examId, status: 'GRADED' },
      include: { studentAnswers: { include: { answerGrade: true } } },
    });

    if (gradedSessions.length === 0) {
      return { success: false, error: 'No finalized results to recalculate' };
    }

    const totalMarks = Number(exam.totalMarks);
    const passingMarks = Number(exam.passingMarks);
    const now = new Date();
    const publishedAt = exam.showResultAfter === 'MANUAL' ? null : now;

    const resultEntries = gradedSessions.map((s) => {
      const obtainedMarks = s.studentAnswers.reduce(
        (sum, a) => sum + (a.answerGrade ? Number(a.answerGrade.marksAwarded) : 0),
        0,
      );
      const score = calculateScore({ totalMarks, obtainedMarks, passingMarks });
      return {
        sessionId: s.id,
        examId,
        studentId: s.studentId,
        obtainedMarks: score.obtainedMarks,
        totalMarks: score.totalMarks,
        percentage: score.percentage,
        isPassed: score.isPassed,
        grade: score.grade,
        publishedAt,
      };
    });

    await prisma.$transaction(async (tx) => {
      await batchUpsertExamResults(tx, resultEntries);
      await recomputeExamRanks(tx, examId);
    }, { timeout: TX_TIMEOUT, maxWait: TX_MAX_WAIT });

    createAuditLog(session.user.id, 'REFINALIZE_WRITTEN_EXAM', 'EXAM', examId, {
      resultsUpdated: resultEntries.length,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidatePath(RESULTS_PATH);
    return { success: true, data: { resultsUpdated: resultEntries.length } };
  },
);
