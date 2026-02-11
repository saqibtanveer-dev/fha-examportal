'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { auth } from '@/lib/auth';
import { createQuestionSchema, type CreateQuestionInput } from '@/validations/question-schemas';
import { revalidatePath } from 'next/cache';

type ActionResult = { success: boolean; error?: string; data?: unknown };

// ============================================
// Create Question
// ============================================

export async function createQuestionAction(input: CreateQuestionInput): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const parsed = createQuestionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { mcqOptions, tagIds, gradingRubric, ...questionData } = parsed.data;

  const question = await prisma.question.create({
    data: {
      ...questionData,
      gradingRubric: gradingRubric ? JSON.parse(JSON.stringify(gradingRubric)) : undefined,
      createdById: session.user.id,
      mcqOptions: mcqOptions
        ? { createMany: { data: mcqOptions } }
        : undefined,
      questionTags: tagIds
        ? { createMany: { data: tagIds.map((tagId) => ({ tagId })) } }
        : undefined,
    },
  });

  revalidatePath('/teacher/questions');
  return { success: true, data: { id: question.id } };
}

// ============================================
// Delete Question (Soft)
// ============================================

export async function deleteQuestionAction(id: string): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) return { success: false, error: 'Question not found' };

  // Teachers can only delete their own; admin can delete any
  if (session.user.role === 'TEACHER' && question.createdById !== session.user.id) {
    return { success: false, error: 'You can only delete your own questions' };
  }

  // Check if question is used in any active exam
  const activeExamUsage = await prisma.examQuestion.count({
    where: {
      questionId: id,
      exam: { status: { in: ['PUBLISHED', 'ACTIVE'] }, deletedAt: null },
    },
  });

  if (activeExamUsage > 0) {
    return { success: false, error: 'Cannot delete a question used in active exams' };
  }

  await prisma.question.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  revalidatePath('/teacher/questions');
  return { success: true };
}

// ============================================
// Toggle Question Active
// ============================================

export async function toggleQuestionActiveAction(id: string): Promise<ActionResult> {
  await requireRole('TEACHER', 'ADMIN');

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) return { success: false, error: 'Question not found' };

  await prisma.question.update({
    where: { id },
    data: { isActive: !question.isActive },
  });

  revalidatePath('/teacher/questions');
  return { success: true };
}
