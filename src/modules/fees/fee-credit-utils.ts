import { runSerializableTransaction, lockTransactionKeys } from '@/lib/transaction-locks';

/**
 * Pure utility — no 'use server', no Next.js imports.
 * Safe to import from Trigger.dev workers.
 *
 * Auto-applies available ACTIVE credits against a newly-created fee assignment.
 * Returns the total amount applied.
 */
export async function applyCreditsToAssignment(
  studentProfileId: string,
  assignmentId: string,
  balanceAmount: number,
  _academicSessionId: string,
): Promise<number> {
  if (balanceAmount <= 0) return 0;

  return runSerializableTransaction(async (tx) => {
    await lockTransactionKeys(tx, [`fee-assignment:${assignmentId}`, `fee-credits:${studentProfileId}`]);

    const credits = await tx.feeCredit.findMany({
      where: { studentProfileId, status: 'ACTIVE', remainingAmount: { gt: 0 } },
      orderBy: { createdAt: 'asc' },
    });

    let totalApplied = 0;
    let remaining = balanceAmount;
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
        await tx.feeCredit.update({
          where: { id: credit.id },
          data: { remainingAmount: newRemaining },
        });
      }
    }

    if (totalApplied > 0) {
      if (exhaustedIds.length > 0) {
        await tx.feeCredit.updateMany({
          where: { id: { in: exhaustedIds } },
          data: { remainingAmount: 0, status: 'EXHAUSTED' },
        });
      }

      const newBalance = Math.max(0, Math.round((balanceAmount - totalApplied) * 100) / 100);
      await tx.feeAssignment.update({
        where: { id: assignmentId },
        data: {
          paidAmount: { increment: totalApplied },
          balanceAmount: newBalance,
          status: newBalance <= 0 ? 'PAID' : 'PARTIAL',
        },
      });
    }

    return totalApplied;
  });
}
