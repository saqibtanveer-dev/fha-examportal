'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction, safeFetchAction } from '@/lib/safe-action';
import { z } from 'zod/v4';

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

    createAuditLog(session.user.id, 'ENROLL_STUDENT_SUBJECT', 'STUDENT_SUBJECT_ENROLLMENT', enrollment.id, data).catch(() => {});
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
    }).catch(() => {});
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

    createAuditLog(session.user.id, 'UNENROLL_STUDENT_SUBJECT', 'STUDENT_SUBJECT_ENROLLMENT', data.studentProfileId, data).catch(() => {});
    revalidateEnrollmentPaths();
    return actionSuccess();
  },
);

/** Fetch enrollments for a class/subject/session (for UI) */
export const fetchEnrollmentsBySubjectAction = safeFetchAction(async (
  subjectId: string,
  classId: string,
  academicSessionId: string,
) => {
  await requireRole('ADMIN', 'TEACHER');

  return prisma.studentSubjectEnrollment.findMany({
    where: { subjectId, classId, academicSessionId, isActive: true },
    select: {
      id: true,
      studentProfileId: true,
      studentProfile: {
        select: {
          id: true,
          rollNumber: true,
          sectionId: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { studentProfile: { rollNumber: 'asc' } },
  });
});
