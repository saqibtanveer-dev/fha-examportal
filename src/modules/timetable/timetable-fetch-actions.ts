'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import {
  listPeriodSlots,
  listAllPeriodSlots,
  listActivePeriodSlots,
  listPeriodSlotsByClass,
  getPeriodSlotById,
  listTimetableEntriesByClass,
  listTimetableEntriesByTeacher,
  listTimetableEntriesByTeacherAndDay,
  getTimetableEntryById,
} from './timetable-queries';
import type { DayOfWeek } from '@prisma/client';
import { safeFetchAction } from '@/lib/safe-action';
import { getStudentVisibleSubjectIds } from '@/lib/enrollment-helpers';

// ── Period Slot Reads ──

export const fetchPeriodSlotsAction = safeFetchAction(async (classId?: string) => {
  await requireRole('ADMIN', 'PRINCIPAL');
  if (classId) {
    const classSlots = await listPeriodSlotsByClass(classId);
    if (classSlots.length > 0) return serialize(classSlots);
  }
  const slots = await listPeriodSlots();
  return serialize(slots);
});

export const fetchAllPeriodSlotsAction = safeFetchAction(async () => {
  await requireRole('ADMIN');
  const slots = await listAllPeriodSlots();
  return serialize(slots);
});

export const fetchActivePeriodSlotsAction = safeFetchAction(async (classId?: string, sectionId?: string) => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
  const slots = await listActivePeriodSlots(classId, sectionId);
  return serialize(slots);
});

export const fetchPeriodSlotByIdAction = safeFetchAction(async (id: string) => {
  await requireRole('ADMIN');
  const slot = await getPeriodSlotById(id);
  return serialize(slot);
});

// ── Timetable Entry Reads ──

export const fetchTimetableByClassAction = safeFetchAction(async (
  classId: string,
  sectionId: string,
  academicSessionId: string,
) => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const entries = await listTimetableEntriesByClass(classId, sectionId, academicSessionId);
  return serialize(entries);
});

export const fetchTimetableForStudentAction = safeFetchAction(async (
  studentProfileId: string,
  classId: string,
  sectionId: string,
  academicSessionId: string,
) => {
  await requireRole('STUDENT', 'FAMILY');
  const entries = await listTimetableEntriesByClass(classId, sectionId, academicSessionId);
  const visibleSubjects = await getStudentVisibleSubjectIds(studentProfileId, classId, academicSessionId);
  const filtered = entries.filter((e) => visibleSubjects.has(e.subjectId));
  return serialize(filtered);
});

export const fetchTimetableByTeacherAction = safeFetchAction(async (
  teacherProfileId: string,
  academicSessionId: string,
) => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const entries = await listTimetableEntriesByTeacher(teacherProfileId, academicSessionId);
  return serialize(entries);
});

export const fetchTimetableByTeacherAndDayAction = safeFetchAction(async (
  teacherProfileId: string,
  dayOfWeek: DayOfWeek,
  academicSessionId: string,
) => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const entries = await listTimetableEntriesByTeacherAndDay(teacherProfileId, dayOfWeek, academicSessionId);
  return serialize(entries);
});

export const fetchTimetableEntryByIdAction = safeFetchAction(async (id: string) => {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const entry = await getTimetableEntryById(id);
  return serialize(entry);
});

// ── Teacher list for timetable assignment ──

export const fetchTeacherProfilesAction = safeFetchAction(async () => {
  await requireRole('ADMIN');
  const teachers = await prisma.teacherProfile.findMany({
    where: { user: { isActive: true } },
    select: {
      id: true,
      employeeId: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { user: { firstName: 'asc' } },
  });
  return serialize(teachers);
});

// ── Class teacher management ──

export const fetchSectionsWithClassTeachersAction = safeFetchAction(async () => {
  await requireRole('ADMIN');
  const sections = await prisma.section.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      class: { select: { id: true, name: true, grade: true } },
      classTeacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          teacherProfile: { select: { employeeId: true } },
        },
      },
    },
    orderBy: [{ class: { grade: 'asc' } }, { name: 'asc' }],
  });
  return serialize(sections);
});

// ── Sections assigned to a teacher (for attendance access control) ──

export const fetchTeacherAssignedSectionsAction = safeFetchAction(async () => {
  const session = await requireRole('TEACHER');
  const userId = session.user.id;

  const sections = await prisma.section.findMany({
    where: { classTeacherId: userId, isActive: true },
    select: {
      id: true,
      name: true,
      class: { select: { id: true, name: true } },
    },
    orderBy: [{ class: { grade: 'asc' } }, { name: 'asc' }],
  });
  return serialize(sections);
});
