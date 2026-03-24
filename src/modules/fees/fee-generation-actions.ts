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
import { runFeeGeneration } from './workflows/fee-generation-core';

import { logger } from '@/lib/logger';
const FEE_PATHS = ['/admin/fees', '/admin/fees/generate'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Generate fees for a month (queued via Trigger.dev worker) ──

export const generateFeesAction = safeAction(
  async function generateFeesAction(
    input: GenerateFeesInput,
  ): Promise<ActionResult<{ queued: boolean; generated?: number; skipped?: number }>> {
    const session = await requireRole('ADMIN');
    const parsed = generateFeesSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const {
      generatedForMonth,
      classId,
      sectionId,
      dueDate,
      studentProfileIds,
      familyProfileId,
      categoryIds,
    } = parsed.data;

    if (familyProfileId && studentProfileIds?.length) {
      return actionError('Select either specific students or a family, not both');
    }

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    let resolvedStudentProfileIds = studentProfileIds;
    if (familyProfileId) {
      const links = await prisma.familyStudentLink.findMany({
        where: { familyProfileId, isActive: true },
        select: { studentProfileId: true },
      });
      resolvedStudentProfileIds = links.map((link) => link.studentProfileId);
      if (resolvedStudentProfileIds.length === 0) {
        return actionError('No active students linked to the selected family');
      }
    }

    // Build student filter based on specificity
    const studentWhere: Record<string, unknown> = {
      status: 'ACTIVE',
      user: { isActive: true, deletedAt: null },
    };
    if (resolvedStudentProfileIds?.length) {
      studentWhere.id = { in: resolvedStudentProfileIds };
    } else {
      if (classId) studentWhere.classId = classId;
      if (sectionId) studentWhere.sectionId = sectionId;
    }

    // Quick pre-flight checks (fast, no heavy queries)
    const [studentCount, structureCount] = await Promise.all([
      prisma.studentProfile.count({ where: studentWhere }),
      prisma.feeStructure.count({
        where: {
          academicSessionId,
          isActive: true,
          ...(categoryIds?.length ? { categoryId: { in: categoryIds } } : {}),
        },
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
      {
        classId,
        sectionId,
        dueDate,
        academicSessionId,
        studentProfileIds: resolvedStudentProfileIds,
        familyProfileId,
        categoryIds,
      },
    );

    try {
      const idempotencySuffix = resolvedStudentProfileIds?.length
        ? `students:${resolvedStudentProfileIds.sort().join(',')}`
        : `${classId ?? 'all'}:${sectionId ?? 'all'}`;

      const payload = {
        generatedForMonth,
        classId,
        sectionId,
        dueDate,
        academicSessionId,
        requestedByUserId: session.user.id,
        lockId: lockRecord.id,
        studentProfileIds: resolvedStudentProfileIds,
        categoryIds,
      };

      const shouldRunInline = Boolean(familyProfileId)
        || (Array.isArray(resolvedStudentProfileIds) && resolvedStudentProfileIds.length <= 1);

      if (shouldRunInline) {
        const result = await runFeeGeneration(payload);
        createAuditLog(
          session.user.id,
          'INLINE_FEE_GENERATION',
          'FEE_ASSIGNMENT',
          generatedForMonth,
          {
            classId,
            sectionId,
            familyProfileId,
            studentProfileIds: resolvedStudentProfileIds,
            generated: result.generated,
            skipped: result.skipped,
          },
        ).catch((err) => logger.error({ err }, 'Audit log failed'));

        revalidateFeePaths();
        return actionSuccess({ queued: false, generated: result.generated, skipped: result.skipped });
      }

      const runHandle = await tasks.trigger('fees-generation-workflow', {
        ...payload,
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
        {
          classId,
          sectionId,
          studentProfileIds: resolvedStudentProfileIds,
          familyProfileId,
          categoryIds,
          runId: runHandle.id,
          studentCount,
        },
      ).catch((err) => logger.error({ err }, 'Audit log failed'));

      revalidateFeePaths();
      return actionSuccess({ queued: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to queue fee generation job';
      return actionError(errorMessage);
    }
  },
);
