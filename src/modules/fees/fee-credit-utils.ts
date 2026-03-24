import { prisma } from '@/lib/prisma';
import { runSerializableTransaction, lockTransactionKeys } from '@/lib/transaction-locks';

/**
 * Pure utility — no 'use server', no Next.js imports.
 * Safe to import from Trigger.dev workers.
 *
 * Auto-applies ACTIVE per-student credits against a newly-created fee assignment.
 * Credits are strictly scoped to the same student and are never shared with siblings.
 *
 * Locking strategy — LOCK FIRST, THEN READ:
 *   pg_advisory_xact_lock is the FIRST SQL statement inside the transaction.
 *   PostgreSQL takes the SERIALIZABLE snapshot only at the first statement.
 *   If TX2 is blocked here waiting for TX1, and TX1 commits first,
 *   TX2's snapshot is taken AFTER TX1's commit → TX2 reads fresh balances.
 *   This prevents double-spending without relying on serialization-failure retries.
 *   lockTransactionKeys() sorts keys to prevent deadlocks.
 *
 */
export async function applyCreditsToAssignment(
  studentProfileId: string,
  assignmentId: string,
  balanceAmount: number,
): Promise<number> {
  if (balanceAmount <= 0) return 0;

  return runSerializableTransaction(async (tx) => {
    // ── LOCK FIRST (snapshot taken here, after any blocking) ─────────────────
    const lockKeys: string[] = [
      `fee-assignment:${assignmentId}`,
      `fee-student-credits:${studentProfileId}`,
    ];
    await lockTransactionKeys(tx, lockKeys);

    // ── READ CREDITS (fresh, post-lock snapshot) ──────────────────────────────
    const credits = await tx.feeCredit.findMany({
      where: {
        studentProfileId,
        status: 'ACTIVE',
        remainingAmount: { gt: 0 },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (credits.length === 0) return 0;

    // ── APPLY ─────────────────────────────────────────────────────────────────
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
