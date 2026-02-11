import { z } from 'zod/v4';

// ============================================
// Department
// ============================================

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(500).optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

// ============================================
// Subject
// ============================================

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  code: z.string().min(1, 'Code is required').max(20),
  departmentId: z.string().uuid('Invalid department'),
  description: z.string().max(500).optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(20).optional(),
  departmentId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

// ============================================
// Class
// ============================================

export const createClassSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  grade: z.number().int().min(1).max(12),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;

// ============================================
// Section
// ============================================

export const createSectionSchema = z.object({
  name: z.string().min(1, 'Name required').max(50),
  classId: z.string().uuid('Invalid class'),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
