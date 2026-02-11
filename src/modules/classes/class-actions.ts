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

type ActionResult = { success: boolean; error?: string; data?: unknown };

export async function createClassAction(input: CreateClassInput): Promise<ActionResult> {
  await requireRole('ADMIN');
  const parsed = createClassSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const cls = await prisma.class.create({ data: { name: parsed.data.name, grade: parsed.data.grade } });
  revalidatePath('/admin/classes');
  return { success: true, data: { id: cls.id } };
}

export async function createSectionAction(input: CreateSectionInput): Promise<ActionResult> {
  await requireRole('ADMIN');
  const parsed = createSectionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const existing = await prisma.section.findUnique({
    where: { classId_name: { classId: parsed.data.classId, name: parsed.data.name } },
  });
  if (existing) return { success: false, error: 'Section already exists in this class' };

  const section = await prisma.section.create({ data: parsed.data });
  revalidatePath('/admin/classes');
  return { success: true, data: { id: section.id } };
}

export async function deleteClassAction(id: string): Promise<ActionResult> {
  await requireRole('ADMIN');
  const students = await prisma.studentProfile.count({ where: { classId: id } });
  if (students > 0) return { success: false, error: 'Cannot delete class with students' };

  await prisma.class.delete({ where: { id } });
  revalidatePath('/admin/classes');
  return { success: true };
}

export async function deleteSectionAction(id: string): Promise<ActionResult> {
  await requireRole('ADMIN');
  const students = await prisma.studentProfile.count({ where: { sectionId: id } });
  if (students > 0) return { success: false, error: 'Cannot delete section with students' };

  await prisma.section.delete({ where: { id } });
  revalidatePath('/admin/classes');
  return { success: true };
}
