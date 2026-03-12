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
import { isSubjectElectiveForClass } from '@/lib/enrollment-helpers';
import { findOrCreateElectiveGroup, cleanupOrphanedGroup } from './timetable-elective-helpers';

function revalidateTimetablePaths() {
  revalidatePath('/admin/timetable');
  revalidatePath('/teacher/timetable');
  revalidatePath('/student/timetable');
  revalidatePath('/family/timetable');
}

// ── Create Entry (handles both regular and elective) ──

export const createTimetableEntryAction = safeAction(
  async function createTimetableEntryAction(input: CreateTimetableEntryInput): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');

    const parsed = createTimetableEntrySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    const periodSlot = await prisma.periodSlot.findUnique({ where: { id: data.periodSlotId } });
    if (!periodSlot) return actionError('Period slot not found');
    if (periodSlot.isBreak) return actionError('Cannot assign a subject to a break period');

    // Check teacher conflict
    const conflict = await hasTeacherConflict(
      data.teacherProfileId, data.periodSlotId, data.dayOfWeek, data.academicSessionId,
    );
    if (conflict) return actionError('Teacher is already assigned to another class in this period');

    // Check if subject is elective
    const isElective = await isSubjectElectiveForClass(data.subjectId, data.classId);

    // Check existing entries in this slot
    const existingEntries = await prisma.timetableEntry.findMany({
      where: {
        classId: data.classId,
        sectionId: data.sectionId,
        periodSlotId: data.periodSlotId,
        dayOfWeek: data.dayOfWeek,
        academicSessionId: data.academicSessionId,
        isActive: true,
      },
    });

    // Validate: no mixing elective + non-elective in same period
    if (existingEntries.length > 0) {
      const hasElective = existingEntries.some((e) => e.isElectiveSlot);
      const hasRegular = existingEntries.some((e) => !e.isElectiveSlot);

      if (isElective && hasRegular) {
        return actionError('This period has a regular subject. Remove it first to create an elective block.');
      }
      if (!isElective && hasElective) {
        return actionError('This period is an elective block. Cannot add a non-elective subject.');
      }
      if (!isElective && hasRegular) {
        return actionError('This period already has a subject assigned.');
      }
    }

    let electiveSlotGroupId: string | undefined;

    if (isElective) {
      electiveSlotGroupId = await findOrCreateElectiveGroup(
        data.classId, data.sectionId, data.periodSlotId, data.dayOfWeek, data.academicSessionId,
      );
    }

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
        isElectiveSlot: isElective,
        electiveSlotGroupId,
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

    // If subject is changing, re-check elective status and update group membership
    let electiveUpdates: Record<string, unknown> = {};
    if (data.subjectId && data.subjectId !== existing.subjectId) {
      const newIsElective = await isSubjectElectiveForClass(data.subjectId, existing.classId);
      const wasElective = existing.isElectiveSlot;

      if (newIsElective !== wasElective) {
        // Elective status changed — validate no type mixing in the slot
        const siblings = await prisma.timetableEntry.findMany({
          where: {
            classId: existing.classId,
            sectionId: existing.sectionId,
            periodSlotId: existing.periodSlotId,
            dayOfWeek: existing.dayOfWeek,
            academicSessionId: existing.academicSessionId,
            isActive: true,
            id: { not: id },
          },
        });

        if (siblings.length > 0) {
          const siblingHasElective = siblings.some((s) => s.isElectiveSlot);
          const siblingHasRegular = siblings.some((s) => !s.isElectiveSlot);

          if (newIsElective && siblingHasRegular) {
            return actionError('Cannot change to elective — this period has a regular subject.');
          }
          if (!newIsElective && siblingHasElective) {
            return actionError('Cannot change to regular — this period is an elective block.');
          }
        }
      }

      if (newIsElective) {
        const groupId = await findOrCreateElectiveGroup(
          existing.classId, existing.sectionId, existing.periodSlotId, existing.dayOfWeek, existing.academicSessionId,
        );
        electiveUpdates = { isElectiveSlot: true, electiveSlotGroupId: groupId };
      } else {
        electiveUpdates = { isElectiveSlot: false, electiveSlotGroupId: null };
      }
    }

    await prisma.timetableEntry.update({ where: { id }, data: { ...data, ...electiveUpdates } });

    // Clean up orphaned group from old membership
    if (electiveUpdates.electiveSlotGroupId === null && existing.electiveSlotGroupId) {
      await cleanupOrphanedGroup(existing.electiveSlotGroupId);
    }

    createAuditLog(session.user.id, 'UPDATE_TIMETABLE_ENTRY', 'TIMETABLE_ENTRY', id, data).catch(() => {});
    revalidateTimetablePaths();
    return actionSuccess();
  },
);

// ── Delete Entry ──

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

    // Clean up empty ElectiveSlotGroup if this was the last entry
    if (existing.electiveSlotGroupId) {
      await cleanupOrphanedGroup(existing.electiveSlotGroupId);
    }

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
        isElectiveSlot: e.isElectiveSlot ?? false,
        electiveSlotGroupId: e.electiveSlotGroupId,
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
