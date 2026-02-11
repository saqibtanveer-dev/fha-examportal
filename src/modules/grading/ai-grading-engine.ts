import { generateObject } from 'ai';
import { gradingModel } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { AI_CONFIDENCE_THRESHOLD, AI_MAX_TOKENS } from '@/lib/constants';
import {
  shortAnswerGradeSchema,
  longAnswerGradeSchema,
  type ShortAnswerGrade,
  type LongAnswerGrade,
} from './ai-grading-schemas';
import {
  buildShortAnswerPrompt,
  buildLongAnswerPrompt,
} from './ai-grading-prompts';

const MAX_ANSWER_LENGTH = 4000;

/* ─── Types ─── */

type AiGradeInput = {
  studentAnswerId: string;
  answerText: string;
  questionType: 'SHORT_ANSWER' | 'LONG_ANSWER';
  questionTitle: string;
  questionDescription: string | null;
  modelAnswer: string | null;
  subjectName: string;
  difficulty: string;
  maxMarks: number;
};

export type AiGradeResult = {
  success: boolean;
  marksAwarded: number;
  confidence: number;
  feedback: string;
  needsReview: boolean;
  error?: string;
};

/* ─── Main AI Grading Function ─── */

export async function aiGradeAnswer(input: AiGradeInput): Promise<AiGradeResult> {
  // Guard: empty answer
  if (!input.answerText || input.answerText.trim().length === 0) {
    await saveAiGrade(input.studentAnswerId, {
      marksAwarded: 0,
      maxMarks: input.maxMarks,
      feedback: 'No answer provided.',
      confidence: 1.0,
      promptTokens: 0,
      responseTokens: 0,
    });
    return { success: true, marksAwarded: 0, confidence: 1.0, feedback: 'No answer provided.', needsReview: false };
  }

  // Sanitize and cap answer length
  const sanitizedAnswer = input.answerText.slice(0, MAX_ANSWER_LENGTH).trim();

  try {
    const result =
      input.questionType === 'SHORT_ANSWER'
        ? await gradeShortAnswer({ ...input, answerText: sanitizedAnswer })
        : await gradeLongAnswer({ ...input, answerText: sanitizedAnswer });

    const needsReview = result.confidence < AI_CONFIDENCE_THRESHOLD;

    await saveAiGrade(input.studentAnswerId, {
      marksAwarded: clampMarks(result.marksAwarded, input.maxMarks),
      maxMarks: input.maxMarks,
      feedback: result.feedback,
      confidence: result.confidence,
      promptTokens: result.promptTokens,
      responseTokens: result.responseTokens,
    });

    return {
      success: true,
      marksAwarded: clampMarks(result.marksAwarded, input.maxMarks),
      confidence: result.confidence,
      feedback: result.feedback,
      needsReview,
    };
  } catch (err) {
    logger.error({ err, studentAnswerId: input.studentAnswerId }, 'AI grading failed');
    return {
      success: false,
      marksAwarded: 0,
      confidence: 0,
      feedback: 'AI grading failed. Requires manual review.',
      needsReview: true,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/* ─── Short Answer Grading ─── */

type GradeOutput = {
  marksAwarded: number;
  feedback: string;
  confidence: number;
  promptTokens: number;
  responseTokens: number;
};

async function gradeShortAnswer(input: AiGradeInput): Promise<GradeOutput> {
  const prompt = buildShortAnswerPrompt({
    subjectName: input.subjectName,
    questionTitle: input.questionTitle,
    questionDescription: input.questionDescription ?? '',
    modelAnswer: input.modelAnswer,
    difficulty: input.difficulty,
    maxMarks: input.maxMarks,
    studentAnswer: input.answerText,
  });

  const { object, usage } = await generateObject({
    model: gradingModel,
    schema: shortAnswerGradeSchema,
    prompt,
    maxOutputTokens: AI_MAX_TOKENS,
  });

  return {
    marksAwarded: object.marksAwarded,
    feedback: object.feedback,
    confidence: object.confidence,
    promptTokens: usage?.inputTokens ?? 0,
    responseTokens: usage?.outputTokens ?? 0,
  };
}

/* ─── Long Answer Grading ─── */

async function gradeLongAnswer(input: AiGradeInput): Promise<GradeOutput> {
  const prompt = buildLongAnswerPrompt({
    subjectName: input.subjectName,
    questionTitle: input.questionTitle,
    questionDescription: input.questionDescription ?? '',
    modelAnswer: input.modelAnswer,
    difficulty: input.difficulty,
    maxMarks: input.maxMarks,
    studentAnswer: input.answerText,
  });

  const { object, usage } = await generateObject({
    model: gradingModel,
    schema: longAnswerGradeSchema,
    prompt,
    maxOutputTokens: AI_MAX_TOKENS,
  });

  return {
    marksAwarded: object.marksAwarded,
    feedback: formatLongAnswerFeedback(object),
    confidence: object.confidence,
    promptTokens: usage?.inputTokens ?? 0,
    responseTokens: usage?.outputTokens ?? 0,
  };
}

/* ─── Helpers ─── */

function clampMarks(marks: number, max: number): number {
  return Math.max(0, Math.min(marks, max));
}

function formatLongAnswerFeedback(grade: LongAnswerGrade): string {
  const lines: string[] = [grade.feedback];

  if (grade.criterionGrades.length > 0) {
    lines.push('\nBreakdown:');
    grade.criterionGrades.forEach((c) => {
      lines.push(`• ${c.criterion}: ${c.score}/${c.maxScore} — ${c.comment}`);
    });
  }

  if (grade.strengths.length > 0) {
    lines.push(`\nStrengths: ${grade.strengths.join(', ')}`);
  }

  if (grade.improvements.length > 0) {
    lines.push(`\nAreas to improve: ${grade.improvements.join(', ')}`);
  }

  return lines.join('\n');
}

type SaveGradeInput = {
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
  confidence: number;
  promptTokens: number;
  responseTokens: number;
};

async function saveAiGrade(studentAnswerId: string, data: SaveGradeInput) {
  await prisma.answerGrade.upsert({
    where: { studentAnswerId },
    create: {
      studentAnswerId,
      gradedBy: 'AI',
      marksAwarded: data.marksAwarded,
      maxMarks: data.maxMarks,
      feedback: data.feedback,
      aiConfidence: data.confidence,
      aiModelUsed: 'gpt-4o-mini',
      aiPromptTokens: data.promptTokens,
      aiResponseTokens: data.responseTokens,
    },
    update: {
      gradedBy: 'AI',
      marksAwarded: data.marksAwarded,
      feedback: data.feedback,
      aiConfidence: data.confidence,
      aiModelUsed: 'gpt-4o-mini',
      aiPromptTokens: data.promptTokens,
      aiResponseTokens: data.responseTokens,
      isReviewed: false,
      reviewedAt: null,
    },
  });
}
