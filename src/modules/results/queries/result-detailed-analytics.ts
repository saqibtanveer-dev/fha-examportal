import { prisma } from '@/lib/prisma';
import type { ExamDetailedAnalytics, QuestionAnalytics, McqOptionAnalysis } from './result-types';

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo]!;
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (idx - lo);
}

function stdDev(values: number[], mean: number): number {
  if (values.length <= 1) return 0;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

export async function getExamDetailedAnalytics(
  examId: string,
): Promise<ExamDetailedAnalytics | null> {
  const [results, sessions, examQuestions] = await Promise.all([
    prisma.examResult.findMany({
      where: { examId },
      select: {
        studentId: true,
        percentage: true,
        grade: true,
        isPassed: true,
        obtainedMarks: true,
        totalMarks: true,
      },
    }),
    prisma.examSession.findMany({
      where: { examId, status: { in: ['SUBMITTED', 'GRADED'] } },
      include: {
        studentAnswers: {
          select: {
            examQuestionId: true,
            selectedOptionId: true,
            answerText: true,
            timeSpent: true,
            answerGrade: { select: { marksAwarded: true, maxMarks: true } },
          },
        },
      },
    }),
    prisma.examQuestion.findMany({
      where: { examId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        marks: true,
        sortOrder: true,
        question: {
          select: {
            id: true,
            title: true,
            type: true,
            difficulty: true,
            mcqOptions: {
              orderBy: { sortOrder: 'asc' },
              select: { id: true, label: true, text: true, isCorrect: true },
            },
          },
        },
      },
    }),
  ]);

  if (results.length === 0) return null;

  // ── Overall Stats ──────────────────────────────────────────────
  const percentages = results.map((r) => Number(r.percentage)).sort((a, b) => a - b);
  const totalStudents = results.length;
  const passed = results.filter((r) => r.isPassed).length;
  const failed = totalStudents - passed;
  const passRate = (passed / totalStudents) * 100;
  const avgPercentage = percentages.reduce((a, b) => a + b, 0) / totalStudents;
  const medianPercentage = percentile(percentages, 50);
  const stdDeviation = stdDev(percentages, avgPercentage);
  const maxPercentage = percentages[percentages.length - 1]!;
  const minPercentage = percentages[0]!;
  const q1Percentage = percentile(percentages, 25);
  const q3Percentage = percentile(percentages, 75);

  const scoreDistribution = [
    { range: '0–20', count: percentages.filter((p) => p <= 20).length },
    { range: '21–40', count: percentages.filter((p) => p > 20 && p <= 40).length },
    { range: '41–60', count: percentages.filter((p) => p > 40 && p <= 60).length },
    { range: '61–80', count: percentages.filter((p) => p > 60 && p <= 80).length },
    { range: '81–100', count: percentages.filter((p) => p > 80).length },
  ];

  const gradeCounts: Record<string, number> = {};
  for (const r of results) {
    const g = r.grade ?? 'Ungraded';
    gradeCounts[g] = (gradeCounts[g] ?? 0) + 1;
  }
  const gradeDistribution = Object.entries(gradeCounts)
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => b.count - a.count);

  // ── Time Analytics ─────────────────────────────────────────────
  const completionTimes = sessions.map((s) => s.timeSpent).filter((t): t is number => t != null);
  const avgCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length / 60
    : null;
  const fastestTime = completionTimes.length > 0 ? Math.min(...completionTimes) / 60 : null;
  const slowestTime = completionTimes.length > 0 ? Math.max(...completionTimes) / 60 : null;

  const timeMins = completionTimes.map((t) => t / 60).sort((a, b) => a - b);
  const timeDistribution: { range: string; count: number }[] = [];
  if (timeMins.length > 0) {
    const maxMin = Math.ceil(Math.max(...timeMins));
    const bucketSize = Math.max(5, Math.ceil(maxMin / 6));
    for (let start = 0; start < maxMin; start += bucketSize) {
      const end = start + bucketSize;
      const isLastBucket = start + bucketSize >= maxMin;
      timeDistribution.push({
        range: `${start}–${end}m`,
        count: timeMins.filter((t) => t >= start && (isLastBucket ? t <= end : t < end)).length,
      });
    }
  }

  // ── Anti-Cheat ─────────────────────────────────────────────────
  const flaggedCount = sessions.filter((s) => s.isFlagged).length;
  const avgTabSwitches = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.tabSwitchCount, 0) / sessions.length
    : 0;
  const totalCopyPasteAttempts = sessions.reduce((sum, s) => sum + s.copyPasteAttempts, 0);
  const totalFullscreenExits = sessions.reduce((sum, s) => sum + s.fullscreenExits, 0);

  // ── Per-Question Analytics ────────────────────────────────────
  const studentScores = new Map<string, number>();
  for (const r of results) studentScores.set(r.studentId, Number(r.percentage));
  const sortedStudentIds = [...studentScores.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id);
  const n27 = Math.max(1, Math.ceil(sortedStudentIds.length * 0.27));
  const bottomGroup = new Set(sortedStudentIds.slice(0, n27));
  const topGroup = new Set(sortedStudentIds.slice(-n27));

  type AnswerWithStudent = (typeof sessions)[0]['studentAnswers'][0] & { studentId: string };
  const answersWithStudent = new Map<string, AnswerWithStudent[]>();
  for (const sess of sessions) {
    for (const sa of sess.studentAnswers) {
      const arr = answersWithStudent.get(sa.examQuestionId) ?? [];
      arr.push({ ...sa, studentId: sess.studentId });
      answersWithStudent.set(sa.examQuestionId, arr);
    }
  }

  const questions: QuestionAnalytics[] = examQuestions.map((eq, idx) => {
    const q = eq.question;
    const maxMarks = Number(eq.marks);
    const allAnswers = answersWithStudent.get(eq.id) ?? [];

    let correctCount = 0;
    let partialCount = 0;
    let wrongCount = 0;
    let totalMarksSum = 0;
    let timeSum = 0;
    let timeCount = 0;
    let topCorrect = 0;
    let topTotal = 0;
    let bottomCorrect = 0;
    let bottomTotal = 0;

    const optionCounts = new Map<string, number>();
    if (q.type === 'MCQ') {
      for (const opt of q.mcqOptions) optionCounts.set(opt.id, 0);
    }

    const attemptedStudents = new Set<string>();

    for (const sa of allAnswers) {
      attemptedStudents.add(sa.studentId);
      const awarded = sa.answerGrade ? Number(sa.answerGrade.marksAwarded) : 0;
      const isFullMarks = awarded >= maxMarks;
      const isPartial = awarded > 0 && awarded < maxMarks;
      const hasGrade = !!sa.answerGrade;

      if (hasGrade) {
        if (isFullMarks) correctCount++;
        else if (isPartial) partialCount++;
        else wrongCount++;
        totalMarksSum += awarded;
      }

      if (sa.timeSpent != null) { timeSum += sa.timeSpent; timeCount++; }

      if (q.type === 'MCQ' && sa.selectedOptionId) {
        optionCounts.set(sa.selectedOptionId, (optionCounts.get(sa.selectedOptionId) ?? 0) + 1);
      }

      if (topGroup.has(sa.studentId)) { topTotal++; if (isFullMarks) topCorrect++; }
      if (bottomGroup.has(sa.studentId)) { bottomTotal++; if (isFullMarks) bottomCorrect++; }
    }

    const attemptedCount = attemptedStudents.size;
    const unansweredCount = totalStudents - attemptedCount;
    const gradedCount = correctCount + partialCount + wrongCount;
    const accuracyRate = gradedCount > 0 ? (correctCount / gradedCount) * 100 : 0;
    const avgMarksAwarded = gradedCount > 0 ? totalMarksSum / gradedCount : 0;
    const avgTimeSpent = timeCount > 0 ? timeSum / timeCount : null;
    const difficultyIndex = gradedCount > 0 ? correctCount / gradedCount : 0;
    const topRate = topTotal > 0 ? topCorrect / topTotal : 0;
    const bottomRate = bottomTotal > 0 ? bottomCorrect / bottomTotal : 0;
    const discriminationIndex = topRate - bottomRate;

    const optionAnalysis: McqOptionAnalysis[] = q.type === 'MCQ'
      ? q.mcqOptions.map((opt) => ({
          label: opt.label,
          text: opt.text,
          isCorrect: opt.isCorrect,
          selectionCount: optionCounts.get(opt.id) ?? 0,
          selectionPercentage: attemptedCount > 0 ? ((optionCounts.get(opt.id) ?? 0) / attemptedCount) * 100 : 0,
        }))
      : [];

    return {
      questionId: q.id,
      examQuestionId: eq.id,
      questionNumber: idx + 1,
      title: q.title,
      type: q.type as QuestionAnalytics['type'],
      maxMarks,
      difficulty: q.difficulty,
      totalStudents,
      attemptedCount,
      correctCount,
      partialCount,
      wrongCount,
      unansweredCount,
      accuracyRate,
      avgMarksAwarded,
      avgTimeSpent,
      difficultyIndex,
      discriminationIndex,
      optionAnalysis,
    };
  });

  return {
    totalStudents, passed, failed, passRate,
    avgPercentage, medianPercentage, stdDeviation,
    maxPercentage, minPercentage, q1Percentage, q3Percentage,
    scoreDistribution, gradeDistribution,
    questions,
    avgCompletionTime, fastestTime, slowestTime, timeDistribution,
    flaggedCount, avgTabSwitches, totalCopyPasteAttempts, totalFullscreenExits,
  };
}
