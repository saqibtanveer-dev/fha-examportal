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
