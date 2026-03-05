'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import { calculateScore, deriveGrade } from '@/modules/grading/grading-core';
import type { ActionResult } from '@/types/action-result';
import {
  bulkEnterWrittenMarksSchema,
  markAbsentSchema,
  finalizeWrittenExamSchema,
  type BulkEnterWrittenMarksInput,
  type MarkAbsentInput,
  type FinalizeWrittenExamInput,
} from '@/validations/written-exam-schemas';

const MARKS_PATH = '/teacher/exams';
const RESULTS_PATH = '/teacher/results';

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

    let savedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const entry of entries) {
        const studentAnswer = await tx.studentAnswer.findUnique({
          where: {
            sessionId_examQuestionId: {
              sessionId: entry.sessionId,
              examQuestionId: entry.examQuestionId,
            },
          },
        });
        if (!studentAnswer) continue;

        const maxMarks = questionMaxMap.get(entry.examQuestionId)!;

        await tx.answerGrade.upsert({
          where: { studentAnswerId: studentAnswer.id },
          create: {
            studentAnswerId: studentAnswer.id,
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

        await tx.studentAnswer.update({
          where: { id: studentAnswer.id },
          data: { answeredAt: new Date() },
        });

        savedCount++;
      }
    });

    // Update session statuses for affected sessions
    const affectedSessionIds = [...new Set(entries.map((e) => e.sessionId))];
    for (const sessionId of affectedSessionIds) {
      const gradedCount = await prisma.answerGrade.count({
        where: { studentAnswer: { sessionId } },
      });
      const isComplete = gradedCount >= examQuestions.length;

      const currentSession = await prisma.examSession.findUnique({
        where: { id: sessionId },
        select: { status: true },
      });
      if (currentSession && !['GRADED', 'ABSENT'].includes(currentSession.status)) {
        await prisma.examSession.update({
          where: { id: sessionId },
          data: { status: isComplete ? 'SUBMITTED' : 'IN_PROGRESS' },
        });
      }
    }

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

    // Calculate results in transaction
    const results = await prisma.$transaction(async (tx) => {
      const createdResults = [];

      for (const s of activeSessions) {
        const obtainedMarks = s.studentAnswers.reduce(
          (sum, a) => sum + (a.answerGrade ? Number(a.answerGrade.marksAwarded) : 0),
          0,
        );

        const score = calculateScore({ totalMarks, obtainedMarks, passingMarks });

        const result = await tx.examResult.upsert({
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
          },
          update: {
            obtainedMarks: score.obtainedMarks,
            totalMarks: score.totalMarks,
            percentage: score.percentage,
            isPassed: score.isPassed,
            grade: score.grade,
          },
        });

        await tx.examSession.update({
          where: { id: s.id },
          data: { status: 'GRADED', submittedAt: new Date() },
        });

        createdResults.push(result);
      }

      return createdResults;
    });

    // Calculate and assign ranks
    const ranked = results
      .sort((a, b) => Number(b.obtainedMarks) - Number(a.obtainedMarks));

    let currentRank = 1;
    let prevMarks: number | null = null;
    for (const [i, result] of ranked.entries()) {
      const marks = Number(result.obtainedMarks);
      if (prevMarks !== null && marks < prevMarks) {
        currentRank = i + 1;
      }
      await prisma.examResult.update({
        where: { id: result.id },
        data: { rank: currentRank },
      });
      prevMarks = marks;
    }

    // Mark exam as completed
    await prisma.exam.update({
      where: { id: examId },
      data: { status: 'COMPLETED' },
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
      const updated = [];
      for (const s of gradedSessions) {
        const obtainedMarks = s.studentAnswers.reduce(
          (sum, a) => sum + (a.answerGrade ? Number(a.answerGrade.marksAwarded) : 0),
          0,
        );
        const score = calculateScore({ totalMarks, obtainedMarks, passingMarks });

        const result = await tx.examResult.update({
          where: { sessionId: s.id },
          data: {
            obtainedMarks: score.obtainedMarks,
            totalMarks: score.totalMarks,
            percentage: score.percentage,
            isPassed: score.isPassed,
            grade: score.grade,
          },
        });
        updated.push(result);
      }
      return updated;
    });

    // Recalculate ranks
    const ranked = results.sort((a, b) => Number(b.obtainedMarks) - Number(a.obtainedMarks));
    let currentRank = 1;
    let prevMarks: number | null = null;
    for (const [i, result] of ranked.entries()) {
      const marks = Number(result.obtainedMarks);
      if (prevMarks !== null && marks < prevMarks) {
        currentRank = i + 1;
      }
      await prisma.examResult.update({
        where: { id: result.id },
        data: { rank: currentRank },
      });
      prevMarks = marks;
    }

    createAuditLog(session.user.id, 'REFINALIZE_WRITTEN_EXAM', 'EXAM', examId, {
      resultsUpdated: results.length,
    }).catch(() => {});

    revalidatePath(RESULTS_PATH);
    return { success: true, data: { resultsUpdated: results.length } };
  },
);
