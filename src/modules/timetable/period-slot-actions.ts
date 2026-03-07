'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import {
  createPeriodSlotSchema,
  updatePeriodSlotSchema,
  type CreatePeriodSlotInput,
  type UpdatePeriodSlotInput,
} from '@/validations/timetable-schemas';
import { isEndAfterStart } from './timetable.utils';

function revalidateTimetablePaths() {
  revalidatePath('/admin/timetable');
  revalidatePath('/teacher/timetable');
}

export const createPeriodSlotAction = safeAction(
  async function createPeriodSlotAction(input: CreatePeriodSlotInput): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');

    const parsed = createPeriodSlotSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    if (!isEndAfterStart(data.startTime, data.endTime)) {
      return actionError('End time must be after start time');
    }

    const slot = await prisma.periodSlot.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        startTime: data.startTime,
        endTime: data.endTime,
        sortOrder: data.sortOrder,
        isBreak: data.isBreak,
        classId: data.classId ?? null,
      },
    });

    createAuditLog(session.user.id, 'CREATE_PERIOD_SLOT', 'PERIOD_SLOT', slot.id, data).catch(() => {});
    revalidateTimetablePaths();
    return actionSuccess({ id: slot.id });
  },
);

export const updatePeriodSlotAction = safeAction(
  async function updatePeriodSlotAction(id: string, input: UpdatePeriodSlotInput): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const parsed = updatePeriodSlotSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const existing = await prisma.periodSlot.findUnique({ where: { id } });
    if (!existing) return actionError('Period slot not found');

    const data = parsed.data;
    const startTime = data.startTime ?? existing.startTime;
    const endTime = data.endTime ?? existing.endTime;
    if (!isEndAfterStart(startTime, endTime)) {
      return actionError('End time must be after start time');
    }

    await prisma.periodSlot.update({ where: { id }, data });
    createAuditLog(session.user.id, 'UPDATE_PERIOD_SLOT', 'PERIOD_SLOT', id, data).catch(() => {});
    revalidateTimetablePaths();
    return actionSuccess();
  },
);

export const deletePeriodSlotAction = safeAction(
  async function deletePeriodSlotAction(id: string): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const linkedEntries = await prisma.timetableEntry.count({ where: { periodSlotId: id, isActive: true } });
    if (linkedEntries > 0) {
      return actionError(`Cannot delete period slot with ${linkedEntries} active timetable entries`);
    }

    await prisma.periodSlot.delete({ where: { id } });
    createAuditLog(session.user.id, 'DELETE_PERIOD_SLOT', 'PERIOD_SLOT', id).catch(() => {});
    revalidateTimetablePaths();
    return actionSuccess();
  },
);
