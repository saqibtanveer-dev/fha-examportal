import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { ResultWithDetails, DetailedResult, AnswerDetail, AiGradeInfo } from './result-types';

export type ExamResultsPage = {
  results: ResultWithDetails[];
  total: number;
  page: number;
  pageSize: number;
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

  const now = new Date();
  return results.filter((r) => {
    const policy = r.exam.showResultAfter;
    if (policy === 'IMMEDIATELY') return true;
    if (policy === 'AFTER_DEADLINE') {
      const deadline = r.exam.scheduledEndAt;
      return deadline ? now >= deadline : true;
    }
    if (policy === 'MANUAL') return !!r.publishedAt;
    return true;
  });
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

export async function getResultsByExamPage(
  examId: string,
  params?: { page?: number; pageSize?: number },
): Promise<ExamResultsPage> {
  const page = Math.max(1, params?.page ?? 1);
  const requestedPageSize = params?.pageSize ?? 50;
  const pageSize = Math.min(100, Math.max(10, requestedPageSize));
  const skip = (page - 1) * pageSize;

  const [results, total] = await Promise.all([
    prisma.examResult.findMany({
      where: { examId },
      orderBy: { percentage: 'desc' },
      skip,
      take: pageSize,
      include: {
        exam: { include: { subject: { select: { id: true, name: true, code: true } } } },
        student: { select: { id: true, firstName: true, lastName: true } },
        session: { select: { id: true, attemptNumber: true, submittedAt: true } },
      },
    }),
    prisma.examResult.count({ where: { examId } }),
  ]);

  return { results, total, page, pageSize };
}

// ─── Detailed Result Builder ─────────────────────────────────────────

async function fetchDetailedResult(
  resultId: string,
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

  // De-duplicate exam questions from student answers
  const examQuestions = result.session.studentAnswers
    .map((sa) => sa.examQuestion)
    .filter((eq, i, arr) => arr.findIndex((x) => x.id === eq.id) === i);

  const answerMap = new Map(
    result.session.studentAnswers.map((sa) => [sa.examQuestionId, sa]),
  );

  const sortedQuestions = [...examQuestions].sort((a, b) => a.sortOrder - b.sortOrder);

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
 * Student view — enforces ownership + showResultAfter policy.
 * AI metadata is STRIPPED.
 */
export async function getStudentResultDetail(
  resultId: string,
  studentId: string,
): Promise<DetailedResult | null> {
  const result = await fetchDetailedResult(resultId, studentId);
  if (!result) return null;
  if (!result.allowReview) result.answers = [];
  delete result.aiGradeMap;
  return result;
}

/**
 * Teacher/admin view — includes AI metadata, anti-cheat info, all answer details.
 */
export async function getTeacherResultDetail(
  resultId: string,
): Promise<DetailedResult | null> {
  return fetchDetailedResult(resultId);
}
