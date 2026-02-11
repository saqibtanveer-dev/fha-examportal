import { z } from 'zod';

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
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  phone: z.string().optional(),
});

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
