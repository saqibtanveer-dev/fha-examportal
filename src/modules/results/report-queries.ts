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
    prisma.exam.count(),
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
  const departments = await prisma.department.findMany({
    include: {
      subjects: {
        include: {
          exams: {
            include: {
              examResults: { select: { percentage: true, isPassed: true } },
            },
          },
        },
      },
    },
  });

  return departments.map((dept) => {
    const allResults = dept.subjects.flatMap((s: any) =>
      s.exams.flatMap((e: any) => e.examResults),
    );
    const total = allResults.length;
    const passed = allResults.filter((r: any) => r.isPassed).length;
    const avgPercentage =
      total > 0
        ? allResults.reduce((sum: number, r: any) => sum + Number(r.percentage), 0) / total
        : 0;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      examCount: dept.subjects.reduce((s: number, sub: any) => s + sub.exams.length, 0),
      avgPercentage: Math.round(avgPercentage * 100) / 100,
      passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
    };
  });
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
  const subjects = await prisma.subject.findMany({
    include: {
      exams: {
        include: {
          examResults: { select: { percentage: true, isPassed: true } },
        },
      },
    },
  });

  return subjects
    .map((sub) => {
      const allResults = sub.exams.flatMap((e: any) => e.examResults);
      const total = allResults.length;
      const passed = allResults.filter((r: any) => r.isPassed).length;
      const avgPercentage =
        total > 0
          ? allResults.reduce((s: number, r: any) => s + Number(r.percentage), 0) / total
          : 0;

      return {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        resultCount: total,
        avgPercentage: Math.round(avgPercentage * 100) / 100,
        passRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
      };
    })
    .filter((s) => s.resultCount > 0)
    .sort((a, b) => b.avgPercentage - a.avgPercentage);
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
    where: { status: 'PUBLISHED' },
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
