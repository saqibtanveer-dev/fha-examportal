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
  collectStudentFeeSchema,
  collectFamilyFeeSchema,
  type CollectStudentFeeInput,
  type CollectFamilyFeeInput,
} from '@/validations/fee-schemas';
import { getCurrentAcademicSessionId, findFeeSettings } from './fee-queries';
import { generateReceiptNumber, generateFamilyReceiptNumber } from './receipt-generator';

const FEE_PATHS = ['/admin/fees', '/student/fees', '/family/fees'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Combined student fee collection (payment + discount atomic) ──

export const collectStudentFeeAction = safeAction(
  async function collectStudentFeeAction(
    input: CollectStudentFeeInput,
  ): Promise<ActionResult<{ receiptNumber?: string }>> {
    const session = await requireRole('ADMIN');
    const parsed = collectStudentFeeSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { feeAssignmentId, paymentAmount, discountAmount, paymentMethod, referenceNumber, discountReason } = parsed.data;

    if (paymentAmount <= 0 && discountAmount <= 0) return actionError('Enter a payment or discount amount');
    if (discountAmount > 0 && (!discountReason || discountReason.length < 3)) {
      return actionError('Discount reason is required (min 3 chars)');
    }

    const assignment = await prisma.feeAssignment.findUnique({ where: { id: feeAssignmentId } });
    if (!assignment) return actionError('Fee assignment not found');
    if (assignment.status === 'CANCELLED') return actionError('Cannot collect on a cancelled assignment');
    if (assignment.status === 'WAIVED') return actionError('This fee has been waived');
    if (assignment.status === 'PAID') return actionError('This fee is already fully paid');

    const balance = Number(assignment.balanceAmount);
    const effectiveDiscount = Math.min(discountAmount, balance);
    const balanceAfterDiscount = Math.round(Math.max(0, balance - effectiveDiscount) * 100) / 100;
    const effectivePayment = Math.min(paymentAmount, balanceAfterDiscount);
    const finalBalance = Math.round(Math.max(0, balanceAfterDiscount - effectivePayment) * 100) / 100;
    const excessPayment = Math.round(Math.max(0, paymentAmount - effectivePayment) * 100) / 100;

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    let receiptNumber: string | undefined;
    if (effectivePayment > 0) {
      const settings = await findFeeSettings(academicSessionId);
      receiptNumber = await generateReceiptNumber(settings?.receiptPrefix ?? 'FRCP');
    }

    const newPaid = Number(assignment.paidAmount) + effectivePayment;
    const newDiscount = Number(assignment.discountAmount) + effectiveDiscount;
    const newStatus = finalBalance <= 0 ? (effectivePayment > 0 ? 'PAID' : 'WAIVED') : 'PARTIAL';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops: any[] = [];

    if (effectiveDiscount > 0) {
      ops.push(prisma.feeDiscount.create({
        data: { feeAssignmentId, amount: effectiveDiscount, reason: discountReason!, appliedById: session.user.id },
      }));
    }

    if (effectivePayment > 0) {
      ops.push(prisma.feePayment.create({
        data: {
          feeAssignmentId, amount: effectivePayment, paymentMethod,
          referenceNumber, receiptNumber: receiptNumber!,
          recordedById: session.user.id,
        },
      }));
    }

    ops.push(prisma.feeAssignment.update({
      where: { id: feeAssignmentId },
      data: { paidAmount: newPaid, balanceAmount: finalBalance, discountAmount: newDiscount, status: newStatus },
    }));

    // Overpayment credit INSIDE transaction for atomicity
    if (excessPayment > 0) {
      ops.push(prisma.feeCredit.create({
        data: {
          studentProfileId: assignment.studentProfileId, academicSessionId,
          amount: excessPayment, remainingAmount: excessPayment,
          reason: `Overpayment credit from receipt ${receiptNumber}`,
          referenceNumber: receiptNumber, createdById: session.user.id,
        },
      }));
    }

    await prisma.$transaction(ops);

    createAuditLog(session.user.id, 'COLLECT_STUDENT_FEE', 'FEE_PAYMENT', feeAssignmentId, {
      paymentAmount: effectivePayment, discountAmount: effectiveDiscount,
      excessCredit: excessPayment > 0 ? excessPayment : undefined, paymentMethod,
    }).catch((err: unknown) => logger.error({ err }, 'Audit log failed'));

    revalidateFeePaths();
    return actionSuccess({ receiptNumber });
  },
);

// ── Combined family fee collection (per-assignment payment + discount) ──

export const collectFamilyFeeAction = safeAction(
  async function collectFamilyFeeAction(
    input: CollectFamilyFeeInput,
  ): Promise<ActionResult<{ masterReceiptNumber?: string; totalPayment: number; totalDiscount: number }>> {
    const session = await requireRole('ADMIN');
    const parsed = collectFamilyFeeSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { familyProfileId, items, paymentMethod, referenceNumber, discountReason } = parsed.data;

    const activeItems = items.filter((i) => i.paymentAmount > 0 || i.discountAmount > 0);
    if (activeItems.length === 0) return actionError('Enter amounts for at least one assignment');

    const hasDiscounts = activeItems.some((i) => i.discountAmount > 0);
    if (hasDiscounts && (!discountReason || discountReason.length < 3)) {
      return actionError('Discount reason is required when applying discounts');
    }

    const family = await prisma.familyProfile.findUnique({
      where: { id: familyProfileId }, select: { id: true },
    });
    if (!family) return actionError('Family profile not found');

    const assignmentIds = activeItems.map((i) => i.feeAssignmentId);
    const assignments = await prisma.feeAssignment.findMany({
      where: { id: { in: assignmentIds }, status: { notIn: ['CANCELLED', 'PAID', 'WAIVED'] } },
      select: { id: true, balanceAmount: true, paidAmount: true, discountAmount: true, studentProfileId: true },
    });
    const aMap = new Map(assignments.map((a) => [a.id, a]));

    // Validate all items before applying
    for (const item of activeItems) {
      const a = aMap.get(item.feeAssignmentId);
      if (!a) return actionError(`Assignment ${item.feeAssignmentId} not found or already settled`);
      const balance = Number(a.balanceAmount);
      if (item.paymentAmount + item.discountAmount > balance + 0.01) {
        return actionError(`Payment + discount (${item.paymentAmount + item.discountAmount}) exceeds balance (${balance})`);
      }
    }

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');
    const settings = await findFeeSettings(academicSessionId);

    const hasPayments = activeItems.some((i) => i.paymentAmount > 0);
    const familyPaymentId = hasPayments ? crypto.randomUUID() : undefined;
    const masterReceiptNumber = hasPayments
      ? await generateFamilyReceiptNumber(settings?.familyReceiptPrefix ?? 'FMRC')
      : undefined;

    // Pre-generate ALL child receipt numbers to avoid race conditions inside the loop
    const paymentItems = activeItems.filter((i) => i.paymentAmount > 0);
    const childReceipts: string[] = [];
    for (const _ of paymentItems) {
      childReceipts.push(await generateReceiptNumber(settings?.receiptPrefix ?? 'FRCP'));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops: any[] = [];
    let totalPayment = 0;
    let totalDiscount = 0;

    // Create FamilyPayment record if any payments
    if (hasPayments && masterReceiptNumber && familyPaymentId) {
      const payTotal = activeItems.reduce((s, i) => s + Math.min(i.paymentAmount, Number(aMap.get(i.feeAssignmentId)!.balanceAmount)), 0);
      ops.push(prisma.familyPayment.create({
        data: {
          id: familyPaymentId,
          familyProfileId, totalAmount: payTotal, paymentMethod, referenceNumber,
          masterReceiptNumber, allocationStrategy: 'CUSTOM',
          recordedById: session.user.id,
        },
      }));
    }

    // Process each item
    let receiptIdx = 0;
    for (const item of activeItems) {
      const a = aMap.get(item.feeAssignmentId)!;
      const balance = Number(a.balanceAmount);

      const effDiscount = Math.min(item.discountAmount, balance);
      const balAfterDiscount = Math.round(Math.max(0, balance - effDiscount) * 100) / 100;
      const effPayment = Math.min(item.paymentAmount, balAfterDiscount);
      const finalBal = Math.round(Math.max(0, balAfterDiscount - effPayment) * 100) / 100;

      if (effDiscount > 0) {
        ops.push(prisma.feeDiscount.create({
          data: { feeAssignmentId: item.feeAssignmentId, amount: effDiscount, reason: discountReason!, appliedById: session.user.id },
        }));
        totalDiscount = Math.round((totalDiscount + effDiscount) * 100) / 100;
      }

      if (effPayment > 0) {
        ops.push(prisma.feePayment.create({
          data: {
            feeAssignmentId: item.feeAssignmentId, familyPaymentId,
            amount: effPayment, paymentMethod, referenceNumber, receiptNumber: childReceipts[receiptIdx++]!,
            recordedById: session.user.id,
          },
        }));
        totalPayment = Math.round((totalPayment + effPayment) * 100) / 100;
      }

      const newPaid = Number(a.paidAmount) + effPayment;
      const newDiscountTotal = Number(a.discountAmount) + effDiscount;
      const newStatus = finalBal <= 0 ? (effPayment > 0 ? 'PAID' : 'WAIVED') : 'PARTIAL';

      ops.push(prisma.feeAssignment.update({
        where: { id: item.feeAssignmentId },
        data: { paidAmount: newPaid, balanceAmount: finalBal, discountAmount: newDiscountTotal, status: newStatus },
      }));
    }

    await prisma.$transaction(ops);

    createAuditLog(session.user.id, 'COLLECT_FAMILY_FEE', 'FAMILY_PAYMENT', masterReceiptNumber ?? familyProfileId, {
      familyProfileId, totalPayment, totalDiscount, itemCount: activeItems.length,
    }).catch((err: unknown) => logger.error({ err }, 'Audit log failed'));

    revalidateFeePaths();
    return actionSuccess({ masterReceiptNumber, totalPayment, totalDiscount });
  },
);
