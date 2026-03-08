import { prisma } from '@/lib/prisma';
import type { Prisma, ExamStatus } from '@prisma/client';
import type { PaginationParams } from '@/utils/pagination';
import { getSkipTake, buildPaginatedResult } from '@/utils/pagination';
import {
  getStudentEnrolledSubjectIds,
  hasEnrollmentsForClass,
} from '@/modules/subjects/enrollment-queries';

export type ExamWithRelations = Prisma.ExamGetPayload<{
  include: {
    subject: { select: { id: true; name: true; code: true } };
    createdBy: { select: { id: true; firstName: true; lastName: true } };
    academicSession: { select: { id: true; name: true } };
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
  academicSessionId?: string;
};

export async function listExams(params: PaginationParams, filters: ExamListFilters) {
  const where: Prisma.ExamWhereInput = { deletedAt: null };

  if (filters.subjectId) where.subjectId = filters.subjectId;
  if (filters.status) where.status = filters.status;
  if (filters.createdById) where.createdById = filters.createdById;
  if (filters.academicSessionId) where.academicSessionId = filters.academicSessionId;
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
        academicSession: { select: { id: true, name: true } },
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
      academicSession: { select: { id: true, name: true } },
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

export async function getExamsForStudent(
  studentId: string,
  classId: string,
  sectionId?: string,
  studentProfileId?: string,
  academicSessionId?: string,
) {
  // Build subject filter: if enrollments exist, only show exams for enrolled subjects
  let enrolledSubjectIds: Set<string> | null = null;
  if (studentProfileId && academicSessionId) {
    const hasEnrollments = await hasEnrollmentsForClass(classId, academicSessionId);
    if (hasEnrollments) {
      enrolledSubjectIds = await getStudentEnrolledSubjectIds(studentProfileId, academicSessionId);
    }
  }

  return prisma.exam.findMany({
    where: {
      deletedAt: null,
      OR: [
        // Online exams: PUBLISHED or ACTIVE
        {
          deliveryMode: 'ONLINE',
          status: { in: ['PUBLISHED', 'ACTIVE'] },
        },
        // Written exams: ACTIVE or COMPLETED (finalized)
        {
          deliveryMode: 'WRITTEN',
          status: { in: ['ACTIVE', 'COMPLETED'] },
        },
      ],
      // Only show exams for subjects the student is enrolled in (if enrollments configured)
      ...(enrolledSubjectIds ? { subjectId: { in: Array.from(enrolledSubjectIds) } } : {}),
      examClassAssignments: {
        some: {
          classId,
          OR: [
            { sectionId: null },
            ...(sectionId ? [{ sectionId }] : []),
          ],
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      examSessions: {
        where: { studentId },
        select: { id: true, status: true, attemptNumber: true },
      },
      examResults: {
        where: { studentId },
        select: { id: true, obtainedMarks: true, totalMarks: true, percentage: true, grade: true, isPassed: true },
        take: 1,
      },
      _count: { select: { examQuestions: true } },
    },
  });
}
