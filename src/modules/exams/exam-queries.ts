import { prisma } from '@/lib/prisma';
import type { Prisma, ExamStatus } from '@prisma/client';
import type { PaginationParams } from '@/utils/pagination';
import { getSkipTake, buildPaginatedResult } from '@/utils/pagination';

export type ExamWithRelations = Prisma.ExamGetPayload<{
  include: {
    subject: { select: { id: true; name: true; code: true } };
    createdBy: { select: { id: true; firstName: true; lastName: true } };
    examQuestions: { include: { question: true } };
    examClassAssignments: { include: { class: true; section: true } };
    _count: { select: { examSessions: true } };
  };
}>;

export type ExamListFilters = {
  search?: string;
  subjectId?: string;
  status?: ExamStatus;
  createdById?: string;
};

export async function listExams(params: PaginationParams, filters: ExamListFilters) {
  const where: Prisma.ExamWhereInput = { deletedAt: null };

  if (filters.subjectId) where.subjectId = filters.subjectId;
  if (filters.status) where.status = filters.status;
  if (filters.createdById) where.createdById = filters.createdById;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [data, totalCount] = await Promise.all([
    prisma.exam.findMany({
      where,
      ...getSkipTake(params),
      orderBy: { createdAt: 'desc' },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        examQuestions: { include: { question: true }, orderBy: { sortOrder: 'asc' } },
        examClassAssignments: { include: { class: true, section: true } },
        _count: { select: { examSessions: true } },
      },
    }),
    prisma.exam.count({ where }),
  ]);

  return buildPaginatedResult(data, totalCount, params);
}

export async function getExamById(id: string): Promise<ExamWithRelations | null> {
  return prisma.exam.findUnique({
    where: { id, deletedAt: null },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      examQuestions: { include: { question: { include: { mcqOptions: true } } }, orderBy: { sortOrder: 'asc' } },
      examClassAssignments: { include: { class: true, section: true } },
      _count: { select: { examSessions: true } },
    },
  });
}

export async function getExamDetail(id: string) {
  return prisma.exam.findUnique({
    where: { id, deletedAt: null },
    include: {
      subject: true,
      createdBy: { select: { firstName: true, lastName: true } },
      examQuestions: {
        include: {
          question: {
            select: { id: true, title: true, type: true, difficulty: true, marks: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
      examClassAssignments: {
        include: {
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
      _count: { select: { examSessions: true } },
    },
  });
}

export async function getExamsForStudent(studentId: string, classId: string, sectionId: string) {
  return prisma.exam.findMany({
    where: {
      deletedAt: null,
      status: { in: ['PUBLISHED', 'ACTIVE'] },
      examClassAssignments: {
        some: {
          classId,
          OR: [{ sectionId: null }, { sectionId }],
        },
      },
    },
    orderBy: { scheduledStartAt: 'desc' },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      examSessions: {
        where: { studentId },
        select: { id: true, status: true, attemptNumber: true },
      },
      _count: { select: { examQuestions: true } },
    },
  });
}
