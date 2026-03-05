'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import { hasTeacherDutyConflict } from './datesheet-queries';
import { MAX_DUTIES_PER_ENTRY } from './datesheet.constants';
import {
  assignDutySchema,
  updateDutySchema,
  type AssignDutyInput,
  type UpdateDutyInput,
} from '@/validations/datesheet-schemas';

function revalidatePaths() {
  revalidatePath('/admin/datesheet');
  revalidatePath('/teacher/datesheet');
}

// ── Assign Duty ──

export const assignDutyAction = safeAction(
  async function assignDutyAction(input: AssignDutyInput): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');

    const parsed = assignDutySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    const entry = await prisma.datesheetEntry.findUnique({
      where: { id: data.datesheetEntryId },
      include: {
        datesheet: { select: { status: true } },
        _count: { select: { duties: true } },
      },
    });
    if (!entry) return actionError('Entry not found');
    if (entry.datesheet.status !== 'DRAFT') return actionError('Cannot assign duties to a non-DRAFT datesheet');
    if (entry._count.duties >= MAX_DUTIES_PER_ENTRY) return actionError(`Maximum ${MAX_DUTIES_PER_ENTRY} duties per entry`);

    const conflict = await hasTeacherDutyConflict(
      data.teacherProfileId, entry.examDate, entry.startTime, entry.endTime, entry.id,
    );
    if (conflict) return actionError('Teacher has a conflicting duty at this time');

    const duty = await prisma.datesheetDuty.create({
      data: {
        datesheetEntryId: data.datesheetEntryId,
        teacherProfileId: data.teacherProfileId,
        role: data.role,
        room: data.room,
        notes: data.notes,
      },
    });

    createAuditLog(session.user.id, 'ASSIGN_DATESHEET_DUTY', 'DATESHEET_DUTY', duty.id, data).catch(() => {});
    revalidatePaths();
    return actionSuccess({ id: duty.id });
  },
);

// ── Update Duty ──

export const updateDutyAction = safeAction(
  async function updateDutyAction(id: string, input: UpdateDutyInput): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const parsed = updateDutySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const duty = await prisma.datesheetDuty.findUnique({
      where: { id },
      include: { datesheetEntry: { include: { datesheet: { select: { status: true } } } } },
    });
    if (!duty) return actionError('Duty not found');
    if (duty.datesheetEntry.datesheet.status !== 'DRAFT') return actionError('Cannot edit duties of a non-DRAFT datesheet');

    const data = parsed.data;
    await prisma.datesheetDuty.update({
      where: { id },
      data: {
        ...(data.role && { role: data.role }),
        ...(data.room !== undefined && { room: data.room }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    createAuditLog(session.user.id, 'UPDATE_DATESHEET_DUTY', 'DATESHEET_DUTY', id, data).catch(() => {});
    revalidatePaths();
    return actionSuccess();
  },
);

// ── Remove Duty ──

export const removeDutyAction = safeAction(
  async function removeDutyAction(id: string): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const duty = await prisma.datesheetDuty.findUnique({
      where: { id },
      include: { datesheetEntry: { include: { datesheet: { select: { status: true } } } } },
    });
    if (!duty) return actionError('Duty not found');
    if (duty.datesheetEntry.datesheet.status !== 'DRAFT') return actionError('Cannot remove duties from a non-DRAFT datesheet');

    await prisma.datesheetDuty.delete({ where: { id } });

    createAuditLog(session.user.id, 'REMOVE_DATESHEET_DUTY', 'DATESHEET_DUTY', id).catch(() => {});
    revalidatePaths();
    return actionSuccess();
  },
);
