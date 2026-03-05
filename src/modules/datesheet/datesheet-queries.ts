import { prisma } from '@/lib/prisma';
import type { DatesheetStatus } from '@prisma/client';

// ============================================
// SELECT / INCLUDE FRAGMENTS
// ============================================

const datesheetListSelect = {
  id: true,
  title: true,
  description: true,
  examType: true,
  status: true,
  startDate: true,
  endDate: true,
  publishedAt: true,
  createdAt: true,
  academicSession: { select: { id: true, name: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  publishedBy: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { entries: true } },
} as const;

const entryInclude = {
  class: { select: { id: true, name: true, grade: true } },
  section: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
  duties: {
    include: {
      teacherProfile: {
        select: {
          id: true,
          employeeId: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  },
} as const;

// ============================================
// DATESHEET QUERIES
// ============================================

export async function listDatesheets(academicSessionId: string, status?: DatesheetStatus) {
  return prisma.datesheet.findMany({
    where: { academicSessionId, ...(status ? { status } : {}) },
    select: datesheetListSelect,
    orderBy: { startDate: 'desc' },
  });
}

export async function getDatesheetById(id: string) {
  return prisma.datesheet.findUnique({
    where: { id },
    select: datesheetListSelect,
  });
}

export async function getDatesheetWithEntries(id: string) {
  return prisma.datesheet.findUnique({
    where: { id },
    include: {
      academicSession: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      publishedBy: { select: { id: true, firstName: true, lastName: true } },
      entries: {
        include: entryInclude,
        orderBy: [{ examDate: 'asc' }, { startTime: 'asc' }],
      },
    },
  });
}

// ============================================
// ENTRY QUERIES
// ============================================

export async function listEntriesByDatesheet(datesheetId: string) {
  return prisma.datesheetEntry.findMany({
    where: { datesheetId },
    include: entryInclude,
    orderBy: [{ examDate: 'asc' }, { startTime: 'asc' }, { class: { grade: 'asc' } }],
  });
}

export async function listEntriesByClass(datesheetId: string, classId: string, sectionId?: string) {
  return prisma.datesheetEntry.findMany({
    where: {
      datesheetId,
      classId,
      ...(sectionId ? { OR: [{ sectionId }, { sectionId: null }] } : {}),
    },
    include: entryInclude,
    orderBy: [{ examDate: 'asc' }, { startTime: 'asc' }],
  });
}

export async function getEntryById(id: string) {
  return prisma.datesheetEntry.findUnique({
    where: { id },
    include: entryInclude,
  });
}

/** Check for time overlap on same class + date within a datesheet */
export async function hasEntryConflict(
  datesheetId: string,
  classId: string,
  sectionId: string | null,
  examDate: Date,
  startTime: string,
  endTime: string,
  excludeId?: string,
): Promise<boolean> {
  const entries = await prisma.datesheetEntry.findMany({
    where: {
      datesheetId,
      classId,
      examDate,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      ...(sectionId ? { OR: [{ sectionId }, { sectionId: null }] } : {}),
    },
    select: { id: true, startTime: true, endTime: true },
  });
  const { doTimesOverlap } = await import('./datesheet.utils');
  return entries.some((e) => doTimesOverlap(startTime, endTime, e.startTime, e.endTime));
}

// ============================================
// DUTY QUERIES
// ============================================

export async function listDutiesByEntry(datesheetEntryId: string) {
  return prisma.datesheetDuty.findMany({
    where: { datesheetEntryId },
    include: {
      teacherProfile: {
        select: {
          id: true,
          employeeId: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });
}

export async function listDutiesByTeacher(teacherProfileId: string, datesheetId: string) {
  return prisma.datesheetDuty.findMany({
    where: {
      teacherProfileId,
      datesheetEntry: { datesheetId },
    },
    include: {
      teacherProfile: {
        select: {
          id: true,
          employeeId: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      datesheetEntry: { include: entryInclude },
    },
  });
}

/** Check teacher duty time conflict on same date */
export async function hasTeacherDutyConflict(
  teacherProfileId: string,
  examDate: Date,
  startTime: string,
  endTime: string,
  excludeEntryId?: string,
): Promise<boolean> {
  const duties = await prisma.datesheetDuty.findMany({
    where: {
      teacherProfileId,
      datesheetEntry: {
        examDate,
        ...(excludeEntryId ? { id: { not: excludeEntryId } } : {}),
      },
    },
    select: { datesheetEntry: { select: { startTime: true, endTime: true } } },
  });
  const { doTimesOverlap } = await import('./datesheet.utils');
  return duties.some((d) => doTimesOverlap(startTime, endTime, d.datesheetEntry.startTime, d.datesheetEntry.endTime));
}

// ============================================
// DASHBOARD / SUMMARY QUERIES
// ============================================

export async function getPublishedDatesheetForClass(
  classId: string,
  sectionId: string | null,
  academicSessionId: string,
) {
  return prisma.datesheet.findMany({
    where: { academicSessionId, status: 'PUBLISHED' },
    include: {
      academicSession: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      publishedBy: { select: { id: true, firstName: true, lastName: true } },
      entries: {
        where: {
          classId,
          ...(sectionId ? { OR: [{ sectionId }, { sectionId: null }] } : {}),
        },
        include: entryInclude,
        orderBy: [{ examDate: 'asc' }, { startTime: 'asc' }],
      },
    },
    orderBy: { startDate: 'desc' },
  });
}

export async function getTeacherDutyRoster(teacherProfileId: string, academicSessionId: string) {
  return prisma.datesheetDuty.findMany({
    where: {
      teacherProfileId,
      datesheetEntry: {
        datesheet: { academicSessionId, status: 'PUBLISHED' },
      },
    },
    include: {
      teacherProfile: {
        select: {
          id: true,
          employeeId: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      datesheetEntry: { include: entryInclude },
    },
    orderBy: { datesheetEntry: { examDate: 'asc' } },
  });
}

export async function getDatesheetStats(datesheetId: string) {
  const [entryCount, dutyCount, classResult, dateResult] = await Promise.all([
    prisma.datesheetEntry.count({ where: { datesheetId } }),
    prisma.datesheetDuty.count({ where: { datesheetEntry: { datesheetId } } }),
    prisma.datesheetEntry.findMany({
      where: { datesheetId },
      select: { classId: true },
      distinct: ['classId'],
    }),
    prisma.datesheetEntry.findMany({
      where: { datesheetId },
      select: { examDate: true },
      distinct: ['examDate'],
    }),
  ]);
  return {
    entryCount,
    dutyCount,
    classCount: classResult.length,
    dateCount: dateResult.length,
  };
}
