'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import {
  createDatesheetSchema,
  updateDatesheetSchema,
  type CreateDatesheetInput,
  type UpdateDatesheetInput,
} from '@/validations/datesheet-schemas';

function revalidateDatesheetPaths() {
  revalidatePath('/admin/datesheet');
  revalidatePath('/principal/datesheet');
  revalidatePath('/teacher/datesheet');
  revalidatePath('/student/datesheet');
  revalidatePath('/family/datesheet');
}

// ── Create ──

export const createDatesheetAction = safeAction(
  async function createDatesheetAction(input: CreateDatesheetInput): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');

    const parsed = createDatesheetSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const data = parsed.data;

    const academicSession = await prisma.academicSession.findUnique({
      where: { id: data.academicSessionId },
    });
    if (!academicSession) return actionError('Academic session not found');

    const overlap = await prisma.datesheet.findFirst({
      where: {
        academicSessionId: data.academicSessionId,
        examType: data.examType,
        status: { in: ['DRAFT', 'PUBLISHED'] },
      },
    });
    if (overlap) return actionError(`A ${data.examType} datesheet already exists for this session`);

    const datesheet = await prisma.datesheet.create({
      data: {
        title: data.title,
        description: data.description,
        examType: data.examType,
        academicSessionId: data.academicSessionId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        createdById: session.user.id,
      },
    });

    createAuditLog(session.user.id, 'CREATE_DATESHEET', 'DATESHEET', datesheet.id, data).catch(() => {});
    revalidateDatesheetPaths();
    return actionSuccess({ id: datesheet.id });
  },
);

// ── Update ──

export const updateDatesheetAction = safeAction(
  async function updateDatesheetAction(id: string, input: UpdateDatesheetInput): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const parsed = updateDatesheetSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const datesheet = await prisma.datesheet.findUnique({ where: { id } });
    if (!datesheet) return actionError('Datesheet not found');
    if (datesheet.status !== 'DRAFT') return actionError('Only DRAFT datesheets can be edited');

    const data = parsed.data;
    await prisma.datesheet.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.examType && { examType: data.examType }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
    });

    createAuditLog(session.user.id, 'UPDATE_DATESHEET', 'DATESHEET', id, data).catch(() => {});
    revalidateDatesheetPaths();
    return actionSuccess();
  },
);

// ── Publish ──

export const publishDatesheetAction = safeAction(
  async function publishDatesheetAction(id: string): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const datesheet = await prisma.datesheet.findUnique({
      where: { id },
      include: { _count: { select: { entries: true } } },
    });
    if (!datesheet) return actionError('Datesheet not found');
    if (datesheet.status !== 'DRAFT') return actionError('Only DRAFT datesheets can be published');
    if (datesheet._count.entries === 0) return actionError('Cannot publish an empty datesheet');

    await prisma.datesheet.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date(), publishedById: session.user.id },
    });

    createAuditLog(session.user.id, 'PUBLISH_DATESHEET', 'DATESHEET', id).catch(() => {});
    revalidateDatesheetPaths();
    return actionSuccess();
  },
);

// ── Unpublish ──

export const unpublishDatesheetAction = safeAction(
  async function unpublishDatesheetAction(id: string): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const datesheet = await prisma.datesheet.findUnique({ where: { id } });
    if (!datesheet) return actionError('Datesheet not found');
    if (datesheet.status !== 'PUBLISHED') return actionError('Only PUBLISHED datesheets can be unpublished');

    await prisma.datesheet.update({
      where: { id },
      data: { status: 'DRAFT', publishedAt: null, publishedById: null },
    });

    createAuditLog(session.user.id, 'UNPUBLISH_DATESHEET', 'DATESHEET', id).catch(() => {});
    revalidateDatesheetPaths();
    return actionSuccess();
  },
);

// ── Archive ──

export const archiveDatesheetAction = safeAction(
  async function archiveDatesheetAction(id: string): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const datesheet = await prisma.datesheet.findUnique({ where: { id } });
    if (!datesheet) return actionError('Datesheet not found');
    if (datesheet.status === 'ARCHIVED') return actionError('Datesheet is already archived');

    await prisma.datesheet.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    createAuditLog(session.user.id, 'ARCHIVE_DATESHEET', 'DATESHEET', id).catch(() => {});
    revalidateDatesheetPaths();
    return actionSuccess();
  },
);

// ── Delete (DRAFT only) ──

export const deleteDatesheetAction = safeAction(
  async function deleteDatesheetAction(id: string): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const datesheet = await prisma.datesheet.findUnique({ where: { id } });
    if (!datesheet) return actionError('Datesheet not found');
    if (datesheet.status !== 'DRAFT') return actionError('Only DRAFT datesheets can be deleted');

    await prisma.datesheet.delete({ where: { id } });

    createAuditLog(session.user.id, 'DELETE_DATESHEET', 'DATESHEET', id).catch(() => {});
    revalidateDatesheetPaths();
    return actionSuccess();
  },
);
