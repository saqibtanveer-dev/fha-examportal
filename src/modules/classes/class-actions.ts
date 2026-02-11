'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import {
  createClassSchema,
  createSectionSchema,
  type CreateClassInput,
  type CreateSectionInput,
} from '@/validations/organization-schemas';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

export async function createClassAction(input: CreateClassInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('ADMIN');
  const parsed = createClassSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const cls = await prisma.class.create({ data: { name: parsed.data.name, grade: parsed.data.grade } });
  createAuditLog(session.user.id, 'CREATE_CLASS', 'CLASS', cls.id, parsed.data).catch(() => {});
  revalidatePath('/admin/classes');
  return { success: true, data: { id: cls.id } };
}

export async function createSectionAction(input: CreateSectionInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('ADMIN');
  const parsed = createSectionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const existing = await prisma.section.findUnique({
    where: { classId_name: { classId: parsed.data.classId, name: parsed.data.name } },
  });
  if (existing) return { success: false, error: 'Section already exists in this class' };

  const section = await prisma.section.create({ data: parsed.data });
  createAuditLog(session.user.id, 'CREATE_SECTION', 'SECTION', section.id, parsed.data).catch(() => {});
  revalidatePath('/admin/classes');
  return { success: true, data: { id: section.id } };
}

export async function deleteClassAction(id: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const students = await prisma.studentProfile.count({ where: { classId: id } });
  if (students > 0) return { success: false, error: 'Cannot delete class with students' };

  await prisma.class.delete({ where: { id } });
  createAuditLog(session.user.id, 'DELETE_CLASS', 'CLASS', id).catch(() => {});
  revalidatePath('/admin/classes');
  return { success: true };
}

export async function deleteSectionAction(id: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const students = await prisma.studentProfile.count({ where: { sectionId: id } });
  if (students > 0) return { success: false, error: 'Cannot delete section with students' };

  await prisma.section.delete({ where: { id } });
  createAuditLog(session.user.id, 'DELETE_SECTION', 'SECTION', id).catch(() => {});
  revalidatePath('/admin/classes');
  return { success: true };
}
