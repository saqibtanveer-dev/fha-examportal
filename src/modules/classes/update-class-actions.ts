'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { createAuditLog } from '@/modules/audit/audit-queries';

const updateClassSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  grade: z.number().int().min(1).max(12).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateClassInput = z.infer<typeof updateClassSchema>;

export async function updateClassAction(
  id: string,
  input: UpdateClassInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  const parsed = updateClassSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');
  }

  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls) return actionError('Class not found');

  await prisma.class.update({ where: { id }, data: parsed.data });
  createAuditLog(session.user.id, 'UPDATE_CLASS', 'CLASS', id, parsed.data).catch(() => {});
  revalidatePath('/admin/classes');
  return actionSuccess();
}

const updateSectionSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;

export async function updateSectionAction(
  id: string,
  input: UpdateSectionInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  const parsed = updateSectionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');
  }

  await prisma.section.update({ where: { id }, data: parsed.data });
  createAuditLog(session.user.id, 'UPDATE_SECTION', 'SECTION', id, parsed.data).catch(() => {});
  revalidatePath('/admin/classes');
  return actionSuccess();
}
