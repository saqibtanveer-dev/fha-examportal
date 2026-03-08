'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import { calculateScore } from '@/modules/grading/grading-core';
import type { ActionResult } from '@/types/action-result';
import {
  finalizeWrittenExamSchema,
  type FinalizeWrittenExamInput,
} from '@/validations/written-exam-schemas';

const MARKS_PATH = '/teacher/exams';
const RESULTS_PATH = '/teacher/results';

// ============================================
// Finalize Written Exam
// ============================================

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
      },
    });
    if (!exam) return { success: false, error: 'Exam not found' };
    if (exam.deliveryMode !== 'WRITTEN') return { success: false, error: 'Not a written exam' };
    if (session.user.role === 'TEACHER' && exam.createdById !== session.user.id) {
      return { success: false, error: 'Access denied' };
    }

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

    const results = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // Batch upsert all results in parallel (replaces sequential N+1 loop)
      const createdResults = await Promise.all(
        activeSessions.map((s) => {
          const obtainedMarks = s.studentAnswers.reduce(
            (sum, a) => sum + (a.answerGrade ? Number(a.answerGrade.marksAwarded) : 0),
            0,
          );
          const score = calculateScore({ totalMarks, obtainedMarks, passingMarks });

          return tx.examResult.upsert({
            where: { sessionId: s.id },
            create: {
              sessionId: s.id,
              studentId: s.studentId,
              examId,
              obtainedMarks: score.obtainedMarks,
              totalMarks: score.totalMarks,
              percentage: score.percentage,
              isPassed: score.isPassed,
              grade: score.grade,
              publishedAt: now,
            },
            update: {
              obtainedMarks: score.obtainedMarks,
              totalMarks: score.totalMarks,
              percentage: score.percentage,
              isPassed: score.isPassed,
              grade: score.grade,
              publishedAt: now,
            },
          });
        }),
      );

      // Batch update all active sessions to GRADED
      const sessionIds = activeSessions.map((s) => s.id);
      await tx.examSession.updateMany({
        where: { id: { in: sessionIds } },
        data: { status: 'GRADED', submittedAt: now },
      });

      // Calculate and assign ranks
      const ranked = createdResults.sort(
        (a, b) => Number(b.obtainedMarks) - Number(a.obtainedMarks),
      );

      let currentRank = 1;
      let prevMarks: number | null = null;
      const rankUpdates: Array<{ id: string; rank: number }> = [];
      for (const [i, result] of ranked.entries()) {
        const marks = Number(result.obtainedMarks);
        if (prevMarks !== null && marks < prevMarks) {
          currentRank = i + 1;
        }
        rankUpdates.push({ id: result.id, rank: currentRank });
        prevMarks = marks;
      }

      const rankGroups = new Map<number, string[]>();
      for (const { id, rank } of rankUpdates) {
        const group = rankGroups.get(rank) ?? [];
        group.push(id);
        rankGroups.set(rank, group);
      }
      for (const [rank, ids] of rankGroups) {
        await tx.examResult.updateMany({
          where: { id: { in: ids } },
          data: { rank },
        });
      }

      // Mark exam as completed
      await tx.exam.update({
        where: { id: examId },
        data: { status: 'COMPLETED' },
      });

      return createdResults;
    });

    createAuditLog(session.user.id, 'FINALIZE_WRITTEN_EXAM', 'EXAM', examId, {
      resultsCreated: results.length,
      absentCount: absentSessions.length,
    }).catch(() => {});

    revalidatePath(MARKS_PATH);
    revalidatePath(RESULTS_PATH);

    return {
      success: true,
      data: {
        resultsCreated: results.length,
        absentCount: absentSessions.length,
        incompleteStudents: [],
      },
    };
  },
);

// ============================================
// Re-finalize (Recalculate After Corrections)
// ============================================

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
      select: { id: true, deliveryMode: true, createdById: true, totalMarks: true, passingMarks: true },
    });
    if (!exam) return { success: false, error: 'Exam not found' };
    if (exam.deliveryMode !== 'WRITTEN') return { success: false, error: 'Not a written exam' };
    if (session.user.role === 'TEACHER' && exam.createdById !== session.user.id) {
      return { success: false, error: 'Access denied' };
    }

    const gradedSessions = await prisma.examSession.findMany({
      where: { examId, status: 'GRADED' },
      include: { studentAnswers: { include: { answerGrade: true } } },
    });

    if (gradedSessions.length === 0) {
      return { success: false, error: 'No finalized results to recalculate' };
    }

    const totalMarks = Number(exam.totalMarks);
    const passingMarks = Number(exam.passingMarks);

    const results = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // Batch update all results in parallel (replaces sequential N+1 loop)
      const updated = await Promise.all(
        gradedSessions.map((s) => {
          const obtainedMarks = s.studentAnswers.reduce(
            (sum, a) => sum + (a.answerGrade ? Number(a.answerGrade.marksAwarded) : 0),
            0,
          );
          const score = calculateScore({ totalMarks, obtainedMarks, passingMarks });

          return tx.examResult.update({
            where: { sessionId: s.id },
            data: {
              obtainedMarks: score.obtainedMarks,
              totalMarks: score.totalMarks,
              percentage: score.percentage,
              isPassed: score.isPassed,
              grade: score.grade,
              publishedAt: now,
            },
          });
        }),
      );

      // Recalculate ranks
      const ranked = updated.sort((a, b) => Number(b.obtainedMarks) - Number(a.obtainedMarks));
      let currentRank = 1;
      let prevMarks: number | null = null;
      const rankGroups = new Map<number, string[]>();

      for (const [i, result] of ranked.entries()) {
        const marks = Number(result.obtainedMarks);
        if (prevMarks !== null && marks < prevMarks) {
          currentRank = i + 1;
        }
        const group = rankGroups.get(currentRank) ?? [];
        group.push(result.id);
        rankGroups.set(currentRank, group);
        prevMarks = marks;
      }

      for (const [rank, ids] of rankGroups) {
        await tx.examResult.updateMany({
          where: { id: { in: ids } },
          data: { rank },
        });
      }

      return updated;
    });

    createAuditLog(session.user.id, 'REFINALIZE_WRITTEN_EXAM', 'EXAM', examId, {
      resultsUpdated: results.length,
    }).catch(() => {});

    revalidatePath(RESULTS_PATH);
    return { success: true, data: { resultsUpdated: results.length } };
  },
);
