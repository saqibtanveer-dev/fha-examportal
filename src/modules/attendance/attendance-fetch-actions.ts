'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
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

export async function fetchDailyAttendanceAction(
  classId: string,
  sectionId: string,
  date: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const dateObj = new Date(date + 'T00:00:00.000Z');
  const records = await getDailyAttendanceByClassDate(classId, sectionId, dateObj, academicSessionId);
  return serialize(records);
}

export async function fetchStudentDailyAttendanceAction(
  studentProfileId: string,
  startDate: string,
  endDate: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const records = await getDailyAttendanceByStudent(
    studentProfileId,
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T00:00:00.000Z'),
    academicSessionId,
  );
  return serialize(records);
}

export async function fetchHasDailyAttendanceAction(
  classId: string,
  sectionId: string,
  date: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return false;
  const dateObj = new Date(date + 'T00:00:00.000Z');
  return hasDailyAttendance(classId, sectionId, dateObj, academicSessionId);
}

// ============================================
// SUBJECT ATTENDANCE FETCHES
// ============================================

export async function fetchSubjectAttendanceAction(
  classId: string,
  sectionId: string,
  subjectId: string,
  periodSlotId: string,
  date: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const dateObj = new Date(date + 'T00:00:00.000Z');
  const records = await getSubjectAttendanceBySlot(
    classId, sectionId, subjectId, periodSlotId, dateObj, academicSessionId,
  );
  return serialize(records);
}

export async function fetchStudentSubjectAttendanceAction(
  studentProfileId: string,
  startDate: string,
  endDate: string,
  subjectId?: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const records = await getSubjectAttendanceByStudent(
    studentProfileId,
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T00:00:00.000Z'),
    academicSessionId,
    subjectId,
  );
  return serialize(records);
}

// ============================================
// STUDENTS FOR MARKING
// ============================================

export async function fetchStudentsForMarkingAction(
  classId: string,
  sectionId: string,
) {
  await requireRole('ADMIN', 'TEACHER');
  const students = await getActiveStudentsInSection(classId, sectionId);
  return serialize(students);
}

// ============================================
// STATS & ANALYTICS
// ============================================

export async function fetchDailyAttendanceCountsAction(
  classId: string,
  sectionId: string,
  date: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const dateObj = new Date(date + 'T00:00:00.000Z');
  const result = await getDailyAttendanceCounts(classId, sectionId, dateObj, academicSessionId);
  return serialize(result);
}

export async function fetchStudentDailyAttendanceCountsAction(
  studentProfileId: string,
  startDate: string,
  endDate: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const result = await getStudentDailyAttendanceCounts(
    studentProfileId,
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T00:00:00.000Z'),
    academicSessionId,
  );
  return serialize(result);
}

export async function fetchClassAttendanceTrendAction(
  classId: string,
  sectionId: string,
  startDate: string,
  endDate: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const result = await getClassDailyAttendanceTrend(
    classId,
    sectionId,
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T00:00:00.000Z'),
    academicSessionId,
  );
  return serialize(result);
}

export async function fetchStudentWiseAttendanceAction(
  classId: string,
  sectionId: string,
  startDate: string,
  endDate: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];

  // Get raw groupBy data: { studentProfileId, status, _count: { id } }[]
  const raw = await getStudentWiseDailyAttendance(
    classId,
    sectionId,
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T00:00:00.000Z'),
    academicSessionId,
  );

  // Aggregate per student
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

  // Fetch student details
  const profiles = await prisma.studentProfile.findMany({
    where: { id: { in: [...studentMap.keys()] } },
    select: {
      id: true,
      rollNumber: true,
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { rollNumber: 'asc' },
  });

  // Build enriched rows
  const result = profiles.map((p) => {
    const counts = studentMap.get(p.id) ?? { present: 0, absent: 0, late: 0, excused: 0 };
    const total = counts.present + counts.absent + counts.late + counts.excused;
    const attended = counts.present + counts.late;
    const percentage = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0;
    return {
      studentProfileId: p.id,
      studentName: `${p.user.firstName} ${p.user.lastName}`,
      rollNumber: p.rollNumber,
      present: counts.present,
      absent: counts.absent,
      late: counts.late,
      excused: counts.excused,
      total,
      percentage,
    };
  });

  return serialize(result);
}

export async function fetchSchoolAttendanceForDateAction(date: string) {
  await requireRole('ADMIN', 'PRINCIPAL');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const dateObj = new Date(date + 'T00:00:00.000Z');
  const result = await getSchoolDailyAttendanceForDate(dateObj, academicSessionId);
  return serialize(result);
}

export async function fetchActiveStudentCountAction(classId: string, sectionId: string) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  return getActiveStudentCountBySection(classId, sectionId);
}

// ============================================
// STUDENT SELF-SERVICE
// ============================================

export async function fetchMyStudentProfileAction() {
  const session = await requireRole('STUDENT');
  const profile = await prisma.studentProfile.findFirst({
    where: { userId: session.user.id },
    select: { id: true, rollNumber: true, registrationNo: true, classId: true, sectionId: true },
  });
  return serialize(profile);
}
