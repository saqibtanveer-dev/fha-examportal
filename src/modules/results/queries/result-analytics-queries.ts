import { prisma } from '@/lib/prisma';

export async function getExamAnalytics(examId: string) {
  const results = await prisma.examResult.findMany({
    where: { examId },
    select: { obtainedMarks: true, totalMarks: true, percentage: true, isPassed: true },
  });

  if (results.length === 0) return null;

  const percentages = results.map((r) => Number(r.percentage));
  const total = results.length;
  const passed = results.filter((r) => r.isPassed).length;
  const avgPercentage = percentages.reduce((a, b) => a + b, 0) / total;
  const maxPercentage = Math.max(...percentages);
  const minPercentage = Math.min(...percentages);

  const distribution = {
    '0-20': percentages.filter((p) => p <= 20).length,
    '21-40': percentages.filter((p) => p > 20 && p <= 40).length,
    '41-60': percentages.filter((p) => p > 40 && p <= 60).length,
    '61-80': percentages.filter((p) => p > 60 && p <= 80).length,
    '81-100': percentages.filter((p) => p > 80).length,
  };

  return { total, passed, failed: total - passed, avgPercentage, maxPercentage, minPercentage, distribution };
}

export async function getStudentAnalytics(studentId: string) {
  const allResults = await prisma.examResult.findMany({
    where: { studentId },
    include: { exam: { include: { subject: { select: { name: true } } } } },
    orderBy: { createdAt: 'asc' },
  });

  const now = new Date();
  const results = allResults.filter((r) => {
    const policy = r.exam.showResultAfter;
    if (policy === 'IMMEDIATELY') return true;
    if (policy === 'AFTER_DEADLINE') {
      const deadline = r.exam.scheduledEndAt;
      return deadline ? now >= deadline : true;
    }
    if (policy === 'MANUAL') return !!r.publishedAt;
    return true;
  });

  const bySubject: Record<string, { total: number; sum: number }> = {};
  const timeline: { date: string; percentage: number; exam: string }[] = [];

  for (const r of results) {
    const subName = r.exam.subject.name;
    if (!bySubject[subName]) bySubject[subName] = { total: 0, sum: 0 };
    bySubject[subName]!.total += 1;
    bySubject[subName]!.sum += Number(r.percentage);

    timeline.push({
      date: r.createdAt.toISOString(),
      percentage: Number(r.percentage),
      exam: r.exam.title,
    });
  }

  const subjectAverages = Object.entries(bySubject).map(([name, data]) => ({
    subject: name,
    average: data.sum / data.total,
    exams: data.total,
  }));

  return { subjectAverages, timeline, totalExams: results.length };
}
