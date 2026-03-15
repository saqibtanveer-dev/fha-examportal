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
  getTeacherSubjectClasses,
} from './diary-queries';
import type { DiaryFilters } from './diary.types';
import { safeFetchAction } from '@/lib/safe-action';
import { getStudentVisibleSubjectIds } from '@/lib/enrollment-helpers';
import { getTodayDateString } from './diary.utils';

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

  // Filter out elective subjects the student is not enrolled in
  const visibleSubjects = await getStudentVisibleSubjectIds(
    studentProfile.id,
    studentProfile.classId,
    academicSessionId,
  );
  const filtered = entries.filter((e) => visibleSubjects.has(e.subjectId));

  return serialize(filtered);
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

  // Filter out elective subjects the student is not enrolled in
  const visibleSubjects = await getStudentVisibleSubjectIds(
    studentProfile.id,
    studentProfile.classId,
    academicSessionId,
  );
  const filtered = entries.filter((e) => visibleSubjects.has(e.subjectId));

  return serialize(filtered);
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

