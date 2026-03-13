import { prisma } from '@/lib/prisma';
import type { ResultTermWithGroups } from '../types/report-types';

// ============================================
// List Result Terms
// ============================================

export type ResultTermListFilters = {
  academicSessionId?: string;
  classId?: string;
  isPublished?: boolean;
  isActive?: boolean;
};

export type ResultTermSummary = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isPublished: boolean;
  isComputing: boolean;
  publishedAt: Date | null;
  computedAt: Date | null;
  createdAt: Date;
  academicSession: { id: string; name: string };
  class: { id: string; name: string; grade: number };
  _count: { examGroups: number; consolidatedResults: number };
};

export async function listResultTerms(
  filters: ResultTermListFilters,
): Promise<ResultTermSummary[]> {
  return prisma.resultTerm.findMany({
    where: {
      ...(filters.academicSessionId && { academicSessionId: filters.academicSessionId }),
      ...(filters.classId && { classId: filters.classId }),
      ...(filters.isPublished !== undefined && { isPublished: filters.isPublished }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      academicSession: { select: { id: true, name: true } },
      class: { select: { id: true, name: true, grade: true } },
      _count: { select: { examGroups: true, consolidatedResults: true } },
    },
  });
}

// ============================================
// Get Result Term with Full Config
// ============================================

export async function getResultTermWithGroups(
  id: string,
): Promise<ResultTermWithGroups | null> {
  const term = await prisma.resultTerm.findUnique({
    where: { id },
    include: {
      academicSession: { select: { id: true, name: true } },
      class: { select: { id: true, name: true, grade: true } },
      examGroups: {
        orderBy: { sortOrder: 'asc' },
        include: {
          examLinks: {
            include: {
              exam: {
                select: {
                  id: true,
                  title: true,
                  subjectId: true,
                  type: true,
                  status: true,
                  totalMarks: true,
                  subject: { select: { name: true, code: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!term) return null;

  return {
    id: term.id,
    name: term.name,
    description: term.description,
    isActive: term.isActive,
    isPublished: term.isPublished,
    isComputing: term.isComputing,
    publishedAt: term.publishedAt?.toISOString() ?? null,
    computedAt: term.computedAt?.toISOString() ?? null,
    academicSession: term.academicSession,
    class: term.class,
    examGroups: term.examGroups.map((g) => ({
      id: g.id,
      name: g.name,
      weight: Number(g.weight),
      aggregateMode: g.aggregateMode,
      bestOfCount: g.bestOfCount,
      sortOrder: g.sortOrder,
      examLinks: g.examLinks.map((l) => ({
        id: l.id,
        exam: {
          id: l.exam.id,
          title: l.exam.title,
          subjectId: l.exam.subjectId,
          subjectName: l.exam.subject.name,
          subjectCode: l.exam.subject.code,
          type: l.exam.type,
          status: l.exam.status,
          totalMarks: Number(l.exam.totalMarks),
        },
      })),
    })),
  };
}

// ============================================
// Validate total weight = 100
// ============================================

export async function validateResultTermWeights(
  resultTermId: string,
): Promise<{ isValid: boolean; totalWeight: number }> {
  const groups = await prisma.resultExamGroup.findMany({
    where: { resultTermId },
    select: { weight: true },
  });
  const totalWeight = groups.reduce((sum, g) => sum + Number(g.weight), 0);
  return { isValid: Math.abs(totalWeight - 100) < 0.01, totalWeight };
}

// ============================================
// Get available exams for a result term class/session
// ============================================

export async function getAvailableExamsForTerm(resultTermId: string) {
  const term = await prisma.resultTerm.findUnique({
    where: { id: resultTermId },
    select: { classId: true, academicSessionId: true },
  });
  if (!term) return [];

  const exams = await prisma.exam.findMany({
    where: {
      deletedAt: null,
      academicSessionId: term.academicSessionId,
      examClassAssignments: { some: { classId: term.classId } },
      status: { in: ['COMPLETED', 'ACTIVE', 'PUBLISHED'] },
    },
    orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      totalMarks: true,
      subjectId: true,
      subject: { select: { name: true, code: true } },
    },
  });

  return exams.map((e) => ({ ...e, totalMarks: Number(e.totalMarks) }));
}
