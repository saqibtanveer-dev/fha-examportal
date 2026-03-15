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

    const { generatedForMonth, classId, dueDate } = parsed.data;
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    // Quick pre-flight checks (fast, no heavy queries)
    const [studentCount, structureCount] = await Promise.all([
      prisma.studentProfile.count({
        where: {
          status: 'ACTIVE',
          user: { isActive: true, deletedAt: null },
          ...(classId ? { classId } : {}),
        },
      }),
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
      { classId, dueDate, academicSessionId },
    );

    try {
      const runHandle = await tasks.trigger('fees-generation-workflow', {
        generatedForMonth,
        classId,
        dueDate,
        academicSessionId,
        requestedByUserId: session.user.id,
        lockId: lockRecord.id,
      }, {
        concurrencyKey: `fee-gen:${academicSessionId}:${generatedForMonth}`,
        maxAttempts: 3,
        idempotencyKey: `fees:generate:${academicSessionId}:${generatedForMonth}:${classId ?? 'all'}`,
      });

      createAuditLog(
        session.user.id,
        'QUEUE_FEE_GENERATION',
        'FEE_ASSIGNMENT',
        generatedForMonth,
        { classId, runId: runHandle.id, studentCount },
      ).catch((err) => logger.error({ err }, 'Audit log failed'));

      revalidateFeePaths();
      return actionSuccess({ queued: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to queue fee generation job';
      return actionError(errorMessage);
    }
  },
);
