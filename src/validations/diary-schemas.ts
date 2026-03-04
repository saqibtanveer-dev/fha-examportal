// ============================================
// Diary Validation Schemas — Zod v4
// ============================================

import { z } from 'zod/v4';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// ── Create Diary Entry ──

export const createDiaryEntrySchema = z.object({
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  subjectId: z.string().uuid(),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  content: z.string().min(1, 'Content is required').max(10_000, 'Content too long'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
});

export type CreateDiaryEntryInput = z.infer<typeof createDiaryEntrySchema>;

// ── Update Diary Entry ──

export const updateDiaryEntrySchema = z.object({
  title: z.string().min(3).max(255).optional(),
  content: z.string().min(1).max(10_000).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export type UpdateDiaryEntryInput = z.infer<typeof updateDiaryEntrySchema>;

// ── Copy to Sections ──

export const copyDiaryToSectionsSchema = z.object({
  targetSectionIds: z.array(z.string().uuid()).min(1).max(20),
});

export type CopyDiaryToSectionsInput = z.infer<typeof copyDiaryToSectionsSchema>;

// ── Diary Filter Schema ──

export const diaryFilterSchema = z.object({
  classId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  startDate: z.string().regex(dateRegex).optional(),
  endDate: z.string().regex(dateRegex).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  teacherProfileId: z.string().uuid().optional(),
});

export type DiaryFilterInput = z.infer<typeof diaryFilterSchema>;

// ── Principal Note ──

export const principalNoteSchema = z.object({
  note: z.string().min(1, 'Note is required').max(2_000, 'Note too long'),
});

export type PrincipalNoteInput = z.infer<typeof principalNoteSchema>;
