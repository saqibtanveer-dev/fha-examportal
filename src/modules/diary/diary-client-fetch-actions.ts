'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import { safeFetchAction } from '@/lib/safe-action';
import {
  getDiaryEntriesByTeacher,
  getDiaryEntryById,
  getTeacherDiaryDates,
  getDiaryEntriesByClassSection,
  getDiaryEntriesToday,
  getAllDiaryEntries,
  getTeacherSubjectClasses,
} from './diary-queries';
import type { DiaryFilters } from './diary.types';
import { getStudentVisibleSubjectIds } from '@/lib/enrollment-helpers';

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getCurrentAcademicSessionId(): Promise<string> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  if (!session) throw new Error('No active academic session found');
  return session.id;
}

const fetchTeacherDiaryEntries = safeFetchAction(async (filters?: DiaryFilters) => {
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

export async function fetchTeacherDiaryEntriesAction(filters?: DiaryFilters) {
  return fetchTeacherDiaryEntries(filters);
}

const fetchTeacherSubjectClasses = safeFetchAction(async () => {
  const session = await requireRole('TEACHER', 'ADMIN');
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!teacherProfile) throw new Error('Teacher profile not found');

  const assignments = await getTeacherSubjectClasses(teacherProfile.id);
  return serialize(assignments);
});

export async function fetchTeacherSubjectClassesAction() {
  return fetchTeacherSubjectClasses();
}

const fetchTeacherDiaryCalendar = safeFetchAction(async (year: number, month: number) => {
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

export async function fetchTeacherDiaryCalendarAction(year: number, month: number) {
  return fetchTeacherDiaryCalendar(year, month);
}

const fetchStudentDiary = safeFetchAction(async (
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

  const visibleSubjects = await getStudentVisibleSubjectIds(
    studentProfile.id,
    studentProfile.classId,
    academicSessionId,
  );
  const filtered = entries.filter((e) => visibleSubjects.has(e.subjectId));

  return serialize(filtered);
});

export async function fetchStudentDiaryAction(startDate: string, endDate: string, subjectId?: string) {
  return fetchStudentDiary(startDate, endDate, subjectId);
}

const fetchStudentTodayDiary = safeFetchAction(async () => {
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

  const visibleSubjects = await getStudentVisibleSubjectIds(
    studentProfile.id,
    studentProfile.classId,
    academicSessionId,
  );
  const filtered = entries.filter((e) => visibleSubjects.has(e.subjectId));

  return serialize(filtered);
});

export async function fetchStudentTodayDiaryAction() {
  return fetchStudentTodayDiary();
}

const fetchMyStudentDiaryProfile = safeFetchAction(async () => {
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

export async function fetchMyStudentDiaryProfileAction() {
  return fetchMyStudentDiaryProfile();
}

const fetchAllDiaryEntries = safeFetchAction(async (filters?: DiaryFilters) => {
  await requireRole('PRINCIPAL', 'ADMIN');
  const academicSessionId = await getCurrentAcademicSessionId();
  const entries = await getAllDiaryEntries(academicSessionId, filters);
  return serialize(entries);
});

export async function fetchAllDiaryEntriesAction(filters?: DiaryFilters) {
  return fetchAllDiaryEntries(filters);
}

const fetchDiaryEntryDetail = safeFetchAction(async (entryId: string) => {
  await requireRole('TEACHER', 'PRINCIPAL', 'ADMIN');
  const entry = await getDiaryEntryById(entryId);
  if (!entry || entry.deletedAt) return null;
  return serialize(entry);
});

export async function fetchDiaryEntryDetailAction(entryId: string) {
  return fetchDiaryEntryDetail(entryId);
}
