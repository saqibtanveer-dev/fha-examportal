import { z } from 'zod';

// ============================================
// Tag
// ============================================

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum(['TOPIC', 'DIFFICULTY', 'BLOOM_LEVEL', 'CUSTOM']),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

// ============================================
// MCQ Option
// ============================================

const mcqOptionSchema = z.object({
  label: z.string().min(1).max(5),
  text: z.string().min(1, 'Option text is required'),
  imageUrl: z.string().url().optional(),
  isCorrect: z.boolean(),
  sortOrder: z.number().int().min(0),
});

// ============================================
// Question
// ============================================

export const createQuestionSchema = z
  .object({
    subjectId: z.string().uuid('Invalid subject'),
    type: z.enum(['MCQ', 'SHORT_ANSWER', 'LONG_ANSWER']),
    title: z.string().min(1, 'Title is required').max(1000),
    description: z.string().max(5000).optional(),
    imageUrl: z.string().url().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    marks: z.number().positive('Marks must be positive'),
    expectedTime: z.number().int().positive().optional(),
    modelAnswer: z.string().max(10000).optional(),
    gradingRubric: z.record(z.string(), z.unknown()).optional(),
    explanation: z.string().max(5000).optional(),
    mcqOptions: z.array(mcqOptionSchema).optional(),
    tagIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'MCQ') {
        return data.mcqOptions && data.mcqOptions.length >= 2;
      }
      return true;
    },
    { message: 'MCQ requires at least 2 options', path: ['mcqOptions'] },
  )
  .refine(
    (data) => {
      if (data.type === 'MCQ' && data.mcqOptions) {
        return data.mcqOptions.some((opt) => opt.isCorrect);
      }
      return true;
    },
    { message: 'MCQ must have at least one correct option', path: ['mcqOptions'] },
  );

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export const updateQuestionSchema = z.object({
  title: z.string().min(1).max(1000).optional(),
  description: z.string().max(5000).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  marks: z.number().positive().optional(),
  expectedTime: z.number().int().positive().optional(),
  modelAnswer: z.string().max(10000).optional(),
  gradingRubric: z.record(z.string(), z.unknown()).optional(),
  explanation: z.string().max(5000).optional(),
  isActive: z.boolean().optional(),
  mcqOptions: z.array(mcqOptionSchema).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
