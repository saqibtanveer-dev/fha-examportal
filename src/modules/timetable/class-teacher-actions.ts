'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';

import { logger } from '@/lib/logger';
export const assignClassTeacherAction = safeAction(
  async function assignClassTeacherAction(
    sectionId: string,
    userId: string | null,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) return actionError('Section not found');

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, isActive: true },
      });
      if (!user) return actionError('User not found');
      if (user.role !== 'TEACHER') return actionError('Only teachers can be assigned as class teacher');
      if (!user.isActive) return actionError('Cannot assign inactive teacher');
    }

    await prisma.section.update({
      where: { id: sectionId },
      data: { classTeacherId: userId },
    });

    createAuditLog(session.user.id, 'ASSIGN_CLASS_TEACHER', 'SECTION', sectionId, {
      classTeacherId: userId,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidatePath('/admin/timetable');
    revalidatePath('/teacher/timetable');
    revalidatePath('/admin/classes');
    return actionSuccess();
  },
);
