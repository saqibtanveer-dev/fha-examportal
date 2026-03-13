'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { computeConsolidatedResults } from '../engine/consolidation-engine';
import {
  computeConsolidatedSchema,
  studentRemarksSchema,
  batchStudentRemarksSchema,
  type ComputeConsolidatedInput,
  type StudentRemarksInput,
  type BatchStudentRemarksInput,
} from '@/validations/result-term-schemas';

const REPORTS_PATH = '/admin/reports';

// ============================================
// Compute Consolidated Results
// ============================================

export const computeConsolidatedResultsAction = safeAction(
  async function computeConsolidatedResultsAction(
    input: ComputeConsolidatedInput,
  ): Promise<ActionResult<{ processed: number; skipped: number }>> {
    const session = await requireRole('ADMIN', 'PRINCIPAL');

    const parsed = computeConsolidatedSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Invalid input');

    const term = await prisma.resultTerm.findUnique({
      where: { id: parsed.data.resultTermId },
      include: { _count: { select: { examGroups: true } } },
    });
    if (!term) return actionError('Result term not found');
    if (term.isComputing) return actionError('Consolidation is already running for this term');
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

    // Lock to prevent concurrent runs
    await prisma.resultTerm.update({
      where: { id: parsed.data.resultTermId },
      data: { isComputing: true },
    });

    try {
      const result = await computeConsolidatedResults(parsed.data.resultTermId, {
        sectionId: parsed.data.sectionId,
        recompute: parsed.data.recompute,
      });

      createAuditLog(
        session.user.id,
        'COMPUTE_CONSOLIDATED_RESULTS',
        'RESULT_TERM',
        parsed.data.resultTermId,
        { processed: result.processed },
      ).catch(() => {});

      revalidatePath(`${REPORTS_PATH}/consolidation`);
      revalidatePath(`${REPORTS_PATH}/result-terms/${parsed.data.resultTermId}`);
      return actionSuccess(result);
    } finally {
      // Always unlock
      await prisma.resultTerm.update({
        where: { id: parsed.data.resultTermId },
        data: { isComputing: false },
      });
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

    createAuditLog(session.user.id, 'CLEAR_CONSOLIDATED_RESULTS', 'RESULT_TERM', resultTermId).catch(() => {});
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
    let updated = 0;
    await prisma.$transaction(
      remarks
        .filter((r) => r.classTeacherRemarks || r.principalRemarks)
        .map((r) => {
          updated++;
          return prisma.consolidatedStudentSummary.update({
            where: { resultTermId_studentId: { resultTermId, studentId: r.studentId } },
            data: {
              ...(r.classTeacherRemarks !== undefined && { classTeacherRemarks: r.classTeacherRemarks }),
              ...(r.principalRemarks !== undefined && { principalRemarks: r.principalRemarks }),
            },
          });
        }),
    );

    revalidatePath(`${REPORTS_PATH}/dmc`);
    return actionSuccess({ updated });
  },
);

// ============================================
// Mark stale (when underlying exam results change)
// ============================================

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
