'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import {
  applyFamilyDiscountSchema,
  type ApplyFamilyDiscountInput,
} from '@/validations/fee-schemas';

const FEE_PATHS = ['/admin/fees', '/student/fees', '/family/fees'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Apply discount to multiple assignments in a family ──

export const applyFamilyDiscountAction = safeAction(
  async function applyFamilyDiscountAction(
    input: ApplyFamilyDiscountInput,
  ): Promise<ActionResult<{ appliedCount: number; totalDiscount: number }>> {
    const session = await requireRole('ADMIN');
    const parsed = applyFamilyDiscountSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { familyProfileId, discounts, reason } = parsed.data;

    // Verify family exists
    const family = await prisma.familyProfile.findUnique({
      where: { id: familyProfileId },
      select: { id: true },
    });
    if (!family) return actionError('Family profile not found');

    // Fetch all referenced assignments in one query
    const assignmentIds = discounts.map((d) => d.feeAssignmentId);
    const assignments = await prisma.feeAssignment.findMany({
      where: { id: { in: assignmentIds }, status: { not: 'CANCELLED' } },
      select: { id: true, balanceAmount: true, discountAmount: true, status: true },
    });

    const assignmentMap = new Map(assignments.map((a) => [a.id, a]));

    // Validate all discounts before applying any
    for (const d of discounts) {
      const a = assignmentMap.get(d.feeAssignmentId);
      if (!a) return actionError(`Assignment ${d.feeAssignmentId} not found or cancelled`);
      const balance = Number(a.balanceAmount);
      if (d.amount > balance + 0.01) {
        return actionError(`Discount (${d.amount}) exceeds balance (${balance}) for an assignment`);
      }
    }

    // Apply all discounts in a batch transaction
    const ops = [];
    let appliedCount = 0;
    let totalDiscount = 0;

    for (const d of discounts) {
      const a = assignmentMap.get(d.feeAssignmentId)!;
      const balance = Number(a.balanceAmount);
      const effectiveDiscount = Math.min(d.amount, balance);
      const newBalance = Math.max(0, balance - effectiveDiscount);
      const newDiscountTotal = Number(a.discountAmount) + effectiveDiscount;
      const newStatus = newBalance <= 0 ? 'WAIVED' : a.status;

      ops.push(
        prisma.feeDiscount.create({
          data: {
            feeAssignmentId: d.feeAssignmentId,
            amount: effectiveDiscount,
            reason,
            appliedById: session.user.id,
          },
        }),
      );
      ops.push(
        prisma.feeAssignment.update({
          where: { id: d.feeAssignmentId },
          data: {
            discountAmount: newDiscountTotal,
            balanceAmount: newBalance,
            status: newStatus,
          },
        }),
      );
      appliedCount++;
      totalDiscount += effectiveDiscount;
    }

    await prisma.$transaction(ops);

    createAuditLog(session.user.id, 'APPLY_FAMILY_DISCOUNT', 'FEE_DISCOUNT', familyProfileId, {
      reason,
      appliedCount,
      totalDiscount,
    }).catch((err) => logger.error({ err }, 'Audit log failed for family discount'));

    revalidateFeePaths();
    return actionSuccess({ appliedCount, totalDiscount });
  },
);
