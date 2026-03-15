'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';

import { logger } from '@/lib/logger';
const REPORTS_PATH = '/admin/reports';

export const forceReleaseConsolidationLockAction = safeAction(
  async function forceReleaseConsolidationLockAction(
    resultTermId: string,
  ): Promise<ActionResult<{ released: true }>> {
    const session = await requireRole('ADMIN', 'PRINCIPAL');

    const term = await prisma.resultTerm.findUnique({
      where: { id: resultTermId },
      select: { id: true, isComputing: true, lockExpiresAt: true, lockOwner: true },
    });

    if (!term) return actionError('Result term not found');
    if (!term.isComputing) return actionError('No active consolidation lock found');

    const now = new Date();
    const isStale = !term.lockExpiresAt || term.lockExpiresAt < now;
    if (!isStale) {
      return actionError('Lock is still active. Force release is only allowed for stale locks.');
    }

    await prisma.resultTerm.update({
      where: { id: resultTermId },
      data: {
        isComputing: false,
        lockOwner: null,
        lockAcquiredAt: null,
        lockExpiresAt: null,
      },
    });

    createAuditLog(
      session.user.id,
      'FORCE_RELEASE_CONSOLIDATION_LOCK',
      'RESULT_TERM',
      resultTermId,
      {
        previousLockOwner: term.lockOwner,
        previousLockExpiresAt: term.lockExpiresAt?.toISOString() ?? null,
      },
    ).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidatePath(`${REPORTS_PATH}/consolidation`);
    revalidatePath(`${REPORTS_PATH}/result-terms/${resultTermId}`);

    return actionSuccess({ released: true });
  },
);

export async function markConsolidatedResultsStale(examId: string): Promise<void> {
  const links = await prisma.resultExamLink.findMany({
    where: { examId },
    select: { examGroup: { select: { resultTermId: true } } },
  });

  const termIds = [...new Set(links.map((l) => l.examGroup.resultTermId))];
  if (termIds.length === 0) return;

  await prisma.consolidatedResult.updateMany({
    where: { resultTermId: { in: termIds } },
    data: { isStale: true },
  });

  await prisma.consolidatedStudentSummary.updateMany({
    where: { resultTermId: { in: termIds } },
    data: { isStale: true },
  });
}
