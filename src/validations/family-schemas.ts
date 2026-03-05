import { z } from 'zod/v4';

// ============================================
// Family Profile Schemas
// ============================================

export const createFamilyProfileSchema = z.object({
  userId: z.string().uuid(),
  relationship: z.string().min(1, 'Relationship is required').max(100),
  occupation: z.string().max(200).optional(),
  address: z.string().optional(),
  emergencyPhone: z.string().max(20).optional(),
});

export type CreateFamilyProfileInput = z.infer<typeof createFamilyProfileSchema>;

export const updateFamilyProfileSchema = z.object({
  relationship: z.string().min(1).max(100).optional(),
  occupation: z.string().max(200).optional(),
  address: z.string().optional(),
  emergencyPhone: z.string().max(20).optional(),
});

export type UpdateFamilyProfileInput = z.infer<typeof updateFamilyProfileSchema>;

// ============================================
// Family-Student Link Schemas
// ============================================

export const linkStudentSchema = z.object({
  familyProfileId: z.string().uuid('Invalid family profile ID'),
  studentProfileId: z.string().uuid('Invalid student profile ID'),
  relationship: z.string().min(1, 'Relationship is required').max(100),
  isPrimary: z.boolean().default(false),
});

export type LinkStudentInput = z.infer<typeof linkStudentSchema>;

export const unlinkStudentSchema = z.object({
  familyProfileId: z.string().uuid(),
  studentProfileId: z.string().uuid(),
});

export type UnlinkStudentInput = z.infer<typeof unlinkStudentSchema>;
