'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { createUserSchema, type CreateUserInput } from '@/validations/user-schemas';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { toggleUserActive, softDeleteUser } from './user-queries';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

// ============================================
// Create User
// ============================================

export async function createUserAction(input: CreateUserInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('ADMIN');

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' };
  }

  const { email, password, firstName, lastName, role, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'A user with this email already exists' };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role, phone },
  });

  createAuditLog(session.user.id, 'CREATE_USER', 'USER', user.id, { email, role }).catch(() => {});
  revalidatePath('/admin/users');
  return { success: true, data: { id: user.id } };
}

// ============================================
// Toggle User Active
// ============================================

export async function toggleUserActiveAction(userId: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  const user = await toggleUserActive(userId);
  if (!user) return { success: false, error: 'User not found' };

  createAuditLog(session.user.id, 'TOGGLE_USER_ACTIVE', 'USER', userId, { isActive: user.isActive }).catch(() => {});
  revalidatePath('/admin/users');
  return { success: true };
}

// ============================================
// Delete User (Soft)
// ============================================

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  await softDeleteUser(userId);
  createAuditLog(session.user.id, 'DELETE_USER', 'USER', userId).catch(() => {});
  revalidatePath('/admin/users');
  return { success: true };
}
