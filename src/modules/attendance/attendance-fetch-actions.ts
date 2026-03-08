'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import { safeFetchAction } from '@/lib/safe-action';
import {
  getDailyAttendanceByClassDate,
  getDailyAttendanceByStudent,
  getSubjectAttendanceBySlot,
  getSubjectAttendanceByStudent,
  getActiveStudentsInSection,
  hasDailyAttendance,
  getDailyAttendanceCounts,
  getStudentDailyAttendanceCounts,
  getClassDailyAttendanceTrend,
  getStudentWiseDailyAttendance,
  getSchoolDailyAttendanceForDate,
  getActiveStudentCountBySection,
} from './attendance-queries';
import {
  isSubjectElective,
  getStudentsEnrolledInSubject,
  hasEnrollmentsForClass,
} from '@/modules/subjects/enrollment-queries';

// ============================================
// HELPERS
// ============================================

async function getCurrentAcademicSessionId(): Promise<string | null> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  return session?.id ?? null;
}

// ============================================
// DAILY ATTENDANCE FETCHES
// ============================================

export const fetchDailyAttendanceAction = safeFetchAction(
  async (classId: string, sectionId: string, date: string) => {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return [];
    const dateObj = new Date(date + 'T00:00:00.000Z');
    return serialize(await getDailyAttendanceByClassDate(classId, sectionId, dateObj, academicSessionId));
  },
);

export const fetchStudentDailyAttendanceAction = safeFetchAction(
  async (studentProfileId: string, startDate: string, endDate: string) => {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return [];
    return serialize(await getDailyAttendanceByStudent(
      studentProfileId,
      new Date(startDate + 'T00:00:00.000Z'),
      new Date(endDate + 'T00:00:00.000Z'),
      academicSessionId,
    ));
  },
);

export const fetchHasDailyAttendanceAction = safeFetchAction(
  async (classId: string, sectionId: string, date: string) => {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return false;
    const dateObj = new Date(date + 'T00:00:00.000Z');
    return hasDailyAttendance(classId, sectionId, dateObj, academicSessionId);
  },
);

// ============================================
// SUBJECT ATTENDANCE FETCHES
// ============================================

export const fetchSubjectAttendanceAction = safeFetchAction(
  async (classId: string, sectionId: string, subjectId: string, periodSlotId: string, date: string) => {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return [];
    const dateObj = new Date(date + 'T00:00:00.000Z');
    return serialize(await getSubjectAttendanceBySlot(
      classId, sectionId, subjectId, periodSlotId, dateObj, academicSessionId,
    ));
  },
);

export const fetchStudentSubjectAttendanceAction = safeFetchAction(
  async (studentProfileId: string, startDate: string, endDate: string, subjectId?: string) => {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return [];
    return serialize(await getSubjectAttendanceByStudent(
      studentProfileId,
      new Date(startDate + 'T00:00:00.000Z'),
      new Date(endDate + 'T00:00:00.000Z'),
      academicSessionId,
      subjectId,
    ));
  },
);

// ============================================
// STUDENTS FOR MARKING
// ============================================

export const fetchStudentsForMarkingAction = safeFetchAction(
  async (classId: string, sectionId: string, subjectId?: string) => {
    await requireRole('ADMIN', 'TEACHER');

    if (subjectId) {
      const academicSessionId = await getCurrentAcademicSessionId();
      if (academicSessionId) {
        const elective = await isSubjectElective(subjectId, classId);
        if (elective) {
          const hasEnrollments = await hasEnrollmentsForClass(classId, academicSessionId);
          if (hasEnrollments) {
            const enrollments = await getStudentsEnrolledInSubject(subjectId, classId, academicSessionId);
            const filteredStudents = enrollments
              .filter((e) => e.studentProfile.sectionId === sectionId)
              .map((e) => e.studentProfile);
            return serialize(filteredStudents);
          }
        }
      }
    }

    return serialize(await getActiveStudentsInSection(classId, sectionId));
  },
);

// ============================================
// STATS & ANALYTICS
// ============================================

export const fetchDailyAttendanceCountsAction = safeFetchAction(
  async (classId: string, sectionId: string, date: string) => {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return [];
    const dateObj = new Date(date + 'T00:00:00.000Z');
    return serialize(await getDailyAttendanceCounts(classId, sectionId, dateObj, academicSessionId));
  },
);

export const fetchStudentDailyAttendanceCountsAction = safeFetchAction(
  async (studentProfileId: string, startDate: string, endDate: string) => {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return [];
    return serialize(await getStudentDailyAttendanceCounts(
      studentProfileId,
      new Date(startDate + 'T00:00:00.000Z'),
      new Date(endDate + 'T00:00:00.000Z'),
      academicSessionId,
    ));
  },
);

export const fetchClassAttendanceTrendAction = safeFetchAction(
  async (classId: string, sectionId: string, startDate: string, endDate: string) => {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return [];
    return serialize(await getClassDailyAttendanceTrend(
      classId, sectionId,
      new Date(startDate + 'T00:00:00.000Z'),
      new Date(endDate + 'T00:00:00.000Z'),
      academicSessionId,
    ));
  },
);

export const fetchStudentWiseAttendanceAction = safeFetchAction(
  async (classId: string, sectionId: string, startDate: string, endDate: string) => {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return [];

    const raw = await getStudentWiseDailyAttendance(
      classId, sectionId,
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
  },
);

export const fetchSchoolAttendanceForDateAction = safeFetchAction(
  async (date: string) => {
    await requireRole('ADMIN', 'PRINCIPAL');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return [];
    const dateObj = new Date(date + 'T00:00:00.000Z');
    return serialize(await getSchoolDailyAttendanceForDate(dateObj, academicSessionId));
  },
);

export const fetchActiveStudentCountAction = safeFetchAction(
  async (classId: string, sectionId: string) => {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
    return getActiveStudentCountBySection(classId, sectionId);
  },
);

// ============================================
// STUDENT SELF-SERVICE
// ============================================

export const fetchMyStudentProfileAction = safeFetchAction(async () => {
  const session = await requireRole('STUDENT');
  const profile = await prisma.studentProfile.findFirst({
    where: { userId: session.user.id },
    select: { id: true, rollNumber: true, registrationNo: true, classId: true, sectionId: true },
  });
  return serialize(profile);
});

export const fetchCurrentAcademicSessionAction = safeFetchAction(async () => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true, name: true, isCurrent: true },
  });
  return serialize(session);
});
