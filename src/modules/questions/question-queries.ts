import { prisma } from '@/lib/prisma';
import type { Prisma, QuestionType, Difficulty } from '@prisma/client';
import type { PaginationParams } from '@/utils/pagination';
import { getSkipTake, buildPaginatedResult } from '@/utils/pagination';

// ============================================
// Types
// ============================================

export type QuestionWithRelations = Prisma.QuestionGetPayload<{
  include: {
    subject: { select: { id: true; name: true; code: true } };
    createdBy: { select: { id: true; firstName: true; lastName: true } };
    mcqOptions: true;
    questionTags: { include: { tag: true } };
    _count: { select: { examQuestions: true } };
  };
}>;

export type QuestionListFilters = {
  search?: string;
  subjectId?: string;
  type?: QuestionType;
  difficulty?: Difficulty;
  createdById?: string;
};

// ============================================
// List Questions
// ============================================

export async function listQuestions(params: PaginationParams, filters: QuestionListFilters) {
  const where: Prisma.QuestionWhereInput = { deletedAt: null, isActive: true };

  if (filters.subjectId) where.subjectId = filters.subjectId;
  if (filters.type) where.type = filters.type;
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.createdById) where.createdById = filters.createdById;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [data, totalCount] = await Promise.all([
    prisma.question.findMany({
      where,
      ...getSkipTake(params),
      orderBy: { createdAt: 'desc' },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        mcqOptions: { orderBy: { sortOrder: 'asc' } },
        questionTags: { include: { tag: true } },
        _count: { select: { examQuestions: true } },
      },
    }),
    prisma.question.count({ where }),
  ]);

  return buildPaginatedResult(data, totalCount, params);
}

// ============================================
// Get Single Question
// ============================================

export async function getQuestionById(id: string): Promise<QuestionWithRelations | null> {
  return prisma.question.findUnique({
    where: { id, deletedAt: null },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      mcqOptions: { orderBy: { sortOrder: 'asc' } },
      questionTags: { include: { tag: true } },
      _count: { select: { examQuestions: true } },
    },
  });
}

// ============================================
// Light list for exam question picker
// ============================================

export async function getQuestionsForPicker(subjectId?: string) {
  return prisma.question.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      ...(subjectId ? { subjectId } : {}),
    },
    select: {
      id: true,
      title: true,
      type: true,
      difficulty: true,
      marks: true,
    },
    orderBy: { title: 'asc' },
  });
}
