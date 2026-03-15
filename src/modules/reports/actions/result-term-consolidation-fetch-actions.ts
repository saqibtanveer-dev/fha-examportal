'use server';

import { requireRole } from '@/lib/auth-utils';
import { safeFetchAction } from '@/lib/safe-action';
import { prisma } from '@/lib/prisma';

const getConsolidationJobSnapshot = safeFetchAction(
  async function getConsolidationJobSnapshot(resultTermId: string) {
    await requireRole('ADMIN', 'PRINCIPAL');

    const [term, latestLifecycleAudit, latestCheckpointAudit] = await Promise.all([
      prisma.resultTerm.findUnique({
        where: { id: resultTermId },
        select: {
          id: true,
          isComputing: true,
          lockOwner: true,
          lockAcquiredAt: true,
          lockExpiresAt: true,
          computedAt: true,
          _count: { select: { consolidatedResults: true, consolidatedSummaries: true } },
        },
      }),
      prisma.auditLog.findFirst({
        where: {
          entityType: 'RESULT_TERM',
          entityId: resultTermId,
          action: {
            in: [
              'QUEUE_CONSOLIDATED_RESULTS',
              'COMPUTE_CONSOLIDATED_RESULTS',
              'COMPUTE_CONSOLIDATED_RESULTS_FAILED',
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          action: true,
          createdAt: true,
          metadata: true,
        },
      }),
      prisma.auditLog.findFirst({
        where: {
          entityType: 'RESULT_TERM',
          entityId: resultTermId,
          action: 'COMPUTE_CONSOLIDATED_RESULTS_CHECKPOINT',
        },
        orderBy: { createdAt: 'desc' },
        select: {
          action: true,
          createdAt: true,
          metadata: true,
        },
      }),
    ]);

    if (!term) return null;

    const status = term.isComputing
      ? 'RUNNING'
      : latestLifecycleAudit?.action === 'COMPUTE_CONSOLIDATED_RESULTS_FAILED'
        ? 'FAILED'
        : latestLifecycleAudit?.action === 'COMPUTE_CONSOLIDATED_RESULTS'
          ? 'COMPLETED'
          : latestLifecycleAudit?.action === 'QUEUE_CONSOLIDATED_RESULTS'
            ? 'QUEUED'
            : 'IDLE';

    const progressSource =
      term.isComputing && latestCheckpointAudit ? latestCheckpointAudit : latestLifecycleAudit;
    const metadata = (progressSource?.metadata ?? null) as Record<string, unknown> | null;

    return {
      resultTermId,
      status,
      lastEventAt: progressSource?.createdAt ?? null,
      computedAt: term.computedAt,
      lock: {
        owner: term.lockOwner,
        acquiredAt: term.lockAcquiredAt,
        expiresAt: term.lockExpiresAt,
      },
      counts: {
        consolidatedResults: term._count.consolidatedResults,
        consolidatedSummaries: term._count.consolidatedSummaries,
      },
      run: {
        runId: typeof metadata?.runId === 'string' ? metadata.runId : null,
        processed: typeof metadata?.processed === 'number' ? metadata.processed : null,
        skipped: typeof metadata?.skipped === 'number' ? metadata.skipped : null,
        error: typeof metadata?.error === 'string' ? metadata.error : null,
      },
    };
  },
);

export async function getConsolidationJobSnapshotAction(resultTermId: string) {
  return getConsolidationJobSnapshot(resultTermId);
}
