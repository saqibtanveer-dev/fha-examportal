import { prisma } from '@/lib/prisma';
import type { AttendanceStatus } from '@prisma/client';

// ============================================
// SHARED INCLUDES
// ============================================

const studentProfileInclude = {
  studentProfile: {
    select: {
      id: true,
      rollNumber: true,
      registrationNo: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
} as const;

const markerInclude = {
  markedBy: { select: { id: true, firstName: true, lastName: true } },
  editedBy: { select: { id: true, firstName: true, lastName: true } },
} as const;

const dailyAttendanceInclude = {
  ...studentProfileInclude,
  ...markerInclude,
} as const;

const subjectAttendanceInclude = {
  ...studentProfileInclude,
  ...markerInclude,
  subject: { select: { id: true, name: true, code: true } },
  periodSlot: { select: { id: true, name: true, shortName: true, startTime: true, endTime: true } },
} as const;

// ============================================
// DAILY ATTENDANCE QUERIES
// ============================================

/** Get daily attendance for a class/section on a specific date */
export async function getDailyAttendanceByClassDate(
  classId: string,
  sectionId: string,
  date: Date,
  academicSessionId: string,
) {
  return prisma.dailyAttendance.findMany({
    where: { classId, sectionId, date, academicSessionId },
    include: dailyAttendanceInclude,
    orderBy: { studentProfile: { rollNumber: 'asc' } },
  });
}

/** Get daily attendance for a single student over a date range */
export async function getDailyAttendanceByStudent(
  studentProfileId: string,
  startDate: Date,
  endDate: Date,
  academicSessionId: string,
) {
  return prisma.dailyAttendance.findMany({
    where: {
      studentProfileId,
      academicSessionId,
      date: { gte: startDate, lte: endDate },
    },
    include: markerInclude,
    orderBy: { date: 'asc' },
  });
}

/** Check if daily attendance exists for a class/section/date */
export async function hasDailyAttendance(
  classId: string,
  sectionId: string,
  date: Date,
  academicSessionId: string,
): Promise<boolean> {
  const count = await prisma.dailyAttendance.count({
    where: { classId, sectionId, date, academicSessionId },
  });
  return count > 0;
}

/** Get daily attendance status counts for a class on a date */
export async function getDailyAttendanceCounts(
  classId: string,
  sectionId: string,
  date: Date,
  academicSessionId: string,
) {
  return prisma.dailyAttendance.groupBy({
    by: ['status'],
    where: { classId, sectionId, date, academicSessionId },
    _count: { id: true },
  });
}

/** Get daily attendance count by status for a student in a date range */
export async function getStudentDailyAttendanceCounts(
  studentProfileId: string,
  startDate: Date,
  endDate: Date,
  academicSessionId: string,
) {
  return prisma.dailyAttendance.groupBy({
    by: ['status'],
    where: {
      studentProfileId,
      academicSessionId,
      date: { gte: startDate, lte: endDate },
    },
    _count: { id: true },
  });
}

// ============================================
// SUBJECT ATTENDANCE QUERIES
// ============================================

/** Get subject attendance for a class/section/subject/period on a date */
export async function getSubjectAttendanceBySlot(
  classId: string,
  sectionId: string,
  subjectId: string,
  periodSlotId: string,
  date: Date,
  academicSessionId: string,
) {
  return prisma.subjectAttendance.findMany({
    where: { classId, sectionId, subjectId, periodSlotId, date, academicSessionId },
    include: subjectAttendanceInclude,
    orderBy: { studentProfile: { rollNumber: 'asc' } },
  });
}

/** Get all subject attendance for a student over a date range */
export async function getSubjectAttendanceByStudent(
  studentProfileId: string,
  startDate: Date,
  endDate: Date,
  academicSessionId: string,
  subjectId?: string,
) {
  return prisma.subjectAttendance.findMany({
    where: {
      studentProfileId,
      academicSessionId,
      date: { gte: startDate, lte: endDate },
      ...(subjectId ? { subjectId } : {}),
    },
    include: {
      ...markerInclude,
      subject: { select: { id: true, name: true, code: true } },
      periodSlot: { select: { id: true, name: true, shortName: true, startTime: true, endTime: true } },
    },
    orderBy: [{ date: 'asc' }, { periodSlot: { sortOrder: 'asc' } }],
  });
}

/** Check if subject attendance exists for a slot on a date */
export async function hasSubjectAttendance(
  classId: string,
  sectionId: string,
  subjectId: string,
  periodSlotId: string,
  date: Date,
  academicSessionId: string,
): Promise<boolean> {
  const count = await prisma.subjectAttendance.count({
    where: { classId, sectionId, subjectId, periodSlotId, date, academicSessionId },
  });
  return count > 0;
}

// ============================================
// STUDENT LIST FOR MARKING
// ============================================

/** Get active students in a class/section for attendance marking */
export async function getActiveStudentsInSection(classId: string, sectionId: string) {
  return prisma.studentProfile.findMany({
    where: {
      classId,
      sectionId,
      status: 'ACTIVE',
      user: { isActive: true, deletedAt: null },
    },
    select: {
      id: true,
      rollNumber: true,
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { rollNumber: 'asc' },
  });
}

// ============================================
// STATS & ANALYTICS QUERIES
// ============================================

/** Get class-level daily attendance % for a date range (for charts) */
export async function getClassDailyAttendanceTrend(
  classId: string,
  sectionId: string,
  startDate: Date,
  endDate: Date,
  academicSessionId: string,
) {
  return prisma.dailyAttendance.groupBy({
    by: ['date', 'status'],
    where: {
      classId,
      sectionId,
      academicSessionId,
      date: { gte: startDate, lte: endDate },
    },
    _count: { id: true },
    orderBy: { date: 'asc' },
  });
}

/** Get per-student daily attendance summary for a class in a date range */
export async function getStudentWiseDailyAttendance(
  classId: string,
  sectionId: string,
  startDate: Date,
  endDate: Date,
  academicSessionId: string,
) {
  return prisma.dailyAttendance.groupBy({
    by: ['studentProfileId', 'status'],
    where: {
      classId,
      sectionId,
      academicSessionId,
      date: { gte: startDate, lte: endDate },
    },
    _count: { id: true },
  });
}

/** Get school-wide attendance for a date (admin dashboard) */
export async function getSchoolDailyAttendanceForDate(
  date: Date,
  academicSessionId: string,
) {
  return prisma.dailyAttendance.groupBy({
    by: ['classId', 'sectionId', 'status'],
    where: { date, academicSessionId },
    _count: { id: true },
  });
}

/** Get total active student count per section (for calculating % with missing records) */
export async function getActiveStudentCountBySection(classId: string, sectionId: string) {
  return prisma.studentProfile.count({
    where: {
      classId,
      sectionId,
      status: 'ACTIVE',
      user: { isActive: true, deletedAt: null },
    },
  });
}
