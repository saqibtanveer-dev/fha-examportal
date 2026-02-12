'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import {
  createAcademicSessionSchema,
  updateAcademicSessionSchema,
  type CreateAcademicSessionInput,
  type UpdateAcademicSessionInput,
} from '@/validations/organization-schemas';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

export async function createAcademicSessionAction(
  input: CreateAcademicSessionInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('ADMIN');
  const parsed = createAcademicSessionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { isCurrent, startDate, endDate, ...rest } = parsed.data;

  // If setting as current, unset other current sessions
  if (isCurrent) {
    await prisma.academicSession.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
  }

  const academicSession = await prisma.academicSession.create({
    data: {
      ...rest,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isCurrent: isCurrent ?? false,
    },
  });

  createAuditLog(session.user.id, 'CREATE_ACADEMIC_SESSION', 'ACADEMIC_SESSION', academicSession.id, rest).catch(() => {});
  revalidatePath('/admin/settings');
  return { success: true, data: { id: academicSession.id } };
}

export async function updateAcademicSessionAction(
  id: string,
  input: UpdateAcademicSessionInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');
  const parsed = updateAcademicSessionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { isCurrent, startDate, endDate, ...rest } = parsed.data;

  // If setting as current, unset other current sessions
  if (isCurrent) {
    await prisma.academicSession.updateMany({
      where: { isCurrent: true, id: { not: id } },
      data: { isCurrent: false },
    });
  }

  await prisma.academicSession.update({
    where: { id },
    data: {
      ...rest,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
      ...(isCurrent !== undefined ? { isCurrent } : {}),
    },
  });

  createAuditLog(session.user.id, 'UPDATE_ACADEMIC_SESSION', 'ACADEMIC_SESSION', id, parsed.data).catch(() => {});
  revalidatePath('/admin/settings');
  return { success: true };
}

export async function setCurrentAcademicSessionAction(id: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  await prisma.$transaction([
    prisma.academicSession.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    }),
    prisma.academicSession.update({
      where: { id },
      data: { isCurrent: true },
    }),
  ]);

  createAuditLog(session.user.id, 'SET_CURRENT_SESSION', 'ACADEMIC_SESSION', id).catch(() => {});
  revalidatePath('/admin/settings');
  return { success: true };
}

export async function deleteAcademicSessionAction(id: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  const examCount = await prisma.exam.count({ where: { academicSessionId: id } });
  if (examCount > 0) {
    return { success: false, error: `Cannot delete — ${examCount} exams are linked to this session` };
  }

  const academicSession = await prisma.academicSession.findUnique({ where: { id } });
  if (academicSession?.isCurrent) {
    return { success: false, error: 'Cannot delete the current active session' };
  }

  await prisma.academicSession.delete({ where: { id } });
  createAuditLog(session.user.id, 'DELETE_ACADEMIC_SESSION', 'ACADEMIC_SESSION', id).catch(() => {});
  revalidatePath('/admin/settings');
  return { success: true };
}
