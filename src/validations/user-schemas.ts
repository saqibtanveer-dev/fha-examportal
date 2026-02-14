import { z } from 'zod/v4';
import { passwordSchema } from './password-schemas';

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// User Schemas
// ============================================

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  phone: z.string().optional(),
  // Student profile fields (required when role = STUDENT)
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  rollNumber: z.string().optional(),
  registrationNo: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  // Teacher profile fields (required when role = TEACHER)
  employeeId: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
}).refine(
  (data) => {
    if (data.role === 'STUDENT') {
      return !!data.classId && !!data.sectionId && !!data.rollNumber && !!data.registrationNo;
    }
    return true;
  },
  { message: 'Students require classId, sectionId, rollNumber, and registrationNo' },
).refine(
  (data) => {
    if (data.role === 'TEACHER') {
      return !!data.employeeId;
    }
    return true;
  },
  { message: 'Teachers require employeeId' },
);

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ============================================
// Student Profile
// ============================================

export const createStudentProfileSchema = z.object({
  userId: z.string().uuid(),
  rollNumber: z.string().min(1, 'Roll number is required'),
  registrationNo: z.string().min(1, 'Registration number is required'),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

export type CreateStudentProfileInput = z.infer<typeof createStudentProfileSchema>;

// ============================================
// Teacher Profile
// ============================================

export const createTeacherProfileSchema = z.object({
  userId: z.string().uuid(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
});

export type CreateTeacherProfileInput = z.infer<typeof createTeacherProfileSchema>;
