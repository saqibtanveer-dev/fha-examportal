import type { Prisma } from '@prisma/client';

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
  answerText: string | null;
  selectedOptionId: string | null;
  mcqOptions: {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }[];
  modelAnswer: string | null;
  explanation: string | null;
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
  questions: QuestionAnalytics[];
  avgCompletionTime: number | null;
  fastestTime: number | null;
  slowestTime: number | null;
  timeDistribution: { range: string; count: number }[];
  flaggedCount: number;
  avgTabSwitches: number;
  totalCopyPasteAttempts: number;
  totalFullscreenExits: number;
};
