'use server';

// ============================================
// Diary Module — Server Fetch Actions (Read-Only)
// ============================================

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import {
  getDiaryEntriesByTeacher,
  getDiaryEntryById,
  getTeacherDiaryDates,
  getDiaryEntriesByClassSection,
  getDiaryEntriesToday,
  getAllDiaryEntries,
  getDiaryCountsByTeacher,
  getExpectedDiaryTeachers,
  getTeacherSubjectClasses,
} from './diary-queries';
import type { DiaryFilters, DiaryCoverageData, DiaryCoverageRow, DiaryStatsData } from './diary.types';
import { getWorkingDays, normalizeDiaryDate, getTodayDateString } from './diary.utils';
import { safeFetchAction } from '@/lib/safe-action';

// ── Helpers ──

async function getCurrentAcademicSessionId(): Promise<string> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  if (!session) throw new Error('No active academic session found');
  return session.id;
}

// ── Teacher Fetch Actions ──

export const fetchTeacherDiaryEntriesAction = safeFetchAction(async (filters?: DiaryFilters) => {
  const session = await requireRole('TEACHER', 'ADMIN');
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!teacherProfile) throw new Error('Teacher profile not found');

  const academicSessionId = await getCurrentAcademicSessionId();
  const entries = await getDiaryEntriesByTeacher(teacherProfile.id, academicSessionId, filters);
  return serialize(entries);
});

export const fetchTeacherSubjectClassesAction = safeFetchAction(async () => {
  const session = await requireRole('TEACHER', 'ADMIN');
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!teacherProfile) throw new Error('Teacher profile not found');

  const assignments = await getTeacherSubjectClasses(teacherProfile.id);
  return serialize(assignments);
});

export const fetchTeacherDiaryCalendarAction = safeFetchAction(async (year: number, month: number) => {
  const session = await requireRole('TEACHER', 'ADMIN');
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!teacherProfile) throw new Error('Teacher profile not found');

  const academicSessionId = await getCurrentAcademicSessionId();
  const dates = await getTeacherDiaryDates(teacherProfile.id, academicSessionId, year, month);
  return serialize(dates);
});

// ── Student Fetch Actions ──

export const fetchStudentDiaryAction = safeFetchAction(async (
  startDate: string,
  endDate: string,
  subjectId?: string,
) => {
  const session = await requireRole('STUDENT');
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, classId: true, sectionId: true },
  });
  if (!studentProfile) throw new Error('Student profile not found');

  const academicSessionId = await getCurrentAcademicSessionId();
  const entries = await getDiaryEntriesByClassSection(
    studentProfile.classId,
    studentProfile.sectionId,
    academicSessionId,
    startDate,
    endDate,
    subjectId,
  );
  return serialize(entries);
});

export const fetchStudentTodayDiaryAction = safeFetchAction(async () => {
  const session = await requireRole('STUDENT');
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, classId: true, sectionId: true },
  });
  if (!studentProfile) throw new Error('Student profile not found');

  const academicSessionId = await getCurrentAcademicSessionId();
  const today = getTodayDateString();
  const entries = await getDiaryEntriesToday(
    studentProfile.classId,
    studentProfile.sectionId,
    academicSessionId,
    today,
  );
  return serialize(entries);
});

export const fetchMyStudentDiaryProfileAction = safeFetchAction(async () => {
  const session = await requireRole('STUDENT');
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      classId: true,
      sectionId: true,
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
  });
  if (!profile) return null;
  return serialize({
    id: profile.id,
    classId: profile.classId,
    sectionId: profile.sectionId,
    className: profile.class.name,
    sectionName: profile.section.name,
  });
});

// ── Principal Fetch Actions ──

export const fetchAllDiaryEntriesAction = safeFetchAction(async (filters?: DiaryFilters) => {
  await requireRole('PRINCIPAL', 'ADMIN');
  const academicSessionId = await getCurrentAcademicSessionId();
  const entries = await getAllDiaryEntries(academicSessionId, filters);
  return serialize(entries);
});

export const fetchDiaryEntryDetailAction = safeFetchAction(async (entryId: string) => {
  await requireRole('TEACHER', 'PRINCIPAL', 'ADMIN');
  const entry = await getDiaryEntryById(entryId);
  if (!entry || entry.deletedAt) return null;
  return serialize(entry);
});

export const fetchDiaryCoverageAction = safeFetchAction(async (
  startDate: string,
  endDate: string,
  classId?: string,
) : Promise<DiaryCoverageData> => {
  await requireRole('PRINCIPAL', 'ADMIN');
  const academicSessionId = await getCurrentAcademicSessionId();

  const [actualCounts, expectedTeachers] = await Promise.all([
    getDiaryCountsByTeacher(academicSessionId, startDate, endDate),
    getExpectedDiaryTeachers(academicSessionId),
  ]);

  const workingDays = getWorkingDays(startDate, endDate);
  const filteredTeachers = classId
    ? expectedTeachers.filter((t) => t.classId === classId)
    : expectedTeachers;

  // Build teacher → date → count map
  const teacherDateMap = new Map<string, Map<string, number>>();
  for (const row of actualCounts) {
    const dateStr = normalizeDiaryDate(row.date);
    if (!teacherDateMap.has(row.teacherProfileId)) {
      teacherDateMap.set(row.teacherProfileId, new Map());
    }
    teacherDateMap.get(row.teacherProfileId)!.set(dateStr, row._count.id);
  }

  // Build expected per teacher per date
  const teacherExpected = new Map<string, number>();
  const teacherMeta = new Map<string, { name: string; employeeId: string }>();
  for (const t of filteredTeachers) {
    const count = (teacherExpected.get(t.teacherId) ?? 0) + 1;
    teacherExpected.set(t.teacherId, count);
    if (!teacherMeta.has(t.teacherId)) {
      teacherMeta.set(t.teacherId, {
        name: `${t.teacher.user.firstName} ${t.teacher.user.lastName}`,
        employeeId: t.teacher.employeeId,
      });
    }
  }

  // Build rows
  const rows: DiaryCoverageRow[] = [];
  let totalSubmitted = 0;
  let totalExpected = 0;

  for (const [teacherId, expectedCount] of teacherExpected) {
    const meta = teacherMeta.get(teacherId)!;
    const dateMap = teacherDateMap.get(teacherId) ?? new Map();
    const dates: Record<string, { submitted: number; expected: number }> = {};

    let teacherSubmitted = 0;
    for (const day of workingDays) {
      const submitted = dateMap.get(day) ?? 0;
      dates[day] = { submitted, expected: expectedCount };
      teacherSubmitted += submitted > 0 ? 1 : 0;
    }

    const coveragePercent = workingDays.length > 0
      ? Math.round((teacherSubmitted / workingDays.length) * 100)
      : 0;

    totalSubmitted += teacherSubmitted;
    totalExpected += workingDays.length;

    rows.push({
      teacherProfileId: teacherId,
      teacherName: meta.name,
      employeeId: meta.employeeId,
      dates,
      coveragePercent,
    });
  }

  rows.sort((a, b) => a.coveragePercent - b.coveragePercent);

  return {
    rows,
    dates: workingDays,
    overallCoverage: totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0,
  };
});

export const fetchDiaryStatsAction = safeFetchAction(async (
  startDate: string,
  endDate: string,
) : Promise<DiaryStatsData> => {
  await requireRole('PRINCIPAL', 'ADMIN');
  const academicSessionId = await getCurrentAcademicSessionId();

  const today = getTodayDateString();
  const [allEntries, expectedTeachers] = await Promise.all([
    getDiaryCountsByTeacher(academicSessionId, startDate, endDate),
    getExpectedDiaryTeachers(academicSessionId),
  ]);

  const teachersWithEntries = new Set(allEntries.map((e) => e.teacherProfileId));
  const totalEntries = allEntries.reduce((sum, e) => sum + e._count.id, 0);

  // Find who's missing today
  const todayEntries = allEntries.filter((e) => normalizeDiaryDate(e.date) === today);
  const todayTeachers = new Set(todayEntries.map((e) => e.teacherProfileId));

  const missingToday = expectedTeachers
    .filter((t) => !todayTeachers.has(t.teacherId))
    .map((t) => ({
      teacherName: `${t.teacher.user.firstName} ${t.teacher.user.lastName}`,
      employeeId: t.teacher.employeeId,
      subjectName: t.subject.name,
      className: t.class?.name ?? 'N/A',
    }));

  // Deduplicate missing by teacher
  const seenTeachers = new Set<string>();
  const uniqueMissing = missingToday.filter((m) => {
    const key = m.employeeId;
    if (seenTeachers.has(key)) return false;
    seenTeachers.add(key);
    return true;
  });

  return {
    totalEntries,
    totalTeachersWithEntries: teachersWithEntries.size,
    totalExpectedEntries: expectedTeachers.length,
    coveragePercent: expectedTeachers.length > 0
      ? Math.round((teachersWithEntries.size / new Set(expectedTeachers.map((t) => t.teacherId)).size) * 100)
      : 0,
    missingToday: uniqueMissing,
  };
});
