'use server';

import { requireRole } from '@/lib/auth-utils';
import { safeFetchAction } from '@/lib/safe-action';
import { prisma } from '@/lib/prisma';
import type { DiaryCoverageData, DiaryCoverageRow, DiaryStatsData } from './diary.types';
import { getDiaryCountsByTeacher, getExpectedDiaryTeachers } from './diary-queries';
import { getWorkingDays, normalizeDiaryDate, getTodayDateString } from './diary.utils';

async function getCurrentAcademicSessionId(): Promise<string> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  if (!session) throw new Error('No active academic session found');
  return session.id;
}

const fetchDiaryCoverage = safeFetchAction(async (
  startDate: string,
  endDate: string,
  classId?: string,
): Promise<DiaryCoverageData> => {
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

  const teacherDateMap = new Map<string, Map<string, number>>();
  for (const row of actualCounts) {
    const dateStr = normalizeDiaryDate(row.date);
    if (!teacherDateMap.has(row.teacherProfileId)) {
      teacherDateMap.set(row.teacherProfileId, new Map());
    }
    teacherDateMap.get(row.teacherProfileId)!.set(dateStr, row._count.id);
  }

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

export async function fetchDiaryCoverageAction(startDate: string, endDate: string, classId?: string) {
  return fetchDiaryCoverage(startDate, endDate, classId);
}

const fetchDiaryStats = safeFetchAction(async (
  startDate: string,
  endDate: string,
): Promise<DiaryStatsData> => {
  await requireRole('PRINCIPAL', 'ADMIN');
  const academicSessionId = await getCurrentAcademicSessionId();

  const today = getTodayDateString();
  const [allEntries, expectedTeachers] = await Promise.all([
    getDiaryCountsByTeacher(academicSessionId, startDate, endDate),
    getExpectedDiaryTeachers(academicSessionId),
  ]);

  const teachersWithEntries = new Set(allEntries.map((e) => e.teacherProfileId));
  const totalEntries = allEntries.reduce((sum, e) => sum + e._count.id, 0);

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

export async function fetchDiaryStatsAction(startDate: string, endDate: string) {
  return fetchDiaryStats(startDate, endDate);
}
