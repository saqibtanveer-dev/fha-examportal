'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
} from '@/validations/organization-schemas';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

export async function createDepartmentAction(input: CreateDepartmentInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('ADMIN');
  const parsed = createDepartmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const dept = await prisma.department.create({ data: parsed.data });
  createAuditLog(session.user.id, 'CREATE_DEPARTMENT', 'DEPARTMENT', dept.id, parsed.data).catch(() => {});
  revalidatePath('/admin/departments');
  return { success: true, data: { id: dept.id } };
}

export async function updateDepartmentAction(
  id: string,
  input: UpdateDepartmentInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = updateDepartmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  await prisma.department.update({ where: { id }, data: parsed.data });
  createAuditLog(session.user.id, 'UPDATE_DEPARTMENT', 'DEPARTMENT', id, parsed.data).catch(() => {});
  revalidatePath('/admin/departments');
  return { success: true };
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const subjects = await prisma.subject.count({ where: { departmentId: id } });
  if (subjects > 0) {
    return { success: false, error: 'Cannot delete department with associated subjects' };
  }
  await prisma.department.delete({ where: { id } });
  createAuditLog(session.user.id, 'DELETE_DEPARTMENT', 'DEPARTMENT', id).catch(() => {});
  revalidatePath('/admin/departments');
  return { success: true };
}
