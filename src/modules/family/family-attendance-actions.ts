'use server';

// ============================================
// Family Module — Child Attendance Fetch Actions
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';
import type { ChildAttendanceSummary, ChildAttendanceRecord } from './family.types';

/**
 * Fetch attendance summary for a child.
 */
export async function fetchChildAttendanceSummaryAction(
  studentProfileId: string,
): Promise<ActionResult<ChildAttendanceSummary>> {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: {
      user: { select: { firstName: true, lastName: true } },
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
  });

  if (!studentProfile) {
    return { success: false, error: 'Student not found' };
  }

  const records = await prisma.dailyAttendance.findMany({
    where: { studentProfileId },
    select: { date: true, status: true },
    orderBy: { date: 'asc' },
  });

  const present = records.filter((r) => r.status === 'PRESENT').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const late = records.filter((r) => r.status === 'LATE').length;
  const excused = records.filter((r) => r.status === 'EXCUSED').length;
  const totalDays = records.length;
  const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

  // Monthly breakdown
  const monthlyMap = new Map<string, { present: number; absent: number; total: number }>();
  for (const record of records) {
    const month = record.date.toISOString().slice(0, 7); // YYYY-MM
    const entry = monthlyMap.get(month) ?? { present: 0, absent: 0, total: 0 };
    entry.total++;
    if (record.status === 'PRESENT') entry.present++;
    if (record.status === 'ABSENT') entry.absent++;
    monthlyMap.set(month, entry);
  }

  const monthly = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    ...data,
  }));

  return {
    success: true,
    data: {
      studentProfileId,
      studentName: `${studentProfile.user.firstName} ${studentProfile.user.lastName}`,
      className: studentProfile.class.name,
      sectionName: studentProfile.section.name,
      daily: { totalDays, present, absent, late, excused, percentage },
      monthly,
    },
  };
}

/**
 * Fetch daily attendance records for a child within a date range.
 */
export async function fetchChildAttendanceRecordsAction(
  studentProfileId: string,
  startDate?: string,
  endDate?: string,
): Promise<ActionResult<ChildAttendanceRecord[]>> {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  const where: Record<string, unknown> = { studentProfileId };
  if (startDate) where.date = { ...(where.date as object ?? {}), gte: new Date(startDate) };
  if (endDate) where.date = { ...(where.date as object ?? {}), lte: new Date(endDate) };

  const records = await prisma.dailyAttendance.findMany({
    where,
    select: { id: true, date: true, status: true, createdAt: true },
    orderBy: { date: 'desc' },
    take: 100,
  });

  return {
    success: true,
    data: records.map((r) => ({
      id: r.id,
      date: r.date.toISOString(),
      status: r.status,
      markedAt: r.createdAt.toISOString(),
    })),
  };
}
