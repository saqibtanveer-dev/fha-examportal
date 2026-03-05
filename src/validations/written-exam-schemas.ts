import { z } from 'zod/v4';

// ============================================
// Initialize Written Exam Sessions
// ============================================

export const initializeWrittenSessionsSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
});

export type InitializeWrittenSessionsInput = z.infer<typeof initializeWrittenSessionsSchema>;

// ============================================
// Enter Marks for Single Question
// ============================================

export const enterWrittenMarksSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  examQuestionId: z.string().uuid('Invalid exam question ID'),
  marksAwarded: z.number().min(0, 'Marks cannot be negative'),
  feedback: z.string().max(1000, 'Feedback too long').optional(),
});

export type EnterWrittenMarksInput = z.infer<typeof enterWrittenMarksSchema>;

// ============================================
// Batch Enter Marks (All Questions for One Student)
// ============================================

const batchMarkEntrySchema = z.object({
  examQuestionId: z.string().uuid(),
  marksAwarded: z.number().min(0, 'Marks cannot be negative'),
  feedback: z.string().max(1000).optional(),
});

export const batchEnterWrittenMarksSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  marks: z.array(batchMarkEntrySchema).min(1, 'At least one mark entry required'),
});

export type BatchEnterWrittenMarksInput = z.infer<typeof batchEnterWrittenMarksSchema>;

// ============================================
// Bulk Enter Marks (Multiple Students, Spreadsheet)
// ============================================

const bulkEntrySchema = z.object({
  sessionId: z.string().uuid(),
  examQuestionId: z.string().uuid(),
  marksAwarded: z.number().min(0, 'Marks cannot be negative'),
});

export const bulkEnterWrittenMarksSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  entries: z
    .array(bulkEntrySchema)
    .min(1, 'At least one entry required')
    .max(500, 'Max 500 entries per batch'),
});

export type BulkEnterWrittenMarksInput = z.infer<typeof bulkEnterWrittenMarksSchema>;

// ============================================
// Mark / Unmark Absent
// ============================================

export const markAbsentSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export type MarkAbsentInput = z.infer<typeof markAbsentSchema>;

// ============================================
// Finalize Written Exam
// ============================================

export const finalizeWrittenExamSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
});

export type FinalizeWrittenExamInput = z.infer<typeof finalizeWrittenExamSchema>;
