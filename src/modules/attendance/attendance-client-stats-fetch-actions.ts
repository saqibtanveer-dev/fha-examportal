'use server';

import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import { assertTeacherSectionAccess } from '@/lib/authorization-guards';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import { safeFetchAction } from '@/lib/safe-action';
import {
  getDailyAttendanceCounts,
  getStudentDailyAttendanceCounts,
  getClassDailyAttendanceTrend,
  getStudentWiseDailyAttendance,
  getSchoolDailyAttendanceForDate,
  getActiveStudentCountBySection,
} from './attendance-queries';

async function getCurrentAcademicSessionId(): Promise<string | null> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  return session?.id ?? null;
}

const fetchDailyAttendanceCounts = safeFetchAction(async (classId: string, sectionId: string, date: string) => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const dateObj = new Date(date + 'T00:00:00.000Z');
  return serialize(await getDailyAttendanceCounts(classId, sectionId, dateObj, academicSessionId));
});

export async function fetchDailyAttendanceCountsAction(classId: string, sectionId: string, date: string) {
  return fetchDailyAttendanceCounts(classId, sectionId, date);
}

const fetchStudentDailyAttendanceCounts = safeFetchAction(async (
  studentProfileId: string,
  startDate: string,
  endDate: string,
) => {
  const session = await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
  if (session.user.role === 'FAMILY') {
    await assertFamilyStudentAccess(session.user.id, studentProfileId);
  }
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  return serialize(await getStudentDailyAttendanceCounts(
    studentProfileId,
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T00:00:00.000Z'),
    academicSessionId,
  ));
});

export async function fetchStudentDailyAttendanceCountsAction(
  studentProfileId: string,
  startDate: string,
  endDate: string,
) {
  return fetchStudentDailyAttendanceCounts(studentProfileId, startDate, endDate);
}

const fetchClassAttendanceTrend = safeFetchAction(async (
  classId: string,
  sectionId: string,
  startDate: string,
  endDate: string,
) => {
  const session = await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  if (session.user.role === 'TEACHER') {
    await assertTeacherSectionAccess(session.user.id, classId, sectionId);
  }
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  return serialize(await getClassDailyAttendanceTrend(
    classId,
    sectionId,
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T00:00:00.000Z'),
    academicSessionId,
  ));
});

export async function fetchClassAttendanceTrendAction(
  classId: string,
  sectionId: string,
  startDate: string,
  endDate: string,
) {
  return fetchClassAttendanceTrend(classId, sectionId, startDate, endDate);
}

const fetchStudentWiseAttendance = safeFetchAction(async (
  classId: string,
  sectionId: string,
  startDate: string,
  endDate: string,
) => {
  const session = await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  if (session.user.role === 'TEACHER') {
    await assertTeacherSectionAccess(session.user.id, classId, sectionId);
  }
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];

  const raw = await getStudentWiseDailyAttendance(
    classId,
    sectionId,
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T00:00:00.000Z'),
    academicSessionId,
  );

  const studentMap = new Map<string, { present: number; absent: number; late: number; excused: number }>();
  for (const row of raw) {
    const existing = studentMap.get(row.studentProfileId) ?? { present: 0, absent: 0, late: 0, excused: 0 };
    const count = row._count.id;
    if (row.status === 'PRESENT') existing.present += count;
    else if (row.status === 'ABSENT') existing.absent += count;
    else if (row.status === 'LATE') existing.late += count;
    else if (row.status === 'EXCUSED') existing.excused += count;
    studentMap.set(row.studentProfileId, existing);
  }

  if (studentMap.size === 0) return [];

  const profiles = await prisma.studentProfile.findMany({
    where: { id: { in: [...studentMap.keys()] } },
    select: {
      id: true,
      rollNumber: true,
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { rollNumber: 'asc' },
  });

  return serialize(profiles.map((p) => {
    const counts = studentMap.get(p.id) ?? { present: 0, absent: 0, late: 0, excused: 0 };
    const total = counts.present + counts.absent + counts.late + counts.excused;
    const attended = counts.present + counts.late;
    const percentage = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0;
    return {
      studentProfileId: p.id,
      studentName: `${p.user.firstName} ${p.user.lastName}`,
      rollNumber: p.rollNumber,
      ...counts,
      total,
      percentage,
    };
  }));
});

export async function fetchStudentWiseAttendanceAction(
  classId: string,
  sectionId: string,
  startDate: string,
  endDate: string,
) {
  return fetchStudentWiseAttendance(classId, sectionId, startDate, endDate);
}

const fetchSchoolAttendanceForDate = safeFetchAction(async (date: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const dateObj = new Date(date + 'T00:00:00.000Z');
  return serialize(await getSchoolDailyAttendanceForDate(dateObj, academicSessionId));
});

export async function fetchSchoolAttendanceForDateAction(date: string) {
  return fetchSchoolAttendanceForDate(date);
}

const fetchActiveStudentCount = safeFetchAction(async (classId: string, sectionId: string) => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  return getActiveStudentCountBySection(classId, sectionId);
});

export async function fetchActiveStudentCountAction(classId: string, sectionId: string) {
  return fetchActiveStudentCount(classId, sectionId);
}
