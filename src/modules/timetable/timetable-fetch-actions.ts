'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';
import {
  listPeriodSlots,
  listActivePeriodSlots,
  getPeriodSlotById,
  listTimetableEntriesByClass,
  listTimetableEntriesByTeacher,
  listTimetableEntriesByTeacherAndDay,
  getTimetableEntryById,
} from './timetable-queries';
import type { DayOfWeek } from '@prisma/client';

// ── Period Slot Reads ──

export async function fetchPeriodSlotsAction() {
  await requireRole('ADMIN', 'PRINCIPAL');
  const slots = await listPeriodSlots();
  return serialize(slots);
}

export async function fetchActivePeriodSlotsAction() {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
  const slots = await listActivePeriodSlots();
  return serialize(slots);
}

export async function fetchPeriodSlotByIdAction(id: string) {
  await requireRole('ADMIN');
  const slot = await getPeriodSlotById(id);
  return serialize(slot);
}

// ── Timetable Entry Reads ──

export async function fetchTimetableByClassAction(
  classId: string,
  sectionId: string,
  academicSessionId: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'FAMILY');
  const entries = await listTimetableEntriesByClass(classId, sectionId, academicSessionId);
  return serialize(entries);
}

export async function fetchTimetableByTeacherAction(
  teacherProfileId: string,
  academicSessionId: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const entries = await listTimetableEntriesByTeacher(teacherProfileId, academicSessionId);
  return serialize(entries);
}

export async function fetchTimetableByTeacherAndDayAction(
  teacherProfileId: string,
  dayOfWeek: DayOfWeek,
  academicSessionId: string,
) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const entries = await listTimetableEntriesByTeacherAndDay(teacherProfileId, dayOfWeek, academicSessionId);
  return serialize(entries);
}

export async function fetchTimetableEntryByIdAction(id: string) {
  await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');
  const entry = await getTimetableEntryById(id);
  return serialize(entry);
}

// ── Teacher list for timetable assignment ──

export async function fetchTeacherProfilesAction() {
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
}

// ── Class teacher management ──

export async function fetchSectionsWithClassTeachersAction() {
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
}

// ── Sections assigned to a teacher (for attendance access control) ──

export async function fetchTeacherAssignedSectionsAction() {
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
}
