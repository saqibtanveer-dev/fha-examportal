'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import { isEndAfterStart } from './datesheet.utils';
import { hasEntryConflict } from './datesheet-queries';
import {
  createDatesheetEntrySchema,
  updateDatesheetEntrySchema,
  bulkCreateEntriesSchema,
  type CreateDatesheetEntryInput,
  type UpdateDatesheetEntryInput,
  type BulkCreateEntriesInput,
} from '@/validations/datesheet-schemas';

function revalidatePaths() {
  revalidatePath('/admin/datesheet');
  revalidatePath('/principal/datesheet');
  revalidatePath('/teacher/datesheet');
  revalidatePath('/student/datesheet');
  revalidatePath('/family/datesheet');
}

// ── Create Entry ──

export const createDatesheetEntryAction = safeAction(
  async function createDatesheetEntryAction(input: CreateDatesheetEntryInput): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');

    const parsed = createDatesheetEntrySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    const datesheet = await prisma.datesheet.findUnique({ where: { id: data.datesheetId } });
    if (!datesheet) return actionError('Datesheet not found');
    if (datesheet.status !== 'DRAFT') return actionError('Cannot add entries to a non-DRAFT datesheet');

    if (!isEndAfterStart(data.startTime, data.endTime)) {
      return actionError('End time must be after start time');
    }

    const examDate = new Date(data.examDate);
    if (examDate < datesheet.startDate || examDate > datesheet.endDate) {
      return actionError('Exam date must be within the datesheet date range');
    }

    // If "apply to all sections", expand to all sections of the class
    if (data.applyToAllSections) {
      const sections = await prisma.section.findMany({
        where: { classId: data.classId, isActive: true },
        select: { id: true },
      });
      if (sections.length === 0) return actionError('No active sections found for this class');

      for (const sec of sections) {
        const conflict = await hasEntryConflict(
          data.datesheetId, data.classId, sec.id, examDate, data.startTime, data.endTime,
          undefined, data.subjectId,
        );
        if (conflict) return actionError(`Time conflict for section in this class on this date`);
      }

      const rows = sections.map((sec) => ({
        datesheetId: data.datesheetId,
        classId: data.classId,
        sectionId: sec.id,
        subjectId: data.subjectId,
        examDate,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        instructions: data.instructions,
        totalMarks: data.totalMarks,
      }));

      const result = await prisma.datesheetEntry.createMany({ data: rows, skipDuplicates: true });
      createAuditLog(session.user.id, 'CREATE_DATESHEET_ENTRIES', 'DATESHEET', data.datesheetId, {
        count: result.count,
      }).catch(() => {});
      revalidatePaths();
      return actionSuccess({ id: data.datesheetId });
    }

    // Single section entry
    const conflict = await hasEntryConflict(
      data.datesheetId, data.classId, data.sectionId, examDate, data.startTime, data.endTime,
      undefined, data.subjectId,
    );
    if (conflict) return actionError('Time conflict: this section already has an exam at this time on this date');

    const entry = await prisma.datesheetEntry.create({
      data: {
        datesheetId: data.datesheetId,
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        examDate,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        instructions: data.instructions,
        totalMarks: data.totalMarks,
      },
    });

    createAuditLog(session.user.id, 'CREATE_DATESHEET_ENTRY', 'DATESHEET_ENTRY', entry.id, data).catch(() => {});
    revalidatePaths();
    return actionSuccess({ id: entry.id });
  },
);

// ── Update Entry ──

export const updateDatesheetEntryAction = safeAction(
  async function updateDatesheetEntryAction(id: string, input: UpdateDatesheetEntryInput): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const parsed = updateDatesheetEntrySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const existing = await prisma.datesheetEntry.findUnique({
      where: { id },
      include: { datesheet: { select: { status: true, startDate: true, endDate: true } } },
    });
    if (!existing) return actionError('Entry not found');
    if (existing.datesheet.status !== 'DRAFT') return actionError('Cannot edit entries of a non-DRAFT datesheet');

    const data = parsed.data;
    const startTime = data.startTime ?? existing.startTime;
    const endTime = data.endTime ?? existing.endTime;

    if (!isEndAfterStart(startTime, endTime)) {
      return actionError('End time must be after start time');
    }

    if (data.examDate) {
      const newDate = new Date(data.examDate);
      if (newDate < existing.datesheet.startDate || newDate > existing.datesheet.endDate) {
        return actionError('Exam date must be within the datesheet date range');
      }
    }

    // Check for time conflicts when time or date is being changed
    if (data.examDate || data.startTime || data.endTime) {
      const examDate = data.examDate ? new Date(data.examDate) : existing.examDate;
      const effectiveSubjectId = data.subjectId ?? existing.subjectId;
      const conflict = await hasEntryConflict(
        existing.datesheetId, existing.classId, existing.sectionId, examDate, startTime, endTime, id,
        effectiveSubjectId,
      );
      if (conflict) return actionError('Time conflict: this class already has an exam at this time on this date');
    }

    await prisma.datesheetEntry.update({
      where: { id },
      data: {
        ...(data.subjectId && { subjectId: data.subjectId }),
        ...(data.examDate && { examDate: new Date(data.examDate) }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.room !== undefined && { room: data.room }),
        ...(data.instructions !== undefined && { instructions: data.instructions }),
        ...(data.totalMarks !== undefined && { totalMarks: data.totalMarks }),
      },
    });

    createAuditLog(session.user.id, 'UPDATE_DATESHEET_ENTRY', 'DATESHEET_ENTRY', id, data).catch(() => {});
    revalidatePaths();
    return actionSuccess();
  },
);

// ── Delete Entry ──

export const deleteDatesheetEntryAction = safeAction(
  async function deleteDatesheetEntryAction(id: string): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const existing = await prisma.datesheetEntry.findUnique({
      where: { id },
      include: { datesheet: { select: { status: true } } },
    });
    if (!existing) return actionError('Entry not found');
    if (existing.datesheet.status !== 'DRAFT') return actionError('Cannot delete entries of a non-DRAFT datesheet');

    await prisma.datesheetEntry.delete({ where: { id } });

    createAuditLog(session.user.id, 'DELETE_DATESHEET_ENTRY', 'DATESHEET_ENTRY', id).catch(() => {});
    revalidatePaths();
    return actionSuccess();
  },
);

// ── Bulk Create Entries ──

export const bulkCreateDatesheetEntriesAction = safeAction(
  async function bulkCreateDatesheetEntriesAction(input: BulkCreateEntriesInput): Promise<ActionResult<{ created: number }>> {
    const session = await requireRole('ADMIN');

    const parsed = bulkCreateEntriesSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;
    const datesheet = await prisma.datesheet.findUnique({ where: { id: data.datesheetId } });
    if (!datesheet) return actionError('Datesheet not found');
    if (datesheet.status !== 'DRAFT') return actionError('Cannot add entries to a non-DRAFT datesheet');

    // Validate each entry before bulk insert
    for (const [i, e] of data.entries.entries()) {
      if (!isEndAfterStart(e.startTime, e.endTime)) {
        return actionError(`Entry ${i + 1}: End time must be after start time`);
      }
      const examDate = new Date(e.examDate);
      if (examDate < datesheet.startDate || examDate > datesheet.endDate) {
        return actionError(`Entry ${i + 1}: Exam date must be within the datesheet date range`);
      }
      const conflict = await hasEntryConflict(
        data.datesheetId, e.classId, e.sectionId, examDate, e.startTime, e.endTime,
        undefined, e.subjectId,
      );
      if (conflict) {
        return actionError(`Entry ${i + 1}: Time conflict for this section on this date`);
      }
    }

    const rows = data.entries.map((e) => ({
      datesheetId: data.datesheetId,
      classId: e.classId,
      sectionId: e.sectionId,
      subjectId: e.subjectId,
      examDate: new Date(e.examDate),
      startTime: e.startTime,
      endTime: e.endTime,
      room: e.room,
    }));

    const result = await prisma.datesheetEntry.createMany({ data: rows, skipDuplicates: true });

    createAuditLog(session.user.id, 'BULK_CREATE_DATESHEET_ENTRIES', 'DATESHEET', data.datesheetId, {
      count: result.count,
    }).catch(() => {});
    revalidatePaths();
    return actionSuccess({ created: result.count });
  },
);
