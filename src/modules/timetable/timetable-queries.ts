import { prisma } from '@/lib/prisma';
import type { DayOfWeek } from '@prisma/client';
import { isSharedElectiveDeliveryCompatible } from './timetable-shared-delivery';

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
  classId: true,
  sectionId: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** List all global period slots (classId = null, sectionId = null) */
export async function listPeriodSlots() {
  return prisma.periodSlot.findMany({
    where: { classId: null, sectionId: null },
    orderBy: { sortOrder: 'asc' },
    select: periodSlotSelect,
  });
}

/** List ALL period slots (global + class + section) for admin management */
export async function listAllPeriodSlots() {
  return prisma.periodSlot.findMany({
    orderBy: [{ classId: 'asc' }, { sectionId: 'asc' }, { sortOrder: 'asc' }],
    select: periodSlotSelect,
  });
}

/**
 * 3-tier merge: Global → Class → Section.
 * Each tier overrides the previous at the same sortOrder, adds at new sortOrders.
 * - No classId → pure global
 * - classId only → global + class overrides
 * - classId + sectionId → global + class overrides + section overrides
 */
export async function listActivePeriodSlots(classId?: string, sectionId?: string) {
  const globalSlots = await prisma.periodSlot.findMany({
    where: { isActive: true, classId: null, sectionId: null },
    orderBy: { sortOrder: 'asc' },
    select: periodSlotSelect,
  });

  if (!classId) return globalSlots;

  // Layer 2: class-level overrides (sectionId = null)
  const classSlots = await prisma.periodSlot.findMany({
    where: { classId, sectionId: null, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: periodSlotSelect,
  });

  // Merge class on top of global
  let merged = mergeSlotLayers(globalSlots, classSlots);

  if (sectionId) {
    // Layer 3: section-level overrides
    const sectionSlots = await prisma.periodSlot.findMany({
      where: { classId, sectionId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: periodSlotSelect,
    });
    merged = mergeSlotLayers(merged, sectionSlots);
  }

  return merged;
}

/** Override base slots with overlay at matching sortOrders, add new ones */
function mergeSlotLayers<T extends { sortOrder: number }>(base: T[], overlay: T[]): T[] {
  if (overlay.length === 0) return base;
  const overlaySortOrders = new Set(overlay.map((s) => s.sortOrder));
  return [
    ...base.filter((s) => !overlaySortOrders.has(s.sortOrder)),
    ...overlay,
  ].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** List period slots for a specific class (sectionId=null, for admin management) */
export async function listPeriodSlotsByClass(classId: string) {
  return prisma.periodSlot.findMany({
    where: { classId, sectionId: null },
    orderBy: { sortOrder: 'asc' },
    select: periodSlotSelect,
  });
}

/** List period slots for a specific section (for admin management) */
export async function listPeriodSlotsBySection(classId: string, sectionId: string) {
  return prisma.periodSlot.findMany({
    where: { classId, sectionId },
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

export async function getMaxPeriodSortOrder(classId?: string | null, sectionId?: string | null): Promise<number> {
  const result = await prisma.periodSlot.aggregate({
    _max: { sortOrder: true },
    where: { classId: classId ?? null, sectionId: sectionId ?? null },
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
  electiveSlotGroup: { select: { id: true, name: true } },
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

/**
 * Get all timetable entries for a specific slot.
 * Returns multiple entries for elective periods.
 */
export async function getTimetableEntriesBySlot(
  classId: string,
  sectionId: string,
  periodSlotId: string,
  dayOfWeek: DayOfWeek,
  academicSessionId: string,
) {
  return prisma.timetableEntry.findMany({
    where: {
      classId,
      sectionId,
      periodSlotId,
      dayOfWeek,
      academicSessionId,
      isActive: true,
    },
    include: timetableEntryInclude,
  });
}

/**
 * Get a specific timetable entry by its unique slot+subject combination.
 */
export async function getTimetableEntryBySlotAndSubject(
  classId: string,
  sectionId: string,
  subjectId: string,
  periodSlotId: string,
  dayOfWeek: DayOfWeek,
  academicSessionId: string,
) {
  return prisma.timetableEntry.findUnique({
    where: {
      classId_sectionId_subjectId_periodSlotId_dayOfWeek_academicSessionId: {
        classId,
        sectionId,
        subjectId,
        periodSlotId,
        dayOfWeek,
        academicSessionId,
      },
    },
    include: timetableEntryInclude,
  });
}

type TeacherConflictCheckInput = {
  teacherProfileId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  periodSlotId: string;
  dayOfWeek: DayOfWeek;
  academicSessionId: string;
  room?: string;
  isElectiveSlot: boolean;
  excludeEntryId?: string;
};

type TimetableReader = {
  timetableEntry: {
    findMany: typeof prisma.timetableEntry.findMany;
  };
};

/**
 * Check whether assigning a teacher to a slot conflicts with existing assignments.
 * Same teacher can share an elective delivery across sections when class, subject and room match.
 */
export async function hasTeacherConflict(
  input: TeacherConflictCheckInput,
  db: TimetableReader = prisma,
): Promise<boolean> {
  const assignmentsAtSlot = await db.timetableEntry.findMany({
    where: {
      teacherProfileId: input.teacherProfileId,
      periodSlotId: input.periodSlotId,
      dayOfWeek: input.dayOfWeek,
      academicSessionId: input.academicSessionId,
      isActive: true,
      ...(input.excludeEntryId ? { id: { not: input.excludeEntryId } } : {}),
    },
    select: {
      classId: true,
      sectionId: true,
      subjectId: true,
      room: true,
      isElectiveSlot: true,
    },
  });

  if (assignmentsAtSlot.length === 0) return false;

  const candidate = {
    classId: input.classId,
    sectionId: input.sectionId,
    subjectId: input.subjectId,
    room: input.room,
    isElectiveSlot: input.isElectiveSlot,
  };

  return assignmentsAtSlot.some((existing) => !isSharedElectiveDeliveryCompatible(existing, candidate));
}
