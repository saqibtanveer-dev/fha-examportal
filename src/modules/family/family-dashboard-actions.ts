'use server';

// ============================================
// Family Module — Child Dashboard Stats Actions
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';
import type { ChildDashboardStats, AllChildrenOverview } from './family.types';
import { safeFetchAction } from '@/lib/safe-action';
import { getStudentVisibleSubjectIds } from '@/lib/enrollment-helpers';

/**
 * Fetch dashboard stats for a single child.
 */
export const fetchChildDashboardStatsAction = safeFetchAction(async (
  studentProfileId: string,
) : Promise<ActionResult<ChildDashboardStats>> => {
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

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const sessionId = currentSession?.id;

  // Parallel fetch all data
  const [attendanceData, examData, diaryData] = await Promise.all([
    fetchAttendanceStats(studentProfileId, sessionId),
    fetchExamStats(studentProfile.userId, sessionId),
    fetchDiaryStats(studentProfileId, studentProfile.classId, studentProfile.sectionId, sessionId),
  ]);

  return {
    success: true,
    data: {
      studentProfileId,
      studentName: `${studentProfile.user.firstName} ${studentProfile.user.lastName}`,
      className: studentProfile.class.name,
      sectionName: studentProfile.section.name,
      attendance: attendanceData,
      exams: examData,
      diary: diaryData,
    },
  };
});

/**
 * Fetch overview stats for all children (home dashboard).
 */
export const fetchAllChildrenOverviewAction = safeFetchAction(async () : Promise<ActionResult<AllChildrenOverview>> => {
  const session = await requireRole('FAMILY');

  const profile = await prisma.familyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      studentLinks: {
        where: { isActive: true },
        include: {
          studentProfile: {
            include: {
              user: { select: { firstName: true, lastName: true } },
              class: { select: { id: true, name: true } },
              section: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!profile) {
    return { success: false, error: 'Family profile not found' };
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const sessionId = currentSession?.id;

  const childrenStats = await Promise.all(
    profile.studentLinks.map(async (link) => {
      const sp = link.studentProfile;
      const [attendance, exams, diary] = await Promise.all([
        fetchAttendanceStats(sp.id, sessionId),
        fetchExamStats(sp.userId, sessionId),
        fetchDiaryStats(sp.id, sp.classId, sp.sectionId, sessionId),
      ]);

      return {
        studentProfileId: sp.id,
        studentName: `${sp.user.firstName} ${sp.user.lastName}`,
        className: sp.class.name,
        sectionName: sp.section.name,
        attendance,
        exams,
        diary,
      } satisfies ChildDashboardStats;
    }),
  );

  return {
    success: true,
    data: { children: childrenStats, totalChildren: childrenStats.length },
  };
});

// ── Private Helpers ──

async function fetchAttendanceStats(studentProfileId: string, academicSessionId?: string) {
  const records = await prisma.dailyAttendance.findMany({
    where: {
      studentProfileId,
      ...(academicSessionId ? { academicSessionId } : {}),
    },
    select: { status: true },
  });

  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === 'PRESENT').length;
  const absentDays = records.filter((r) => r.status === 'ABSENT').length;
  const lateDays = records.filter((r) => r.status === 'LATE').length;
  const excusedDays = records.filter((r) => r.status === 'EXCUSED').length;
  // Formula: (present + late) / (total - excused) — matches shared module
  const effectiveTotal = totalDays - excusedDays;
  const percentage = effectiveTotal > 0 ? Math.round(((presentDays + lateDays) / effectiveTotal) * 100) : 0;

  return { totalDays, presentDays, absentDays, lateDays, percentage };
}

async function fetchExamStats(studentUserId: string, sessionId?: string) {
  const whereClause = sessionId
    ? { studentId: studentUserId, exam: { academicSessionId: sessionId } }
    : { studentId: studentUserId };

  const results = await prisma.examResult.findMany({
    where: whereClause,
    select: { totalMarks: true, obtainedMarks: true, grade: true },
  });

  const totalExams = results.length;
  const completedExams = results.filter((r) => r.obtainedMarks !== null).length;
  const scored = results.filter((r) => Number(r.totalMarks) > 0);
  const avgPct = scored.length > 0
    ? Math.round(scored.reduce((sum, r) => sum + (Number(r.obtainedMarks) / Number(r.totalMarks)) * 100, 0) / scored.length)
    : 0;
  const latestGrade = results.length > 0 ? results[results.length - 1]!.grade : null;

  return { totalExams, completedExams, averagePercentage: avgPct, latestGrade };
}

async function fetchDiaryStats(
  studentProfileId: string, classId: string, sectionId: string, sessionId?: string,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only count diary entries for subjects the student is enrolled in
  const visibleSubjects = sessionId
    ? await getStudentVisibleSubjectIds(studentProfileId, classId, sessionId)
    : null;

  const whereClause = {
    classId,
    sectionId,
    status: 'PUBLISHED' as const,
    deletedAt: null,
    ...(sessionId ? { academicSessionId: sessionId } : {}),
    ...(visibleSubjects ? { subjectId: { in: [...visibleSubjects] } } : {}),
  };

  const [totalEntries, readReceipts, todayEntries] = await Promise.all([
    prisma.diaryEntry.count({ where: whereClause }),
    prisma.diaryReadReceipt.count({ where: { studentProfileId } }),
    prisma.diaryEntry.count({ where: { ...whereClause, date: today } }),
  ]);

  const unreadEntries = Math.max(0, totalEntries - readReceipts);

  return { totalEntries, unreadEntries, todayEntries };
}
