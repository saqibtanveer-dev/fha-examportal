import { task } from '@trigger.dev/sdk/v3';
import { prisma } from '@/lib/prisma';
import { computeConsolidatedResults } from '@/modules/reports/engine/consolidation-engine';
import { createAuditLog } from '@/modules/audit/audit-queries';

type ConsolidationTaskPayload = {
  resultTermId: string;
  sectionId?: string;
  recompute: boolean;
  requestedByUserId: string;
  lockOwner: string;
};

const CONSOLIDATION_LOCK_LEASE_MS = 15 * 60 * 1000;

function readOffsetFromMetadata(metadata: unknown): number {
  if (!metadata || typeof metadata !== 'object') return 0;
  const candidate = (metadata as Record<string, unknown>).nextOffset;
  return typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0
    ? Math.floor(candidate)
    : 0;
}

export const consolidationWorkflow = task({
  id: 'reports-consolidation-workflow',
  run: async (payload: ConsolidationTaskPayload) => {
    try {
      const term = await prisma.resultTerm.findUnique({
        where: { id: payload.resultTermId },
        select: { id: true, isComputing: true, lockOwner: true },
      });

      if (!term) {
        throw new Error('Result term not found');
      }

      if (!term.isComputing) {
        throw new Error('Consolidation lock missing; refusing to run duplicate workflow');
      }

      if (!term.lockOwner || term.lockOwner !== payload.lockOwner) {
        throw new Error('Consolidation lock owner mismatch; aborting stale or duplicate worker');
      }

      const latestQueueAudit = await prisma.auditLog.findFirst({
        where: {
          entityType: 'RESULT_TERM',
          entityId: payload.resultTermId,
          action: 'QUEUE_CONSOLIDATED_RESULTS',
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      const checkpoint = await prisma.auditLog.findFirst({
        where: {
          entityType: 'RESULT_TERM',
          entityId: payload.resultTermId,
          action: 'COMPUTE_CONSOLIDATED_RESULTS_CHECKPOINT',
          ...(latestQueueAudit ? { createdAt: { gte: latestQueueAudit.createdAt } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        select: { metadata: true },
      });

      const resumeFromOffset = readOffsetFromMetadata(checkpoint?.metadata);

      const result = await computeConsolidatedResults(payload.resultTermId, {
        sectionId: payload.sectionId,
        recompute: payload.recompute,
        startOffset: resumeFromOffset,
        onCheckpoint: async ({ processed, skipped, nextOffset, totalStudents, batchSize }) => {
          const leaseUpdate = await prisma.resultTerm.updateMany({
            where: {
              id: payload.resultTermId,
              isComputing: true,
              lockOwner: payload.lockOwner,
            },
            data: {
              lockExpiresAt: new Date(Date.now() + CONSOLIDATION_LOCK_LEASE_MS),
            },
          });

          if (leaseUpdate.count === 0) {
            throw new Error('Consolidation lock lost during execution');
          }

          await createAuditLog(
            payload.requestedByUserId,
            'COMPUTE_CONSOLIDATED_RESULTS_CHECKPOINT',
            'RESULT_TERM',
            payload.resultTermId,
            {
              sectionId: payload.sectionId ?? null,
              recompute: payload.recompute,
              processed,
              skipped,
              nextOffset,
              totalStudents,
              batchSize,
              resumedFromOffset: resumeFromOffset,
            },
          );
        },
      });

      await createAuditLog(
        payload.requestedByUserId,
        'COMPUTE_CONSOLIDATED_RESULTS',
        'RESULT_TERM',
        payload.resultTermId,
        {
          processed: result.processed,
          skipped: result.skipped,
          resumedFromOffset: resumeFromOffset,
          sectionId: payload.sectionId ?? null,
          recompute: payload.recompute,
        },
      );

      return {
        success: true,
        processed: result.processed,
        skipped: result.skipped,
      };
    } catch (error: unknown) {
      await createAuditLog(
        payload.requestedByUserId,
        'COMPUTE_CONSOLIDATED_RESULTS_FAILED',
        'RESULT_TERM',
        payload.resultTermId,
        {
          sectionId: payload.sectionId ?? null,
          recompute: payload.recompute,
          error: error instanceof Error ? error.message : 'Unknown workflow error',
        },
      );

      throw error;
    } finally {
      await prisma.resultTerm.updateMany({
        where: {
          id: payload.resultTermId,
          lockOwner: payload.lockOwner,
        },
        data: {
          isComputing: false,
          lockOwner: null,
          lockAcquiredAt: null,
          lockExpiresAt: null,
        },
      });
    }
  },
});
