import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type ExamListItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  subjectName: string;
  subjectCode: string;
  createdBy: string;
  totalMarks: number;
  duration: number;
  scheduledStartAt: Date | null;
  totalQuestions: number;
  totalStudents: number;
  avgPercentage: number;
  passRate: number;
  createdAt: Date;
};

export async function getExamsList(params?: {
  search?: string;
  status?: string;
  subjectId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ exams: ExamListItem[]; total: number }> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ExamWhereInput = {
    deletedAt: null,
    ...(params?.search
      ? { title: { contains: params.search, mode: 'insensitive' } }
      : {}),
    ...(params?.status ? { status: params.status as Prisma.ExamWhereInput['status'] } : {}),
    ...(params?.subjectId ? { subjectId: params.subjectId } : {}),
    ...(params?.type ? { type: params.type as Prisma.ExamWhereInput['type'] } : {}),
  };

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip,
      take: pageSize,
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
        createdBy: { select: { firstName: true, lastName: true } },
        _count: { select: { examQuestions: true } },
      },
    }),
    prisma.exam.count({ where }),
  ]);

  const examIds = exams.map((e) => e.id);
  const examStats =
    examIds.length > 0
      ? await prisma.$queryRaw<
          { exam_id: string; total: bigint; passed: bigint; avg_pct: number | null }[]
        >`
          SELECT "examId" as exam_id, COUNT(*)::bigint as total,
            COUNT(*) FILTER (WHERE "isPassed" = true)::bigint as passed,
            AVG(percentage)::float as avg_pct
          FROM "ExamResult" WHERE "examId" = ANY(${examIds})
          GROUP BY "examId"
        `
      : [];
  const statsMap = new Map(
    examStats.map((r) => [r.exam_id, { total: Number(r.total), passed: Number(r.passed), avg: r.avg_pct }]),
  );

  const examList: ExamListItem[] = exams.map((e) => {
    const s = statsMap.get(e.id);
    const totalStudents = s?.total ?? 0;

    return {
      id: e.id,
      title: e.title,
      type: e.type,
      status: e.status,
      subjectName: e.subject.name,
      subjectCode: e.subject.code,
      createdBy: `${e.createdBy.firstName} ${e.createdBy.lastName}`,
      totalMarks: Number(e.totalMarks),
      duration: e.duration,
      scheduledStartAt: e.scheduledStartAt,
      totalQuestions: e._count.examQuestions,
      totalStudents,
      avgPercentage: Math.round(Number(s?.avg ?? 0) * 100) / 100,
      passRate: totalStudents > 0 ? Math.round(((s?.passed ?? 0) / totalStudents) * 10000) / 100 : 0,
      createdAt: e.createdAt,
    };
  });

  return { exams: examList, total };
}

export async function getExamDetail(examId: string) {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, deletedAt: null },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      status: true,
      totalMarks: true,
      passingMarks: true,
      duration: true,
      instructions: true,
      shuffleQuestions: true,
      allowReview: true,
      maxAttempts: true,
      scheduledStartAt: true,
      scheduledEndAt: true,
      createdAt: true,
      updatedAt: true,
      subject: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { examQuestions: true, examResults: true } },
      examClassAssignments: {
        select: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!exam) return null;

  return {
    ...exam,
    totalMarks: Number(exam.totalMarks),
    passingMarks: Number(exam.passingMarks),
  };
}
