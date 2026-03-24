import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/modules/audit/audit-queries';
import {
  findActiveDiscountsForStudents,
  computeDiscountForLineItems,
} from '../student-discount-queries';
import { applyCreditsToAssignment } from '../fee-credit-utils';
import { findFeeSettings } from '../fee-queries';

type FeeGenerationPayload = {
  generatedForMonth: string;
  classId?: string;
  sectionId?: string;
  studentProfileIds?: string[];
  categoryIds?: string[];
  dueDate: string;
  academicSessionId: string;
  requestedByUserId: string;
  lockId: string;
};

type FeeGenerationResult = {
  success: boolean;
  generated: number;
  skipped: number;
  reason?: string;
};

type ExistingAssignmentSnapshot = {
  id: string;
  studentProfileId: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  discountAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'WAIVED' | 'CANCELLED';
  lineItemStructureIds: Set<string>;
};

type ProcessItem = {
  studentProfileId: string;
  baseAmount: number;
  netAmount: number;
  discountAmount: number;
  lineItems: { feeStructureId: string; categoryName: string; amount: number }[];
  existing?: ExistingAssignmentSnapshot;
};

function deriveAssignmentStatusForBalance(
  previousStatus: ExistingAssignmentSnapshot['status'],
  paidAmount: number,
  newBalance: number,
): ExistingAssignmentSnapshot['status'] {
  if (newBalance <= 0) return 'PAID';
  if (previousStatus === 'OVERDUE') return 'OVERDUE';
  if (paidAmount > 0) return 'PARTIAL';
  return 'PENDING';
}

const BATCH_SIZE = 50;

export async function runFeeGeneration(payload: FeeGenerationPayload): Promise<FeeGenerationResult> {
  const { generatedForMonth, classId, sectionId, studentProfileIds, categoryIds, dueDate, academicSessionId, requestedByUserId, lockId } = payload;

  try {
    const lock = await prisma.auditLog.findFirst({
      where: {
        id: lockId,
        action: 'FEE_GENERATION_LOCK',
        entityType: 'FEE_ASSIGNMENT',
        entityId: generatedForMonth,
      },
      select: { id: true },
    });

    if (!lock) throw new Error('Fee generation lock not found; aborting stale or duplicate worker');

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

    const students = await prisma.studentProfile.findMany({
      where: studentWhere,
      select: { id: true, classId: true },
    });

    if (students.length === 0) {
      return { success: true, generated: 0, skipped: 0, reason: 'No active students' };
    }

    const structures = await prisma.feeStructure.findMany({
      where: { academicSessionId, isActive: true, ...(categoryIds?.length ? { categoryId: { in: categoryIds } } : {}) },
      include: { category: { select: { name: true, frequency: true } } },
    });

    if (structures.length === 0) return { success: true, generated: 0, skipped: 0, reason: 'No fee structures configured' };

    const classStructures = new Map<string, typeof structures>();
    for (const structure of structures) {
      const list = classStructures.get(structure.classId) ?? [];
      list.push(structure);
      classStructures.set(structure.classId, list);
    }

    const existingAssignmentsRaw = await prisma.feeAssignment.findMany({
      where: { academicSessionId, generatedForMonth, status: { not: 'CANCELLED' } },
      select: {
        id: true,
        studentProfileId: true,
        totalAmount: true,
        paidAmount: true,
        balanceAmount: true,
        discountAmount: true,
        status: true,
        lineItems: { select: { feeStructureId: true } },
      },
    });

    const existingByStudent = new Map<string, ExistingAssignmentSnapshot>();
    for (const assignment of existingAssignmentsRaw) {
      existingByStudent.set(assignment.studentProfileId, {
        id: assignment.id,
        studentProfileId: assignment.studentProfileId,
        totalAmount: Number(assignment.totalAmount),
        paidAmount: Number(assignment.paidAmount),
        balanceAmount: Number(assignment.balanceAmount),
        discountAmount: Number(assignment.discountAmount),
        status: assignment.status,
        lineItemStructureIds: new Set(assignment.lineItems.map((lineItem) => lineItem.feeStructureId)),
      });
    }

    const nonMonthlyStructureIds = structures
      .filter((structure) => structure.category.frequency !== 'MONTHLY')
      .map((structure) => structure.id);

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

      for (const lineItem of existingNonMonthly) {
        nonMonthlyAssigned.add(`${lineItem.feeAssignment.studentProfileId}:${lineItem.feeStructureId}`);
      }
    }

    const dueDateObj = new Date(`${dueDate}T00:00:00.000Z`);

    const toProcess: ProcessItem[] = [];

    const eligibleStudentIds = students
      .filter((student) => student.classId)
      .map((student) => student.id);

    const allDiscounts = eligibleStudentIds.length > 0 ? await findActiveDiscountsForStudents(eligibleStudentIds, academicSessionId) : [];

    const studentDiscountMap = new Map<string, typeof allDiscounts>();
    for (const discount of allDiscounts) {
      const list = studentDiscountMap.get(discount.studentProfileId) ?? [];
      list.push(discount);
      studentDiscountMap.set(discount.studentProfileId, list);
    }

    let skipped = 0;
    for (const student of students) {
      if (!student.classId) {
        skipped += 1;
        continue;
      }

      const existing = existingByStudent.get(student.id);

      const applicable = classStructures.get(student.classId);
      if (!applicable || applicable.length === 0) {
        skipped += 1;
        continue;
      }

      const filteredByFrequency = applicable.filter((structure) => structure.category.frequency === 'MONTHLY' || !nonMonthlyAssigned.has(`${student.id}:${structure.id}`));
      const filteredApplicable = existing
        ? filteredByFrequency.filter((structure) => !existing.lineItemStructureIds.has(structure.id))
        : filteredByFrequency;

      if (filteredApplicable.length === 0) {
        skipped += 1;
        continue;
      }

      const lineItemsRaw = filteredApplicable.map((structure) => ({
        feeStructureId: structure.id,
        categoryId: structure.categoryId,
        categoryName: structure.category.name,
        amount: Number(structure.amount),
      }));

      const baseAmount = lineItemsRaw.reduce((sum, lineItem) => sum + lineItem.amount, 0);

      const studentDiscounts = studentDiscountMap.get(student.id) ?? [];
      let discountAmount = 0;

      if (studentDiscounts.length > 0) {
        const computed = computeDiscountForLineItems(lineItemsRaw, studentDiscounts.map((discount) => ({
          discountType: discount.discountType,
          value: Number(discount.value),
          feeCategoryId: discount.feeCategoryId,
        })));
        discountAmount = computed.totalDiscount;
      }

      const netAmount = Math.round(Math.max(0, baseAmount - discountAmount) * 100) / 100;

      toProcess.push({
        studentProfileId: student.id,
        baseAmount,
        netAmount,
        discountAmount,
        lineItems: lineItemsRaw.map((lineItem) => ({
          feeStructureId: lineItem.feeStructureId,
          categoryName: lineItem.categoryName,
          amount: lineItem.amount,
        })),
        existing,
      });
    }

    const feeSettings = await findFeeSettings(academicSessionId);
    const autoApplyCreditsOnGeneration = (feeSettings as { autoApplyCreditsOnGeneration?: boolean } | null)?.autoApplyCreditsOnGeneration ?? true;

    let generated = 0;
    for (let batchIndex = 0; batchIndex < toProcess.length; batchIndex += BATCH_SIZE) {
      const batch = toProcess.slice(batchIndex, batchIndex + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(async (item) => {
        if (!item.existing) {
          const assignment = await prisma.feeAssignment.create({
            data: {
              studentProfileId: item.studentProfileId,
              academicSessionId,
              generatedForMonth,
              totalAmount: item.baseAmount,
              balanceAmount: item.netAmount,
              discountAmount: item.discountAmount,
              status: item.netAmount <= 0 ? 'WAIVED' : 'PENDING',
              dueDate: dueDateObj,
              generatedById: requestedByUserId,
              lineItems: { create: item.lineItems },
              ...(item.discountAmount > 0 ? {
                discounts: {
                  create: {
                    amount: item.discountAmount,
                    reason: 'Permanent student discount (auto-applied)',
                    source: 'RECURRING_STUDENT',
                    appliedById: requestedByUserId,
                  },
                },
              } : {}),
            },
          });

          if (autoApplyCreditsOnGeneration && item.netAmount > 0) {
            await applyCreditsToAssignment(item.studentProfileId, assignment.id, item.netAmount)
              .catch((err) => logger.error({ err }, 'Credit auto-apply failed'));
          }

          return assignment;
        }

        const newBalance = Math.round((item.existing.balanceAmount + item.netAmount) * 100) / 100;
        const newStatus = deriveAssignmentStatusForBalance(item.existing.status, item.existing.paidAmount, newBalance);

        const updated = await prisma.feeAssignment.update({
          where: { id: item.existing.id },
          data: {
            totalAmount: { increment: item.baseAmount },
            discountAmount: { increment: item.discountAmount },
            balanceAmount: { increment: item.netAmount },
            status: newStatus,
            lineItems: { create: item.lineItems },
            ...(item.discountAmount > 0 ? {
              discounts: {
                create: {
                  amount: item.discountAmount,
                  reason: 'Permanent student discount (auto-applied)',
                  source: 'RECURRING_STUDENT',
                  appliedById: requestedByUserId,
                },
              },
            } : {}),
          },
        });

        if (autoApplyCreditsOnGeneration && item.netAmount > 0) {
          await applyCreditsToAssignment(item.studentProfileId, item.existing.id, item.netAmount)
            .catch((err) => logger.error({ err }, 'Credit auto-apply failed'));
        }

        return updated;
      }));

      for (const result of results) {
        if (result.status === 'fulfilled') generated += 1;
        else {
          skipped += 1;
          logger.error({ err: result.reason }, 'Failed to create fee assignment in generation');
        }
      }

      await createAuditLog(requestedByUserId, 'FEE_GENERATION_CHECKPOINT', 'FEE_ASSIGNMENT', generatedForMonth, {
        batchIndex,
        batchSize: BATCH_SIZE,
        generated,
        skipped,
        totalStudents: toProcess.length,
        autoApplyCreditsOnGeneration,
      });
    }

    await createAuditLog(requestedByUserId, 'GENERATE_FEES', 'FEE_ASSIGNMENT', generatedForMonth, {
      generatedForMonth, classId, sectionId, studentProfileIds, categoryIds, generated, skipped, autoApplyCreditsOnGeneration,
    });

    return { success: true, generated, skipped };
  } catch (error: unknown) {
    try {
      await createAuditLog(requestedByUserId, 'GENERATE_FEES_FAILED', 'FEE_ASSIGNMENT', generatedForMonth, {
        classId,
        sectionId,
        studentProfileIds,
        categoryIds,
        error: error instanceof Error ? error.message : 'Unknown generation error',
      });
    } catch {
      // Audit log failure must not mask the original error.
    }

    throw error;
  }
}
