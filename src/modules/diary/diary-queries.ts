// ============================================
// Diary Module — Pure Prisma Query Functions
// ============================================

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// ── Shared includes (as const pattern — mirrors attendance-queries.ts) ──

const diaryEntryInclude = {
  teacherProfile: {
    select: {
      id: true,
      employeeId: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  subject: { select: { id: true, name: true, code: true } },
  class: { select: { id: true, name: true } },
  section: { select: { id: true, name: true } },
  _count: { select: { readReceipts: true } },
} as const;

const diaryEntryStudentInclude = {
  subject: { select: { id: true, name: true, code: true } },
  teacherProfile: {
    select: { user: { select: { firstName: true, lastName: true } } },
  },
} as const;

const diaryEntryDetailInclude = {
  ...diaryEntryInclude,
  principalNotes: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      principal: { select: { id: true, firstName: true, lastName: true } },
    },
  },
} as const;

// ── Base where clause (exclude soft-deleted) ──

function baseWhere(academicSessionId: string): Prisma.DiaryEntryWhereInput {
  return { academicSessionId, deletedAt: null };
}

// ── Teacher Queries ──

export async function getDiaryEntriesByTeacher(
  teacherProfileId: string,
  academicSessionId: string,
  filters?: {
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    startDate?: string;
    endDate?: string;
    status?: 'DRAFT' | 'PUBLISHED';
  },
) {
  const where: Prisma.DiaryEntryWhereInput = {
    ...baseWhere(academicSessionId),
    teacherProfileId,
  };
  if (filters?.classId) where.classId = filters.classId;
  if (filters?.sectionId) where.sectionId = filters.sectionId;
  if (filters?.subjectId) where.subjectId = filters.subjectId;
  if (filters?.status) where.status = filters.status;
  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }

  return prisma.diaryEntry.findMany({
    where,
    include: diaryEntryInclude,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getDiaryEntryById(id: string) {
  return prisma.diaryEntry.findUnique({
    where: { id },
    include: diaryEntryDetailInclude,
  });
}

export async function getTeacherDiaryDates(
  teacherProfileId: string,
  academicSessionId: string,
  year: number,
  month: number,
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return prisma.diaryEntry.groupBy({
    by: ['date'],
    where: {
      ...baseWhere(academicSessionId),
      teacherProfileId,
      date: { gte: startDate, lte: endDate },
    },
    _count: { id: true },
  });
}

export async function hasDiaryEntry(
  teacherProfileId: string,
  classId: string,
  sectionId: string,
  subjectId: string,
  date: string,
  academicSessionId: string,
) {
  const entry = await prisma.diaryEntry.findFirst({
    where: {
      teacherProfileId,
      classId,
      sectionId,
      subjectId,
      date: new Date(date),
      academicSessionId,
      deletedAt: null,
    },
    select: { id: true, status: true },
  });
  return entry;
}

// ── Student Queries ──

export async function getDiaryEntriesByClassSection(
  classId: string,
  sectionId: string,
  academicSessionId: string,
  startDate: string,
  endDate: string,
  subjectId?: string,
) {
  const where: Prisma.DiaryEntryWhereInput = {
    ...baseWhere(academicSessionId),
    classId,
    sectionId,
    status: 'PUBLISHED',
    date: { gte: new Date(startDate), lte: new Date(endDate) },
  };
  if (subjectId) where.subjectId = subjectId;

  return prisma.diaryEntry.findMany({
    where,
    include: diaryEntryStudentInclude,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getDiaryEntriesToday(
  classId: string,
  sectionId: string,
  academicSessionId: string,
  today: string,
) {
  return prisma.diaryEntry.findMany({
    where: {
      ...baseWhere(academicSessionId),
      classId,
      sectionId,
      status: 'PUBLISHED',
      date: new Date(today),
    },
    include: diaryEntryStudentInclude,
    orderBy: { createdAt: 'desc' },
  });
}

// ── Principal Queries ──

export async function getAllDiaryEntries(
  academicSessionId: string,
  filters?: {
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    teacherProfileId?: string;
    startDate?: string;
    endDate?: string;
    status?: 'DRAFT' | 'PUBLISHED';
  },
) {
  const where: Prisma.DiaryEntryWhereInput = baseWhere(academicSessionId);
  if (filters?.classId) where.classId = filters.classId;
  if (filters?.sectionId) where.sectionId = filters.sectionId;
  if (filters?.subjectId) where.subjectId = filters.subjectId;
  if (filters?.teacherProfileId) where.teacherProfileId = filters.teacherProfileId;
  if (filters?.status) where.status = filters.status;
  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }

  return prisma.diaryEntry.findMany({
    where,
    include: diaryEntryInclude,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getDiaryCountsByTeacher(
  academicSessionId: string,
  startDate: string,
  endDate: string,
) {
  return prisma.diaryEntry.groupBy({
    by: ['teacherProfileId', 'date'],
    where: {
      ...baseWhere(academicSessionId),
      status: 'PUBLISHED',
      date: { gte: new Date(startDate), lte: new Date(endDate) },
    },
    _count: { id: true },
  });
}

export async function getExpectedDiaryTeachers(academicSessionId: string) {
  return prisma.teacherSubject.findMany({
    where: {
      teacher: { user: { isActive: true } },
    },
    select: {
      teacherId: true,
      subjectId: true,
      classId: true,
      teacher: {
        select: {
          id: true,
          employeeId: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      subject: { select: { name: true } },
      class: { select: { name: true } },
    },
  });
}

export async function getReadReceiptCount(diaryEntryId: string) {
  return prisma.diaryReadReceipt.count({
    where: { diaryEntryId },
  });
}

// ── Teacher Subject-Class resolution ──

export async function getTeacherSubjectClasses(teacherProfileId: string) {
  const assignments = await prisma.teacherSubject.findMany({
    where: { teacherId: teacherProfileId },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      class: {
        select: {
          id: true,
          name: true,
          sections: {
            where: { isActive: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          },
        },
      },
    },
  });

  return assignments
    .filter((a) => a.class !== null)
    .map((a) => ({
      subjectId: a.subject.id,
      subjectName: a.subject.name,
      subjectCode: a.subject.code,
      classId: a.class!.id,
      className: a.class!.name,
      sections: a.class!.sections,
    }));
}
