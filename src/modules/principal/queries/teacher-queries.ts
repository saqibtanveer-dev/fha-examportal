import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type TeacherListItem = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  employeeId: string;
  qualification: string | null;
  specialization: string | null;
  joiningDate: Date;
  isActive: boolean;
  lastLoginAt: Date | null;
  subjectCount: number;
  examCount: number;
  questionCount: number;
};

export async function getTeachersList(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ teachers: TeacherListItem[]; total: number }> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.UserWhereInput = {
    role: 'TEACHER',
    deletedAt: null,
    ...(params?.search
      ? {
          OR: [
            { firstName: { contains: params.search, mode: 'insensitive' } },
            { lastName: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
            { teacherProfile: { employeeId: { contains: params.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { firstName: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        teacherProfile: {
          select: {
            id: true,
            employeeId: true,
            qualification: true,
            specialization: true,
            joiningDate: true,
            teacherSubjects: { select: { subjectId: true } },
          },
        },
        _count: { select: { examsCreated: true, questions: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const teachers: TeacherListItem[] = users
    .filter((u) => u.teacherProfile)
    .map((u) => ({
      id: u.teacherProfile!.id,
      userId: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      employeeId: u.teacherProfile!.employeeId,
      qualification: u.teacherProfile!.qualification,
      specialization: u.teacherProfile!.specialization,
      joiningDate: u.teacherProfile!.joiningDate,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
      subjectCount: u.teacherProfile?.teacherSubjects.length ?? 0,
      examCount: u._count.examsCreated,
      questionCount: u._count.questions,
    }));

  return { teachers, total };
}

export async function getTeacherDetail(teacherUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: teacherUserId, role: 'TEACHER' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      teacherProfile: {
        select: {
          id: true,
          employeeId: true,
          qualification: true,
          specialization: true,
          joiningDate: true,
          teacherSubjects: {
            select: {
              subject: { select: { id: true, name: true, code: true } },
              class: { select: { id: true, name: true, grade: true } },
            },
          },
        },
      },
    },
  });

  if (!user || !user.teacherProfile) return null;

  const [exams, questionStats, gradingStats, examResults] = await Promise.all([
    prisma.exam.findMany({
      where: { createdById: teacherUserId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        totalMarks: true,
        duration: true,
        scheduledStartAt: true,
        createdAt: true,
        subject: { select: { name: true, code: true } },
        _count: {
          select: { examQuestions: true, examSessions: true, examResults: true },
        },
      },
    }),
    prisma.question.groupBy({
      by: ['type'],
      where: { createdById: teacherUserId, deletedAt: null },
      _count: { _all: true },
    }),
    prisma.examSession.groupBy({
      by: ['status'],
      where: {
        exam: { createdById: teacherUserId },
        status: { in: ['SUBMITTED', 'GRADING', 'GRADED'] },
      },
      _count: { _all: true },
    }),
    prisma.$queryRaw<[{ total: bigint; passed: bigint; avg_pct: number | null }]>`
      SELECT
        COUNT(*)::bigint as total,
        COUNT(*) FILTER (WHERE er."isPassed" = true)::bigint as passed,
        AVG(er.percentage)::float as avg_pct
      FROM "ExamResult" er
      JOIN "Exam" e ON er."examId" = e.id
      WHERE e."createdById" = ${teacherUserId} AND e."deletedAt" IS NULL
    `,
  ]);

  const pendingGrading = gradingStats
    .filter((s) => s.status === 'SUBMITTED' || s.status === 'GRADING')
    .reduce((sum, s) => sum + s._count._all, 0);
  const gradedCount = gradingStats
    .filter((s) => s.status === 'GRADED')
    .reduce((sum, s) => sum + s._count._all, 0);

  const rs = examResults[0]!;
  const totalResults = Number(rs.total);
  const passedResults = Number(rs.passed);

  return {
    ...user,
    teacherProfile: user.teacherProfile,
    exams,
    questionStats: questionStats.map((qs) => ({
      type: qs.type,
      count: qs._count._all,
    })),
    gradingStats: { pendingGrading, gradedCount },
    performanceSummary: {
      totalResults,
      passedResults,
      failedResults: totalResults - passedResults,
      passRate: totalResults > 0 ? Math.round((passedResults / totalResults) * 10000) / 100 : 0,
      avgPercentage: Math.round(Number(rs.avg_pct ?? 0) * 100) / 100,
    },
  };
}
