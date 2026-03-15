'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import { tasks } from '@trigger.dev/sdk/v3';
import {
  generateFeesSchema,
  type GenerateFeesInput,
} from '@/validations/fee-schemas';
import { getCurrentAcademicSessionId } from './fee-queries';

import { logger } from '@/lib/logger';
const FEE_PATHS = ['/admin/fees', '/admin/fees/generate'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Generate fees for a month (queued via Trigger.dev worker) ──

export const generateFeesAction = safeAction(
  async function generateFeesAction(
    input: GenerateFeesInput,
  ): Promise<ActionResult<{ queued: true }>> {
    const session = await requireRole('ADMIN');
    const parsed = generateFeesSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { generatedForMonth, classId, sectionId, dueDate, studentProfileIds } = parsed.data;
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    // Build student filter based on specificity
    const studentWhere: Record<string, unknown> = {
      status: 'ACTIVE',
      user: { isActive: true, deletedAt: null },
    };
    if (studentProfileIds?.length) {
      studentWhere.id = { in: studentProfileIds };
    } else {
      if (classId) studentWhere.classId = classId;
      if (sectionId) studentWhere.sectionId = sectionId;
    }

    // Quick pre-flight checks (fast, no heavy queries)
    const [studentCount, structureCount] = await Promise.all([
      prisma.studentProfile.count({ where: studentWhere }),
      prisma.feeStructure.count({
        where: { academicSessionId, isActive: true },
      }),
    ]);

    if (studentCount === 0) return actionError('No active students found');
    if (structureCount === 0) return actionError('No fee structures configured');

    // Create a lock audit log as concurrency guard
    const lockRecord = await createAuditLog(
      session.user.id,
      'FEE_GENERATION_LOCK',
      'FEE_ASSIGNMENT',
      generatedForMonth,
      { classId, sectionId, dueDate, academicSessionId, studentProfileIds },
    );

    try {
      const idempotencySuffix = studentProfileIds?.length
        ? `students:${studentProfileIds.sort().join(',')}`
        : `${classId ?? 'all'}:${sectionId ?? 'all'}`;

      const runHandle = await tasks.trigger('fees-generation-workflow', {
        generatedForMonth,
        classId,
        sectionId,
        dueDate,
        academicSessionId,
        requestedByUserId: session.user.id,
        lockId: lockRecord.id,
        studentProfileIds,
      }, {
        concurrencyKey: `fee-gen:${academicSessionId}:${generatedForMonth}`,
        maxAttempts: 3,
        idempotencyKey: `fees:generate:${academicSessionId}:${generatedForMonth}:${idempotencySuffix}`,
      });

      createAuditLog(
        session.user.id,
        'QUEUE_FEE_GENERATION',
        'FEE_ASSIGNMENT',
        generatedForMonth,
        { classId, sectionId, studentProfileIds, runId: runHandle.id, studentCount },
      ).catch((err) => logger.error({ err }, 'Audit log failed'));

      revalidateFeePaths();
      return actionSuccess({ queued: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to queue fee generation job';
      return actionError(errorMessage);
    }
  },
);
