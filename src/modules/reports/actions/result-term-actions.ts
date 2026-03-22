'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import {
  createResultTermSchema,
  updateResultTermSchema,
  type CreateResultTermInput,
  type UpdateResultTermInput,
} from '@/validations/result-term-schemas';

import { logger } from '@/lib/logger';
const REPORTS_PATH = '/admin/reports';

// ============================================
// Create Result Term
// ============================================

export const createResultTermAction = safeAction(async function createResultTermAction(
  input: CreateResultTermInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole('ADMIN', 'PRINCIPAL');

  const parsed = createResultTermSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Invalid input');

  const { name, description, academicSessionId, classId, sectionId } = parsed.data;

  if (sectionId) {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, classId },
      select: { id: true },
    });
    if (!section) {
      return actionError('Selected section does not belong to the selected class');
    }
  }

  const existing = await prisma.resultTerm.findFirst({
    where: {
      name,
      academicSessionId,
      classId,
      ...(sectionId ? { sectionId } : { sectionId: null }),
    },
  });
  if (existing) {
    return actionError(
      sectionId
        ? 'A result term with this name already exists for this class, section, and session'
        : 'A result term with this name already exists for this class and session',
    );
  }

  const term = await prisma.resultTerm.create({
    data: { name, description, academicSessionId, classId, sectionId: sectionId ?? null },
  });

  createAuditLog(session.user.id, 'CREATE_RESULT_TERM', 'RESULT_TERM', term.id, { name }).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath(REPORTS_PATH);
  return actionSuccess({ id: term.id });
});

// ============================================
// Update Result Term
// ============================================

export const updateResultTermAction = safeAction(async function updateResultTermAction(
  id: string,
  input: UpdateResultTermInput,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN', 'PRINCIPAL');

  const term = await prisma.resultTerm.findUnique({ where: { id } });
  if (!term) return actionError('Result term not found');
  if (term.isPublished) return actionError('Cannot edit a published result term');

  const parsed = updateResultTermSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Invalid input');

  await prisma.resultTerm.update({ where: { id }, data: parsed.data });
  createAuditLog(session.user.id, 'UPDATE_RESULT_TERM', 'RESULT_TERM', id, parsed.data).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath(`${REPORTS_PATH}/result-terms/${id}`);
  revalidatePath(REPORTS_PATH);
  return actionSuccess();
});

// ============================================
// Delete Result Term
// ============================================

export const deleteResultTermAction = safeAction(async function deleteResultTermAction(
  id: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN', 'PRINCIPAL');

  const term = await prisma.resultTerm.findUnique({
    where: { id },
    include: { _count: { select: { consolidatedResults: true } } },
  });
  if (!term) return actionError('Result term not found');
  if (term.isPublished) return actionError('Cannot delete a published result term. Unpublish it first.');
  if (term._count.consolidatedResults > 0) {
    return actionError('Cannot delete a term with computed results. Clear results first.');
  }

  await prisma.resultTerm.delete({ where: { id } });
  createAuditLog(session.user.id, 'DELETE_RESULT_TERM', 'RESULT_TERM', id).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath(REPORTS_PATH);
  return actionSuccess();
});

// ============================================
// Publish Result Term
// ============================================

export const publishResultTermAction = safeAction(async function publishResultTermAction(
  id: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN', 'PRINCIPAL');

  const term = await prisma.resultTerm.findUnique({
    where: { id },
    include: { _count: { select: { consolidatedResults: true, consolidatedSummaries: true } } },
  });
  if (!term) return actionError('Result term not found');
  if (term.isPublished) return actionError('Already published');
  if (term._count.consolidatedResults === 0) return actionError('No computed results to publish. Run consolidation first.');

  await prisma.resultTerm.update({
    where: { id },
    data: { isPublished: true, publishedAt: new Date() },
  });

  createAuditLog(session.user.id, 'PUBLISH_RESULT_TERM', 'RESULT_TERM', id).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath(REPORTS_PATH);
  revalidatePath(`${REPORTS_PATH}/result-terms/${id}`);
  return actionSuccess();
});

// ============================================
// Unpublish Result Term
// ============================================

export const unpublishResultTermAction = safeAction(async function unpublishResultTermAction(
  id: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN', 'PRINCIPAL');

  const term = await prisma.resultTerm.findUnique({ where: { id } });
  if (!term) return actionError('Result term not found');
  if (!term.isPublished) return actionError('Not published');

  await prisma.resultTerm.update({
    where: { id },
    data: { isPublished: false },
  });

  createAuditLog(session.user.id, 'UNPUBLISH_RESULT_TERM', 'RESULT_TERM', id).catch((err) => logger.error({ err }, 'Audit log failed'));
  revalidatePath(REPORTS_PATH);
  revalidatePath(`${REPORTS_PATH}/result-terms/${id}`);
  return actionSuccess();
});
