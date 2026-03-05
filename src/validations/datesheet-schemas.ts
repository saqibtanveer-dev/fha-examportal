import { z } from 'zod/v4';
import { TIME_FORMAT_REGEX, DUTY_ROLES } from '@/modules/datesheet/datesheet.constants';

// ============================================
// Datesheet (Container)
// ============================================

const examTypeEnum = z.enum(['QUIZ', 'MIDTERM', 'FINAL', 'PRACTICE', 'CUSTOM']);

export const createDatesheetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  examType: examTypeEnum,
  academicSessionId: z.string().uuid('Invalid academic session'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((d) => d.startDate <= d.endDate, {
  message: 'Start date must be on or before end date',
  path: ['endDate'],
});

export type CreateDatesheetInput = z.infer<typeof createDatesheetSchema>;

export const updateDatesheetSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  examType: examTypeEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type UpdateDatesheetInput = z.infer<typeof updateDatesheetSchema>;

// ============================================
// Datesheet Entry
// ============================================

export const createDatesheetEntrySchema = z.object({
  datesheetId: z.string().uuid('Invalid datesheet'),
  classId: z.string().uuid('Invalid class'),
  sectionId: z.string().uuid('Invalid section').nullable().optional(),
  subjectId: z.string().uuid('Invalid subject'),
  examDate: z.string().min(1, 'Exam date is required'),
  startTime: z.string().regex(TIME_FORMAT_REGEX, 'Invalid time format. Use HH:mm'),
  endTime: z.string().regex(TIME_FORMAT_REGEX, 'Invalid time format. Use HH:mm'),
  room: z.string().max(100).optional(),
  instructions: z.string().max(500).optional(),
  totalMarks: z.number().positive().optional(),
});

export type CreateDatesheetEntryInput = z.infer<typeof createDatesheetEntrySchema>;

export const updateDatesheetEntrySchema = z.object({
  subjectId: z.string().uuid().optional(),
  examDate: z.string().optional(),
  startTime: z.string().regex(TIME_FORMAT_REGEX, 'Invalid time format').optional(),
  endTime: z.string().regex(TIME_FORMAT_REGEX, 'Invalid time format').optional(),
  room: z.string().max(100).optional(),
  instructions: z.string().max(500).optional(),
  totalMarks: z.number().positive().nullable().optional(),
});

export type UpdateDatesheetEntryInput = z.infer<typeof updateDatesheetEntrySchema>;

export const bulkCreateEntriesSchema = z.object({
  datesheetId: z.string().uuid(),
  entries: z.array(z.object({
    classId: z.string().uuid(),
    sectionId: z.string().uuid().nullable().optional(),
    subjectId: z.string().uuid(),
    examDate: z.string().min(1),
    startTime: z.string().regex(TIME_FORMAT_REGEX),
    endTime: z.string().regex(TIME_FORMAT_REGEX),
    room: z.string().max(100).optional(),
  })).min(1, 'At least one entry is required').max(100),
});

export type BulkCreateEntriesInput = z.infer<typeof bulkCreateEntriesSchema>;

// ============================================
// Datesheet Duty
// ============================================

export const assignDutySchema = z.object({
  datesheetEntryId: z.string().uuid('Invalid entry'),
  teacherProfileId: z.string().uuid('Invalid teacher'),
  role: z.enum(DUTY_ROLES).default('INVIGILATOR'),
  room: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export type AssignDutyInput = z.infer<typeof assignDutySchema>;

export const updateDutySchema = z.object({
  role: z.string().max(50).optional(),
  room: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export type UpdateDutyInput = z.infer<typeof updateDutySchema>;
