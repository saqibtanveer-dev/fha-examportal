'use server';

import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import { assertTeacherSectionAccess } from '@/lib/authorization-guards';
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
} from './attendance-queries';
import {
  isSubjectElective,
  getStudentsEnrolledInSubject,
  hasEnrollmentsForClass,
} from '@/modules/subjects/enrollment-queries';
import { getStudentVisibleSubjectIds } from '@/lib/enrollment-helpers';

async function getCurrentAcademicSessionId(): Promise<string | null> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  return session?.id ?? null;
}

const fetchDailyAttendance = safeFetchAction(async (classId: string, sectionId: string, date: string) => {
  const session = await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  if (session.user.role === 'TEACHER') {
    await assertTeacherSectionAccess(session.user.id, classId, sectionId);
  }
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const dateObj = new Date(date + 'T00:00:00.000Z');
  return serialize(await getDailyAttendanceByClassDate(classId, sectionId, dateObj, academicSessionId));
});

export async function fetchDailyAttendanceAction(classId: string, sectionId: string, date: string) {
  return fetchDailyAttendance(classId, sectionId, date);
}

const fetchStudentDailyAttendance = safeFetchAction(async (
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
  return serialize(await getDailyAttendanceByStudent(
    studentProfileId,
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T00:00:00.000Z'),
    academicSessionId,
  ));
});

export async function fetchStudentDailyAttendanceAction(studentProfileId: string, startDate: string, endDate: string) {
  return fetchStudentDailyAttendance(studentProfileId, startDate, endDate);
}

const fetchSubjectAttendance = safeFetchAction(async (
  classId: string,
  sectionId: string,
  subjectId: string,
  periodSlotId: string,
  date: string,
) => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];
  const dateObj = new Date(date + 'T00:00:00.000Z');
  return serialize(await getSubjectAttendanceBySlot(
    classId,
    sectionId,
    subjectId,
    periodSlotId,
    dateObj,
    academicSessionId,
  ));
});

export async function fetchSubjectAttendanceAction(
  classId: string,
  sectionId: string,
  subjectId: string,
  periodSlotId: string,
  date: string,
) {
  return fetchSubjectAttendance(classId, sectionId, subjectId, periodSlotId, date);
}

const fetchStudentSubjectAttendance = safeFetchAction(async (
  studentProfileId: string,
  startDate: string,
  endDate: string,
  subjectId?: string,
) => {
  const session = await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
  if (session.user.role === 'FAMILY') {
    await assertFamilyStudentAccess(session.user.id, studentProfileId);
  }
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return [];

  const records = await getSubjectAttendanceByStudent(
    studentProfileId,
    new Date(startDate + 'T00:00:00.000Z'),
    new Date(endDate + 'T00:00:00.000Z'),
    academicSessionId,
    subjectId,
  );

  if (session.user.role === 'STUDENT' || session.user.role === 'FAMILY') {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: { classId: true },
    });

    if (student) {
      const visibleSubjects = await getStudentVisibleSubjectIds(studentProfileId, student.classId, academicSessionId);
      return serialize(records.filter((r) => visibleSubjects.has(r.subjectId)));
    }
  }

  return serialize(records);
});

export async function fetchStudentSubjectAttendanceAction(
  studentProfileId: string,
  startDate: string,
  endDate: string,
  subjectId?: string,
) {
  return fetchStudentSubjectAttendance(studentProfileId, startDate, endDate, subjectId);
}

const fetchStudentsForMarking = safeFetchAction(async (classId: string, sectionId: string, subjectId?: string) => {
  const session = await requireRole('ADMIN', 'TEACHER');
  if (session.user.role === 'TEACHER') {
    await assertTeacherSectionAccess(session.user.id, classId, sectionId);
  }

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
});

export async function fetchStudentsForMarkingAction(classId: string, sectionId: string, subjectId?: string) {
  return fetchStudentsForMarking(classId, sectionId, subjectId);
}

const fetchHasDailyAttendance = safeFetchAction(async (classId: string, sectionId: string, date: string) => {
  const session = await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  if (session.user.role === 'TEACHER') {
    await assertTeacherSectionAccess(session.user.id, classId, sectionId);
  }
  const academicSessionId = await getCurrentAcademicSessionId();
  if (!academicSessionId) return false;
  const dateObj = new Date(date + 'T00:00:00.000Z');
  return hasDailyAttendance(classId, sectionId, dateObj, academicSessionId);
});

export async function fetchHasDailyAttendanceAction(classId: string, sectionId: string, date: string) {
  return fetchHasDailyAttendance(classId, sectionId, date);
}
