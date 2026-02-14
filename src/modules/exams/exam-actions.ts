'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import {
  createExamSchema,
  updateExamSchema,
  type CreateExamInput,
  type UpdateExamInput,
} from '@/validations/exam-schemas';
import { createBulkNotifications } from '@/modules/notifications/notification-queries';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

// ============================================
// Create Exam
// ============================================

export async function createExamAction(input: CreateExamInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const parsed = createExamSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { questions, classAssignments, scheduledStartAt, scheduledEndAt, academicSessionId, ...examData } = parsed.data;

  // Auto-set academic session to current if not provided
  let sessionId = academicSessionId;
  if (!sessionId) {
    const currentSession = await prisma.academicSession.findFirst({ where: { isCurrent: true } });
    if (currentSession) sessionId = currentSession.id;
  }

  const exam = await prisma.exam.create({
    data: {
      ...examData,
      academicSessionId: sessionId,
      scheduledStartAt: scheduledStartAt ? new Date(scheduledStartAt) : undefined,
      scheduledEndAt: scheduledEndAt ? new Date(scheduledEndAt) : undefined,
      createdById: session.user.id,
      examQuestions: {
        createMany: { data: questions },
      },
      examClassAssignments: {
        createMany: {
          data: classAssignments.map((a) => ({
            classId: a.classId,
            sectionId: a.sectionId ?? null,
          })),
        },
      },
    },
  });

  createAuditLog(session.user.id, 'CREATE_EXAM', 'EXAM', exam.id, { title: examData.title }).catch(() => {});
  revalidatePath('/teacher/exams');
  return { success: true, data: { id: exam.id } };
}

// ============================================
// Update Exam (Draft only)
// ============================================

export async function updateExamAction(id: string, input: UpdateExamInput): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) return { success: false, error: 'Exam not found' };
  if (session.user.role === 'TEACHER' && exam.createdById !== session.user.id) {
    return { success: false, error: 'You can only modify your own exams' };
  }
  if (exam.status !== 'DRAFT') return { success: false, error: 'Only draft exams can be edited' };

  const parsed = updateExamSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  await prisma.exam.update({ where: { id }, data: parsed.data });
  createAuditLog(session.user.id, 'UPDATE_EXAM', 'EXAM', id, parsed.data).catch(() => {});
  revalidatePath('/teacher/exams');
  return { success: true };
}

// ============================================
// Publish Exam
// ============================================

export async function publishExamAction(id: string): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: { examQuestions: true, examClassAssignments: true },
  });

  if (!exam) return { success: false, error: 'Exam not found' };
  if (session.user.role === 'TEACHER' && exam.createdById !== session.user.id) {
    return { success: false, error: 'You can only publish your own exams' };
  }
  if (exam.status !== 'DRAFT') return { success: false, error: 'Only draft exams can be published' };
  if (exam.examQuestions.length === 0) return { success: false, error: 'Add questions before publishing' };
  if (exam.examClassAssignments.length === 0) return { success: false, error: 'Assign to classes first' };

  await prisma.exam.update({ where: { id }, data: { status: 'PUBLISHED' } });

  // Notify active students in assigned classes
  const classIds = exam.examClassAssignments.map((a) => a.classId);
  const students = await prisma.studentProfile.findMany({
    where: {
      classId: { in: classIds },
      status: 'ACTIVE',
      user: { isActive: true, deletedAt: null },
    },
    select: { userId: true },
  });
  const studentIds = students.map((s) => s.userId);
  if (studentIds.length > 0) {
    await createBulkNotifications(
      studentIds,
      'EXAM_ASSIGNED',
      'New Exam Assigned',
      `Exam "${exam.title}" has been published. Check your dashboard.`,
      '/student/exams',
    );
  }

  createAuditLog(session.user.id, 'PUBLISH_EXAM', 'EXAM', id).catch(() => {});
  revalidatePath('/teacher/exams');
  return { success: true };
}

// ============================================
// Delete Exam (Soft)
// ============================================

export async function deleteExamAction(id: string): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const exam = await prisma.exam.findUnique({ where: { id, deletedAt: null } });
  if (!exam) return { success: false, error: 'Exam not found' };
  if (session.user.role === 'TEACHER' && exam.createdById !== session.user.id) {
    return { success: false, error: 'You can only delete your own exams' };
  }

  const sessions = await prisma.examSession.count({ where: { examId: id } });
  if (sessions > 0) return { success: false, error: 'Cannot delete exam with sessions' };

  await prisma.exam.update({ where: { id }, data: { deletedAt: new Date() } });
  createAuditLog(session.user.id, 'DELETE_EXAM', 'EXAM', id).catch(() => {});
  revalidatePath('/teacher/exams');
  return { success: true };
}
