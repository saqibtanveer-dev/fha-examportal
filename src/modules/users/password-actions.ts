'use server';

import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-utils';
import { changePasswordSchema, type ChangePasswordInput } from '@/validations/password-schemas';
import { createAuditLog } from '@/modules/audit/audit-queries';
import bcrypt from 'bcryptjs';
import type { ActionResult } from '@/types/action-result';

const SALT_ROUNDS = 12;

export async function changePasswordAction(input: ChangePasswordInput): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) return { success: false, error: 'User not found' };

  const validCurrent = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!validCurrent) return { success: false, error: 'Current password is incorrect' };

  const hash = await bcrypt.hash(parsed.data.newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hash },
  });

  createAuditLog(session.user.id, 'CHANGE_PASSWORD', 'USER', session.user.id).catch(() => {});

  return { success: true };
}
