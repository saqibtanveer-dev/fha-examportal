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
  recordFamilyPaymentSchema,
  type RecordFamilyPaymentInput,
} from '@/validations/fee-schemas';
import {
  getCurrentAcademicSessionId,
  findFeeSettings,
} from './fee-queries';
import { generateFamilyReceiptNumber, generateReceiptNumber } from './receipt-generator';
import { computeAllocation } from './allocation-engine';
import type { ChildWithAssignments, PendingAssignment } from './fee.types';

const FEE_PATHS = ['/admin/fees', '/student/fees', '/family/fees'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));
const AMOUNT_EPSILON = 0.01;

// ── Record family payment ──

export const recordFamilyPaymentAction = safeAction(
  async function recordFamilyPaymentAction(
    input: RecordFamilyPaymentInput,
  ): Promise<ActionResult<{ masterReceiptNumber: string; totalAllocated: number; unallocated: number }>> {
    const session = await requireRole('ADMIN');
    const parsed = recordFamilyPaymentSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const {
      familyProfileId,
      totalAmount,
      paymentMethod,
      referenceNumber,
      allocationStrategy,
      manualAllocations,
      childPriorityOrder,
      customAllocations,
    } = parsed.data;

    if (allocationStrategy === 'CUSTOM') {
      if (!customAllocations || customAllocations.length === 0) {
        return actionError('Custom allocations are required for CUSTOM strategy');
      }
      const requestedTotal = Math.round(customAllocations.reduce((sum, entry) => sum + entry.amount, 0) * 100) / 100;
      if (Math.abs(requestedTotal - totalAmount) > AMOUNT_EPSILON) {
        return actionError('Custom allocation total must match payment total amount');
      }
    }

    // Verify family profile and gather all children + pending assignments in one query
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { id: familyProfileId },
      include: {
        studentLinks: {
          where: { isActive: true },
          include: {
            studentProfile: {
              select: {
                id: true,
                rollNumber: true,
                user: { select: { firstName: true, lastName: true } },
                class: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!familyProfile) return actionError('Family profile not found');
    if (familyProfile.studentLinks.length === 0) {
      return actionError('No active children linked to this family');
    }

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    // Batch fetch all pending assignments for all children at once
    const childIds = familyProfile.studentLinks.map((l) => l.studentProfile.id);
    const allAssignments = await prisma.feeAssignment.findMany({
      where: {
        studentProfileId: { in: childIds },
        academicSessionId,
        status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
        balanceAmount: { gt: 0 },
      },
      include: { lineItems: { select: { id: true, categoryName: true, amount: true } } },
      orderBy: { dueDate: 'asc' },
    });

    // Group assignments by student
    const assignmentsByStudent = new Map<string, typeof allAssignments>();
    for (const a of allAssignments) {
      const list = assignmentsByStudent.get(a.studentProfileId) ?? [];
      list.push(a);
      assignmentsByStudent.set(a.studentProfileId, list);
    }

    // Build children array
    const children: ChildWithAssignments[] = [];
    for (const link of familyProfile.studentLinks) {
      const sp = link.studentProfile;
      const assignments = assignmentsByStudent.get(sp.id);
      if (!assignments || assignments.length === 0) continue;

      const pending: PendingAssignment[] = assignments.map((a) => ({
        assignmentId: a.id,
        periodLabel: a.generatedForMonth,
        categoryName: a.lineItems.map((li) => li.categoryName).join(', '),
        dueDate: a.dueDate.toISOString(),
        balanceAmount: Number(a.balanceAmount),
      }));

      children.push({
        childId: sp.id,
        childName: `${sp.user.firstName} ${sp.user.lastName}`,
        className: sp.class?.name ?? '',
        assignments: pending,
      });
    }

    if (children.length === 0) {
      return actionError('No pending fees found for any linked children');
    }

    // Compute allocation
    const allocation = computeAllocation({
      totalAmount,
      strategy: allocationStrategy,
      children,
      manualAllocations,
      childPriorityOrder,
      customAllocations,
    });

    if (allocation.totalAllocated <= 0) {
      return actionError('Could not allocate any amount to pending fees');
    }

    const settings = await findFeeSettings(academicSessionId);

    // Pre-generate all receipt numbers OUTSIDE the transaction
    // to avoid P2028 timeout on Neon serverless
    const masterReceipt = await generateFamilyReceiptNumber(
      settings?.familyReceiptPrefix ?? 'FMRC',
    );

    // Count how many child receipts we need
    const receiptCount = allocation.allocations.reduce(
      (sum, ca) => sum + ca.assignmentAllocations.filter((a) => a.allocatedAmount > 0).length,
      0,
    );
    const childReceipts: string[] = [];
    for (let i = 0; i < receiptCount; i++) {
      childReceipts.push(
        await generateReceiptNumber(settings?.receiptPrefix ?? 'FRCP'),
      );
    }

    // Collect all assignment IDs for advisory locks
    const allAssignmentIds = allocation.allocations
      .flatMap((ca) => ca.assignmentAllocations.filter((a) => a.allocatedAmount > 0).map((a) => a.assignmentId));
    const lockKeys = [`family:${familyProfileId}`, ...allAssignmentIds.map((id) => `fee-assignment:${id}`)];

    const familyPaymentId = crypto.randomUUID();

    // Run all writes inside a serializable transaction with advisory locks
    await runSerializableTransaction(async (tx) => {
      await lockTransactionKeys(tx, lockKeys);

      await tx.familyPayment.create({
        data: {
          id: familyPaymentId,
          familyProfileId,
          totalAmount: allocation.totalAllocated,
          paymentMethod,
          referenceNumber,
          masterReceiptNumber: masterReceipt,
          allocationStrategy,
          allocationDetails: JSON.parse(JSON.stringify(allocation)),
          recordedById: session.user.id,
        },
      });

      let receiptIdx = 0;
      for (const childAlloc of allocation.allocations) {
        for (const aa of childAlloc.assignmentAllocations) {
          if (aa.allocatedAmount <= 0) continue;

          await tx.feePayment.create({
            data: {
              feeAssignmentId: aa.assignmentId,
              familyPaymentId,
              amount: aa.allocatedAmount,
              paymentMethod,
              referenceNumber,
              receiptNumber: childReceipts[receiptIdx++]!,
              recordedById: session.user.id,
            },
          });

          await tx.feeAssignment.update({
            where: { id: aa.assignmentId },
            data: {
              paidAmount: { increment: aa.allocatedAmount },
              balanceAmount: { decrement: aa.allocatedAmount },
              status: aa.newBalance <= 0 ? 'PAID' : 'PARTIAL',
            },
          });
        }
      }

      // Overpayment credits INSIDE transaction for atomicity
      if (allocation.unallocated > 0.01) {
        const excessPerChild = Math.round((allocation.unallocated / childIds.length) * 100) / 100;
        for (const childId of childIds) {
          if (excessPerChild <= 0) continue;
          await tx.feeCredit.create({
            data: {
              studentProfileId: childId,
              familyProfileId,
              academicSessionId,
              amount: excessPerChild,
              remainingAmount: excessPerChild,
              reason: `Overpayment credit from family payment ${masterReceipt}`,
              referenceNumber: masterReceipt,
              createdById: session.user.id,
            },
          });
        }
      }
    });

    const masterReceiptNumber = masterReceipt;

    createAuditLog(session.user.id, 'RECORD_FAMILY_PAYMENT', 'FAMILY_PAYMENT', masterReceiptNumber, {
      familyProfileId,
      totalAmount: allocation.totalAllocated,
      allocationStrategy,
      childCount: allocation.allocations.length,
    }).catch((err) => logger.error({ err }, 'Audit log failed for family payment'));

    revalidateFeePaths();
    return actionSuccess({
      masterReceiptNumber,
      totalAllocated: allocation.totalAllocated,
      unallocated: allocation.unallocated,
    });
  },
);
