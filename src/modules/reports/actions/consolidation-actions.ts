'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { tasks } from '@trigger.dev/sdk/v3';
import { randomUUID } from 'crypto';
import {
  computeConsolidatedSchema,
  studentRemarksSchema,
  batchStudentRemarksSchema,
  type ComputeConsolidatedInput,
  type StudentRemarksInput,
  type BatchStudentRemarksInput,
} from '@/validations/result-term-schemas';

import { logger } from '@/lib/logger';
const REPORTS_PATH = '/admin/reports';
const CONSOLIDATION_LOCK_LEASE_MS = 15 * 60 * 1000;

// ============================================
// Compute Consolidated Results
// ============================================

export const computeConsolidatedResultsAction = safeAction(
  async function computeConsolidatedResultsAction(
    input: ComputeConsolidatedInput,
  ): Promise<ActionResult<{ queued: true }>> {
    const session = await requireRole('ADMIN', 'PRINCIPAL');

    const parsed = computeConsolidatedSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Invalid input');

    const term = await prisma.resultTerm.findUnique({
      where: { id: parsed.data.resultTermId },
      include: { _count: { select: { examGroups: true } } },
    });
    if (!term) return actionError('Result term not found');
    if (term._count.examGroups === 0) {
      return actionError('No exam groups configured. Add exam groups and link exams first.');
    }

    // Validate weight sum
    const groups = await prisma.resultExamGroup.findMany({
      where: { resultTermId: parsed.data.resultTermId },
      select: { weight: true, _count: { select: { examLinks: true } } },
    });
    const totalWeight = groups.reduce((s, g) => s + Number(g.weight), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return actionError(
        `Exam group weights must sum to 100% (currently ${totalWeight.toFixed(2)}%). Adjust weights before computing.`,
      );
    }
    const emptyGroups = groups.filter((g) => g._count.examLinks === 0);
    if (emptyGroups.length > 0) {
      return actionError(`${emptyGroups.length} exam group(s) have no exams linked. Link exams to all groups.`);
    }

    const now = new Date();
    const lockExpiresAt = new Date(now.getTime() + CONSOLIDATION_LOCK_LEASE_MS);
    const lockOwner = randomUUID();

    // Atomic lock acquisition with stale-lock recovery.
    const lock = await prisma.resultTerm.updateMany({
      where: {
        id: parsed.data.resultTermId,
        OR: [
          { isComputing: false },
          { isComputing: true, lockExpiresAt: { lt: now } },
          { isComputing: true, lockExpiresAt: null },
        ],
      },
      data: {
        isComputing: true,
        lockOwner,
        lockAcquiredAt: now,
        lockExpiresAt,
      },
    });
    if (lock.count === 0) {
      return actionError('Consolidation is already running for this term');
    }

    if (term.isComputing && (!term.lockExpiresAt || term.lockExpiresAt < now)) {
      createAuditLog(
        session.user.id,
        'RECOVER_STALE_CONSOLIDATION_LOCK',
        'RESULT_TERM',
        parsed.data.resultTermId,
        {
          previousLockExpiresAt: term.lockExpiresAt?.toISOString() ?? null,
          sectionId: parsed.data.sectionId ?? null,
          recompute: parsed.data.recompute,
        },
      ).catch((err) => logger.error({ err }, 'Audit log failed'));
    }

    try {
      const runHandle = await tasks.trigger('reports-consolidation-workflow', {
        resultTermId: parsed.data.resultTermId,
        sectionId: parsed.data.sectionId,
        recompute: parsed.data.recompute,
        requestedByUserId: session.user.id,
        lockOwner,
      }, {
        concurrencyKey: parsed.data.resultTermId,
        maxAttempts: 3,
        idempotencyKey: `reports:consolidation:${parsed.data.resultTermId}:${parsed.data.sectionId ?? 'all'}:${parsed.data.recompute ? 'recompute' : 'skip-existing'}`,
      });

      createAuditLog(
        session.user.id,
        'QUEUE_CONSOLIDATED_RESULTS',
        'RESULT_TERM',
        parsed.data.resultTermId,
        {
          sectionId: parsed.data.sectionId ?? null,
          recompute: parsed.data.recompute,
          runId: runHandle.id,
        },
      ).catch((err) => logger.error({ err }, 'Audit log failed'));

      revalidatePath(`${REPORTS_PATH}/consolidation`);
      revalidatePath(`${REPORTS_PATH}/result-terms/${parsed.data.resultTermId}`);
      return actionSuccess({ queued: true });
    } catch (error: unknown) {
      await prisma.resultTerm.update({
        where: { id: parsed.data.resultTermId },
        data: {
          isComputing: false,
          lockOwner: null,
          lockAcquiredAt: null,
          lockExpiresAt: null,
        },
      });

      const errorMessage = error instanceof Error ? error.message : 'Failed to queue consolidation job';
      return actionError(errorMessage);
    } finally {
      // Lock release is handled by the worker on success/failure.
    }
  },
);


// ============================================
// Clear Consolidated Results (for recompute)
// ============================================

export const clearConsolidatedResultsAction = safeAction(
  async function clearConsolidatedResultsAction(
    resultTermId: string,
  ): Promise<ActionResult<{ deletedResults: number; deletedSummaries: number }>> {
    const session = await requireRole('ADMIN', 'PRINCIPAL');

    const term = await prisma.resultTerm.findUnique({ where: { id: resultTermId } });
    if (!term) return actionError('Result term not found');
    if (term.isPublished) return actionError('Cannot clear results of a published term. Unpublish first.');
    if (term.isComputing) return actionError('Consolidation is running. Wait for it to finish.');

    const [{ count: deletedResults }, { count: deletedSummaries }] = await prisma.$transaction([
      prisma.consolidatedResult.deleteMany({ where: { resultTermId } }),
      prisma.consolidatedStudentSummary.deleteMany({ where: { resultTermId } }),
    ]);

    await prisma.resultTerm.update({
      where: { id: resultTermId },
      data: { computedAt: null },
    });

    createAuditLog(session.user.id, 'CLEAR_CONSOLIDATED_RESULTS', 'RESULT_TERM', resultTermId).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidatePath(`${REPORTS_PATH}/consolidation`);
    revalidatePath(`${REPORTS_PATH}/result-terms/${resultTermId}`);
    return actionSuccess({ deletedResults, deletedSummaries });
  },
);

// ============================================
// Add / Update Student Remarks
// ============================================

export const updateStudentRemarksAction = safeAction(
  async function updateStudentRemarksAction(
    input: StudentRemarksInput,
  ): Promise<ActionResult> {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');

    const parsed = studentRemarksSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Invalid input');

    const summary = await prisma.consolidatedStudentSummary.findUnique({
      where: {
        resultTermId_studentId: {
          resultTermId: parsed.data.resultTermId,
          studentId: parsed.data.studentId,
        },
      },
    });
    if (!summary) return actionError('Student consolidated summary not found. Run consolidation first.');

    await prisma.consolidatedStudentSummary.update({
      where: {
        resultTermId_studentId: {
          resultTermId: parsed.data.resultTermId,
          studentId: parsed.data.studentId,
        },
      },
      data: {
        classTeacherRemarks: parsed.data.classTeacherRemarks ?? undefined,
        principalRemarks: parsed.data.principalRemarks ?? undefined,
      },
    });

    revalidatePath(`${REPORTS_PATH}/dmc`);
    return actionSuccess();
  },
);

// ============================================
// Batch Save Student Remarks (efficient for 50+ students)
// ============================================

export const batchUpdateStudentRemarksAction = safeAction(
  async function batchUpdateStudentRemarksAction(
    input: BatchStudentRemarksInput,
  ): Promise<ActionResult<{ updated: number }>> {
    await requireRole('ADMIN', 'PRINCIPAL', 'TEACHER');

    const parsed = batchStudentRemarksSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Invalid input');

    const { resultTermId, remarks } = parsed.data;

    // Verify term exists
    const term = await prisma.resultTerm.findUnique({ where: { id: resultTermId }, select: { id: true } });
    if (!term) return actionError('Result term not found');

    // Batch update in a single transaction
    const filteredRemarks = remarks.filter((r) => r.classTeacherRemarks || r.principalRemarks);
    if (filteredRemarks.length > 0) {
      await prisma.$transaction(
        filteredRemarks.map((r) =>
          prisma.consolidatedStudentSummary.update({
            where: { resultTermId_studentId: { resultTermId, studentId: r.studentId } },
            data: {
              ...(r.classTeacherRemarks !== undefined && { classTeacherRemarks: r.classTeacherRemarks }),
              ...(r.principalRemarks !== undefined && { principalRemarks: r.principalRemarks }),
            },
          }),
        ),
      );
    }

    revalidatePath(`${REPORTS_PATH}/dmc`);
    return actionSuccess({ updated: filteredRemarks.length });
  },
);

