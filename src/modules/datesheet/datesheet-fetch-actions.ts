'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import {
  listDatesheets,
  getDatesheetById,
  getDatesheetWithEntries,
  listEntriesByDatesheet,
  listEntriesByClass,
  listDutiesByEntry,
  listDutiesByTeacher,
  getDatesheetStats,
  getPublishedDatesheetForClass,
  getTeacherDutyRoster,
} from './datesheet-queries';
import type { DatesheetStatus } from '@prisma/client';
import { safeFetchAction } from '@/lib/safe-action';

// ── Admin / Principal reads ──

export const fetchDatesheetListAction = safeFetchAction(async (academicSessionId: string, status?: DatesheetStatus) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const data = await listDatesheets(academicSessionId, status);
  return serialize(data);
});

export const fetchDatesheetDetailAction = safeFetchAction(async (id: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const data = await getDatesheetById(id);
  return serialize(data);
});

export const fetchDatesheetWithEntriesAction = safeFetchAction(async (id: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const data = await getDatesheetWithEntries(id);
  return serialize(data);
});

export const fetchDatesheetEntriesAction = safeFetchAction(async (datesheetId: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const data = await listEntriesByDatesheet(datesheetId);
  return serialize(data);
});

export const fetchDatesheetEntryDutiesAction = safeFetchAction(async (entryId: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  const data = await listDutiesByEntry(entryId);
  return serialize(data);
});

export const fetchDatesheetStatsAction = safeFetchAction(async (datesheetId: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  return getDatesheetStats(datesheetId);
});

// ── Teacher reads ──

export const fetchTeacherDutyRosterAction = safeFetchAction(async (datesheetId: string) => {
  const session = await requireRole('TEACHER');
  const { prisma } = await import('@/lib/prisma');
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!teacher) return serialize([]);
  const data = await listDutiesByTeacher(teacher.id, datesheetId);
  return serialize(data);
});

export const fetchMyDutyRosterAction = safeFetchAction(async (academicSessionId: string) => {
  const session = await requireRole('TEACHER');
  const { prisma } = await import('@/lib/prisma');
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!teacher) return serialize([]);
  const data = await getTeacherDutyRoster(teacher.id, academicSessionId);
  return serialize(data);
});

// ── Student reads ──

export const fetchPublishedDatesheetForStudentAction = safeFetchAction(async (academicSessionId: string) => {
  const session = await requireRole('STUDENT');
  const { prisma } = await import('@/lib/prisma');
  const student = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, classId: true, sectionId: true },
  });
  if (!student) return serialize([]);
  const data = await getPublishedDatesheetForClass(student.classId, student.sectionId, academicSessionId);

  // Filter entries by enrolled subjects if enrollments are configured
  const { hasEnrollmentsForClass, getStudentEnrolledSubjectIds } = await import('@/modules/subjects/enrollment-queries');
  const hasEnrollments = await hasEnrollmentsForClass(student.classId, academicSessionId);
  if (hasEnrollments) {
    const enrolledIds = await getStudentEnrolledSubjectIds(student.id, academicSessionId);
    // Filter entries in each datesheet to only show enrolled subjects
    for (const ds of data) {
      (ds as { entries: { subjectId: string }[] }).entries = (ds as { entries: { subjectId: string }[] }).entries.filter(
        (entry) => enrolledIds.has(entry.subjectId),
      );
    }
  }

  return serialize(data);
});

// ── Published datesheet list (all stakeholders) ──

export const fetchPublishedDatesheetListAction = safeFetchAction(async (academicSessionId: string) => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
  const data = await listDatesheets(academicSessionId, 'PUBLISHED');
  return serialize(data);
});

// ── Family reads ──

export const fetchPublishedDatesheetForChildAction = safeFetchAction(async (
  childStudentProfileId: string,
  academicSessionId: string,
) => {
  await requireRole('FAMILY');
  const { prisma } = await import('@/lib/prisma');
  const student = await prisma.studentProfile.findUnique({
    where: { id: childStudentProfileId },
    select: { id: true, classId: true, sectionId: true },
  });
  if (!student) return serialize([]);
  const data = await getPublishedDatesheetForClass(student.classId, student.sectionId, academicSessionId);

  // Filter entries by enrolled subjects if enrollments are configured
  const { hasEnrollmentsForClass, getStudentEnrolledSubjectIds } = await import('@/modules/subjects/enrollment-queries');
  const hasEnrollments = await hasEnrollmentsForClass(student.classId, academicSessionId);
  if (hasEnrollments) {
    const enrolledIds = await getStudentEnrolledSubjectIds(student.id, academicSessionId);
    for (const ds of data) {
      (ds as { entries: { subjectId: string }[] }).entries = (ds as { entries: { subjectId: string }[] }).entries.filter(
        (entry) => enrolledIds.has(entry.subjectId),
      );
    }
  }

  return serialize(data);
});

// ── Class entries read for specific datesheet ──

export const fetchDatesheetEntriesByClassAction = safeFetchAction(async (
  datesheetId: string,
  classId: string,
  sectionId?: string,
) => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
  const data = await listEntriesByClass(datesheetId, classId, sectionId);
  return serialize(data);
});
