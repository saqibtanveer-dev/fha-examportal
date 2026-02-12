'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { updateQuestionSchema, type UpdateQuestionInput } from '@/validations/question-schemas';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { createAuditLog } from '@/modules/audit/audit-queries';

export async function updateQuestionAction(
  id: string,
  input: UpdateQuestionInput,
): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const parsed = updateQuestionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');
  }

  const question = await prisma.question.findUnique({
    where: { id, deletedAt: null },
  });
  if (!question) return actionError('Question not found');

  // Teachers can only edit their own questions
  if (session.user.role === 'TEACHER' && question.createdById !== session.user.id) {
    return actionError('You can only edit your own questions');
  }

  // Check if question is in an active exam
  const activeUsage = await prisma.examQuestion.count({
    where: {
      questionId: id,
      exam: { status: { in: ['PUBLISHED', 'ACTIVE'] }, deletedAt: null },
    },
  });
  if (activeUsage > 0) {
    return actionError('Cannot edit a question used in active exams');
  }

  const { mcqOptions, tagIds, ...rest } = parsed.data;
  const questionData = {
    ...rest,
    gradingRubric: rest.gradingRubric as Record<string, unknown> | undefined as any,
  };

  await prisma.$transaction(async (tx) => {
    // Update question fields
    await tx.question.update({
      where: { id },
      data: questionData,
    });

    // Update MCQ options if provided
    if (mcqOptions !== undefined) {
      await tx.mcqOption.deleteMany({ where: { questionId: id } });
      if (mcqOptions && mcqOptions.length > 0) {
        await tx.mcqOption.createMany({
          data: mcqOptions.map((opt) => ({ ...opt, questionId: id })),
        });
      }
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      await tx.questionTag.deleteMany({ where: { questionId: id } });
      if (tagIds && tagIds.length > 0) {
        await tx.questionTag.createMany({
          data: tagIds.map((tagId) => ({ questionId: id, tagId })),
        });
      }
    }
  });

  createAuditLog(session.user.id, 'UPDATE_QUESTION', 'QUESTION', id).catch(() => {});
  revalidatePath('/teacher/questions');
  return actionSuccess();
}

export async function duplicateQuestionAction(id: string): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const original = await prisma.question.findUnique({
    where: { id, deletedAt: null },
    include: { mcqOptions: true, questionTags: true },
  });
  if (!original) return actionError('Question not found');

  const duplicate = await prisma.question.create({
    data: {
      subjectId: original.subjectId,
      classId: original.classId,
      type: original.type,
      title: `${original.title} (Copy)`,
      description: original.description,
      imageUrl: original.imageUrl,
      difficulty: original.difficulty,
      marks: original.marks,
      expectedTime: original.expectedTime,
      modelAnswer: original.modelAnswer,
      gradingRubric: original.gradingRubric ?? undefined,
      explanation: original.explanation,
      createdById: session.user.id,
      mcqOptions: {
        createMany: {
          data: original.mcqOptions.map((opt) => ({
            label: opt.label,
            text: opt.text,
            imageUrl: opt.imageUrl,
            isCorrect: opt.isCorrect,
            sortOrder: opt.sortOrder,
          })),
        },
      },
      questionTags: {
        createMany: {
          data: original.questionTags.map((qt) => ({ tagId: qt.tagId })),
        },
      },
    },
  });

  createAuditLog(session.user.id, 'DUPLICATE_QUESTION', 'QUESTION', duplicate.id, { originalId: id }).catch(() => {});
  revalidatePath('/teacher/questions');
  return actionSuccess({ id: duplicate.id });
}
