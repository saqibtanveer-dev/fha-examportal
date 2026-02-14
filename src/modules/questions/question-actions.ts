'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { auth } from '@/lib/auth';
import { createQuestionSchema, type CreateQuestionInput } from '@/validations/question-schemas';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

// ============================================
// Create Question
// ============================================

export async function createQuestionAction(input: CreateQuestionInput): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const parsed = createQuestionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const { mcqOptions, tagIds, gradingRubric, ...questionData } = parsed.data;

  // Teacher-subject enforcement (soft — warn but allow if no assignments exist)
  if (session.user.role === 'TEACHER') {
    const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: session.user.id } });
    if (teacherProfile) {
      const assignments = await prisma.teacherSubject.findMany({ where: { teacherId: teacherProfile.id } });
      if (assignments.length > 0) {
        const assignedSubjectIds = assignments.map((a) => a.subjectId);
        if (!assignedSubjectIds.includes(questionData.subjectId)) {
          return { success: false, error: 'You are not assigned to this subject. Contact admin.' };
        }
      }
    }
  }

  // Validate classId against SubjectClassLink if provided
  if (questionData.classId) {
    const link = await prisma.subjectClassLink.findUnique({
      where: { subjectId_classId: { subjectId: questionData.subjectId, classId: questionData.classId } },
    });
    if (!link || !link.isActive) {
      return { success: false, error: 'This subject is not assigned to the selected class' };
    }
  }

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

  createAuditLog(session.user.id, 'CREATE_QUESTION', 'QUESTION', question.id, { subjectId: questionData.subjectId, classId: questionData.classId, type: questionData.type }).catch(() => {});
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

  createAuditLog(session.user.id, 'DELETE_QUESTION', 'QUESTION', id).catch(() => {});
  revalidatePath('/teacher/questions');
  return { success: true };
}

// ============================================
// Toggle Question Active
// ============================================

export async function toggleQuestionActiveAction(id: string): Promise<ActionResult> {
  const session = await requireRole('TEACHER', 'ADMIN');

  const question = await prisma.question.findUnique({ where: { id, deletedAt: null } });
  if (!question) return { success: false, error: 'Question not found' };

  await prisma.question.update({
    where: { id },
    data: { isActive: !question.isActive },
  });

  createAuditLog(session.user.id, 'TOGGLE_QUESTION_ACTIVE', 'QUESTION', id, { isActive: !question.isActive }).catch(() => {});
  revalidatePath('/teacher/questions');
  return { success: true };
}
