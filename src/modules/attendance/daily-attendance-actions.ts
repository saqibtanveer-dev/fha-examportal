'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import {
  markDailyAttendanceSchema,
  updateAttendanceRecordSchema,
  type MarkDailyAttendanceInput,
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

async function isClassTeacherOfSection(userId: string, sectionId: string): Promise<boolean> {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: { classTeacherId: true },
  });
  return section?.classTeacherId === userId;
}

// ── Mark Daily Attendance ──

export const markDailyAttendanceAction = safeAction(
  async function markDailyAttendanceAction(
    input: MarkDailyAttendanceInput,
  ): Promise<ActionResult<{ count: number }>> {
    const session = await requireRole('ADMIN', 'TEACHER');
    const userId = session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    const parsed = markDailyAttendanceSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { classId, sectionId, date, records } = parsed.data;
    const dateObj = new Date(date + 'T00:00:00.000Z');

    if (isFutureDate(date)) {
      return actionError('Cannot mark attendance for a future date');
    }

    if (!isAdmin && !isToday(date)) {
      return actionError('Teachers can only mark attendance for today');
    }

    if (!isAdmin) {
      const isClassTeacher = await isClassTeacherOfSection(userId, sectionId);
      if (!isClassTeacher) {
        return actionError('Only the class teacher or admin can mark daily attendance for this section');
      }
    }

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) {
      return actionError('No active academic session found');
    }

    const result = await prisma.$transaction(
      records.map((record) =>
        prisma.dailyAttendance.upsert({
          where: {
            studentProfileId_date_academicSessionId: {
              studentProfileId: record.studentProfileId,
              date: dateObj,
              academicSessionId,
            },
          },
          create: {
            studentProfileId: record.studentProfileId,
            classId,
            sectionId,
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

    createAuditLog(userId, 'MARK_DAILY_ATTENDANCE', 'DAILY_ATTENDANCE', `${classId}-${sectionId}`, {
      date, classId, sectionId, recordCount: records.length,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidatePath('/teacher/attendance');
    revalidatePath('/admin/attendance');
    revalidatePath('/student/attendance');
    return actionSuccess({ count: result.length });
  },
);

// ── Update Single Daily Attendance Record ──

export const updateDailyAttendanceAction = safeAction(
  async function updateDailyAttendanceAction(
    recordId: string,
    input: UpdateAttendanceRecordInput,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN', 'TEACHER');
    const userId = session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    const parsed = updateAttendanceRecordSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const record = await prisma.dailyAttendance.findUnique({
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

    await prisma.dailyAttendance.update({
      where: { id: recordId },
      data: {
        status: parsed.data.status,
        remarks: parsed.data.remarks,
        isEdited: true,
        editedById: userId,
        editedAt: new Date(),
      },
    });

    createAuditLog(userId, 'UPDATE_DAILY_ATTENDANCE', 'DAILY_ATTENDANCE', recordId, parsed.data).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidatePath('/teacher/attendance');
    revalidatePath('/admin/attendance');
    revalidatePath('/student/attendance');
    return actionSuccess();
  },
);
