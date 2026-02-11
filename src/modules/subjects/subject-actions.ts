'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import {
  createSubjectSchema,
  updateSubjectSchema,
  type CreateSubjectInput,
  type UpdateSubjectInput,
} from '@/validations/organization-schemas';
import { revalidatePath } from 'next/cache';

type ActionResult = { success: boolean; error?: string; data?: unknown };

export async function createSubjectAction(input: CreateSubjectInput): Promise<ActionResult> {
  await requireRole('ADMIN');
  const parsed = createSubjectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const existing = await prisma.subject.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { success: false, error: 'Subject code already exists' };

  const subject = await prisma.subject.create({ data: parsed.data });
  revalidatePath('/admin/subjects');
  return { success: true, data: { id: subject.id } };
}

export async function updateSubjectAction(
  id: string,
  input: UpdateSubjectInput,
): Promise<ActionResult> {
  await requireRole('ADMIN');
  const parsed = updateSubjectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  await prisma.subject.update({ where: { id }, data: parsed.data });
  revalidatePath('/admin/subjects');
  return { success: true };
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  await requireRole('ADMIN');
  const questions = await prisma.question.count({ where: { subjectId: id } });
  if (questions > 0) return { success: false, error: 'Cannot delete subject with questions' };

  await prisma.subject.delete({ where: { id } });
  revalidatePath('/admin/subjects');
  return { success: true };
}
