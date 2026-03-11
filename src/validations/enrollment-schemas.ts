import { z } from 'zod/v4';

export const enrollStudentSchema = z.object({
  studentProfileId: z.string().uuid('Invalid student'),
  subjectId: z.string().uuid('Invalid subject'),
  classId: z.string().uuid('Invalid class'),
  academicSessionId: z.string().uuid('Invalid academic session'),
});

export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;

export const bulkEnrollByGroupSchema = z.object({
  classId: z.string().uuid('Invalid class'),
  sectionId: z.string().uuid('Invalid section'),
  academicSessionId: z.string().uuid('Invalid academic session'),
  electiveGroupName: z.string().min(1, 'Group name is required'),
  assignments: z
    .array(
      z.object({
        studentProfileId: z.string().uuid('Invalid student'),
        subjectId: z.string().uuid('Invalid subject'),
      }),
    )
    .min(1, 'At least one assignment required'),
});

export type BulkEnrollByGroupInput = z.infer<typeof bulkEnrollByGroupSchema>;

export const unenrollStudentSchema = z.object({
  studentProfileId: z.string().uuid('Invalid student'),
  subjectId: z.string().uuid('Invalid subject'),
  academicSessionId: z.string().uuid('Invalid academic session'),
});

export type UnenrollStudentInput = z.infer<typeof unenrollStudentSchema>;

export const createElectiveSlotGroupSchema = z.object({
  classId: z.string().uuid('Invalid class'),
  sectionId: z.string().uuid('Invalid section'),
  periodSlotId: z.string().uuid('Invalid period slot'),
  dayOfWeek: z.enum([
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
  ]),
  academicSessionId: z.string().uuid('Invalid academic session'),
  name: z.string().max(100).optional(),
});

export type CreateElectiveSlotGroupInput = z.infer<typeof createElectiveSlotGroupSchema>;
