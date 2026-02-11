'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';
import type { ActionResult } from '@/types/action-result';

const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  category: z.enum(['TOPIC', 'DIFFICULTY', 'BLOOM_LEVEL', 'CUSTOM']),
});

const updateTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50).optional(),
  category: z.enum(['TOPIC', 'DIFFICULTY', 'BLOOM_LEVEL', 'CUSTOM']).optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

export async function createTagAction(input: CreateTagInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const parsed = createTagSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const existing = await prisma.tag.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { success: false, error: 'Tag with this name already exists' };

  const tag = await prisma.tag.create({ data: parsed.data });

  createAuditLog(session.user.id, 'CREATE_TAG', 'TAG', tag.id, { name: tag.name }).catch(() => {});
  revalidatePath('/teacher/questions');
  return { success: true, data: { id: tag.id } };
}

export async function updateTagAction(id: string, input: UpdateTagInput): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const parsed = updateTagSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  await prisma.tag.update({ where: { id }, data: parsed.data });

  createAuditLog(session.user.id, 'UPDATE_TAG', 'TAG', id).catch(() => {});
  revalidatePath('/teacher/questions');
  return { success: true };
}

export async function deleteTagAction(id: string): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const usageCount = await prisma.questionTag.count({ where: { tagId: id } });
  if (usageCount > 0) {
    return { success: false, error: `Cannot delete: tag used by ${usageCount} questions` };
  }

  await prisma.tag.delete({ where: { id } });

  createAuditLog(session.user.id, 'DELETE_TAG', 'TAG', id).catch(() => {});
  revalidatePath('/teacher/questions');
  return { success: true };
}
