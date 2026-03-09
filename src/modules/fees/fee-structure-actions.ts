'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import {
  createFeeStructureSchema,
  updateFeeStructureSchema,
  bulkCreateStructuresSchema,
  type CreateFeeStructureInput,
  type UpdateFeeStructureInput,
  type BulkCreateStructuresInput,
} from '@/validations/fee-schemas';

const FEE_PATHS = ['/admin/fees', '/admin/fees/structures'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Create Structure ──

export const createFeeStructureAction = safeAction(
  async function createFeeStructureAction(
    input: CreateFeeStructureInput,
  ): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');
    const parsed = createFeeStructureSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const structure = await prisma.feeStructure.create({
      data: { ...parsed.data, amount: parsed.data.amount },
    });

    createAuditLog(session.user.id, 'CREATE_FEE_STRUCTURE', 'FEE_STRUCTURE', structure.id, {
      categoryId: parsed.data.categoryId,
      classId: parsed.data.classId,
      amount: parsed.data.amount,
    }).catch(() => {});

    revalidateFeePaths();
    return actionSuccess({ id: structure.id });
  },
);

// ── Update Structure ──

export const updateFeeStructureAction = safeAction(
  async function updateFeeStructureAction(
    id: string,
    input: UpdateFeeStructureInput,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');
    const parsed = updateFeeStructureSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const existing = await prisma.feeStructure.findUnique({ where: { id } });
    if (!existing) return actionError('Fee structure not found');

    await prisma.feeStructure.update({ where: { id }, data: parsed.data });

    createAuditLog(session.user.id, 'UPDATE_FEE_STRUCTURE', 'FEE_STRUCTURE', id, parsed.data).catch(() => {});
    revalidateFeePaths();
    return actionSuccess();
  },
);

// ── Bulk Create (one category → many classes) ──

export const bulkCreateStructuresAction = safeAction(
  async function bulkCreateStructuresAction(
    input: BulkCreateStructuresInput,
  ): Promise<ActionResult<{ count: number }>> {
    const session = await requireRole('ADMIN');
    const parsed = bulkCreateStructuresSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { categoryId, academicSessionId, classAmounts } = parsed.data;

    // Check category exists
    const category = await prisma.feeCategory.findUnique({ where: { id: categoryId } });
    if (!category) return actionError('Category not found');

    const results = await prisma.$transaction(
      classAmounts.map((ca) =>
        prisma.feeStructure.upsert({
          where: {
            categoryId_classId_academicSessionId: {
              categoryId,
              classId: ca.classId,
              academicSessionId,
            },
          },
          create: {
            categoryId,
            classId: ca.classId,
            academicSessionId,
            amount: ca.amount,
          },
          update: {
            amount: ca.amount,
            isActive: true,
          },
        }),
      ),
    );

    createAuditLog(session.user.id, 'BULK_CREATE_FEE_STRUCTURES', 'FEE_STRUCTURE', categoryId, {
      categoryId,
      academicSessionId,
      classCount: classAmounts.length,
    }).catch(() => {});

    revalidateFeePaths();
    return actionSuccess({ count: results.length });
  },
);
