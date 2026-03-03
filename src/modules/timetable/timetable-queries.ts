import { prisma } from '@/lib/prisma';
import type { DayOfWeek } from '@prisma/client';

// ============================================
// PERIOD SLOT QUERIES
// ============================================

const periodSlotSelect = {
  id: true,
  name: true,
  shortName: true,
  startTime: true,
  endTime: true,
  sortOrder: true,
  isBreak: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listPeriodSlots() {
  return prisma.periodSlot.findMany({
    orderBy: { sortOrder: 'asc' },
    select: periodSlotSelect,
  });
}

export async function listActivePeriodSlots() {
  return prisma.periodSlot.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: periodSlotSelect,
  });
}

export async function getPeriodSlotById(id: string) {
  return prisma.periodSlot.findUnique({
    where: { id },
    select: periodSlotSelect,
  });
}

export async function getMaxPeriodSortOrder(): Promise<number> {
  const result = await prisma.periodSlot.aggregate({
    _max: { sortOrder: true },
  });
  return result._max.sortOrder ?? 0;
}

// ============================================
// TIMETABLE ENTRY QUERIES
// ============================================

const timetableEntryInclude = {
  class: { select: { id: true, name: true, grade: true } },
  section: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
  teacherProfile: {
    select: {
      id: true,
      employeeId: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  periodSlot: {
    select: { id: true, name: true, shortName: true, startTime: true, endTime: true, sortOrder: true },
  },
  academicSession: { select: { id: true, name: true } },
} as const;

export async function listTimetableEntriesByClass(
  classId: string,
  sectionId: string,
  academicSessionId: string,
) {
  return prisma.timetableEntry.findMany({
    where: { classId, sectionId, academicSessionId, isActive: true },
    include: timetableEntryInclude,
    orderBy: [{ dayOfWeek: 'asc' }, { periodSlot: { sortOrder: 'asc' } }],
  });
}

export async function listTimetableEntriesByTeacher(
  teacherProfileId: string,
  academicSessionId: string,
) {
  return prisma.timetableEntry.findMany({
    where: { teacherProfileId, academicSessionId, isActive: true },
    include: timetableEntryInclude,
    orderBy: [{ dayOfWeek: 'asc' }, { periodSlot: { sortOrder: 'asc' } }],
  });
}

export async function listTimetableEntriesByTeacherAndDay(
  teacherProfileId: string,
  dayOfWeek: DayOfWeek,
  academicSessionId: string,
) {
  return prisma.timetableEntry.findMany({
    where: { teacherProfileId, dayOfWeek, academicSessionId, isActive: true },
    include: timetableEntryInclude,
    orderBy: { periodSlot: { sortOrder: 'asc' } },
  });
}

export async function getTimetableEntryById(id: string) {
  return prisma.timetableEntry.findUnique({
    where: { id },
    include: timetableEntryInclude,
  });
}

export async function getTimetableEntryBySlot(
  classId: string,
  sectionId: string,
  periodSlotId: string,
  dayOfWeek: DayOfWeek,
  academicSessionId: string,
) {
  return prisma.timetableEntry.findUnique({
    where: {
      classId_sectionId_periodSlotId_dayOfWeek_academicSessionId: {
        classId,
        sectionId,
        periodSlotId,
        dayOfWeek,
        academicSessionId,
      },
    },
    include: timetableEntryInclude,
  });
}

/** Check if a teacher is already assigned to another class in the same period */
export async function hasTeacherConflict(
  teacherProfileId: string,
  periodSlotId: string,
  dayOfWeek: DayOfWeek,
  academicSessionId: string,
  excludeEntryId?: string,
): Promise<boolean> {
  const conflict = await prisma.timetableEntry.findFirst({
    where: {
      teacherProfileId,
      periodSlotId,
      dayOfWeek,
      academicSessionId,
      isActive: true,
      ...(excludeEntryId ? { id: { not: excludeEntryId } } : {}),
    },
  });
  return conflict !== null;
}
