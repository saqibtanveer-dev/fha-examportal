import { prisma } from '@/lib/prisma';

export type ClassOverview = {
  id: string;
  name: string;
  grade: number;
  isActive: boolean;
  totalStudents: number;
  totalSections: number;
  sectionNames: string[];
  totalExams: number;
  avgPercentage: number;
  passRate: number;
};

export async function getClassesList(): Promise<ClassOverview[]> {
  const classes = await prisma.class.findMany({
    where: { isActive: true },
    orderBy: { grade: 'asc' },
    select: {
      id: true,
      name: true,
      grade: true,
      isActive: true,
      sections: { select: { name: true } },
      _count: { select: { students: true } },
    },
  });

  const classIds = classes.map((c) => c.id);
  const [examCounts, resultStats] = await Promise.all([
    classIds.length > 0
      ? prisma.$queryRaw<{ class_id: string; exam_count: bigint }[]>`
          SELECT "classId" as class_id, COUNT(DISTINCT "examId")::bigint as exam_count
          FROM "ExamClassAssignment" WHERE "classId" = ANY(${classIds})
          GROUP BY "classId"
        `
      : [],
    classIds.length > 0
      ? prisma.$queryRaw<{ class_id: string; total: bigint; passed: bigint; avg_pct: number | null }[]>`
          SELECT eca."classId" as class_id,
            COUNT(*)::bigint as total,
            COUNT(*) FILTER (WHERE er."isPassed" = true)::bigint as passed,
            AVG(er.percentage)::float as avg_pct
          FROM "ExamResult" er
          JOIN "ExamClassAssignment" eca ON eca."examId" = er."examId"
          WHERE eca."classId" = ANY(${classIds})
          GROUP BY eca."classId"
        `
      : [],
  ]);

  const examCountMap = new Map(examCounts.map((r) => [r.class_id, Number(r.exam_count)]));
  const statsMap = new Map(
    resultStats.map((r) => [r.class_id, { total: Number(r.total), passed: Number(r.passed), avg: r.avg_pct }]),
  );

  return classes.map((cls) => {
    const s = statsMap.get(cls.id);
    const total = s?.total ?? 0;

    return {
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      isActive: cls.isActive,
      totalStudents: cls._count.students,
      totalSections: cls.sections.length,
      sectionNames: cls.sections.map((s) => s.name),
      totalExams: examCountMap.get(cls.id) ?? 0,
      avgPercentage: Math.round(Number(s?.avg ?? 0) * 100) / 100,
      passRate: total > 0 ? Math.round(((s?.passed ?? 0) / total) * 10000) / 100 : 0,
    };
  });
}

export async function getClassDetail(classId: string) {
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      grade: true,
      isActive: true,
      sections: {
        select: {
          id: true,
          name: true,
          students: {
            select: {
              userId: true,
              rollNumber: true,
              status: true,
              user: { select: { firstName: true, lastName: true, email: true, isActive: true } },
            },
          },
        },
      },
      subjectClassLinks: {
        select: {
          subject: { select: { id: true, name: true, code: true } },
        },
      },
      teacherSubjects: {
        select: {
          teacher: {
            select: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          subject: { select: { name: true, code: true } },
        },
      },
    },
  });

  if (!cls) return null;

  const studentUserIds = cls.sections.flatMap((s) => s.students.map((st) => st.userId));

  const [results, assignedExams] = await Promise.all([
    prisma.examResult.findMany({
      where: { studentId: { in: studentUserIds } },
      select: {
        studentId: true,
        percentage: true,
        isPassed: true,
        exam: { select: { id: true, title: true, type: true, subject: { select: { name: true } } } },
      },
    }),
    prisma.examClassAssignment.findMany({
      where: { classId },
      select: {
        exam: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            totalMarks: true,
            scheduledStartAt: true,
            subject: { select: { name: true, code: true } },
            createdBy: { select: { firstName: true, lastName: true } },
            _count: { select: { examResults: true } },
          },
        },
      },
    }),
  ]);

  const assignedExamIds = assignedExams.map((ae) => ae.exam.id);
  const examResultStats =
    assignedExamIds.length > 0
      ? await prisma.$queryRaw<
          { exam_id: string; total: bigint; passed: bigint; avg_pct: number | null }[]
        >`
          SELECT "examId" as exam_id, COUNT(*)::bigint as total,
            COUNT(*) FILTER (WHERE "isPassed" = true)::bigint as passed,
            AVG(percentage)::float as avg_pct
          FROM "ExamResult" WHERE "examId" = ANY(${assignedExamIds})
          GROUP BY "examId"
        `
      : [];
  const examStatsMap = new Map(
    examResultStats.map((r) => [r.exam_id, { total: Number(r.total), passed: Number(r.passed), avg: r.avg_pct }]),
  );

  const allPercentages = results.map((r) => Number(r.percentage));
  const totalResultsCount = allPercentages.length;
  const passedCount = results.filter((r) => r.isPassed).length;
  const avgPercentage =
    totalResultsCount > 0
      ? allPercentages.reduce((a, b) => a + b, 0) / totalResultsCount
      : 0;

  const bySubject: Record<string, { sum: number; total: number; passed: number }> = {};
  for (const r of results) {
    const sub = r.exam.subject.name;
    if (!bySubject[sub]) bySubject[sub] = { sum: 0, total: 0, passed: 0 };
    bySubject[sub]!.sum += Number(r.percentage);
    bySubject[sub]!.total += 1;
    if (r.isPassed) bySubject[sub]!.passed += 1;
  }

  const subjectPerformance = Object.entries(bySubject).map(([subject, data]) => ({
    subject,
    avgPercentage: Math.round((data.sum / data.total) * 100) / 100,
    passRate: Math.round((data.passed / data.total) * 10000) / 100,
    totalResults: data.total,
  }));

  const byStudent: Record<string, { sum: number; total: number; passed: number }> = {};
  for (const r of results) {
    if (!byStudent[r.studentId]) byStudent[r.studentId] = { sum: 0, total: 0, passed: 0 };
    byStudent[r.studentId]!.sum += Number(r.percentage);
    byStudent[r.studentId]!.total += 1;
    if (r.isPassed) byStudent[r.studentId]!.passed += 1;
  }

  const studentsWithPerformance = cls.sections.flatMap((s) =>
    s.students.map((st) => {
      const perf = byStudent[st.userId];
      return {
        userId: st.userId,
        firstName: st.user.firstName,
        lastName: st.user.lastName,
        email: st.user.email,
        rollNumber: st.rollNumber,
        section: s.name,
        status: st.status,
        isActive: st.user.isActive,
        examsTaken: perf?.total ?? 0,
        avgPercentage: perf ? Math.round((perf.sum / perf.total) * 100) / 100 : 0,
        passRate: perf ? Math.round((perf.passed / perf.total) * 10000) / 100 : 0,
      };
    }),
  );

  return {
    ...cls,
    assignedExams: assignedExams.map((ae) => {
      const es = examStatsMap.get(ae.exam.id);
      const totalResults = es?.total ?? 0;
      return {
        ...ae.exam,
        totalMarks: Number(ae.exam.totalMarks),
        resultsCount: totalResults,
        avgPercentage: Math.round(Number(es?.avg ?? 0) * 100) / 100,
        passRate: totalResults > 0 ? Math.round(((es?.passed ?? 0) / totalResults) * 10000) / 100 : 0,
      };
    }),
    classStats: {
      totalStudents: studentUserIds.length,
      totalResults: totalResultsCount,
      passedCount,
      failedCount: totalResultsCount - passedCount,
      avgPercentage: Math.round(avgPercentage * 100) / 100,
      passRate:
        totalResultsCount > 0
          ? Math.round((passedCount / totalResultsCount) * 10000) / 100
          : 0,
    },
    subjectPerformance,
    studentsWithPerformance,
  };
}
