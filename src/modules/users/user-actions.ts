'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { createUserSchema, type CreateUserInput } from '@/validations/user-schemas';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { toggleUserActive, softDeleteUser } from './user-queries';

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

// ============================================
// Create User
// ============================================

export async function createUserAction(input: CreateUserInput): Promise<ActionResult> {
  await requireRole('ADMIN');

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

  revalidatePath('/admin/users');
  return { success: true, data: { id: user.id } };
}

// ============================================
// Toggle User Active
// ============================================

export async function toggleUserActiveAction(userId: string): Promise<ActionResult> {
  await requireRole('ADMIN');

  const user = await toggleUserActive(userId);
  if (!user) return { success: false, error: 'User not found' };

  revalidatePath('/admin/users');
  return { success: true };
}

// ============================================
// Delete User (Soft)
// ============================================

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  await requireRole('ADMIN');

  await softDeleteUser(userId);
  revalidatePath('/admin/users');
  return { success: true };
}
