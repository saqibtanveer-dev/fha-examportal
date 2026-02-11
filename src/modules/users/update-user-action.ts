'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { updateUserSchema, type UpdateUserInput } from '@/validations/user-schemas';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { createAuditLog } from '@/modules/audit/audit-queries';

export async function updateUserAction(
  id: string,
  input: UpdateUserInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');
  }

  const user = await prisma.user.findUnique({ where: { id, deletedAt: null } });
  if (!user) return actionError('User not found');

  await prisma.user.update({
    where: { id },
    data: parsed.data,
  });

  createAuditLog(session.user.id, 'UPDATE_USER', 'USER', id, parsed.data).catch(() => {});
  revalidatePath('/admin/users');
  return actionSuccess();
}
