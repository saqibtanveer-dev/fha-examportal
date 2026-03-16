'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import { runSerializableTransaction, lockTransactionKeys } from '@/lib/transaction-locks';
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

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    // Pre-generate receipt number OUTSIDE the serializable tx to avoid P2028 on Neon
    const settings = await findFeeSettings(academicSessionId);
    const receiptNumber = await generateReceiptNumber(settings?.receiptPrefix ?? 'FRCP');

    const result = await runSerializableTransaction(async (tx) => {
      await lockTransactionKeys(tx, [`fee-assignment:${feeAssignmentId}`]);

      const assignment = await tx.feeAssignment.findUnique({ where: { id: feeAssignmentId } });
      if (!assignment) return { error: 'Fee assignment not found' } as const;
      if (assignment.status === 'CANCELLED') return { error: 'Cannot pay a cancelled assignment' } as const;
      if (assignment.status === 'WAIVED') return { error: 'This fee has been waived' } as const;
      if (assignment.status === 'PAID') return { error: 'This fee is already fully paid' } as const;

      const balance = Number(assignment.balanceAmount);
      const effectiveAmount = Math.min(amount, balance);
      const excessAmount = Math.round(Math.max(0, amount - balance) * 100) / 100;

      const newPaid = Number(assignment.paidAmount) + effectiveAmount;
      const newBalance = Math.max(0, Number(assignment.totalAmount) - newPaid);
      const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIAL';

      await tx.feePayment.create({
        data: { feeAssignmentId, amount: effectiveAmount, paymentMethod, referenceNumber, receiptNumber, recordedById: session.user.id },
      });

      await tx.feeAssignment.update({
        where: { id: feeAssignmentId },
        data: { paidAmount: newPaid, balanceAmount: Math.max(0, newBalance), status: newStatus },
      });

      if (excessAmount > 0) {
        const familyLink = await tx.familyStudentLink.findFirst({
          where: { studentProfileId: assignment.studentProfileId, isActive: true },
          select: { familyProfileId: true },
        });
        await tx.feeCredit.create({
          data: {
            studentProfileId: assignment.studentProfileId,
            familyProfileId: familyLink?.familyProfileId ?? null,
            academicSessionId,
            amount: excessAmount, remainingAmount: excessAmount,
            reason: `Overpayment credit from receipt ${receiptNumber}`,
            referenceNumber: receiptNumber, createdById: session.user.id,
          },
        });
      }

      return { error: null, effectiveAmount, excessAmount } as const;
    });

    if (result.error) return actionError(result.error);

    createAuditLog(session.user.id, 'RECORD_FEE_PAYMENT', 'FEE_PAYMENT', receiptNumber, {
      feeAssignmentId, amount: result.effectiveAmount,
      excessCredit: result.excessAmount > 0 ? result.excessAmount : undefined, paymentMethod,
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

    const result = await runSerializableTransaction(async (tx) => {
      await lockTransactionKeys(tx, [`fee-assignment:${feeAssignmentId}`]);

      const assignment = await tx.feeAssignment.findUnique({ where: { id: feeAssignmentId } });
      if (!assignment) return { error: 'Fee assignment not found' } as const;
      if (assignment.status === 'CANCELLED') return { error: 'Cannot discount a cancelled assignment' } as const;

      const balance = Number(assignment.balanceAmount);
      if (amount > balance + 0.01) {
        return { error: `Discount (${amount}) exceeds balance (${balance})` } as const;
      }
      const effectiveDiscount = Math.min(amount, balance);

      const newBalance = Math.max(0, balance - effectiveDiscount);
      const newDiscount = Number(assignment.discountAmount) + effectiveDiscount;
      const newStatus = newBalance <= 0 ? 'WAIVED' : assignment.status;

      await tx.feeDiscount.create({
        data: { feeAssignmentId, amount: effectiveDiscount, reason, appliedById: session.user.id },
      });
      await tx.feeAssignment.update({
        where: { id: feeAssignmentId },
        data: { discountAmount: newDiscount, balanceAmount: newBalance, status: newStatus },
      });

      return { error: null, effectiveDiscount } as const;
    });

    if (result.error) return actionError(result.error);

    createAuditLog(session.user.id, 'APPLY_FEE_DISCOUNT', 'FEE_DISCOUNT', feeAssignmentId, {
      amount: result.effectiveDiscount, reason,
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

    const result = await runSerializableTransaction(async (tx) => {
      const payment = await tx.feePayment.findUnique({
        where: { id: paymentId },
        include: { feeAssignment: true },
      });
      if (!payment) return { error: 'Payment not found' } as const;
      if (payment.status === 'REVERSED') return { error: 'Payment already reversed' } as const;

      // Lock the assignment to prevent concurrent modifications
      await lockTransactionKeys(tx, [`fee-assignment:${payment.feeAssignmentId}`]);

      const paymentAmount = Number(payment.amount);
      const assignment = payment.feeAssignment;
      const newPaid = Math.max(0, Number(assignment.paidAmount) - paymentAmount);
      const totalDiscount = Number(assignment.discountAmount);
      const newBalance = Math.max(0, Number(assignment.totalAmount) - newPaid - totalDiscount);

      let newStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED';
      if (newPaid <= 0 && totalDiscount >= Number(assignment.totalAmount)) {
        newStatus = 'WAIVED';
      } else if (newPaid <= 0 && totalDiscount <= 0) {
        newStatus = 'PENDING';
      } else if (newBalance <= 0) {
        newStatus = 'PAID';
      } else {
        newStatus = newPaid > 0 ? 'PARTIAL' : 'PENDING';
      }

      await tx.feePayment.update({
        where: { id: paymentId },
        data: { status: 'REVERSED', reversedById: session.user.id, reversalReason: reason, reversedAt: new Date() },
      });

      await tx.feeAssignment.update({
        where: { id: assignment.id },
        data: { paidAmount: newPaid, balanceAmount: Math.max(0, newBalance), status: newStatus },
      });

      if (payment.receiptNumber) {
        await tx.feeCredit.updateMany({
          where: { referenceNumber: payment.receiptNumber, status: 'ACTIVE' },
          data: { status: 'REFUNDED', remainingAmount: 0 },
        });
      }

      return { error: null, paymentAmount } as const;
    });

    if (result.error) return actionError(result.error);

    createAuditLog(session.user.id, 'REVERSE_FEE_PAYMENT', 'FEE_PAYMENT', paymentId, {
      amount: result.paymentAmount, reason,
    }).catch((err) => logger.error({ err }, 'Audit log failed for payment reversal'));

    revalidateFeePaths();
    return actionSuccess();
  },
);
