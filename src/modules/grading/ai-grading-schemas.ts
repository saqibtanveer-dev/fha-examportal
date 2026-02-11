import { z } from 'zod/v4';

/**
 * AI response schema for SHORT_ANSWER grading.
 * Used with Vercel AI SDK generateObject().
 */
export const shortAnswerGradeSchema = z.object({
  marksAwarded: z
    .number()
    .min(0)
    .describe('Marks awarded out of maximum marks'),
  feedback: z
    .string()
    .describe('Brief constructive feedback for the student'),
  reasoning: z
    .string()
    .describe('Internal reasoning for the grade (for audit)'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence level 0.0-1.0'),
  keyMatchedConcepts: z
    .array(z.string())
    .describe('Key concepts correctly addressed'),
  missingConcepts: z
    .array(z.string())
    .describe('Important concepts missing from the answer'),
});

export type ShortAnswerGrade = z.infer<typeof shortAnswerGradeSchema>;

/**
 * AI response schema for LONG_ANSWER grading.
 * Rubric-based with per-criterion scores.
 */
export const longAnswerGradeSchema = z.object({
  marksAwarded: z
    .number()
    .min(0)
    .describe('Total marks awarded out of maximum marks'),
  feedback: z
    .string()
    .describe('Overall constructive feedback for the student'),
  reasoning: z
    .string()
    .describe('Internal reasoning for the grade (for audit)'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence level 0.0-1.0'),
  criterionGrades: z
    .array(
      z.object({
        criterion: z.string().describe('Name of the evaluation criterion'),
        score: z.number().describe('Score for this criterion'),
        maxScore: z.number().describe('Maximum possible score'),
        comment: z.string().describe('Brief comment for this criterion'),
      }),
    )
    .describe('Per-criterion grade breakdown'),
  strengths: z
    .array(z.string())
    .describe('Key strengths of the answer'),
  improvements: z
    .array(z.string())
    .describe('Suggested areas for improvement'),
});

export type LongAnswerGrade = z.infer<typeof longAnswerGradeSchema>;
