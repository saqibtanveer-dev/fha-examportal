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
  type GenerateFeesInput,
} from '@/validations/fee-schemas';
import { getCurrentAcademicSessionId } from './fee-queries';
import { applyCreditsToAssignment } from './advance-payment-actions';
import {
  findActiveDiscountsForStudents,
  computeDiscountForLineItems,
} from './student-discount-queries';

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

    // Frequency guard: ONE_TIME/ANNUAL/TERM structures should only generate once per session
    const nonMonthlyStructureIds = structures
      .filter((s) => s.category.frequency !== 'MONTHLY')
      .map((s) => s.id);

    const nonMonthlyAssigned = new Set<string>();
    if (nonMonthlyStructureIds.length > 0) {
      const existingNonMonthly = await prisma.feeLineItem.findMany({
        where: {
          feeStructureId: { in: nonMonthlyStructureIds },
          feeAssignment: { academicSessionId, status: { not: 'CANCELLED' } },
        },
        select: {
          feeStructureId: true,
          feeAssignment: { select: { studentProfileId: true } },
        },
      });
      for (const li of existingNonMonthly) {
        nonMonthlyAssigned.add(`${li.feeAssignment.studentProfileId}:${li.feeStructureId}`);
      }
    }

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
      discountAmount: number;
      dueDate: Date;
      generatedById: string;
      lineItems: { feeStructureId: string; categoryName: string; amount: number }[];
    }[] = [];

    // Bulk-fetch active permanent discounts for all students being processed
    const eligibleStudentIds = students
      .filter((s) => !existingSet.has(s.id) && s.classId)
      .map((s) => s.id);
    const allDiscounts = await findActiveDiscountsForStudents(eligibleStudentIds, academicSessionId);

    // Build a map: studentId → their discounts
    const studentDiscountMap = new Map<string, typeof allDiscounts>();
    for (const d of allDiscounts) {
      const list = studentDiscountMap.get(d.studentProfileId) ?? [];
      list.push(d);
      studentDiscountMap.set(d.studentProfileId, list);
    }

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

      // Filter out non-monthly structures already assigned this session
      const filteredApplicable = applicable.filter((s) => {
        if (s.category.frequency === 'MONTHLY') return true;
        return !nonMonthlyAssigned.has(`${student.id}:${s.id}`);
      });

      if (filteredApplicable.length === 0) {
        skipped++;
        continue;
      }

      const lineItemsRaw = filteredApplicable.map((s) => ({
        feeStructureId: s.id,
        categoryId: s.categoryId,
        categoryName: s.category.name,
        amount: Number(s.amount),
      }));

      const baseAmount = lineItemsRaw.reduce((sum, li) => sum + li.amount, 0);

      // Apply permanent student-level discounts
      const studentDiscounts = studentDiscountMap.get(student.id) ?? [];
      let discountAmount = 0;
      if (studentDiscounts.length > 0) {
        const computed = computeDiscountForLineItems(
          lineItemsRaw,
          studentDiscounts.map((d) => ({
            discountType: d.discountType,
            value: Number(d.value),
            feeCategoryId: d.feeCategoryId,
          })),
        );
        discountAmount = computed.totalDiscount;
      }

      const totalAmount = Math.round(Math.max(0, baseAmount - discountAmount) * 100) / 100;

      toCreate.push({
        studentProfileId: student.id,
        academicSessionId,
        generatedForMonth,
        totalAmount: baseAmount,
        balanceAmount: totalAmount,
        discountAmount,
        dueDate: dueDateObj,
        generatedById: session.user.id,
        lineItems: lineItemsRaw.map((li) => ({
          feeStructureId: li.feeStructureId,
          categoryName: li.categoryName,
          amount: li.amount,
        })),
      });
    }

    // Process in batches to avoid Neon serverless timeout.
    // Each create is atomic (Prisma wraps nested writes in an implicit transaction).
    const BATCH_SIZE = 50;
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
              discountAmount: data.discountAmount,
              status: data.balanceAmount <= 0 ? 'WAIVED' : 'PENDING',
              dueDate: data.dueDate,
              generatedById: data.generatedById,
              lineItems: { create: data.lineItems },
              // Auto-create FeeDiscount record for permanent discount tracking
              ...(data.discountAmount > 0 ? {
                discounts: {
                  create: {
                    amount: data.discountAmount,
                    reason: 'Permanent student discount (auto-applied)',
                    appliedById: data.generatedById,
                  },
                },
              } : {}),
            },
          }).then(async (assignment) => {
            // Auto-apply any existing credits to this new assignment (use balanceAmount, not total)
            if (data.balanceAmount > 0) {
              await applyCreditsToAssignment(
                data.studentProfileId, assignment.id, data.balanceAmount, data.academicSessionId,
              ).catch((err) => logger.error({ err }, 'Credit auto-apply failed'));
            }
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
