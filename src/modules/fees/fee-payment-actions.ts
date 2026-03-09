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
  recordPaymentSchema,
  applyDiscountSchema,
  reversePaymentSchema,
  type RecordPaymentInput,
  type ApplyDiscountInput,
  type ReversePaymentInput,
} from '@/validations/fee-schemas';
import { getCurrentAcademicSessionId, findFeeSettings } from './fee-queries';
import { generateReceiptNumber } from './receipt-generator';

const FEE_PATHS = ['/admin/fees', '/student/fees', '/family/fees'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Record individual payment ──

export const recordPaymentAction = safeAction(
  async function recordPaymentAction(
    input: RecordPaymentInput,
  ): Promise<ActionResult<{ receiptNumber: string }>> {
    const session = await requireRole('ADMIN');
    const parsed = recordPaymentSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { feeAssignmentId, amount, paymentMethod, referenceNumber } = parsed.data;

    const assignment = await prisma.feeAssignment.findUnique({
      where: { id: feeAssignmentId },
    });
    if (!assignment) return actionError('Fee assignment not found');
    if (assignment.status === 'CANCELLED') return actionError('Cannot pay a cancelled assignment');
    if (assignment.status === 'WAIVED') return actionError('This fee has been waived');
    if (assignment.status === 'PAID') return actionError('This fee is already fully paid');

    const balance = Number(assignment.balanceAmount);
    // Clamp to actual balance — excess becomes advance credit
    const effectiveAmount = Math.min(amount, balance);
    const excessAmount = Math.round(Math.max(0, amount - balance) * 100) / 100;

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');
    const settings = await findFeeSettings(academicSessionId);
    const receiptNumber = await generateReceiptNumber(settings?.receiptPrefix ?? 'FRCP');

    const newPaid = Number(assignment.paidAmount) + effectiveAmount;
    const newBalance = Math.max(0, Number(assignment.totalAmount) - newPaid);
    const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIAL';

    await prisma.$transaction([
      prisma.feePayment.create({
        data: {
          feeAssignmentId,
          amount: effectiveAmount,
          paymentMethod,
          referenceNumber,
          receiptNumber,
          recordedById: session.user.id,
        },
      }),
      prisma.feeAssignment.update({
        where: { id: feeAssignmentId },
        data: {
          paidAmount: newPaid,
          balanceAmount: Math.max(0, newBalance),
          status: newStatus,
        },
      }),
    ]);

    // Create advance credit for excess payment
    if (excessAmount > 0) {
      await prisma.feeCredit.create({
        data: {
          studentProfileId: assignment.studentProfileId,
          academicSessionId,
          amount: excessAmount,
          remainingAmount: excessAmount,
          reason: `Overpayment credit from receipt ${receiptNumber}`,
          referenceNumber: receiptNumber,
          createdById: session.user.id,
        },
      }).catch((err) => logger.error({ err }, 'Failed to create advance credit'));
    }

    createAuditLog(session.user.id, 'RECORD_FEE_PAYMENT', 'FEE_PAYMENT', receiptNumber, {
      feeAssignmentId,
      amount: effectiveAmount,
      excessCredit: excessAmount > 0 ? excessAmount : undefined,
      paymentMethod,
    }).catch((err) => logger.error({ err }, 'Audit log failed for payment'));

    revalidateFeePaths();
    return actionSuccess({ receiptNumber });
  },
);

// ── Apply discount ──

export const applyDiscountAction = safeAction(
  async function applyDiscountAction(
    input: ApplyDiscountInput,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');
    const parsed = applyDiscountSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { feeAssignmentId, amount, reason } = parsed.data;

    const assignment = await prisma.feeAssignment.findUnique({
      where: { id: feeAssignmentId },
    });
    if (!assignment) return actionError('Fee assignment not found');
    if (assignment.status === 'CANCELLED') return actionError('Cannot discount a cancelled assignment');

    const balance = Number(assignment.balanceAmount);
    if (amount > balance + 0.01) {
      return actionError(`Discount (${amount}) exceeds balance (${balance})`);
    }
    const effectiveDiscount = Math.min(amount, balance);

    const newBalance = Math.max(0, balance - effectiveDiscount);
    const newDiscount = Number(assignment.discountAmount) + effectiveDiscount;
    const newStatus = newBalance <= 0 ? 'WAIVED' : assignment.status;

    await prisma.$transaction([
      prisma.feeDiscount.create({
        data: { feeAssignmentId, amount: effectiveDiscount, reason, appliedById: session.user.id },
      }),
      prisma.feeAssignment.update({
        where: { id: feeAssignmentId },
        data: {
          discountAmount: newDiscount,
          balanceAmount: newBalance,
          status: newStatus,
        },
      }),
    ]);

    createAuditLog(session.user.id, 'APPLY_FEE_DISCOUNT', 'FEE_DISCOUNT', feeAssignmentId, {
      amount: effectiveDiscount,
      reason,
    }).catch((err) => logger.error({ err }, 'Audit log failed for discount'));

    revalidateFeePaths();
    return actionSuccess();
  },
);

// ── Reverse payment ──

export const reversePaymentAction = safeAction(
  async function reversePaymentAction(
    input: ReversePaymentInput,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');
    const parsed = reversePaymentSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { paymentId, reason } = parsed.data;

    const payment = await prisma.feePayment.findUnique({
      where: { id: paymentId },
      include: { feeAssignment: true },
    });
    if (!payment) return actionError('Payment not found');
    if (payment.status === 'REVERSED') return actionError('Payment already reversed');

    const paymentAmount = Number(payment.amount);
    const assignment = payment.feeAssignment;
    const newPaid = Math.max(0, Number(assignment.paidAmount) - paymentAmount);
    const newBalance = Number(assignment.totalAmount) - newPaid - Number(assignment.discountAmount);
    const newStatus = newPaid <= 0 ? 'PENDING' : 'PARTIAL';

    await prisma.$transaction([
      prisma.feePayment.update({
        where: { id: paymentId },
        data: {
          status: 'REVERSED',
          reversedById: session.user.id,
          reversalReason: reason,
          reversedAt: new Date(),
        },
      }),
      prisma.feeAssignment.update({
        where: { id: assignment.id },
        data: {
          paidAmount: newPaid,
          balanceAmount: Math.max(0, newBalance),
          status: newStatus,
        },
      }),
    ]);

    createAuditLog(session.user.id, 'REVERSE_FEE_PAYMENT', 'FEE_PAYMENT', paymentId, {
      amount: paymentAmount,
      reason,
    }).catch((err) => logger.error({ err }, 'Audit log failed for payment reversal'));

    revalidateFeePaths();
    return actionSuccess();
  },
);
