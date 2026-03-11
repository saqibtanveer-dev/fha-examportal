'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import { getCurrentAcademicSessionId } from './fee-queries';

const FEE_PATHS = ['/admin/fees', '/student/fees', '/family/fees'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Record advance payment as credit ──

export const recordAdvancePaymentAction = safeAction(
  async function recordAdvancePaymentAction(input: {
    studentProfileId: string;
    familyProfileId?: string;
    amount: number;
    reason?: string;
    referenceNumber?: string;
  }): Promise<ActionResult<{ creditId: string }>> {
    const session = await requireRole('ADMIN');
    const { studentProfileId, familyProfileId, amount, reason, referenceNumber } = input;

    if (amount <= 0) return actionError('Amount must be positive');

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    // Verify student exists
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: { id: true },
    });
    if (!student) return actionError('Student not found');

    const credit = await prisma.feeCredit.create({
      data: {
        studentProfileId,
        familyProfileId: familyProfileId ?? null,
        academicSessionId,
        amount,
        remainingAmount: amount,
        reason: reason ?? 'Advance payment',
        referenceNumber: referenceNumber ?? null,
        createdById: session.user.id,
      },
    });

    createAuditLog(session.user.id, 'RECORD_ADVANCE_PAYMENT', 'FEE_CREDIT', credit.id, {
      studentProfileId,
      familyProfileId,
      amount,
    }).catch((err) => logger.error({ err }, 'Audit log failed for advance payment'));

    revalidateFeePaths();
    return actionSuccess({ creditId: credit.id });
  },
);

// ── Auto-apply credits when generating fees ──

export async function applyCreditsToAssignment(
  studentProfileId: string,
  assignmentId: string,
  balanceAmount: number,
  _academicSessionId: string,
): Promise<number> {
  if (balanceAmount <= 0) return 0;

  const credits = await prisma.feeCredit.findMany({
    where: {
      studentProfileId,
      status: 'ACTIVE',
      remainingAmount: { gt: 0 },
    },
    orderBy: { createdAt: 'asc' },
  });

  let totalApplied = 0;
  let remaining = balanceAmount;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ops: any[] = [];
  const exhaustedIds: string[] = [];

  for (const credit of credits) {
    if (remaining <= 0) break;
    const creditRemaining = Number(credit.remainingAmount);
    const toApply = Math.min(remaining, creditRemaining);
    remaining = Math.round((remaining - toApply) * 100) / 100;
    totalApplied = Math.round((totalApplied + toApply) * 100) / 100;

    const newRemaining = Math.round((creditRemaining - toApply) * 100) / 100;
    if (newRemaining <= 0) {
      exhaustedIds.push(credit.id);
    } else {
      ops.push(prisma.feeCredit.update({
        where: { id: credit.id },
        data: { remainingAmount: newRemaining },
      }));
    }
  }

  if (totalApplied > 0) {
    // Batch exhaust fully-used credits in one op
    if (exhaustedIds.length > 0) {
      ops.push(prisma.feeCredit.updateMany({
        where: { id: { in: exhaustedIds } },
        data: { remainingAmount: 0, status: 'EXHAUSTED' },
      }));
    }

    const newBalance = Math.max(0, Math.round((balanceAmount - totalApplied) * 100) / 100);
    ops.push(prisma.feeAssignment.update({
      where: { id: assignmentId },
      data: {
        paidAmount: { increment: totalApplied },
        balanceAmount: newBalance,
        status: newBalance <= 0 ? 'PAID' : 'PARTIAL',
      },
    }));
    await prisma.$transaction(ops);
  }

  return totalApplied;
}

// ── Fetch student credits ──

export const fetchStudentCreditsAction = safeAction(
  async function fetchStudentCreditsAction(
    studentProfileId: string,
  ): Promise<ActionResult<{ credits: { id: string; amount: number; remainingAmount: number; reason: string; status: string; createdAt: Date }[] }>> {
    await requireRole('ADMIN', 'PRINCIPAL');

    const credits = await prisma.feeCredit.findMany({
      where: { studentProfileId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        remainingAmount: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    });

    return actionSuccess({
      credits: credits.map((c) => ({
        ...c,
        amount: Number(c.amount),
        remainingAmount: Number(c.remainingAmount),
      })),
    });
  },
);
