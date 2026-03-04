'use server';

// ============================================
// Family Module — Child Timetable Fetch Actions
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';
import type { ChildTimetableEntry } from './family.types';

/**
 * Fetch the weekly timetable for a child.
 */
export async function fetchChildTimetableAction(
  studentProfileId: string,
): Promise<ActionResult<ChildTimetableEntry[]>> {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { classId: true, sectionId: true },
  });

  if (!studentProfile) {
    return { success: false, error: 'Student not found' };
  }

  const entries = await prisma.timetableEntry.findMany({
    where: {
      classId: studentProfile.classId,
      sectionId: studentProfile.sectionId,
    },
    include: {
      subject: { select: { name: true } },
      teacherProfile: {
        include: { user: { select: { firstName: true, lastName: true } } },
      },
      periodSlot: { select: { name: true, startTime: true, endTime: true } },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { periodSlot: { startTime: 'asc' } }],
  });

  return {
    success: true,
    data: entries.map((e) => ({
      id: e.id,
      dayOfWeek: e.dayOfWeek,
      subjectName: e.subject.name,
      teacherName: `${e.teacherProfile.user.firstName} ${e.teacherProfile.user.lastName}`,
      startTime: e.periodSlot.startTime,
      endTime: e.periodSlot.endTime,
      periodLabel: e.periodSlot.name,
    })),
  };
}
