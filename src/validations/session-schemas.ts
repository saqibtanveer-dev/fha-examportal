import { z } from 'zod';

// ============================================
// Submit Answer
// ============================================

export const submitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  examQuestionId: z.string().uuid(),
  answerText: z.string().max(10000).optional(),
  selectedOptionId: z.string().uuid().optional(),
  isMarkedForReview: z.boolean().optional(),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

// ============================================
// Start Exam Session
// ============================================

export const startSessionSchema = z.object({
  examId: z.string().uuid(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;

// ============================================
// Submit Session
// ============================================

export const submitSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

export type SubmitSessionInput = z.infer<typeof submitSessionSchema>;

// ============================================
// Grade Answer (manual by teacher)
// ============================================

export const gradeAnswerSchema = z.object({
  studentAnswerId: z.string().uuid(),
  marksAwarded: z.number().min(0, 'Marks cannot be negative'),
  feedback: z.string().max(5000).optional(),
});

export type GradeAnswerInput = z.infer<typeof gradeAnswerSchema>;
