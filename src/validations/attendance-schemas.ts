import { z } from 'zod/v4';

// ============================================
// Attendance Record Entry (single student)
// ============================================

const attendanceStatusEnum = z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']);

const attendanceRecordEntry = z.object({
  studentProfileId: z.string().uuid('Invalid student'),
  status: attendanceStatusEnum,
  remarks: z.string().max(500).optional(),
});

// ============================================
// Daily Attendance
// ============================================

export const markDailyAttendanceSchema = z.object({
  classId: z.string().uuid('Invalid class'),
  sectionId: z.string().uuid('Invalid section'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  records: z.array(attendanceRecordEntry).min(1, 'At least one student record required'),
});

export type MarkDailyAttendanceInput = z.infer<typeof markDailyAttendanceSchema>;

// ============================================
// Subject Attendance
// ============================================

export const markSubjectAttendanceSchema = z.object({
  classId: z.string().uuid('Invalid class'),
  sectionId: z.string().uuid('Invalid section'),
  subjectId: z.string().uuid('Invalid subject'),
  periodSlotId: z.string().uuid('Invalid period slot'),
  timetableEntryId: z.string().uuid('Invalid timetable entry').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  records: z.array(attendanceRecordEntry).min(1, 'At least one student record required'),
});

export type MarkSubjectAttendanceInput = z.infer<typeof markSubjectAttendanceSchema>;

// ============================================
// Update Single Record
// ============================================

export const updateAttendanceRecordSchema = z.object({
  status: attendanceStatusEnum,
  remarks: z.string().max(500).optional(),
});

export type UpdateAttendanceRecordInput = z.infer<typeof updateAttendanceRecordSchema>;

// ============================================
// Fetch Filters
// ============================================

export const attendanceFilterSchema = z.object({
  classId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: attendanceStatusEnum.optional(),
}).refine(
  (d) => !d.startDate || !d.endDate || d.startDate <= d.endDate,
  { message: 'Start date must be before or equal to end date' },
);

export type AttendanceFilterInput = z.infer<typeof attendanceFilterSchema>;

// ============================================
// Monthly Report Filter
// ============================================

export const monthlyReportSchema = z.object({
  classId: z.string().uuid('Invalid class'),
  sectionId: z.string().uuid('Invalid section'),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

export type MonthlyReportInput = z.infer<typeof monthlyReportSchema>;

// ============================================
// Student Attendance Filter
// ============================================

export const studentAttendanceFilterSchema = z.object({
  studentProfileId: z.string().uuid('Invalid student'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type StudentAttendanceFilterInput = z.infer<typeof studentAttendanceFilterSchema>;
