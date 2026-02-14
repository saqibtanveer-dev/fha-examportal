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
// Subject-Class Link
// ============================================

export const assignSubjectToClassSchema = z.object({
  subjectId: z.string().uuid('Invalid subject'),
  classId: z.string().uuid('Invalid class'),
  syllabus: z.string().max(500).optional(),
});

export type AssignSubjectToClassInput = z.infer<typeof assignSubjectToClassSchema>;

export const bulkAssignSubjectToClassesSchema = z.object({
  subjectId: z.string().uuid('Invalid subject'),
  classIds: z.array(z.string().uuid()).min(1, 'Select at least one class'),
});

export type BulkAssignSubjectToClassesInput = z.infer<typeof bulkAssignSubjectToClassesSchema>;

// ============================================
// Academic Session
// ============================================

export const createAcademicSessionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  startDate: z.string().datetime('Invalid date'),
  endDate: z.string().datetime('Invalid date'),
  isCurrent: z.boolean().default(false),
});

export type CreateAcademicSessionInput = z.infer<typeof createAcademicSessionSchema>;

export const updateAcademicSessionSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isCurrent: z.boolean().optional(),
});

export type UpdateAcademicSessionInput = z.infer<typeof updateAcademicSessionSchema>;

// ============================================
// Teacher-Subject Assignment
// ============================================

export const assignTeacherToSubjectSchema = z.object({
  teacherId: z.string().uuid('Invalid teacher'),
  subjectId: z.string().uuid('Invalid subject'),
  classId: z.string().uuid().optional(),
});

export type AssignTeacherToSubjectInput = z.infer<typeof assignTeacherToSubjectSchema>;

export const bulkAssignTeacherSubjectsSchema = z.object({
  teacherId: z.string().uuid('Invalid teacher'),
  subjectIds: z.array(z.string().uuid()).min(1, 'Select at least one subject'),
});

export type BulkAssignTeacherSubjectsInput = z.infer<typeof bulkAssignTeacherSubjectsSchema>;

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

// ============================================
// Student Promotion / Year Transition
// ============================================

export const studentPromotionEntrySchema = z.object({
  studentProfileId: z.string().uuid(),
  action: z.enum(['PROMOTE', 'HOLD_BACK', 'GRADUATE']),
  toSectionId: z.string().uuid().optional(),
});

export type StudentPromotionEntry = z.infer<typeof studentPromotionEntrySchema>;

export const bulkPromoteClassSchema = z.object({
  academicSessionId: z.string().uuid('Select an academic session'),
  fromClassId: z.string().uuid('Invalid class'),
  toClassId: z.string().uuid().optional(),
  defaultSectionId: z.string().uuid().optional(),
  entries: z.array(studentPromotionEntrySchema).min(1, 'Select at least one student'),
});

export type BulkPromoteClassInput = z.infer<typeof bulkPromoteClassSchema>;

export const yearTransitionSchema = z.object({
  academicSessionId: z.string().uuid('Select an academic session'),
  promotions: z.array(z.object({
    fromClassId: z.string().uuid(),
    toClassId: z.string().uuid().optional(),
    defaultSectionId: z.string().uuid().optional(),
    entries: z.array(studentPromotionEntrySchema),
  })),
});

export type YearTransitionInput = z.infer<typeof yearTransitionSchema>;
