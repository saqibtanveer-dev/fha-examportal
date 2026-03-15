'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { assertTeacherSubjectSectionAccess, getTeacherProfileIdOrThrow } from '@/lib/authorization-guards';
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
import { isSubjectElectiveForClass } from '@/lib/enrollment-helpers';
import { safeAction } from '@/lib/safe-action';

import { logger } from '@/lib/logger';
// ============================================
// Create Exam
// ============================================

export const createExamAction = safeAction(async function createExamAction(input: CreateExamInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const parsed = createExamSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { questions, classAssignments, scheduledStartAt, scheduledEndAt, academicSessionId, ...examData } = parsed.data;

  // Validate teacher has section access for all assigned class-sections
  if (session.user.role === 'TEACHER') {
    const teacherProfileId = await getTeacherProfileIdOrThrow(session.user.id);
    for (const assignment of classAssignments) {
      await assertTeacherSubjectSectionAccess(
        teacherProfileId,
        examData.subjectId,
        assignment.classId,
        assignment.sectionId,
      );
    }
  }

  // For written exams, enforce certain defaults
  if (examData.deliveryMode === 'WRITTEN') {
    examData.shuffleQuestions = false;
    examData.maxAttempts = 1;
  }

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
            sectionId: a.sectionId,
          })),
        },
      },
    },
  });

  createAuditLog(session.user.id, 'CREATE_EXAM', 'EXAM', exam.id, { title: examData.title }).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath('/teacher/exams');
  return { success: true, data: { id: exam.id } };
});

// ============================================
// Update Exam (Draft only)
// ============================================

export const updateExamAction = safeAction(async function updateExamAction(id: string, input: UpdateExamInput): Promise<ActionResult> {
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
  createAuditLog(session.user.id, 'UPDATE_EXAM', 'EXAM', id, parsed.data).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath('/teacher/exams');
  return { success: true };
});

// ============================================
// Publish Exam
// ============================================

export const publishExamAction = safeAction(async function publishExamAction(id: string): Promise<ActionResult> {
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

  // Skip student notifications for written exams (students don't see them on portal)
  if (exam.deliveryMode !== 'WRITTEN') {
    const sectionIds = exam.examClassAssignments.map((a) => a.sectionId);
    const students = await prisma.studentProfile.findMany({
      where: {
        sectionId: { in: sectionIds },
        status: 'ACTIVE',
        user: { isActive: true, deletedAt: null },
      },
      select: { id: true, userId: true, classId: true },
    });

    // Filter: only notify students enrolled in the subject (for electives)
    let studentUserIds = students.map((s) => s.userId);
    const firstStudent = students.at(0);
    if (firstStudent) {
      const isElective = await isSubjectElectiveForClass(exam.subjectId, firstStudent.classId);
      if (isElective) {
        const currentSession = await prisma.academicSession.findFirst({
          where: { isCurrent: true }, select: { id: true },
        });
        if (currentSession) {
          const enrolledStudents = await prisma.studentSubjectEnrollment.findMany({
            where: { subjectId: exam.subjectId, academicSessionId: currentSession.id, isActive: true },
            select: { studentProfileId: true },
          });
          const enrolledIds = new Set(enrolledStudents.map((e) => e.studentProfileId));
          studentUserIds = students.filter((s) => enrolledIds.has(s.id)).map((s) => s.userId);
        }
      }
    }

    if (studentUserIds.length > 0) {
      await createBulkNotifications(
        studentUserIds,
        'EXAM_ASSIGNED',
        'New Exam Assigned',
        `Exam "${exam.title}" has been published. Check your dashboard.`,
        '/student/exams',
      );
    }
  }

  createAuditLog(session.user.id, 'PUBLISH_EXAM', 'EXAM', id).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath('/teacher/exams');
  return { success: true };
});

// ============================================
// Delete Exam (Soft)
// ============================================

export const deleteExamAction = safeAction(async function deleteExamAction(id: string): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const exam = await prisma.exam.findUnique({ where: { id, deletedAt: null } });
  if (!exam) return { success: false, error: 'Exam not found' };
  if (session.user.role === 'TEACHER' && exam.createdById !== session.user.id) {
    return { success: false, error: 'You can only delete your own exams' };
  }

  const sessions = await prisma.examSession.count({ where: { examId: id } });
  if (sessions > 0) return { success: false, error: 'Cannot delete exam with sessions' };

  await prisma.exam.update({ where: { id }, data: { deletedAt: new Date() } });
  createAuditLog(session.user.id, 'DELETE_EXAM', 'EXAM', id).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath('/teacher/exams');
  return { success: true };
});
