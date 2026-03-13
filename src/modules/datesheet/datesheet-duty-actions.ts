'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import { hasTeacherDutyConflict } from './datesheet-duty-conflict';
import { MAX_DUTIES_PER_ENTRY } from './datesheet.constants';
import { lockTransactionKeys, runSerializableTransaction } from '@/lib/transaction-locks';
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

function dutyTimeLockKey(teacherProfileId: string, examDate: Date, startTime: string, endTime: string): string {
  const dateKey = examDate.toISOString().slice(0, 10);
  return `ds-duty:teacher:${teacherProfileId}:${dateKey}:${startTime}:${endTime}`;
}

function datesheetEntryLockKey(entryId: string): string {
  return `ds-entry:${entryId}`;
}

// ── Assign Duty ──

export const assignDutyAction = safeAction(
  async function assignDutyAction(input: AssignDutyInput): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');

    const parsed = assignDutySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    const txResult = await runSerializableTransaction(async (tx) => {
      const entry = await tx.datesheetEntry.findUnique({
        where: { id: data.datesheetEntryId },
        include: {
          datesheet: { select: { status: true } },
          _count: { select: { duties: true } },
        },
      });
      if (!entry) return { error: 'Entry not found' } as const;

      await lockTransactionKeys(tx, [
        datesheetEntryLockKey(entry.id),
        dutyTimeLockKey(data.teacherProfileId, entry.examDate, entry.startTime, entry.endTime),
      ]);

      if (entry.datesheet.status !== 'DRAFT') return { error: 'Cannot assign duties to a non-DRAFT datesheet' } as const;
      if (entry._count.duties >= MAX_DUTIES_PER_ENTRY) return { error: `Maximum ${MAX_DUTIES_PER_ENTRY} duties per entry` } as const;

      const conflict = await hasTeacherDutyConflict(
        data.teacherProfileId,
        entry.examDate,
        entry.startTime,
        entry.endTime,
        {
          classId: entry.classId,
          subjectId: entry.subjectId,
          room: data.room ?? entry.room,
          excludeEntryId: entry.id,
        },
        tx,
      );
      if (conflict) return { error: 'Teacher has a conflicting duty at this time' } as const;

      const duty = await tx.datesheetDuty.create({
        data: {
          datesheetEntryId: data.datesheetEntryId,
          teacherProfileId: data.teacherProfileId,
          role: data.role,
          room: data.room,
          notes: data.notes,
        },
      });

      return { duty } as const;
    });

    if (txResult.error) return actionError(txResult.error);
    const duty = txResult.duty;

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

    const data = parsed.data;

    const txResult = await runSerializableTransaction(async (tx) => {
      const duty = await tx.datesheetDuty.findUnique({
        where: { id },
        include: { datesheetEntry: { include: { datesheet: { select: { status: true } } } } },
      });
      if (!duty) return { error: 'Duty not found' } as const;

      await lockTransactionKeys(tx, [
        datesheetEntryLockKey(duty.datesheetEntry.id),
        dutyTimeLockKey(duty.teacherProfileId, duty.datesheetEntry.examDate, duty.datesheetEntry.startTime, duty.datesheetEntry.endTime),
      ]);

      if (duty.datesheetEntry.datesheet.status !== 'DRAFT') {
        return { error: 'Cannot edit duties of a non-DRAFT datesheet' } as const;
      }

      const conflict = await hasTeacherDutyConflict(
        duty.teacherProfileId,
        duty.datesheetEntry.examDate,
        duty.datesheetEntry.startTime,
        duty.datesheetEntry.endTime,
        {
          classId: duty.datesheetEntry.classId,
          subjectId: duty.datesheetEntry.subjectId,
          room: data.room ?? duty.room ?? duty.datesheetEntry.room,
          excludeEntryId: duty.datesheetEntry.id,
        },
        tx,
      );
      if (conflict) return { error: 'Teacher has a conflicting duty at this time' } as const;

      await tx.datesheetDuty.update({
        where: { id },
        data: {
          ...(data.role && { role: data.role }),
          ...(data.room !== undefined && { room: data.room }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });

      return { ok: true } as const;
    });

    if (txResult.error) return actionError(txResult.error);

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
