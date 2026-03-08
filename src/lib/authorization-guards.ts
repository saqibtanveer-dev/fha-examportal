'use server';

import { prisma } from '@/lib/prisma';
import { AuthorizationError } from '@/errors/authorization-error';
import type { UserRole } from '@prisma/client';

// ============================================
// Query Scope — Provides context for scoped queries
// ============================================

export type QueryScope = {
  role: UserRole;
  userId: string;
  teacherProfileId?: string;
  studentProfileId?: string;
  classId?: string;
  sectionId?: string;
};

// ============================================
// Guard 1: Teacher has ANY assignment in a section
// Pass if teacher is subject teacher OR class teacher
// ============================================

export async function assertTeacherSectionAccess(
  userId: string,
  classId: string,
  sectionId: string,
): Promise<void> {
  // Check 1: Is a class teacher for this section?
  const section = await prisma.section.findFirst({
    where: { id: sectionId, classId, classTeacherId: userId },
  });
  if (section) return;

  // Check 2: Has any TeacherSubject assignment for this section?
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!teacherProfile) throw new AuthorizationError('Teacher profile not found');

  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId: teacherProfile.id, classId, sectionId },
  });
  if (!assignment) {
    throw new AuthorizationError('You are not assigned to this section');
  }
}

// ============================================
// Guard 2: Teacher teaches a SPECIFIC subject in a section
// ============================================

export async function assertTeacherSubjectSectionAccess(
  teacherProfileId: string,
  subjectId: string,
  classId: string,
  sectionId: string,
): Promise<void> {
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId: teacherProfileId, subjectId, classId, sectionId },
  });
  if (!assignment) {
    throw new AuthorizationError(
      'You are not assigned to teach this subject in this section',
    );
  }
}

// ============================================
// Guard 3: Role-aware exam access
// ADMIN/PRINCIPAL = all, TEACHER = creator or assigned sections
// ============================================

export async function assertExamAccess(
  userId: string,
  role: UserRole,
  examId: string,
): Promise<void> {
  if (role === 'ADMIN' || role === 'PRINCIPAL') return;

  const exam = await prisma.exam.findUnique({
    where: { id: examId, deletedAt: null },
    select: {
      createdById: true,
      examClassAssignments: { select: { classId: true, sectionId: true } },
    },
  });
  if (!exam) throw new AuthorizationError('Exam not found');

  // Exam creator always has access
  if (exam.createdById === userId) return;

  if (role === 'TEACHER') {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!teacherProfile) throw new AuthorizationError('Teacher profile not found');

    // Check if teacher has any assignment in the exam's sections
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: teacherProfile.id,
        OR: exam.examClassAssignments.map((a) => ({
          classId: a.classId,
          sectionId: a.sectionId,
        })),
      },
    });
    if (hasAccess) return;
  }

  throw new AuthorizationError('You do not have access to this exam');
}

// ============================================
// Guard 4: Access to a specific student's data
// ADMIN/PRINCIPAL = all, TEACHER = must teach student's section
// FAMILY = must be linked to student
// ============================================

export async function assertStudentDataAccess(
  userId: string,
  role: UserRole,
  studentProfileId: string,
): Promise<void> {
  if (role === 'ADMIN' || role === 'PRINCIPAL') return;

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { classId: true, sectionId: true, userId: true },
  });
  if (!student) throw new AuthorizationError('Student not found');

  // Student accessing own data
  if (role === 'STUDENT' && student.userId === userId) return;

  if (role === 'TEACHER') {
    if (!student.classId || !student.sectionId) {
      throw new AuthorizationError('Student has no class/section assigned');
    }
    await assertTeacherSectionAccess(userId, student.classId, student.sectionId);
    return;
  }

  if (role === 'FAMILY') {
    const link = await prisma.familyStudentLink.findFirst({
      where: {
        familyProfile: { userId },
        studentProfileId,
        isActive: true,
      },
    });
    if (!link) throw new AuthorizationError('No active family link to this student');
    return;
  }

  throw new AuthorizationError('Access denied');
}

// ============================================
// Guard 5: Grading access — exam creator + teachers in assigned sections
// ============================================

export async function assertGradingAccess(
  userId: string,
  role: UserRole,
  examId: string,
): Promise<void> {
  if (role === 'ADMIN') return;

  const exam = await prisma.exam.findUnique({
    where: { id: examId, deletedAt: null },
    select: { createdById: true },
  });
  if (!exam) throw new AuthorizationError('Exam not found');

  // Exam creator always has grading access
  if (exam.createdById === userId) return;

  if (role === 'TEACHER') {
    // Use the broader exam access check (includes section assignments)
    await assertExamAccess(userId, role, examId);
    return;
  }

  throw new AuthorizationError('You do not have grading access for this exam');
}

// ============================================
// Helper: Get teacher profile ID or throw
// ============================================

export async function getTeacherProfileIdOrThrow(userId: string): Promise<string> {
  const profile = await prisma.teacherProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new AuthorizationError('Teacher profile not found');
  return profile.id;
}
