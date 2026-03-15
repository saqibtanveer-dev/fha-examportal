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
  type BulkCreateTimetableInput,
  type CreateTimetableEntryInput,
  type UpdateTimetableEntryInput,
} from '@/validations/timetable-schemas';
import {
  bulkCreateTimetableWithLock,
  createTimetableEntryWithLock,
  updateTimetableEntryWithLock,
} from './timetable-entry-write-ops';
import { cleanupOrphanedGroup } from './timetable-elective-helpers';

import { logger } from '@/lib/logger';
function revalidateTimetablePaths() {
  revalidatePath('/admin/timetable');
  revalidatePath('/teacher/timetable');
  revalidatePath('/student/timetable');
  revalidatePath('/family/timetable');
}

// -- Create Entry --

export const createTimetableEntryAction = safeAction(
  async function createTimetableEntryAction(input: CreateTimetableEntryInput): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');

    const parsed = createTimetableEntrySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const result = await createTimetableEntryWithLock(parsed.data);
    if (result.error) return actionError(result.error);
    if (!result.entry) return actionError('Failed to create timetable entry');

    createAuditLog(session.user.id, 'CREATE_TIMETABLE_ENTRY', 'TIMETABLE_ENTRY', result.entry.id, parsed.data).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidateTimetablePaths();
    return actionSuccess({ id: result.entry.id });
  },
);

// -- Update Entry --

export const updateTimetableEntryAction = safeAction(
  async function updateTimetableEntryAction(id: string, input: UpdateTimetableEntryInput): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const parsed = updateTimetableEntrySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const result = await updateTimetableEntryWithLock(id, parsed.data);
    if (result.error) return actionError(result.error);

    createAuditLog(session.user.id, 'UPDATE_TIMETABLE_ENTRY', 'TIMETABLE_ENTRY', id, parsed.data).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidateTimetablePaths();
    return actionSuccess();
  },
);

// -- Delete Entry --

export const deleteTimetableEntryAction = safeAction(
  async function deleteTimetableEntryAction(id: string): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const existing = await prisma.timetableEntry.findUnique({ where: { id } });
    if (!existing) return actionError('Timetable entry not found');

    const linkedAttendance = await prisma.subjectAttendance.count({ where: { timetableEntryId: id } });
    if (linkedAttendance > 0) {
      return actionError('Cannot delete timetable entry with linked attendance records. Deactivate instead.');
    }

    await prisma.timetableEntry.delete({ where: { id } });

    if (existing.electiveSlotGroupId) {
      await cleanupOrphanedGroup(existing.electiveSlotGroupId);
    }

    createAuditLog(session.user.id, 'DELETE_TIMETABLE_ENTRY', 'TIMETABLE_ENTRY', id).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidateTimetablePaths();
    return actionSuccess();
  },
);

// -- Bulk Create --

export const bulkCreateTimetableAction = safeAction(
  async function bulkCreateTimetableAction(input: BulkCreateTimetableInput): Promise<ActionResult<{ created: number }>> {
    const session = await requireRole('ADMIN');

    const parsed = bulkCreateTimetableSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const result = await bulkCreateTimetableWithLock(parsed.data.entries);
    if (result.error) return actionError(result.error);
    if (typeof result.created !== 'number') return actionError('Failed to create timetable entries');

    createAuditLog(session.user.id, 'BULK_CREATE_TIMETABLE', 'TIMETABLE_ENTRY', 'bulk', {
      count: result.created,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidateTimetablePaths();
    return actionSuccess({ created: result.created });
  },
);
