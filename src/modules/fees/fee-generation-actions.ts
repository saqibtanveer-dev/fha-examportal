'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import {
  generateFeesSchema,
  cancelAssignmentSchema,
  type GenerateFeesInput,
  type CancelAssignmentInput,
} from '@/validations/fee-schemas';
import { getCurrentAcademicSessionId, findFeeSettings } from './fee-queries';
import { applyCreditsToAssignment } from './advance-payment-actions';

const FEE_PATHS = ['/admin/fees', '/admin/fees/generate'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Generate fees for a month ──

export const generateFeesAction = safeAction(
  async function generateFeesAction(
    input: GenerateFeesInput,
  ): Promise<ActionResult<{ generated: number; skipped: number }>> {
    const session = await requireRole('ADMIN');
    const parsed = generateFeesSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { generatedForMonth, classId, dueDate } = parsed.data;
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    // Get active students with their classes
    const students = await prisma.studentProfile.findMany({
      where: {
        status: 'ACTIVE',
        user: { isActive: true, deletedAt: null },
        ...(classId ? { classId } : {}),
      },
      select: { id: true, classId: true },
    });

    if (students.length === 0) return actionError('No active students found');

    // Get all active structures for the session
    const structures = await prisma.feeStructure.findMany({
      where: { academicSessionId, isActive: true },
      include: { category: { select: { name: true, frequency: true } } },
    });

    if (structures.length === 0) return actionError('No fee structures configured');

    // Build a map: classId → applicable structures
    const classStructures = new Map<string, typeof structures>();
    for (const s of structures) {
      const list = classStructures.get(s.classId) ?? [];
      list.push(s);
      classStructures.set(s.classId, list);
    }

    // Check which students already have assignments for this month
    const existingAssignments = await prisma.feeAssignment.findMany({
      where: {
        academicSessionId,
        generatedForMonth,
        status: { not: 'CANCELLED' },
      },
      select: { studentProfileId: true },
    });
    const existingSet = new Set(existingAssignments.map((a) => a.studentProfileId));

    const dueDateObj = new Date(dueDate + 'T00:00:00.000Z');
    let generated = 0;
    let skipped = 0;

    // Pre-compute which students need assignments and their data
    const toCreate: {
      studentProfileId: string;
      academicSessionId: string;
      generatedForMonth: string;
      totalAmount: number;
      balanceAmount: number;
      dueDate: Date;
      generatedById: string;
      lineItems: { feeStructureId: string; categoryName: string; amount: number }[];
    }[] = [];

    for (const student of students) {
      if (existingSet.has(student.id) || !student.classId) {
        skipped++;
        continue;
      }

      const applicable = classStructures.get(student.classId);
      if (!applicable || applicable.length === 0) {
        skipped++;
        continue;
      }

      const totalAmount = applicable.reduce(
        (sum, s) => sum + Number(s.amount), 0,
      );

      toCreate.push({
        studentProfileId: student.id,
        academicSessionId,
        generatedForMonth,
        totalAmount,
        balanceAmount: totalAmount,
        dueDate: dueDateObj,
        generatedById: session.user.id,
        lineItems: applicable.map((s) => ({
          feeStructureId: s.id,
          categoryName: s.category.name,
          amount: Number(s.amount),
        })),
      });
    }

    // Process in small batches to avoid Neon serverless timeout.
    // Each create is atomic (Prisma wraps nested writes in an implicit transaction).
    const BATCH_SIZE = 10;
    for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
      const batch = toCreate.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((data) =>
          prisma.feeAssignment.create({
            data: {
              studentProfileId: data.studentProfileId,
              academicSessionId: data.academicSessionId,
              generatedForMonth: data.generatedForMonth,
              totalAmount: data.totalAmount,
              balanceAmount: data.balanceAmount,
              dueDate: data.dueDate,
              generatedById: data.generatedById,
              lineItems: { create: data.lineItems },
            },
          }).then(async (assignment) => {
            // Auto-apply any existing credits to this new assignment
            await applyCreditsToAssignment(
              data.studentProfileId, assignment.id, data.totalAmount, data.academicSessionId,
            ).catch((err) => logger.error({ err }, 'Credit auto-apply failed'));
            return assignment;
          }),
        ),
      );
      for (const r of results) {
        if (r.status === 'fulfilled') generated++;
        else {
          skipped++;
          logger.error({ err: r.reason }, 'Failed to create fee assignment');
        }
      }
    }

    createAuditLog(session.user.id, 'GENERATE_FEES', 'FEE_ASSIGNMENT', generatedForMonth, {
      generatedForMonth,
      classId,
      generated,
      skipped,
    }).catch((err) => logger.error({ err }, 'Audit log failed for fee generation'));

    revalidateFeePaths();
    return actionSuccess({ generated, skipped });
  },
);

// ── Cancel assignment ──

export const cancelAssignmentAction = safeAction(
  async function cancelAssignmentAction(
    input: CancelAssignmentInput,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');
    const parsed = cancelAssignmentSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { feeAssignmentId, reason } = parsed.data;

    const assignment = await prisma.feeAssignment.findUnique({
      where: { id: feeAssignmentId },
      include: { payments: { where: { status: 'COMPLETED' } } },
    });

    if (!assignment) return actionError('Assignment not found');
    if (assignment.status === 'CANCELLED') return actionError('Already cancelled');
    if (assignment.payments.length > 0) {
      return actionError('Cannot cancel: payments exist. Reverse payments first.');
    }

    await prisma.feeAssignment.update({
      where: { id: feeAssignmentId },
      data: {
        status: 'CANCELLED',
        cancelledById: session.user.id,
        cancelReason: reason,
      },
    });

    createAuditLog(session.user.id, 'CANCEL_FEE_ASSIGNMENT', 'FEE_ASSIGNMENT', feeAssignmentId, {
      reason,
    }).catch((err) => logger.error({ err }, 'Audit log failed for cancel assignment'));

    revalidateFeePaths();
    return actionSuccess();
  },
);

// ── Apply late fees (bulk) ──

export const applyLateFeesAction = safeAction(
  async function applyLateFeesAction(): Promise<ActionResult<{ updated: number }>> {
    const session = await requireRole('ADMIN');
    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    const settings = await findFeeSettings(academicSessionId);
    const lateFeePerDay = Number(settings?.lateFeePerDay ?? 0);
    const maxLateFee = Number(settings?.maxLateFee ?? 0);
    const graceDays = settings?.gracePeriodDays ?? 0;

    if (lateFeePerDay <= 0) return actionError('Late fee per day is not configured');

    const today = new Date();
    let updated = 0;
    let cursor: string | undefined;

    // Cursor-based pagination to avoid loading all overdue assignments into memory
    const PAGE_SIZE = 100;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const overdueAssignments = await prisma.feeAssignment.findMany({
        where: {
          academicSessionId,
          status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
          balanceAmount: { gt: 0 },
          dueDate: { lt: today },
        },
        take: PAGE_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
        select: { id: true, dueDate: true, lateFeesApplied: true },
      });

      if (overdueAssignments.length === 0) break;
      cursor = overdueAssignments[overdueAssignments.length - 1]!.id;

      const updates: Promise<unknown>[] = [];
      for (const a of overdueAssignments) {
        const daysLate = Math.floor(
          (today.getTime() - a.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        ) - graceDays;

        if (daysLate <= 0) continue;

        let lateFee = daysLate * lateFeePerDay;
        if (maxLateFee > 0) lateFee = Math.min(lateFee, maxLateFee);

        const currentLateFee = Number(a.lateFeesApplied);
        if (lateFee <= currentLateFee) continue;

        const additionalFee = lateFee - currentLateFee;
        updates.push(
          prisma.feeAssignment.update({
            where: { id: a.id },
            data: {
              lateFeesApplied: lateFee,
              totalAmount: { increment: additionalFee },
              balanceAmount: { increment: additionalFee },
              status: 'OVERDUE',
            },
          }),
        );
        updated++;
      }

      if (updates.length > 0) {
        await Promise.allSettled(updates);
      }

      if (overdueAssignments.length < PAGE_SIZE) break;
    }

    createAuditLog(session.user.id, 'APPLY_LATE_FEES', 'FEE_ASSIGNMENT', academicSessionId, {
      updated,
    }).catch((err) => logger.error({ err }, 'Audit log failed for late fees'));

    revalidateFeePaths();
    return actionSuccess({ updated });
  },
);
