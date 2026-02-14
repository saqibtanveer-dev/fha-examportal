'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { createUserSchema, type CreateUserInput } from '@/validations/user-schemas';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { toggleUserActive, softDeleteUser } from './user-queries';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

// ============================================
// Create User
// ============================================

export async function createUserAction(input: CreateUserInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('ADMIN');

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' };
  }

  const {
    email, password, firstName, lastName, role, phone,
    classId, sectionId, rollNumber, registrationNo, guardianName, guardianPhone, dateOfBirth, gender,
    employeeId, qualification, specialization,
  } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'A user with this email already exists' };
  }

  // Validate class/section exist for students
  if (role === 'STUDENT' && classId && sectionId) {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, classId },
    });
    if (!section) {
      return { success: false, error: 'Invalid class or section selection' };
    }
  }

  // Check for duplicate registration number
  if (role === 'STUDENT' && registrationNo) {
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { registrationNo },
    });
    if (existingProfile) {
      return { success: false, error: 'A student with this registration number already exists' };
    }
  }

  // Check for duplicate employee ID
  if (role === 'TEACHER' && employeeId) {
    const existingTeacher = await prisma.teacherProfile.findUnique({
      where: { employeeId },
    });
    if (existingTeacher) {
      return { success: false, error: 'A teacher with this employee ID already exists' };
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      phone,
      // Create StudentProfile if role is STUDENT
      ...(role === 'STUDENT' && classId && sectionId && rollNumber && registrationNo
        ? {
            studentProfile: {
              create: {
                classId,
                sectionId,
                rollNumber,
                registrationNo,
                guardianName: guardianName || null,
                guardianPhone: guardianPhone || null,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender: gender || null,
              },
            },
          }
        : {}),
      // Create TeacherProfile if role is TEACHER
      ...(role === 'TEACHER' && employeeId
        ? {
            teacherProfile: {
              create: {
                employeeId,
                qualification: qualification || null,
                specialization: specialization || null,
              },
            },
          }
        : {}),
    },
  });

  createAuditLog(session.user.id, 'CREATE_USER', 'USER', user.id, { email, role }).catch(() => {});
  revalidatePath('/admin/users');
  return { success: true, data: { id: user.id } };
}

// ============================================
// Toggle User Active
// ============================================

export async function toggleUserActiveAction(userId: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  const user = await toggleUserActive(userId);
  if (!user) return { success: false, error: 'User not found' };

  createAuditLog(session.user.id, 'TOGGLE_USER_ACTIVE', 'USER', userId, { isActive: user.isActive }).catch(() => {});
  revalidatePath('/admin/users');
  return { success: true };
}

// ============================================
// Delete User (Soft)
// ============================================

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  await softDeleteUser(userId);
  createAuditLog(session.user.id, 'DELETE_USER', 'USER', userId).catch(() => {});
  revalidatePath('/admin/users');
  return { success: true };
}

// ============================================
// Find Orphaned Users
// Returns users whose role is STUDENT/TEACHER but
// have no corresponding profile record.
// ============================================

export async function findOrphanedUsersAction(): Promise<ActionResult<{ students: { id: string; name: string; email: string }[]; teachers: { id: string; name: string; email: string }[] }>> {
  await requireRole('ADMIN');

  const orphanedStudents = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      isActive: true,
      deletedAt: null,
      studentProfile: null,
    },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  const orphanedTeachers = await prisma.user.findMany({
    where: {
      role: 'TEACHER',
      isActive: true,
      deletedAt: null,
      teacherProfile: null,
    },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  return {
    success: true,
    data: {
      students: orphanedStudents.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email })),
      teachers: orphanedTeachers.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email })),
    },
  };
}
