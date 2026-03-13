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

export async function listEntriesByClass(datesheetId: string, classId: string, sectionId: string) {
  return prisma.datesheetEntry.findMany({
    where: {
      datesheetId,
      classId,
      sectionId,
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

/** Check for time overlap on same section + date within a datesheet.
 *  Elective subjects from the same group are allowed to share a time slot. */
export async function hasEntryConflict(
  datesheetId: string,
  classId: string,
  sectionId: string,
  examDate: Date,
  startTime: string,
  endTime: string,
  excludeId?: string,
  subjectId?: string,
): Promise<boolean> {
  const entries = await prisma.datesheetEntry.findMany({
    where: {
      datesheetId,
      classId,
      sectionId,
      examDate,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, startTime: true, endTime: true, subjectId: true },
  });

  const { doTimesOverlap } = await import('./datesheet.utils');
  const overlapping = entries.filter((e) => doTimesOverlap(startTime, endTime, e.startTime, e.endTime));
  if (overlapping.length === 0) return false;

  // If no subjectId provided, can't check elective status — treat as conflict
  if (!subjectId) return true;

  // Check if the new subject is elective for this class
  const newLink = await prisma.subjectClassLink.findUnique({
    where: { subjectId_classId: { subjectId, classId } },
    select: { isElective: true, electiveGroupName: true },
  });

  // Non-elective subject always conflicts with any overlap
  if (!newLink?.isElective || !newLink.electiveGroupName) return true;

  // For elective subjects, only conflict with entries from different groups or non-electives
  const overlappingSubjectIds = [...new Set(overlapping.map((e) => e.subjectId))];
  const existingLinks = await prisma.subjectClassLink.findMany({
    where: {
      classId,
      subjectId: { in: overlappingSubjectIds },
    },
    select: { subjectId: true, isElective: true, electiveGroupName: true },
  });

  const linkMap = new Map(existingLinks.map((l) => [l.subjectId, l]));

  for (const entry of overlapping) {
    const entryLink = linkMap.get(entry.subjectId);
    // Conflict if existing entry is not elective or from a different group
    if (!entryLink?.isElective || entryLink.electiveGroupName !== newLink.electiveGroupName) {
      return true;
    }
  }

  return false;
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

// ============================================
// DASHBOARD / SUMMARY QUERIES
// ============================================

export async function getPublishedDatesheetForClass(
  classId: string,
  sectionId: string,
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
          sectionId,
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
