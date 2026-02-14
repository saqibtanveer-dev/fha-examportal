import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// ============================================
// Types
// ============================================

export type ResultWithDetails = Prisma.ExamResultGetPayload<{
  include: {
    exam: { include: { subject: { select: { id: true; name: true; code: true } } } };
    student: { select: { id: true; firstName: true; lastName: true } };
    session: { select: { id: true; attemptNumber: true; submittedAt: true } };
  };
}>;

/** Answer-level detail for result review (shared shape, AI fields stripped for students) */
export type AnswerDetail = {
  id: string;
  questionNumber: number;
  questionTitle: string;
  questionType: 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER';
  questionMarks: number;
  /** Student's written answer (SHORT/LONG) */
  answerText: string | null;
  /** Selected MCQ option ID */
  selectedOptionId: string | null;
  /** All MCQ options */
  mcqOptions: {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }[];
  /** Model answer / correct answer */
  modelAnswer: string | null;
  /** Explanation for the question */
  explanation: string | null;
  /** Grade info */
  grade: {
    marksAwarded: number;
    maxMarks: number;
    feedback: string | null;
    gradedBy: string;
    isCorrect: boolean;
  } | null;
};

/** Teacher-only AI grading metadata */
export type AiGradeInfo = {
  aiConfidence: number | null;
  aiModelUsed: string | null;
  isReviewed: boolean;
  graderId: string | null;
};

export type DetailedResult = {
  id: string;
  examTitle: string;
  examDescription: string | null;
  subjectName: string;
  subjectCode: string;
  totalMarks: number;
  obtainedMarks: number;
  passingMarks: number;
  percentage: number;
  grade: string | null;
  isPassed: boolean;
  rank: number | null;
  publishedAt: string | null;
  duration: number;
  instructions: string | null;
  allowReview: boolean;
  session: {
    id: string;
    status: string;
    attemptNumber: number;
    startedAt: string | null;
    submittedAt: string | null;
    tabSwitchCount: number;
    fullscreenExits: number;
    copyPasteAttempts: number;
    isFlagged: boolean;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
  answers: AnswerDetail[];
  /** Only populated for teacher view */
  aiGradeMap?: Record<string, AiGradeInfo>;
};

export async function getResultsByStudent(studentId: string): Promise<ResultWithDetails[]> {
  const results = await prisma.examResult.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    include: {
      exam: { include: { subject: { select: { id: true, name: true, code: true } } } },
      student: { select: { id: true, firstName: true, lastName: true } },
      session: { select: { id: true, attemptNumber: true, submittedAt: true } },
    },
  });

  // Filter results based on showResultAfter policy
  const now = new Date();
  return results.filter((r) => {
    const policy = r.exam.showResultAfter;
    if (policy === 'IMMEDIATELY') return true;
    if (policy === 'AFTER_DEADLINE') {
      // Show after exam's scheduled end date
      const deadline = r.exam.scheduledEndAt;
      return deadline ? now >= deadline : true;
    }
    if (policy === 'MANUAL') {
      // Show only if publishedAt is set
      return !!r.publishedAt;
    }
    return true;
  });
}

// ============================================
// Detailed result (shared fetcher)
// ============================================

async function fetchDetailedResult(
  resultId: string,
  /** If provided, enforces student ownership */
  studentId?: string,
): Promise<DetailedResult | null> {
  const where: Prisma.ExamResultWhereUniqueInput = { id: resultId };

  const result = await prisma.examResult.findUnique({
    where,
    include: {
      exam: {
        select: {
          title: true,
          description: true,
          totalMarks: true,
          passingMarks: true,
          duration: true,
          instructions: true,
          allowReview: true,
          showResultAfter: true,
          scheduledEndAt: true,
          subject: { select: { name: true, code: true } },
        },
      },
      student: { select: { id: true, firstName: true, lastName: true } },
      session: {
        include: {
          studentAnswers: {
            include: {
              examQuestion: {
                include: {
                  question: {
                    include: { mcqOptions: { orderBy: { sortOrder: 'asc' } } },
                  },
                },
              },
              answerGrade: true,
            },
          },
        },
      },
    },
  });

  if (!result) return null;

  // Enforce student ownership if studentId provided
  if (studentId && result.studentId !== studentId) return null;

  // For student view: enforce showResultAfter policy
  if (studentId) {
    const policy = result.exam.showResultAfter;
    const now = new Date();
    if (policy === 'AFTER_DEADLINE') {
      const deadline = result.exam.scheduledEndAt;
      if (deadline && now < deadline) return null;
    }
    if (policy === 'MANUAL' && !result.publishedAt) return null;
  }

  // Build sorted answers from exam questions
  const examQuestions = result.session.studentAnswers
    .map((sa) => sa.examQuestion)
    .filter((eq, i, arr) => arr.findIndex((x) => x.id === eq.id) === i);

  // Create a map of answers by examQuestionId
  const answerMap = new Map(
    result.session.studentAnswers.map((sa) => [sa.examQuestionId, sa]),
  );

  // Sort by sortOrder
  const sortedQuestions = [...examQuestions].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  const answers: AnswerDetail[] = sortedQuestions.map((eq, idx) => {
    const sa = answerMap.get(eq.id);
    const q = eq.question;
    const ag = sa?.answerGrade;

    const isCorrectAnswer = q.type === 'MCQ'
      ? q.mcqOptions.some((o) => o.isCorrect && o.id === sa?.selectedOptionId)
      : ag ? Number(ag.marksAwarded) === Number(eq.marks) : false;

    return {
      id: sa?.id ?? eq.id,
      questionNumber: idx + 1,
      questionTitle: q.title,
      questionType: q.type as AnswerDetail['questionType'],
      questionMarks: Number(eq.marks),
      answerText: sa?.answerText ?? null,
      selectedOptionId: sa?.selectedOptionId ?? null,
      mcqOptions: q.mcqOptions.map((o) => ({
        id: o.id,
        label: o.label,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
      modelAnswer: q.modelAnswer,
      explanation: q.explanation,
      grade: ag
        ? {
            marksAwarded: Number(ag.marksAwarded),
            maxMarks: Number(ag.maxMarks),
            feedback: ag.feedback,
            gradedBy: ag.gradedBy,
            isCorrect: isCorrectAnswer,
          }
        : null,
    };
  });

  // Build AI grade map (for teacher view)
  const aiGradeMap: Record<string, AiGradeInfo> = {};
  for (const sa of result.session.studentAnswers) {
    if (sa.answerGrade) {
      aiGradeMap[sa.id] = {
        aiConfidence: sa.answerGrade.aiConfidence != null ? Number(sa.answerGrade.aiConfidence) : null,
        aiModelUsed: sa.answerGrade.aiModelUsed,
        isReviewed: sa.answerGrade.isReviewed,
        graderId: sa.answerGrade.graderId,
      };
    }
  }

  return {
    id: result.id,
    examTitle: result.exam.title,
    examDescription: result.exam.description,
    subjectName: result.exam.subject.name,
    subjectCode: result.exam.subject.code,
    totalMarks: Number(result.totalMarks),
    obtainedMarks: Number(result.obtainedMarks),
    passingMarks: Number(result.exam.passingMarks),
    percentage: Number(result.percentage),
    grade: result.grade,
    isPassed: result.isPassed,
    rank: result.rank,
    publishedAt: result.publishedAt?.toISOString() ?? null,
    duration: result.exam.duration,
    instructions: result.exam.instructions,
    allowReview: result.exam.allowReview,
    session: {
      id: result.session.id,
      status: result.session.status,
      attemptNumber: result.session.attemptNumber,
      startedAt: result.session.startedAt?.toISOString() ?? null,
      submittedAt: result.session.submittedAt?.toISOString() ?? null,
      tabSwitchCount: result.session.tabSwitchCount,
      fullscreenExits: result.session.fullscreenExits,
      copyPasteAttempts: result.session.copyPasteAttempts,
      isFlagged: result.session.isFlagged,
    },
    student: {
      id: result.student.id,
      firstName: result.student.firstName,
      lastName: result.student.lastName,
    },
    answers,
    aiGradeMap,
  };
}

/**
 * Get detailed result for student view.
 * Enforces ownership + showResultAfter policy.
 * AI metadata is STRIPPED.
 */
export async function getStudentResultDetail(
  resultId: string,
  studentId: string,
): Promise<DetailedResult | null> {
  const result = await fetchDetailedResult(resultId, studentId);
  if (!result) return null;

  // If allowReview is false, strip answer-level details
  if (!result.allowReview) {
    result.answers = [];
  }

  // Always strip AI metadata from student view
  delete result.aiGradeMap;

  return result;
}

/**
 * Get detailed result for teacher/admin view.
 * Includes AI metadata, anti-cheat info, and all answer details.
 */
export async function getTeacherResultDetail(
  resultId: string,
): Promise<DetailedResult | null> {
  return fetchDetailedResult(resultId);
}

export async function getResultsByExam(examId: string): Promise<ResultWithDetails[]> {
  return prisma.examResult.findMany({
    where: { examId },
    orderBy: { percentage: 'desc' },
    include: {
      exam: { include: { subject: { select: { id: true, name: true, code: true } } } },
      student: { select: { id: true, firstName: true, lastName: true } },
      session: { select: { id: true, attemptNumber: true, submittedAt: true } },
    },
  });
}

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
  const results = await prisma.examResult.findMany({
    where: { studentId },
    include: { exam: { include: { subject: { select: { name: true } } } } },
    orderBy: { createdAt: 'asc' },
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

// ============================================
// Detailed Exam Analytics (Teacher View)
// ============================================

export type McqOptionAnalysis = {
  label: string;
  text: string;
  isCorrect: boolean;
  selectionCount: number;
  selectionPercentage: number;
};

export type QuestionAnalytics = {
  questionId: string;
  examQuestionId: string;
  questionNumber: number;
  title: string;
  type: 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER';
  maxMarks: number;
  difficulty: string;
  totalStudents: number;
  attemptedCount: number;
  correctCount: number;
  partialCount: number;
  wrongCount: number;
  unansweredCount: number;
  accuracyRate: number;
  avgMarksAwarded: number;
  avgTimeSpent: number | null;
  /** Proportion who scored full marks (0–1). Lower = harder. */
  difficultyIndex: number;
  /** Top27% correctRate − Bottom27% correctRate (−1 to 1) */
  discriminationIndex: number;
  /** MCQ only */
  optionAnalysis: McqOptionAnalysis[];
};

export type ExamDetailedAnalytics = {
  // Overall
  totalStudents: number;
  passed: number;
  failed: number;
  passRate: number;
  avgPercentage: number;
  medianPercentage: number;
  stdDeviation: number;
  maxPercentage: number;
  minPercentage: number;
  q1Percentage: number;
  q3Percentage: number;
  scoreDistribution: { range: string; count: number }[];
  gradeDistribution: { grade: string; count: number }[];
  // Per-question
  questions: QuestionAnalytics[];
  // Time
  avgCompletionTime: number | null;
  fastestTime: number | null;
  slowestTime: number | null;
  timeDistribution: { range: string; count: number }[];
  // Anti-cheat
  flaggedCount: number;
  avgTabSwitches: number;
  totalCopyPasteAttempts: number;
  totalFullscreenExits: number;
};

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
  // Parallel fetch: results, sessions with answers+grades, exam questions
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
            answerGrade: {
              select: {
                marksAwarded: true,
                maxMarks: true,
              },
            },
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

  // Score distribution
  const scoreDistribution = [
    { range: '0–20', count: percentages.filter((p) => p <= 20).length },
    { range: '21–40', count: percentages.filter((p) => p > 20 && p <= 40).length },
    { range: '41–60', count: percentages.filter((p) => p > 40 && p <= 60).length },
    { range: '61–80', count: percentages.filter((p) => p > 60 && p <= 80).length },
    { range: '81–100', count: percentages.filter((p) => p > 80).length },
  ];

  // Grade distribution
  const gradeCounts: Record<string, number> = {};
  for (const r of results) {
    const g = r.grade ?? 'Ungraded';
    gradeCounts[g] = (gradeCounts[g] ?? 0) + 1;
  }
  const gradeDistribution = Object.entries(gradeCounts)
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => b.count - a.count);

  // ── Time Analytics ─────────────────────────────────────────────
  const completionTimes = sessions
    .map((s) => s.timeSpent)
    .filter((t): t is number => t != null);
  const avgCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length / 60
    : null;
  const fastestTime = completionTimes.length > 0
    ? Math.min(...completionTimes) / 60
    : null;
  const slowestTime = completionTimes.length > 0
    ? Math.max(...completionTimes) / 60
    : null;

  // Time distribution (in minute buckets)
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
  // Build per-student score map for discrimination index
  const studentScores = new Map<string, number>();
  for (const r of results) {
    studentScores.set(r.studentId, Number(r.percentage));
  }
  const sortedStudentIds = [...studentScores.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => id);
  const n27 = Math.max(1, Math.ceil(sortedStudentIds.length * 0.27));
  const bottomGroup = new Set(sortedStudentIds.slice(0, n27));
  const topGroup = new Set(sortedStudentIds.slice(-n27));

  // Build answer lookup with studentId attached
  type AnswerWithStudent = typeof sessions[0]['studentAnswers'][0] & { studentId: string };
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

    // Categorise
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

      if (sa.timeSpent != null) {
        timeSum += sa.timeSpent;
        timeCount++;
      }

      // MCQ option tracking
      if (q.type === 'MCQ' && sa.selectedOptionId) {
        optionCounts.set(sa.selectedOptionId, (optionCounts.get(sa.selectedOptionId) ?? 0) + 1);
      }

      // Discrimination index groups
      if (topGroup.has(sa.studentId)) {
        topTotal++;
        if (isFullMarks) topCorrect++;
      }
      if (bottomGroup.has(sa.studentId)) {
        bottomTotal++;
        if (isFullMarks) bottomCorrect++;
      }
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

    // MCQ option analysis
    const optionAnalysis: McqOptionAnalysis[] =
      q.type === 'MCQ'
        ? q.mcqOptions.map((opt) => {
            const count = optionCounts.get(opt.id) ?? 0;
            return {
              label: opt.label,
              text: opt.text,
              isCorrect: opt.isCorrect,
              selectionCount: count,
              selectionPercentage: attemptedCount > 0 ? (count / attemptedCount) * 100 : 0,
            };
          })
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
    totalStudents,
    passed,
    failed,
    passRate,
    avgPercentage,
    medianPercentage,
    stdDeviation,
    maxPercentage,
    minPercentage,
    q1Percentage,
    q3Percentage,
    scoreDistribution,
    gradeDistribution,
    questions,
    avgCompletionTime,
    fastestTime,
    slowestTime,
    timeDistribution,
    flaggedCount,
    avgTabSwitches,
    totalCopyPasteAttempts,
    totalFullscreenExits,
  };
}
