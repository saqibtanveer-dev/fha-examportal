'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { assertGradingAccess } from '@/lib/authorization-guards';
import { safeAction } from '@/lib/safe-action';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';
import {
  initializeWrittenSessionsSchema,
  enterWrittenMarksSchema,
  type InitializeWrittenSessionsInput,
  type EnterWrittenMarksInput,
} from '@/validations/written-exam-schemas';


const MARKS_PATH = '/teacher/exams';

// Verify Written Exam Ownership
async function verifyWrittenExamOwnership(examId: string, userId: string, role: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId, deletedAt: null },
    select: { id: true, deliveryMode: true, status: true, createdById: true },
  });
  if (!exam) return { error: 'Exam not found' };
  if (exam.deliveryMode !== 'WRITTEN') return { error: 'Not a written exam' };
  await assertGradingAccess(userId, role as 'TEACHER' | 'ADMIN', examId);
  return { exam };
}

// Initialize Written Exam Sessions

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

    // Build student query conditions — section-scoped
    const classConditions = assignments.map((a) => ({
      classId: a.classId,
      sectionId: a.sectionId,
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

    // Bulk create sessions + empty answers in transaction (batch insert, not sequential)
    await prisma.$transaction(async (tx) => {
      // 1) Batch create all sessions at once
      await tx.examSession.createMany({
        data: newStudentIds.map((studentId) => ({
          examId,
          studentId,
          attemptNumber: 1,
          status: 'NOT_STARTED' as const,
          enteredById: session.user.id,
        })),
      });

      // 2) Fetch back the created session IDs
      const createdSessions = await tx.examSession.findMany({
        where: { examId, studentId: { in: newStudentIds } },
        select: { id: true },
      });

      // 3) Batch create all empty answers at once
      if (examQuestions.length > 0 && createdSessions.length > 0) {
        const answerData = createdSessions.flatMap((s) =>
          examQuestions.map((eq) => ({
            sessionId: s.id,
            examQuestionId: eq.id,
          })),
        );
        await tx.studentAnswer.createMany({ data: answerData });
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

// Enter Marks for Single Question

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
    await assertGradingAccess(session.user.id, session.user.role, examSession.exam.id);
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
