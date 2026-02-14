'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import {
  createSubjectSchema,
  updateSubjectSchema,
  assignSubjectToClassSchema,
  bulkAssignSubjectToClassesSchema,
  assignTeacherToSubjectSchema,
  bulkAssignTeacherSubjectsSchema,
  type CreateSubjectInput,
  type UpdateSubjectInput,
  type AssignSubjectToClassInput,
  type BulkAssignSubjectToClassesInput,
  type AssignTeacherToSubjectInput,
  type BulkAssignTeacherSubjectsInput,
} from '@/validations/organization-schemas';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

// ============================================
// Subject CRUD
// ============================================

export async function createSubjectAction(input: CreateSubjectInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('ADMIN');
  const parsed = createSubjectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const existing = await prisma.subject.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { success: false, error: 'Subject code already exists' };

  const subject = await prisma.subject.create({ data: parsed.data });
  createAuditLog(session.user.id, 'CREATE_SUBJECT', 'SUBJECT', subject.id, parsed.data).catch(() => {});
  revalidatePath('/admin/subjects');
  return { success: true, data: { id: subject.id } };
}

export async function updateSubjectAction(
  id: string,
  input: UpdateSubjectInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = updateSubjectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  await prisma.subject.update({ where: { id }, data: parsed.data });
  createAuditLog(session.user.id, 'UPDATE_SUBJECT', 'SUBJECT', id, parsed.data).catch(() => {});
  revalidatePath('/admin/subjects');
  return { success: true };
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const [questions, exams] = await Promise.all([
    prisma.question.count({ where: { subjectId: id } }),
    prisma.exam.count({ where: { subjectId: id, deletedAt: null } }),
  ]);
  if (questions > 0) return { success: false, error: 'Cannot delete subject with questions' };
  if (exams > 0) return { success: false, error: 'Cannot delete subject with linked exams' };

  await prisma.subject.delete({ where: { id } });
  createAuditLog(session.user.id, 'DELETE_SUBJECT', 'SUBJECT', id).catch(() => {});
  revalidatePath('/admin/subjects');
  return { success: true };
}

// ============================================
// Subject-Class Link Actions
// ============================================

export async function assignSubjectToClassAction(input: AssignSubjectToClassInput): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = assignSubjectToClassSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const existing = await prisma.subjectClassLink.findUnique({
    where: { subjectId_classId: { subjectId: parsed.data.subjectId, classId: parsed.data.classId } },
  });

  if (existing) {
    // Re-activate if it was deactivated
    if (!existing.isActive) {
      await prisma.subjectClassLink.update({ where: { id: existing.id }, data: { isActive: true, syllabus: parsed.data.syllabus } });
    }
    return { success: true };
  }

  await prisma.subjectClassLink.create({ data: parsed.data });
  createAuditLog(session.user.id, 'ASSIGN_SUBJECT_CLASS', 'SUBJECT_CLASS_LINK', parsed.data.subjectId, parsed.data).catch(() => {});
  revalidatePath('/admin/subjects');
  return { success: true };
}

export async function bulkAssignSubjectToClassesAction(input: BulkAssignSubjectToClassesInput): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = bulkAssignSubjectToClassesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { subjectId, classIds } = parsed.data;

  // Get existing links for this subject
  const existingLinks = await prisma.subjectClassLink.findMany({ where: { subjectId } });
  const existingClassIds = new Set(existingLinks.map((l) => l.classId));

  // Deactivate links not in the new list
  const toDeactivate = existingLinks.filter((l) => !classIds.includes(l.classId) && l.isActive);
  for (const link of toDeactivate) {
    // Check if there are questions using this subject+class combo
    const questionsCount = await prisma.question.count({ where: { subjectId, classId: link.classId, deletedAt: null } });
    if (questionsCount > 0) {
      return { success: false, error: `Cannot remove class link — ${questionsCount} questions exist for this subject+class combination` };
    }
  }

  await prisma.$transaction(async (tx) => {
    // Deactivate removed links
    if (toDeactivate.length > 0) {
      await tx.subjectClassLink.updateMany({
        where: { id: { in: toDeactivate.map((l) => l.id) } },
        data: { isActive: false },
      });
    }

    // Activate or create new links
    for (const classId of classIds) {
      if (existingClassIds.has(classId)) {
        await tx.subjectClassLink.update({
          where: { subjectId_classId: { subjectId, classId } },
          data: { isActive: true },
        });
      } else {
        await tx.subjectClassLink.create({ data: { subjectId, classId } });
      }
    }
  });

  createAuditLog(session.user.id, 'BULK_ASSIGN_SUBJECT_CLASSES', 'SUBJECT', subjectId, { classIds }).catch(() => {});
  revalidatePath('/admin/subjects');
  return { success: true };
}

export async function removeSubjectFromClassAction(subjectId: string, classId: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  const questionsCount = await prisma.question.count({ where: { subjectId, classId, deletedAt: null } });
  if (questionsCount > 0) {
    return { success: false, error: `Cannot remove — ${questionsCount} questions exist for this subject+class combo` };
  }

  await prisma.subjectClassLink.updateMany({
    where: { subjectId, classId },
    data: { isActive: false },
  });

  createAuditLog(session.user.id, 'REMOVE_SUBJECT_CLASS', 'SUBJECT_CLASS_LINK', subjectId, { classId }).catch(() => {});
  revalidatePath('/admin/subjects');
  return { success: true };
}

// ============================================
// Teacher-Subject Assignment Actions
// ============================================

export async function assignTeacherToSubjectAction(input: AssignTeacherToSubjectInput): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = assignTeacherToSubjectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const existing = await prisma.teacherSubject.findUnique({
    where: { teacherId_subjectId: { teacherId: parsed.data.teacherId, subjectId: parsed.data.subjectId } },
  });
  if (existing) return { success: true }; // Already assigned

  await prisma.teacherSubject.create({ data: parsed.data });
  createAuditLog(session.user.id, 'ASSIGN_TEACHER_SUBJECT', 'TEACHER_SUBJECT', parsed.data.teacherId, parsed.data).catch(() => {});
  revalidatePath('/admin/subjects');
  revalidatePath('/admin/users');
  return { success: true };
}

export async function bulkAssignTeacherSubjectsAction(input: BulkAssignTeacherSubjectsInput): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = bulkAssignTeacherSubjectsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { teacherId, subjectIds } = parsed.data;

  // Get existing assignments
  const existing = await prisma.teacherSubject.findMany({ where: { teacherId } });
  const existingSubjectIds = new Set(existing.map((e) => e.subjectId));

  await prisma.$transaction(async (tx) => {
    // Remove unselected
    const toRemove = existing.filter((e) => !subjectIds.includes(e.subjectId));
    if (toRemove.length > 0) {
      await tx.teacherSubject.deleteMany({ where: { id: { in: toRemove.map((e) => e.id) } } });
    }

    // Add new
    for (const subjectId of subjectIds) {
      if (!existingSubjectIds.has(subjectId)) {
        await tx.teacherSubject.create({ data: { teacherId, subjectId } });
      }
    }
  });

  createAuditLog(session.user.id, 'BULK_ASSIGN_TEACHER_SUBJECTS', 'TEACHER_SUBJECT', teacherId, { subjectIds }).catch(() => {});
  revalidatePath('/admin/subjects');
  revalidatePath('/admin/users');
  return { success: true };
}

export async function removeTeacherFromSubjectAction(teacherId: string, subjectId: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  await prisma.teacherSubject.deleteMany({ where: { teacherId, subjectId } });
  createAuditLog(session.user.id, 'REMOVE_TEACHER_SUBJECT', 'TEACHER_SUBJECT', teacherId, { subjectId }).catch(() => {});
  revalidatePath('/admin/subjects');
  revalidatePath('/admin/users');
  return { success: true };
}
