'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import {
  createExamSchema,
  updateExamSchema,
  type CreateExamInput,
  type UpdateExamInput,
} from '@/validations/exam-schemas';
import { revalidatePath } from 'next/cache';

type ActionResult = { success: boolean; error?: string; data?: unknown };

// ============================================
// Create Exam
// ============================================

export async function createExamAction(input: CreateExamInput): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const parsed = createExamSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { questions, classAssignments, scheduledStartAt, scheduledEndAt, ...examData } = parsed.data;

  const exam = await prisma.exam.create({
    data: {
      ...examData,
      scheduledStartAt: scheduledStartAt ? new Date(scheduledStartAt) : undefined,
      scheduledEndAt: scheduledEndAt ? new Date(scheduledEndAt) : undefined,
      createdById: session.user.id,
      examQuestions: {
        createMany: { data: questions },
      },
      examClassAssignments: {
        createMany: {
          data: classAssignments.map((a) => ({
            classId: a.classId,
            sectionId: a.sectionId ?? null,
          })),
        },
      },
    },
  });

  revalidatePath('/teacher/exams');
  return { success: true, data: { id: exam.id } };
}

// ============================================
// Update Exam (Draft only)
// ============================================

export async function updateExamAction(id: string, input: UpdateExamInput): Promise<ActionResult> {
  await requireRole('TEACHER', 'ADMIN');

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) return { success: false, error: 'Exam not found' };
  if (exam.status !== 'DRAFT') return { success: false, error: 'Only draft exams can be edited' };

  const parsed = updateExamSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  await prisma.exam.update({ where: { id }, data: parsed.data });
  revalidatePath('/teacher/exams');
  return { success: true };
}

// ============================================
// Publish Exam
// ============================================

export async function publishExamAction(id: string): Promise<ActionResult> {
  await requireRole('TEACHER', 'ADMIN');

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: { examQuestions: true, examClassAssignments: true },
  });

  if (!exam) return { success: false, error: 'Exam not found' };
  if (exam.status !== 'DRAFT') return { success: false, error: 'Only draft exams can be published' };
  if (exam.examQuestions.length === 0) return { success: false, error: 'Add questions before publishing' };
  if (exam.examClassAssignments.length === 0) return { success: false, error: 'Assign to classes first' };

  await prisma.exam.update({ where: { id }, data: { status: 'PUBLISHED' } });
  revalidatePath('/teacher/exams');
  return { success: true };
}

// ============================================
// Delete Exam (Soft)
// ============================================

export async function deleteExamAction(id: string): Promise<ActionResult> {
  await requireRole('TEACHER', 'ADMIN');

  const sessions = await prisma.examSession.count({ where: { examId: id } });
  if (sessions > 0) return { success: false, error: 'Cannot delete exam with sessions' };

  await prisma.exam.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath('/teacher/exams');
  return { success: true };
}
