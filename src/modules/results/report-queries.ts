import { prisma } from '@/lib/prisma';

/* ─── System Overview ─── */

export async function getSystemOverview() {
  const [
    totalStudents,
    totalTeachers,
    totalExams,
    totalResults,
    totalDepartments,
    totalSubjects,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
    prisma.user.count({ where: { role: 'TEACHER', isActive: true } }),
    prisma.exam.count({ where: { deletedAt: null } }),
    prisma.examResult.count(),
    prisma.department.count(),
    prisma.subject.count(),
  ]);

  const aggregates = await prisma.examResult.aggregate({
    _avg: { percentage: true },
    _count: { _all: true },
  });

  const passedCount = await prisma.examResult.count({
    where: { isPassed: true },
  });

  const overallPassRate =
    totalResults > 0 ? (passedCount / totalResults) * 100 : 0;
  const overallAvgPercentage = Number(aggregates._avg.percentage ?? 0);

  return {
    totalStudents,
    totalTeachers,
    totalExams,
    totalResults,
    totalDepartments,
    totalSubjects,
    overallPassRate,
    overallAvgPercentage,
  };
}

/* ─── Department Performance ─── */

export type DepartmentPerformance = {
  departmentId: string;
  departmentName: string;
  examCount: number;
  avgPercentage: number;
  passRate: number;
};

export async function getDepartmentPerformance(): Promise<
  DepartmentPerformance[]
> {
  // Use SQL aggregate instead of loading all examResults into memory
  const rows = await prisma.$queryRaw<
    { departmentId: string; departmentName: string; examCount: bigint; avgPercentage: number | null; passRate: number | null }[]
  >`
    SELECT
      d.id AS "departmentId",
      d.name AS "departmentName",
      COUNT(DISTINCT e.id)::bigint AS "examCount",
      AVG(er.percentage)::float AS "avgPercentage",
      CASE WHEN COUNT(er.id) > 0
        THEN (SUM(CASE WHEN er."isPassed" THEN 1 ELSE 0 END)::float / COUNT(er.id)::float) * 100
        ELSE 0
      END AS "passRate"
    FROM "Department" d
    LEFT JOIN "Subject" s ON s."departmentId" = d.id
    LEFT JOIN "Exam" e ON e."subjectId" = s.id AND e."deletedAt" IS NULL
    LEFT JOIN "ExamResult" er ON er."examId" = e.id
    GROUP BY d.id, d.name
    ORDER BY d.name
  `;

  return rows.map((r) => ({
    departmentId: r.departmentId,
    departmentName: r.departmentName,
    examCount: Number(r.examCount),
    avgPercentage: Math.round((r.avgPercentage ?? 0) * 100) / 100,
    passRate: Math.round((r.passRate ?? 0) * 100) / 100,
  }));
}

/* ─── Subject Performance ─── */

export type SubjectPerformance = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  resultCount: number;
  avgPercentage: number;
  passRate: number;
};

export async function getSubjectPerformance(): Promise<SubjectPerformance[]> {
  // Use SQL aggregate instead of loading all examResults into memory
  const rows = await prisma.$queryRaw<
    { subjectId: string; subjectName: string; subjectCode: string; resultCount: bigint; avgPercentage: number | null; passRate: number | null }[]
  >`
    SELECT
      s.id AS "subjectId",
      s.name AS "subjectName",
      s.code AS "subjectCode",
      COUNT(er.id)::bigint AS "resultCount",
      AVG(er.percentage)::float AS "avgPercentage",
      CASE WHEN COUNT(er.id) > 0
        THEN (SUM(CASE WHEN er."isPassed" THEN 1 ELSE 0 END)::float / COUNT(er.id)::float) * 100
        ELSE 0
      END AS "passRate"
    FROM "Subject" s
    LEFT JOIN "Exam" e ON e."subjectId" = s.id AND e."deletedAt" IS NULL
    LEFT JOIN "ExamResult" er ON er."examId" = e.id
    GROUP BY s.id, s.name, s.code
    HAVING COUNT(er.id) > 0
    ORDER BY AVG(er.percentage)::float DESC NULLS LAST
  `;

  return rows.map((r) => ({
    subjectId: r.subjectId,
    subjectName: r.subjectName,
    subjectCode: r.subjectCode,
    resultCount: Number(r.resultCount),
    avgPercentage: Math.round((r.avgPercentage ?? 0) * 100) / 100,
    passRate: Math.round((r.passRate ?? 0) * 100) / 100,
  }));
}

/* ─── Recent Exam Results (top 10 exams) ─── */

export type RecentExamSummary = {
  examId: string;
  examTitle: string;
  subjectCode: string;
  totalStudents: number;
  passRate: number;
  avgPercentage: number;
  scheduledAt: Date | null;
};

export async function getRecentExamSummaries(): Promise<RecentExamSummary[]> {
  const exams = await prisma.exam.findMany({
    where: {
      status: { in: ['PUBLISHED', 'ACTIVE', 'COMPLETED'] },
      deletedAt: null,
    },
    orderBy: { scheduledStartAt: 'desc' },
    take: 10,
    include: {
      subject: { select: { code: true } },
      examResults: { select: { percentage: true, isPassed: true } },
    },
  });

  return exams.map((e) => {
    const total = e.examResults.length;
    const passed = e.examResults.filter((r) => r.isPassed).length;
    const avg =
      total > 0
        ? e.examResults.reduce((s, r) => s + Number(r.percentage), 0) / total
        : 0;

    return {
      examId: e.id,
      examTitle: e.title,
      subjectCode: e.subject.code,
      totalStudents: total,
      passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
      avgPercentage: Math.round(avg * 100) / 100,
      scheduledAt: e.scheduledStartAt,
    };
  });
}

/* ─── Grade Distribution (system-wide) ─── */

export type GradeDistribution = { grade: string; count: number };

export async function getGradeDistribution(): Promise<GradeDistribution[]> {
  const results = await prisma.examResult.groupBy({
    by: ['grade'],
    _count: { _all: true },
    where: { grade: { not: null } },
    orderBy: { grade: 'asc' },
  });

  return results.map((r) => ({
    grade: r.grade ?? 'Unknown',
    count: r._count._all,
  }));
}
