import { z } from 'zod/v4';

// ============================================
// Exam Question Assignment
// ============================================

const examQuestionSchema = z.object({
  questionId: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  marks: z.number().positive(),
  isRequired: z.boolean().default(true),
});

// ============================================
// Exam Class Assignment
// ============================================

const examClassAssignmentSchema = z.object({
  classId: z.string().uuid(),
  sectionId: z.string().uuid().optional(),
});

// ============================================
// Create Exam
// ============================================

export const createExamSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(2000).optional(),
  subjectId: z.string().uuid('Invalid subject'),
  type: z.enum(['QUIZ', 'MIDTERM', 'FINAL', 'PRACTICE', 'CUSTOM']),
  totalMarks: z.number().positive('Total marks must be positive'),
  passingMarks: z.number().positive('Passing marks must be positive'),
  duration: z.number().int().min(5, 'Min 5 minutes').max(300, 'Max 300 minutes'),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  instructions: z.string().max(5000).optional(),
  shuffleQuestions: z.boolean().default(false),
  showResultAfter: z.enum(['IMMEDIATELY', 'AFTER_DEADLINE', 'MANUAL']).default('IMMEDIATELY'),
  allowReview: z.boolean().default(true),
  maxAttempts: z.number().int().min(1).max(10).default(1),
  questions: z.array(examQuestionSchema).min(1, 'At least one question is required'),
  classAssignments: z.array(examClassAssignmentSchema).min(1, 'Assign to at least one class'),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;

// ============================================
// Update Exam
// ============================================

export const updateExamSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(['QUIZ', 'MIDTERM', 'FINAL', 'PRACTICE', 'CUSTOM']).optional(),
  totalMarks: z.number().positive().optional(),
  passingMarks: z.number().positive().optional(),
  duration: z.number().int().min(5).max(300).optional(),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  instructions: z.string().max(5000).optional(),
  shuffleQuestions: z.boolean().optional(),
  showResultAfter: z.enum(['IMMEDIATELY', 'AFTER_DEADLINE', 'MANUAL']).optional(),
  allowReview: z.boolean().optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

export type UpdateExamInput = z.infer<typeof updateExamSchema>;

// ============================================
// Publish Exam
// ============================================

export const publishExamSchema = z.object({
  examId: z.string().uuid(),
});

export type PublishExamInput = z.infer<typeof publishExamSchema>;
