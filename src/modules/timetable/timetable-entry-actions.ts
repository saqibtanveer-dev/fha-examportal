'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import {
  createTimetableEntrySchema,
  updateTimetableEntrySchema,
  bulkCreateTimetableSchema,
  type CreateTimetableEntryInput,
  type UpdateTimetableEntryInput,
  type BulkCreateTimetableInput,
} from '@/validations/timetable-schemas';
import { hasTeacherConflict } from './timetable-queries';

function revalidateTimetablePaths() {
  revalidatePath('/admin/timetable');
  revalidatePath('/teacher/timetable');
}

// ── Create Entry ──

export const createTimetableEntryAction = safeAction(
  async function createTimetableEntryAction(input: CreateTimetableEntryInput): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');

    const parsed = createTimetableEntrySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    const periodSlot = await prisma.periodSlot.findUnique({ where: { id: data.periodSlotId } });
    if (!periodSlot) return actionError('Period slot not found');
    if (periodSlot.isBreak) return actionError('Cannot assign a subject to a break period');

    const conflict = await hasTeacherConflict(
      data.teacherProfileId, data.periodSlotId, data.dayOfWeek, data.academicSessionId,
    );
    if (conflict) return actionError('Teacher is already assigned to another class in this period');

    const entry = await prisma.timetableEntry.create({
      data: {
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherProfileId: data.teacherProfileId,
        periodSlotId: data.periodSlotId,
        dayOfWeek: data.dayOfWeek,
        academicSessionId: data.academicSessionId,
        room: data.room,
      },
    });

    createAuditLog(session.user.id, 'CREATE_TIMETABLE_ENTRY', 'TIMETABLE_ENTRY', entry.id, data).catch(() => {});
    revalidateTimetablePaths();
    return actionSuccess({ id: entry.id });
  },
);

// ── Update Entry ──

export const updateTimetableEntryAction = safeAction(
  async function updateTimetableEntryAction(id: string, input: UpdateTimetableEntryInput): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const parsed = updateTimetableEntrySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const existing = await prisma.timetableEntry.findUnique({ where: { id } });
    if (!existing) return actionError('Timetable entry not found');

    const data = parsed.data;

    if (data.teacherProfileId && data.teacherProfileId !== existing.teacherProfileId) {
      const conflict = await hasTeacherConflict(
        data.teacherProfileId, existing.periodSlotId, existing.dayOfWeek, existing.academicSessionId, id,
      );
      if (conflict) return actionError('Teacher is already assigned to another class in this period');
    }

    await prisma.timetableEntry.update({ where: { id }, data });
    createAuditLog(session.user.id, 'UPDATE_TIMETABLE_ENTRY', 'TIMETABLE_ENTRY', id, data).catch(() => {});
    revalidateTimetablePaths();
    return actionSuccess();
  },
);

// ── Delete Entry ──

export const deleteTimetableEntryAction = safeAction(
  async function deleteTimetableEntryAction(id: string): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const linkedAttendance = await prisma.subjectAttendance.count({ where: { timetableEntryId: id } });
    if (linkedAttendance > 0) {
      return actionError('Cannot delete timetable entry with linked attendance records. Deactivate instead.');
    }

    await prisma.timetableEntry.delete({ where: { id } });
    createAuditLog(session.user.id, 'DELETE_TIMETABLE_ENTRY', 'TIMETABLE_ENTRY', id).catch(() => {});
    revalidateTimetablePaths();
    return actionSuccess();
  },
);

// ── Bulk Create ──

export const bulkCreateTimetableAction = safeAction(
  async function bulkCreateTimetableAction(input: BulkCreateTimetableInput): Promise<ActionResult<{ created: number }>> {
    const session = await requireRole('ADMIN');

    const parsed = bulkCreateTimetableSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const entries = parsed.data.entries;

    const batchKeys = new Set<string>();
    for (const entry of entries) {
      const key = `${entry.teacherProfileId}-${entry.periodSlotId}-${entry.dayOfWeek}-${entry.academicSessionId}`;
      if (batchKeys.has(key)) {
        return actionError('Duplicate teacher assignment in the same batch: same period and day');
      }
      batchKeys.add(key);
    }

    for (const entry of entries) {
      const conflict = await hasTeacherConflict(
        entry.teacherProfileId, entry.periodSlotId, entry.dayOfWeek, entry.academicSessionId,
      );
      if (conflict) {
        return actionError(`Teacher conflict found for ${entry.dayOfWeek} period ${entry.periodSlotId}`);
      }
    }

    const periodSlotIds = [...new Set(entries.map((e) => e.periodSlotId))];
    const periodSlots = await prisma.periodSlot.findMany({
      where: { id: { in: periodSlotIds } },
      select: { id: true, isBreak: true },
    });
    const breakSlotIds = new Set(periodSlots.filter((p) => p.isBreak).map((p) => p.id));
    for (const entry of entries) {
      if (breakSlotIds.has(entry.periodSlotId)) {
        return actionError('Cannot assign a subject to a break period');
      }
    }

    const result = await prisma.timetableEntry.createMany({
      data: entries.map((e) => ({
        classId: e.classId,
        sectionId: e.sectionId,
        subjectId: e.subjectId,
        teacherProfileId: e.teacherProfileId,
        periodSlotId: e.periodSlotId,
        dayOfWeek: e.dayOfWeek,
        academicSessionId: e.academicSessionId,
        room: e.room,
      })),
      skipDuplicates: true,
    });

    createAuditLog(session.user.id, 'BULK_CREATE_TIMETABLE', 'TIMETABLE_ENTRY', 'bulk', {
      count: result.count,
    }).catch(() => {});
    revalidateTimetablePaths();
    return actionSuccess({ created: result.count });
  },
);
