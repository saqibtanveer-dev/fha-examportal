'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import {
  createExamGroupSchema,
  updateExamGroupSchema,
  linkExamSchema,
  type CreateExamGroupInput,
  type UpdateExamGroupInput,
  type LinkExamInput,
} from '@/validations/result-term-schemas';
import { REQUIRED_TOTAL_WEIGHT, MAX_EXAM_GROUPS } from '../engine/report-constants';

// ============================================
// Add Exam Group
// ============================================

export const addExamGroupAction = safeAction(async function addExamGroupAction(
  input: CreateExamGroupInput,
): Promise<ActionResult<{ id: string }>> {
  await requireRole('ADMIN', 'PRINCIPAL');

  const parsed = createExamGroupSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Invalid input');

  const term = await prisma.resultTerm.findUnique({
    where: { id: parsed.data.resultTermId },
    include: { _count: { select: { examGroups: true } } },
  });
  if (!term) return actionError('Result term not found');
  if (term.isPublished) return actionError('Cannot modify a published result term');
  if (term._count.examGroups >= MAX_EXAM_GROUPS) {
    return actionError(`Cannot exceed ${MAX_EXAM_GROUPS} exam groups per result term`);
  }

  const existingName = await prisma.resultExamGroup.findFirst({
    where: { resultTermId: parsed.data.resultTermId, name: parsed.data.name },
  });
  if (existingName) return actionError('A group with this name already exists in this term');

  const { bestOfCount, aggregateMode, ...rest } = parsed.data;

  if (aggregateMode === 'BEST_OF' && (!bestOfCount || bestOfCount < 1)) {
    return actionError('bestOfCount is required when aggregateMode is BEST_OF');
  }

  const group = await prisma.resultExamGroup.create({
    data: {
      ...rest,
      aggregateMode,
      bestOfCount: aggregateMode === 'BEST_OF' ? bestOfCount : null,
    },
  });

  revalidatePath(`/admin/reports/result-terms/${parsed.data.resultTermId}`);
  return actionSuccess({ id: group.id });
});

// ============================================
// Update Exam Group
// ============================================

export const updateExamGroupAction = safeAction(async function updateExamGroupAction(
  groupId: string,
  input: UpdateExamGroupInput,
): Promise<ActionResult> {
  await requireRole('ADMIN', 'PRINCIPAL');

  const parsed = updateExamGroupSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Invalid input');

  const group = await prisma.resultExamGroup.findUnique({
    where: { id: groupId },
    include: { resultTerm: { select: { isPublished: true } } },
  });
  if (!group) return actionError('Exam group not found');
  if (group.resultTerm.isPublished) return actionError('Cannot modify a published result term');

  const { bestOfCount, aggregateMode, ...rest } = parsed.data;
  const newMode = aggregateMode ?? group.aggregateMode;

  if (newMode === 'BEST_OF' && bestOfCount === null) {
    return actionError('bestOfCount cannot be null when aggregateMode is BEST_OF');
  }

  await prisma.resultExamGroup.update({
    where: { id: groupId },
    data: {
      ...rest,
      aggregateMode,
      bestOfCount: newMode !== 'BEST_OF' ? null : (bestOfCount ?? group.bestOfCount),
    },
  });

  revalidatePath(`/admin/reports/result-terms/${group.resultTermId}`);
  return actionSuccess();
});

// ============================================
// Remove Exam Group
// ============================================

export const removeExamGroupAction = safeAction(async function removeExamGroupAction(
  groupId: string,
): Promise<ActionResult> {
  await requireRole('ADMIN', 'PRINCIPAL');

  const group = await prisma.resultExamGroup.findUnique({
    where: { id: groupId },
    include: { resultTerm: { select: { isPublished: true, id: true } } },
  });
  if (!group) return actionError('Exam group not found');
  if (group.resultTerm.isPublished) return actionError('Cannot modify a published result term');

  await prisma.resultExamGroup.delete({ where: { id: groupId } });
  revalidatePath(`/admin/reports/result-terms/${group.resultTerm.id}`);
  return actionSuccess();
});

// ============================================
// Link Exam to Group
// ============================================

export const linkExamToGroupAction = safeAction(async function linkExamToGroupAction(
  input: LinkExamInput,
): Promise<ActionResult<{ id: string }>> {
  await requireRole('ADMIN', 'PRINCIPAL');

  const parsed = linkExamSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Invalid input');

  const group = await prisma.resultExamGroup.findUnique({
    where: { id: parsed.data.examGroupId },
    include: { resultTerm: { select: { isPublished: true, classId: true, sectionId: true, id: true } } },
  });
  if (!group) return actionError('Exam group not found');
  if (group.resultTerm.isPublished) return actionError('Cannot modify a published result term');

  const exam = await prisma.exam.findUnique({
    where: { id: parsed.data.examId, deletedAt: null },
    select: { id: true, examClassAssignments: { select: { classId: true, sectionId: true } } },
  });
  if (!exam) return actionError('Exam not found');

  const isAssignedToClass = exam.examClassAssignments.some(
    (a) =>
      a.classId === group.resultTerm.classId
      && (!group.resultTerm.sectionId || a.sectionId === group.resultTerm.sectionId),
  );
  if (!isAssignedToClass) {
    return actionError(
      group.resultTerm.sectionId
        ? 'This exam is not assigned to the result term section'
        : 'This exam is not assigned to the result term class',
    );
  }

  const duplicate = await prisma.resultExamLink.findFirst({
    where: { examGroupId: parsed.data.examGroupId, examId: parsed.data.examId },
  });
  if (duplicate) return actionError('This exam is already linked to this group');

  const link = await prisma.resultExamLink.create({
    data: { examGroupId: parsed.data.examGroupId, examId: parsed.data.examId },
  });

  revalidatePath(`/admin/reports/result-terms/${group.resultTerm.id}`);
  return actionSuccess({ id: link.id });
});

// ============================================
// Unlink Exam from Group
// ============================================

export const unlinkExamFromGroupAction = safeAction(async function unlinkExamFromGroupAction(
  linkId: string,
): Promise<ActionResult> {
  await requireRole('ADMIN', 'PRINCIPAL');

  const link = await prisma.resultExamLink.findUnique({
    where: { id: linkId },
    include: {
      examGroup: {
        include: { resultTerm: { select: { isPublished: true, id: true } } },
      },
    },
  });
  if (!link) return actionError('Exam link not found');
  if (link.examGroup.resultTerm.isPublished) return actionError('Cannot modify a published result term');

  await prisma.resultExamLink.delete({ where: { id: linkId } });
  revalidatePath(`/admin/reports/result-terms/${link.examGroup.resultTerm.id}`);
  return actionSuccess();
});

// ============================================
// Auto-link exams by type
// ============================================

export const autoLinkExamsByTypeAction = safeAction(async function autoLinkExamsByTypeAction(
  resultTermId: string,
): Promise<ActionResult<{ linked: number }>> {
  await requireRole('ADMIN', 'PRINCIPAL');

  const term = await prisma.resultTerm.findUnique({
    where: { id: resultTermId },
    include: {
      examGroups: {
        include: { examLinks: { select: { examId: true } } },
      },
    },
  });
  if (!term) return actionError('Result term not found');
  if (term.isPublished) return actionError('Cannot modify a published result term');

  const exams = await prisma.exam.findMany({
    where: {
      deletedAt: null,
      academicSessionId: term.academicSessionId,
      examClassAssignments: {
        some: {
          classId: term.classId,
          ...(term.sectionId ? { sectionId: term.sectionId } : {}),
        },
      },
      status: { in: ['COMPLETED', 'ACTIVE', 'PUBLISHED'] },
    },
    select: { id: true, type: true },
  });

  let linked = 0;
  for (const group of term.examGroups) {
    const upperName = group.name.toUpperCase();
    const matchingExams = exams.filter((e) => {
      const t = e.type.toUpperCase();
      return (
        upperName.includes(t) ||
        (upperName.includes('QUIZ') && t === 'QUIZ') ||
        (upperName.includes('MIDTERM') && t === 'MIDTERM') ||
        (upperName.includes('FINAL') && t === 'FINAL')
      );
    });

    const alreadyLinked = new Set(group.examLinks.map((l) => l.examId));
    const toLink = matchingExams.filter((e) => !alreadyLinked.has(e.id));

    if (toLink.length > 0) {
      await prisma.resultExamLink.createMany({
        data: toLink.map((e) => ({ examGroupId: group.id, examId: e.id })),
        skipDuplicates: true,
      });
      linked += toLink.length;
    }
  }

  revalidatePath(`/admin/reports/result-terms/${resultTermId}`);
  return actionSuccess({ linked });
});
