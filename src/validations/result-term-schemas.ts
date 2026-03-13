import { z } from 'zod/v4';

// ============================================
// Result Term
// ============================================

export const createResultTermSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  academicSessionId: z.string().uuid('Invalid session'),
  classId: z.string().uuid('Invalid class'),
});

export type CreateResultTermInput = z.infer<typeof createResultTermSchema>;

export const updateResultTermSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateResultTermInput = z.infer<typeof updateResultTermSchema>;

// ============================================
// Exam Group
// ============================================

export const createExamGroupSchema = z.object({
  resultTermId: z.string().uuid('Invalid result term'),
  name: z.string().min(1, 'Group name is required').max(100),
  weight: z
    .number()
    .min(0.01, 'Weight must be positive')
    .max(100, 'Weight cannot exceed 100'),
  aggregateMode: z
    .enum(['SINGLE', 'AVERAGE', 'BEST_OF', 'SUM'])
    .default('SINGLE'),
  bestOfCount: z.number().int().min(1).optional().nullable(),
  sortOrder: z.number().int().min(0),
});

export type CreateExamGroupInput = z.infer<typeof createExamGroupSchema>;

export const updateExamGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  weight: z.number().min(0.01).max(100).optional(),
  aggregateMode: z.enum(['SINGLE', 'AVERAGE', 'BEST_OF', 'SUM']).optional(),
  bestOfCount: z.number().int().min(1).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export type UpdateExamGroupInput = z.infer<typeof updateExamGroupSchema>;

// ============================================
// Exam Link
// ============================================

export const linkExamSchema = z.object({
  examGroupId: z.string().uuid('Invalid exam group'),
  examId: z.string().uuid('Invalid exam'),
});

export type LinkExamInput = z.infer<typeof linkExamSchema>;

// ============================================
// Student Remarks
// ============================================

export const studentRemarksSchema = z.object({
  resultTermId: z.string().uuid(),
  studentId: z.string().uuid(),
  classTeacherRemarks: z.string().max(1000).optional().nullable(),
  principalRemarks: z.string().max(1000).optional().nullable(),
});

export type StudentRemarksInput = z.infer<typeof studentRemarksSchema>;

export const batchStudentRemarksSchema = z.object({
  resultTermId: z.string().uuid(),
  remarks: z.array(
    z.object({
      studentId: z.string().uuid(),
      classTeacherRemarks: z.string().max(1000).optional().nullable(),
      principalRemarks: z.string().max(1000).optional().nullable(),
    }),
  ).min(1, 'At least one student required').max(200, 'Too many students in one batch'),
});

export type BatchStudentRemarksInput = z.infer<typeof batchStudentRemarksSchema>;

// ============================================
// Consolidation Options
// ============================================

export const computeConsolidatedSchema = z.object({
  resultTermId: z.string().uuid(),
  sectionId: z.string().uuid().optional(),
  recompute: z.boolean().default(false),
});

export type ComputeConsolidatedInput = z.infer<typeof computeConsolidatedSchema>;
