'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';
import {
  initializeWrittenSessionsSchema,
  enterWrittenMarksSchema,
  batchEnterWrittenMarksSchema,
  bulkEnterWrittenMarksSchema,
  type InitializeWrittenSessionsInput,
  type EnterWrittenMarksInput,
  type BatchEnterWrittenMarksInput,
  type BulkEnterWrittenMarksInput,
} from '@/validations/written-exam-schemas';

const MARKS_PATH = '/teacher/exams';

// ============================================
// Verify Written Exam Ownership
// ============================================

async function verifyWrittenExamOwnership(examId: string, userId: string, role: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId, deletedAt: null },
    select: { id: true, deliveryMode: true, status: true, createdById: true },
  });
  if (!exam) return { error: 'Exam not found' };
  if (exam.deliveryMode !== 'WRITTEN') return { error: 'Not a written exam' };
  if (role === 'TEACHER' && exam.createdById !== userId) {
    return { error: 'You can only manage your own exams' };
  }
  return { exam };
}

// ============================================
// Initialize Written Exam Sessions
// ============================================

export const initializeWrittenExamSessionsAction = safeAction(
  async function initializeWrittenExamSessions(
    input: InitializeWrittenSessionsInput,
  ): Promise<ActionResult<{ sessionsCreated: number }>> {
    const session = await requireRole('TEACHER', 'ADMIN');
    const parsed = initializeWrittenSessionsSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const { examId } = parsed.data;
    const check = await verifyWrittenExamOwnership(examId, session.user.id, session.user.role);
    if ('error' in check) return { success: false, error: check.error };
    if (!['PUBLISHED', 'ACTIVE'].includes(check.exam.status)) {
      return { success: false, error: 'Exam must be published or active' };
    }

    // Get assigned class IDs
    const assignments = await prisma.examClassAssignment.findMany({
      where: { examId },
      select: { classId: true, sectionId: true },
    });
    if (assignments.length === 0) return { success: false, error: 'No classes assigned' };

    // Build student query conditions
    const classConditions = assignments.map((a) => ({
      classId: a.classId,
      ...(a.sectionId ? { sectionId: a.sectionId } : {}),
    }));

    const students = await prisma.studentProfile.findMany({
      where: {
        OR: classConditions,
        status: 'ACTIVE',
        user: { isActive: true, deletedAt: null },
      },
      select: { userId: true },
    });

    // Get existing sessions to avoid duplicates (idempotent)
    const existingSessions = await prisma.examSession.findMany({
      where: { examId },
      select: { studentId: true },
    });
    const existingStudentIds = new Set(existingSessions.map((s) => s.studentId));
    const newStudentIds = students
      .map((s) => s.userId)
      .filter((id) => !existingStudentIds.has(id));

    if (newStudentIds.length === 0) {
      return { success: true, data: { sessionsCreated: 0 } };
    }

    // Get exam questions for creating empty answers
    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId },
      select: { id: true },
    });

    // Bulk create sessions + empty answers in transaction
    await prisma.$transaction(async (tx) => {
      for (const studentId of newStudentIds) {
        const newSession = await tx.examSession.create({
          data: {
            examId,
            studentId,
            attemptNumber: 1,
            status: 'NOT_STARTED',
            enteredById: session.user.id,
          },
        });

        if (examQuestions.length > 0) {
          await tx.studentAnswer.createMany({
            data: examQuestions.map((eq) => ({
              sessionId: newSession.id,
              examQuestionId: eq.id,
            })),
          });
        }
      }
    });

    // Update exam status to ACTIVE if it was PUBLISHED
    if (check.exam.status === 'PUBLISHED') {
      await prisma.exam.update({ where: { id: examId }, data: { status: 'ACTIVE' } });
    }

    createAuditLog(session.user.id, 'INITIALIZE_WRITTEN_SESSIONS', 'EXAM', examId, {
      sessionsCreated: newStudentIds.length,
    }).catch(() => {});
    revalidatePath(MARKS_PATH);

    return { success: true, data: { sessionsCreated: newStudentIds.length } };
  },
);

// ============================================
// Enter Marks for Single Question
// ============================================

export const enterWrittenMarksAction = safeAction(
  async function enterWrittenMarks(
    input: EnterWrittenMarksInput,
  ): Promise<ActionResult<{ sessionComplete: boolean }>> {
    const session = await requireRole('TEACHER', 'ADMIN');
    const parsed = enterWrittenMarksSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

    const { sessionId, examQuestionId, marksAwarded, feedback } = parsed.data;

    const examSession = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: { select: { id: true, deliveryMode: true, createdById: true } },
      },
    });
    if (!examSession) return { success: false, error: 'Session not found' };
    if (examSession.exam.deliveryMode !== 'WRITTEN') return { success: false, error: 'Not a written exam' };
    if (session.user.role === 'TEACHER' && examSession.exam.createdById !== session.user.id) {
      return { success: false, error: 'Access denied' };
    }
    if (['GRADED', 'ABSENT'].includes(examSession.status)) {
      return { success: false, error: 'Cannot modify marks in current status' };
    }

    // Validate marks against question max
    const examQuestion = await prisma.examQuestion.findUnique({
      where: { id: examQuestionId },
      select: { marks: true, examId: true },
    });
    if (!examQuestion || examQuestion.examId !== examSession.examId) {
      return { success: false, error: 'Question not in this exam' };
    }
    if (marksAwarded > Number(examQuestion.marks)) {
      return { success: false, error: `Marks cannot exceed ${examQuestion.marks}` };
    }

    // Find the student answer
    const studentAnswer = await prisma.studentAnswer.findUnique({
      where: { sessionId_examQuestionId: { sessionId, examQuestionId } },
    });
    if (!studentAnswer) return { success: false, error: 'Answer record not found' };

    // Upsert grade
    await prisma.answerGrade.upsert({
      where: { studentAnswerId: studentAnswer.id },
      create: {
        studentAnswerId: studentAnswer.id,
        gradedBy: 'TEACHER',
        graderId: session.user.id,
        marksAwarded,
        maxMarks: Number(examQuestion.marks),
        feedback: feedback ?? null,
      },
      update: {
        marksAwarded,
        maxMarks: Number(examQuestion.marks),
        feedback: feedback ?? null,
        graderId: session.user.id,
      },
    });

    await prisma.studentAnswer.update({
      where: { id: studentAnswer.id },
      data: { answeredAt: new Date() },
    });

    // Check completion + update session status
    const totalQuestions = await prisma.examQuestion.count({
      where: { examId: examSession.examId },
    });
    const gradedCount = await prisma.answerGrade.count({
      where: { studentAnswer: { sessionId } },
    });

    const sessionComplete = gradedCount >= totalQuestions;
    const newStatus = sessionComplete ? 'SUBMITTED' : 'IN_PROGRESS';

    if (examSession.status !== newStatus) {
      await prisma.examSession.update({
        where: { id: sessionId },
        data: { status: newStatus },
      });
    }

    revalidatePath(MARKS_PATH);
    return { success: true, data: { sessionComplete } };
  },
);

// ============================================
// Batch Enter Marks (One Student, All Questions)
// ============================================

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
    if (session.user.role === 'TEACHER' && examSession.exam.createdById !== session.user.id) {
      return { success: false, error: 'Access denied' };
    }
    if (['GRADED', 'ABSENT'].includes(examSession.status)) {
      return { success: false, error: 'Cannot modify marks in current status' };
    }

    // Fetch all exam questions for validation
    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId: examSession.examId },
      select: { id: true, marks: true },
    });
    const questionMap = new Map(examQuestions.map((q) => [q.id, Number(q.marks)]));

    // Validate all marks
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
      for (const entry of marks) {
        const studentAnswer = await tx.studentAnswer.findUnique({
          where: {
            sessionId_examQuestionId: {
              sessionId,
              examQuestionId: entry.examQuestionId,
            },
          },
        });
        if (!studentAnswer) continue;

        const maxMarks = questionMap.get(entry.examQuestionId)!;
        totalObtained += entry.marksAwarded;

        await tx.answerGrade.upsert({
          where: { studentAnswerId: studentAnswer.id },
          create: {
            studentAnswerId: studentAnswer.id,
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

        await tx.studentAnswer.update({
          where: { id: studentAnswer.id },
          data: { answeredAt: new Date() },
        });
      }
    });

    // Check completion
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
