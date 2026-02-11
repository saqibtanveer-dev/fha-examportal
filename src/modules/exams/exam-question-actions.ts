'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';

/** Add a question to an exam (draft only) */
export async function addQuestionToExamAction(
  examId: string,
  questionId: string,
  marks?: number,
): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return { success: false, error: 'Exam not found' };
  if (exam.status !== 'DRAFT') return { success: false, error: 'Only draft exams can be modified' };

  const existing = await prisma.examQuestion.findFirst({
    where: { examId, questionId },
  });
  if (existing) return { success: false, error: 'Question already in exam' };

  const lastOrder = await prisma.examQuestion.findFirst({
    where: { examId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { marks: true },
  });

  await prisma.examQuestion.create({
    data: {
      examId,
      questionId,
      sortOrder: (lastOrder?.sortOrder ?? 0) + 1,
      marks: marks ?? Number(question?.marks ?? 0),
    },
  });

  // Recalculate total marks
  await recalculateExamMarks(examId);

  createAuditLog(session.user.id, 'ADD_EXAM_QUESTION', 'EXAM', examId, { questionId }).catch(() => {});
  revalidatePath(`/teacher/exams/${examId}`);
  return { success: true };
}

/** Remove a question from an exam (draft only) */
export async function removeQuestionFromExamAction(
  examId: string,
  questionId: string,
): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return { success: false, error: 'Exam not found' };
  if (exam.status !== 'DRAFT') return { success: false, error: 'Only draft exams can be modified' };

  await prisma.examQuestion.deleteMany({ where: { examId, questionId } });
  await recalculateExamMarks(examId);

  createAuditLog(session.user.id, 'REMOVE_EXAM_QUESTION', 'EXAM', examId, { questionId }).catch(() => {});
  revalidatePath(`/teacher/exams/${examId}`);
  return { success: true };
}

/** Reorder questions in an exam */
export async function reorderExamQuestionsAction(
  examId: string,
  orderedQuestionIds: string[],
): Promise<ActionResult> {
  await requireRole('TEACHER', 'ADMIN');

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return { success: false, error: 'Exam not found' };
  if (exam.status !== 'DRAFT') return { success: false, error: 'Only draft exams can be modified' };

  await prisma.$transaction(
    orderedQuestionIds.map((questionId, index) =>
      prisma.examQuestion.updateMany({
        where: { examId, questionId },
        data: { sortOrder: index + 1 },
      }),
    ),
  );

  revalidatePath(`/teacher/exams/${examId}`);
  return { success: true };
}

/** Recalculate total marks for an exam based on its questions */
async function recalculateExamMarks(examId: string) {
  const agg = await prisma.examQuestion.aggregate({
    where: { examId },
    _sum: { marks: true },
  });

  await prisma.exam.update({
    where: { id: examId },
    data: { totalMarks: agg._sum.marks ?? 0 },
  });
}
