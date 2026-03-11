import { z } from 'zod/v4';
import { TIME_FORMAT_REGEX, MAX_PERIODS_PER_DAY } from '@/modules/timetable/timetable.constants';

// ============================================
// Period Slot
// ============================================

export const createPeriodSlotSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  shortName: z.string().min(1, 'Short name is required').max(10),
  startTime: z.string().regex(TIME_FORMAT_REGEX, 'Invalid time format. Use HH:mm'),
  endTime: z.string().regex(TIME_FORMAT_REGEX, 'Invalid time format. Use HH:mm'),
  sortOrder: z.number().int().min(1).max(MAX_PERIODS_PER_DAY),
  isBreak: z.boolean().default(false),
  classId: z.string().uuid('Invalid class').optional().nullable(),
  sectionId: z.string().uuid('Invalid section').optional().nullable(),
});

export type CreatePeriodSlotInput = z.infer<typeof createPeriodSlotSchema>;

export const updatePeriodSlotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  shortName: z.string().min(1).max(10).optional(),
  startTime: z.string().regex(TIME_FORMAT_REGEX, 'Invalid time format').optional(),
  endTime: z.string().regex(TIME_FORMAT_REGEX, 'Invalid time format').optional(),
  sortOrder: z.number().int().min(1).max(MAX_PERIODS_PER_DAY).optional(),
  isBreak: z.boolean().optional(),
  isActive: z.boolean().optional(),
  classId: z.string().uuid('Invalid class').optional().nullable(),
  sectionId: z.string().uuid('Invalid section').optional().nullable(),
});

export type UpdatePeriodSlotInput = z.infer<typeof updatePeriodSlotSchema>;

// ============================================
// Timetable Entry
// ============================================

const dayOfWeekEnum = z.enum([
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
]);

export const createTimetableEntrySchema = z.object({
  classId: z.string().uuid('Invalid class'),
  sectionId: z.string().uuid('Invalid section'),
  subjectId: z.string().uuid('Invalid subject'),
  teacherProfileId: z.string().uuid('Invalid teacher'),
  periodSlotId: z.string().uuid('Invalid period slot'),
  dayOfWeek: dayOfWeekEnum,
  academicSessionId: z.string().uuid('Invalid academic session'),
  room: z.string().max(50).optional(),
  isElectiveSlot: z.boolean().default(false),
  electiveSlotGroupId: z.string().uuid().optional(),
});

export type CreateTimetableEntryInput = z.infer<typeof createTimetableEntrySchema>;

export const updateTimetableEntrySchema = z.object({
  subjectId: z.string().uuid().optional(),
  teacherProfileId: z.string().uuid().optional(),
  room: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateTimetableEntryInput = z.infer<typeof updateTimetableEntrySchema>;

export const bulkCreateTimetableSchema = z.object({
  entries: z.array(createTimetableEntrySchema).min(1, 'At least one entry required').max(100),
});

export type BulkCreateTimetableInput = z.infer<typeof bulkCreateTimetableSchema>;
