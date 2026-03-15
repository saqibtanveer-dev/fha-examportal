'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import {
  markSubjectAttendanceSchema,
  updateAttendanceRecordSchema,
  type MarkSubjectAttendanceInput,
  type UpdateAttendanceRecordInput,
} from '@/validations/attendance-schemas';
import { isFutureDate, isToday } from './attendance.utils';

import { logger } from '@/lib/logger';
// ── Helpers ──

async function getCurrentAcademicSessionId(): Promise<string | null> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  return session?.id ?? null;
}

async function isSubjectTeacherForSlot(
  userId: string,
  classId: string,
  sectionId: string,
  subjectId: string,
  academicSessionId: string,
): Promise<boolean> {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!teacherProfile) return false;

  const entry = await prisma.timetableEntry.findFirst({
    where: {
      classId, sectionId, subjectId,
      teacherProfileId: teacherProfile.id,
      academicSessionId,
      isActive: true,
    },
  });
  return entry !== null;
}

// ── Mark Subject Attendance ──

export const markSubjectAttendanceAction = safeAction(
  async function markSubjectAttendanceAction(
    input: MarkSubjectAttendanceInput,
  ): Promise<ActionResult<{ count: number }>> {
    const session = await requireRole('ADMIN', 'TEACHER');
    const userId = session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    const parsed = markSubjectAttendanceSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { classId, sectionId, subjectId, periodSlotId, timetableEntryId, date, records } = parsed.data;
    const dateObj = new Date(date + 'T00:00:00.000Z');

    if (isFutureDate(date)) {
      return actionError('Cannot mark attendance for a future date');
    }

    if (!isAdmin && !isToday(date)) {
      return actionError('Teachers can only mark attendance for today');
    }

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) {
      return actionError('No active academic session found');
    }

    if (!isAdmin) {
      const isSubjectTeacher = await isSubjectTeacherForSlot(
        userId, classId, sectionId, subjectId, academicSessionId,
      );
      if (!isSubjectTeacher) {
        return actionError('Only the subject teacher or admin can mark subject attendance');
      }
    }

    const periodSlot = await prisma.periodSlot.findUnique({ where: { id: periodSlotId } });
    if (!periodSlot) return actionError('Period slot not found');
    if (periodSlot.isBreak) return actionError('Cannot mark attendance for a break period');

    const result = await prisma.$transaction(
      records.map((record) =>
        prisma.subjectAttendance.upsert({
          where: {
            studentProfileId_subjectId_periodSlotId_date_academicSessionId: {
              studentProfileId: record.studentProfileId,
              subjectId, periodSlotId,
              date: dateObj,
              academicSessionId,
            },
          },
          create: {
            studentProfileId: record.studentProfileId,
            classId, sectionId, subjectId,
            timetableEntryId, periodSlotId,
            date: dateObj,
            status: record.status,
            remarks: record.remarks,
            markedById: userId,
            academicSessionId,
          },
          update: {
            status: record.status,
            remarks: record.remarks,
            isEdited: true,
            editedById: userId,
            editedAt: new Date(),
          },
        }),
      ),
    );

    createAuditLog(userId, 'MARK_SUBJECT_ATTENDANCE', 'SUBJECT_ATTENDANCE', `${classId}-${subjectId}`, {
      date, classId, sectionId, subjectId, periodSlotId, recordCount: records.length,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidatePath('/teacher/attendance');
    revalidatePath('/admin/attendance');
    revalidatePath('/student/attendance');
    return actionSuccess({ count: result.length });
  },
);

// ── Update Single Subject Attendance Record ──

export const updateSubjectAttendanceAction = safeAction(
  async function updateSubjectAttendanceAction(
    recordId: string,
    input: UpdateAttendanceRecordInput,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN', 'TEACHER');
    const userId = session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    const parsed = updateAttendanceRecordSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const record = await prisma.subjectAttendance.findUnique({
      where: { id: recordId },
      select: { id: true, date: true, markedById: true },
    });
    if (!record) return actionError('Attendance record not found');

    const recordDate = record.date.toISOString().split('T')[0]!;

    if (!isAdmin) {
      if (!isToday(recordDate)) {
        return actionError('Teachers can only edit same-day attendance');
      }
      if (record.markedById !== userId) {
        return actionError('Teachers can only edit attendance they marked');
      }
    }

    await prisma.subjectAttendance.update({
      where: { id: recordId },
      data: {
        status: parsed.data.status,
        remarks: parsed.data.remarks,
        isEdited: true,
        editedById: userId,
        editedAt: new Date(),
      },
    });

    createAuditLog(userId, 'UPDATE_SUBJECT_ATTENDANCE', 'SUBJECT_ATTENDANCE', recordId, parsed.data).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidatePath('/teacher/attendance');
    revalidatePath('/admin/attendance');
    revalidatePath('/student/attendance');
    return actionSuccess();
  },
);
