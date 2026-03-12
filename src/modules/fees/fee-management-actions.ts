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
  cancelAssignmentSchema,
  type CancelAssignmentInput,
} from '@/validations/fee-schemas';
import { getCurrentAcademicSessionId, findFeeSettings } from './fee-queries';

const FEE_PATHS = ['/admin/fees', '/admin/fees/generate'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Cancel assignment ──

export const cancelAssignmentAction = safeAction(
  async function cancelAssignmentAction(
    input: CancelAssignmentInput,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');
    const parsed = cancelAssignmentSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { feeAssignmentId, reason } = parsed.data;

    const assignment = await prisma.feeAssignment.findUnique({
      where: { id: feeAssignmentId },
      include: { payments: { where: { status: 'COMPLETED' } } },
    });

    if (!assignment) return actionError('Assignment not found');
    if (assignment.status === 'CANCELLED') return actionError('Already cancelled');
    if (assignment.payments.length > 0) {
      return actionError('Cannot cancel: payments exist. Reverse payments first.');
    }

    await prisma.feeAssignment.update({
      where: { id: feeAssignmentId },
      data: {
        status: 'CANCELLED',
        cancelledById: session.user.id,
        cancelReason: reason,
      },
    });

    createAuditLog(session.user.id, 'CANCEL_FEE_ASSIGNMENT', 'FEE_ASSIGNMENT', feeAssignmentId, {
      reason,
    }).catch((err) => logger.error({ err }, 'Audit log failed for cancel assignment'));

    revalidateFeePaths();
    return actionSuccess();
  },
);

// ── Apply late fees (bulk) ──

export const applyLateFeesAction = safeAction(
  async function applyLateFeesAction(): Promise<ActionResult<{ updated: number }>> {
    const session = await requireRole('ADMIN');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    const settings = await findFeeSettings(academicSessionId);
    const lateFeePerDay = Number(settings?.lateFeePerDay ?? 0);
    const maxLateFee = Number(settings?.maxLateFee ?? 0);
    const graceDays = settings?.gracePeriodDays ?? 0;

    if (lateFeePerDay <= 0) return actionError('Late fee per day is not configured');

    const today = new Date();
    let updated = 0;
    let cursor: string | undefined;

    // Cursor-based pagination to avoid loading all overdue assignments into memory
    const PAGE_SIZE = 100;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const overdueAssignments = await prisma.feeAssignment.findMany({
        where: {
          academicSessionId,
          status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
          balanceAmount: { gt: 0 },
          dueDate: { lt: today },
        },
        take: PAGE_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
        select: { id: true, dueDate: true, lateFeesApplied: true },
      });

      if (overdueAssignments.length === 0) break;
      cursor = overdueAssignments[overdueAssignments.length - 1]!.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any[] = [];
      for (const a of overdueAssignments) {
        const daysLate = Math.floor(
          (today.getTime() - a.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        ) - graceDays;

        if (daysLate <= 0) continue;

        let lateFee = daysLate * lateFeePerDay;
        if (maxLateFee > 0) lateFee = Math.min(lateFee, maxLateFee);

        const currentLateFee = Number(a.lateFeesApplied);
        if (lateFee <= currentLateFee) continue;

        const additionalFee = lateFee - currentLateFee;
        updates.push(
          prisma.feeAssignment.update({
            where: { id: a.id },
            data: {
              lateFeesApplied: lateFee,
              totalAmount: { increment: additionalFee },
              balanceAmount: { increment: additionalFee },
              status: 'OVERDUE',
            },
          }),
        );
        updated++;
      }

      if (updates.length > 0) {
        await prisma.$transaction(updates);
      }

      if (overdueAssignments.length < PAGE_SIZE) break;
    }

    createAuditLog(session.user.id, 'APPLY_LATE_FEES', 'FEE_ASSIGNMENT', academicSessionId, {
      updated,
    }).catch((err) => logger.error({ err }, 'Audit log failed for late fees'));

    revalidateFeePaths();
    return actionSuccess({ updated });
  },
);
