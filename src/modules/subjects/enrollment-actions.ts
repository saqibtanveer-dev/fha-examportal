'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import { validateElectiveGroupConflict } from '@/lib/enrollment-helpers';
import { z } from 'zod/v4';

import { logger } from '@/lib/logger';
// ── Schemas ──

const enrollStudentSchema = z.object({
  studentProfileId: z.string().uuid(),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
});

const bulkEnrollSchema = z.object({
  studentProfileIds: z.array(z.string().uuid()).min(1),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
});

const unenrollStudentSchema = z.object({
  studentProfileId: z.string().uuid(),
  subjectId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
});

const changeEnrollmentSchema = z.object({
  studentProfileId: z.string().uuid(),
  oldSubjectId: z.string().uuid(),
  newSubjectId: z.string().uuid(),
  classId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
});

// ── Actions ──

function revalidateEnrollmentPaths() {
  revalidatePath('/admin/subjects');
  revalidatePath('/admin/timetable');
  revalidatePath('/teacher/attendance');
}

/** Enroll a single student in a subject */
export const enrollStudentInSubjectAction = safeAction(
  async function enrollStudentInSubject(
    input: z.infer<typeof enrollStudentSchema>,
  ): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');

    const parsed = enrollStudentSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    // Verify subject-class link exists and is elective
    const link = await prisma.subjectClassLink.findUnique({
      where: { subjectId_classId: { subjectId: data.subjectId, classId: data.classId } },
    });
    if (!link) return actionError('Subject is not linked to this class');

    // Check elective group conflict — student can't take two subjects from same group
    if (link.isElective) {
      const conflict = await validateElectiveGroupConflict(
        data.studentProfileId,
        data.subjectId,
        data.classId,
        data.academicSessionId,
      );
      if (conflict) {
        return actionError(`Student is already enrolled in "${conflict}" from the same elective group`);
      }
    }

    const enrollment = await prisma.studentSubjectEnrollment.upsert({
      where: {
        studentProfileId_subjectId_academicSessionId: {
          studentProfileId: data.studentProfileId,
          subjectId: data.subjectId,
          academicSessionId: data.academicSessionId,
        },
      },
      update: { isActive: true },
      create: data,
    });

    createAuditLog(session.user.id, 'ENROLL_STUDENT_SUBJECT', 'STUDENT_SUBJECT_ENROLLMENT', enrollment.id, data).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidateEnrollmentPaths();
    return actionSuccess({ id: enrollment.id });
  },
);

/** Bulk enroll multiple students in a subject */
export const bulkEnrollStudentsAction = safeAction(
  async function bulkEnrollStudents(
    input: z.infer<typeof bulkEnrollSchema>,
  ): Promise<ActionResult<{ count: number }>> {
    const session = await requireRole('ADMIN');

    const parsed = bulkEnrollSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    // Verify subject-class link exists
    const link = await prisma.subjectClassLink.findUnique({
      where: { subjectId_classId: { subjectId: data.subjectId, classId: data.classId } },
    });
    if (!link) return actionError('Subject is not linked to this class');

    // Validate elective group conflicts for all students
    if (link.isElective) {
      for (const studentProfileId of data.studentProfileIds) {
        const conflict = await validateElectiveGroupConflict(
          studentProfileId,
          data.subjectId,
          data.classId,
          data.academicSessionId,
        );
        if (conflict) {
          return actionError(`A student is already enrolled in "${conflict}" from the same elective group`);
        }
      }
    }

    // Use a transaction for bulk upsert
    const results = await prisma.$transaction(
      data.studentProfileIds.map((studentProfileId) =>
        prisma.studentSubjectEnrollment.upsert({
          where: {
            studentProfileId_subjectId_academicSessionId: {
              studentProfileId,
              subjectId: data.subjectId,
              academicSessionId: data.academicSessionId,
            },
          },
          update: { isActive: true },
          create: {
            studentProfileId,
            subjectId: data.subjectId,
            classId: data.classId,
            academicSessionId: data.academicSessionId,
          },
        }),
      ),
    );

    createAuditLog(session.user.id, 'BULK_ENROLL_STUDENTS', 'STUDENT_SUBJECT_ENROLLMENT', data.subjectId, {
      count: results.length,
      classId: data.classId,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidateEnrollmentPaths();
    return actionSuccess({ count: results.length });
  },
);

/** Unenroll a student from a subject (soft delete) */
export const unenrollStudentFromSubjectAction = safeAction(
  async function unenrollStudentFromSubject(
    input: z.infer<typeof unenrollStudentSchema>,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const parsed = unenrollStudentSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    await prisma.studentSubjectEnrollment.updateMany({
      where: {
        studentProfileId: data.studentProfileId,
        subjectId: data.subjectId,
        academicSessionId: data.academicSessionId,
      },
      data: { isActive: false },
    });

    createAuditLog(session.user.id, 'UNENROLL_STUDENT_SUBJECT', 'STUDENT_SUBJECT_ENROLLMENT', data.studentProfileId, data).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidateEnrollmentPaths();
    return actionSuccess();
  },
);

/** Change a student's elective enrollment from one subject to another (atomic) */
export const changeStudentEnrollmentAction = safeAction(
  async function changeStudentEnrollment(
    input: z.infer<typeof changeEnrollmentSchema>,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const parsed = changeEnrollmentSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    if (data.oldSubjectId === data.newSubjectId) {
      return actionError('New subject is the same as the current one');
    }

    // Verify the new subject-class link exists and is elective
    const newLink = await prisma.subjectClassLink.findUnique({
      where: { subjectId_classId: { subjectId: data.newSubjectId, classId: data.classId } },
      select: { isElective: true, electiveGroupName: true },
    });
    if (!newLink?.isElective) return actionError('New subject is not an elective for this class');

    // Verify old subject is in the same elective group
    const oldLink = await prisma.subjectClassLink.findUnique({
      where: { subjectId_classId: { subjectId: data.oldSubjectId, classId: data.classId } },
      select: { isElective: true, electiveGroupName: true },
    });
    if (!oldLink?.isElective) return actionError('Old subject is not an elective for this class');
    if (oldLink.electiveGroupName !== newLink.electiveGroupName) {
      return actionError('Subjects are not in the same elective group');
    }

    // Atomic: deactivate old enrollment + create/activate new enrollment
    await prisma.$transaction([
      prisma.studentSubjectEnrollment.updateMany({
        where: {
          studentProfileId: data.studentProfileId,
          subjectId: data.oldSubjectId,
          academicSessionId: data.academicSessionId,
          isActive: true,
        },
        data: { isActive: false },
      }),
      prisma.studentSubjectEnrollment.upsert({
        where: {
          studentProfileId_subjectId_academicSessionId: {
            studentProfileId: data.studentProfileId,
            subjectId: data.newSubjectId,
            academicSessionId: data.academicSessionId,
          },
        },
        update: { isActive: true },
        create: {
          studentProfileId: data.studentProfileId,
          subjectId: data.newSubjectId,
          classId: data.classId,
          academicSessionId: data.academicSessionId,
        },
      }),
    ]);

    createAuditLog(session.user.id, 'CHANGE_STUDENT_ENROLLMENT', 'STUDENT_SUBJECT_ENROLLMENT', data.studentProfileId, {
      oldSubjectId: data.oldSubjectId,
      newSubjectId: data.newSubjectId,
      classId: data.classId,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidateEnrollmentPaths();
    return actionSuccess();
  },
);

