'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import {
  createFeeCategorySchema,
  updateFeeCategorySchema,
  type CreateFeeCategoryInput,
  type UpdateFeeCategoryInput,
} from '@/validations/fee-schemas';

import { logger } from '@/lib/logger';
const FEE_PATHS = ['/admin/fees'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Create Category ──

export const createFeeCategoryAction = safeAction(
  async function createFeeCategoryAction(
    input: CreateFeeCategoryInput,
  ): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');
    const parsed = createFeeCategorySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const category = await prisma.feeCategory.create({ data: parsed.data });

    createAuditLog(session.user.id, 'CREATE_FEE_CATEGORY', 'FEE_CATEGORY', category.id, {
      name: parsed.data.name,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidateFeePaths();
    return actionSuccess({ id: category.id });
  },
);

// ── Update Category ──

export const updateFeeCategoryAction = safeAction(
  async function updateFeeCategoryAction(
    id: string,
    input: UpdateFeeCategoryInput,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');
    const parsed = updateFeeCategorySchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const existing = await prisma.feeCategory.findUnique({ where: { id } });
    if (!existing) return actionError('Category not found');

    await prisma.feeCategory.update({ where: { id }, data: parsed.data });

    createAuditLog(session.user.id, 'UPDATE_FEE_CATEGORY', 'FEE_CATEGORY', id, parsed.data).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidateFeePaths();
    return actionSuccess();
  },
);

// ── Delete Category (only if no structures) ──

export const deleteFeeCategoryAction = safeAction(
  async function deleteFeeCategoryAction(id: string): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const category = await prisma.feeCategory.findUnique({
      where: { id },
      include: { _count: { select: { structures: true } } },
    });
    if (!category) return actionError('Category not found');
    if (category._count.structures > 0) {
      return actionError('Cannot delete: category has fee structures. Deactivate instead.');
    }

    await prisma.feeCategory.delete({ where: { id } });

    createAuditLog(session.user.id, 'DELETE_FEE_CATEGORY', 'FEE_CATEGORY', id, {
      name: category.name,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidateFeePaths();
    return actionSuccess();
  },
);
