import { task } from '@trigger.dev/sdk/v3';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { createAuditLog } from '@/modules/audit/audit-queries';
import {
  findActiveDiscountsForStudents,
  computeDiscountForLineItems,
} from '../student-discount-queries';
import { applyCreditsToAssignment } from '../advance-payment-actions';

type FeeGenerationPayload = {
  generatedForMonth: string;
  classId?: string;
  dueDate: string;
  academicSessionId: string;
  requestedByUserId: string;
  lockId: string;
};

const BATCH_SIZE = 50;

export const feeGenerationWorkflow = task({
  id: 'fees-generation-workflow',
  run: async (payload: FeeGenerationPayload) => {
    const {
      generatedForMonth,
      classId,
      dueDate,
      academicSessionId,
      requestedByUserId,
      lockId,
    } = payload;

    try {
      // Verify lock is still held
      const lock = await prisma.auditLog.findFirst({
        where: {
          id: lockId,
          action: 'FEE_GENERATION_LOCK',
          entityType: 'FEE_ASSIGNMENT',
          entityId: generatedForMonth,
        },
        select: { id: true },
      });
      if (!lock) {
        throw new Error('Fee generation lock not found; aborting stale or duplicate worker');
      }

      // Get active students
      const students = await prisma.studentProfile.findMany({
        where: {
          status: 'ACTIVE',
          user: { isActive: true, deletedAt: null },
          ...(classId ? { classId } : {}),
        },
        select: { id: true, classId: true },
      });

      if (students.length === 0) {
        return { success: true, generated: 0, skipped: 0, reason: 'No active students' };
      }

      // Get all active structures for the session
      const structures = await prisma.feeStructure.findMany({
        where: { academicSessionId, isActive: true },
        include: { category: { select: { name: true, frequency: true } } },
      });

      if (structures.length === 0) {
        return { success: true, generated: 0, skipped: 0, reason: 'No fee structures configured' };
      }

      // Build classId → structures map
      const classStructures = new Map<string, typeof structures>();
      for (const s of structures) {
        const list = classStructures.get(s.classId) ?? [];
        list.push(s);
        classStructures.set(s.classId, list);
      }

      // Check existing assignments
      const existingAssignments = await prisma.feeAssignment.findMany({
        where: { academicSessionId, generatedForMonth, status: { not: 'CANCELLED' } },
        select: { studentProfileId: true },
      });
      const existingSet = new Set(existingAssignments.map((a) => a.studentProfileId));

      // Frequency guard: ONE_TIME/ANNUAL/TERM only once per session
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

      // Pre-compute eligible students and their line items
      type ToCreateItem = {
        studentProfileId: string;
        totalAmount: number;
        balanceAmount: number;
        discountAmount: number;
        lineItems: { feeStructureId: string; categoryName: string; amount: number }[];
      };
      const toCreate: ToCreateItem[] = [];

      const eligibleStudentIds = students
        .filter((s) => !existingSet.has(s.id) && s.classId)
        .map((s) => s.id);

      const allDiscounts = await findActiveDiscountsForStudents(eligibleStudentIds, academicSessionId);
      const studentDiscountMap = new Map<string, typeof allDiscounts>();
      for (const d of allDiscounts) {
        const list = studentDiscountMap.get(d.studentProfileId) ?? [];
        list.push(d);
        studentDiscountMap.set(d.studentProfileId, list);
      }

      let skipped = 0;
      for (const student of students) {
        if (existingSet.has(student.id) || !student.classId) {
          skipped++;
          continue;
        }

        const applicable = classStructures.get(student.classId);
        if (!applicable || applicable.length === 0) { skipped++; continue; }

        const filteredApplicable = applicable.filter((s) => {
          if (s.category.frequency === 'MONTHLY') return true;
          return !nonMonthlyAssigned.has(`${student.id}:${s.id}`);
        });
        if (filteredApplicable.length === 0) { skipped++; continue; }

        const lineItemsRaw = filteredApplicable.map((s) => ({
          feeStructureId: s.id,
          categoryId: s.categoryId,
          categoryName: s.category.name,
          amount: Number(s.amount),
        }));

        const baseAmount = lineItemsRaw.reduce((sum, li) => sum + li.amount, 0);

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
          totalAmount: baseAmount,
          balanceAmount: totalAmount,
          discountAmount,
          lineItems: lineItemsRaw.map((li) => ({
            feeStructureId: li.feeStructureId,
            categoryName: li.categoryName,
            amount: li.amount,
          })),
        });
      }

      // Process in batches with checkpoint logging
      let generated = 0;
      for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
        const batch = toCreate.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((data) =>
            prisma.feeAssignment.create({
              data: {
                studentProfileId: data.studentProfileId,
                academicSessionId,
                generatedForMonth,
                totalAmount: data.totalAmount,
                balanceAmount: data.balanceAmount,
                discountAmount: data.discountAmount,
                status: data.balanceAmount <= 0 ? 'WAIVED' : 'PENDING',
                dueDate: dueDateObj,
                generatedById: requestedByUserId,
                lineItems: { create: data.lineItems },
                ...(data.discountAmount > 0 ? {
                  discounts: {
                    create: {
                      amount: data.discountAmount,
                      reason: 'Permanent student discount (auto-applied)',
                      appliedById: requestedByUserId,
                    },
                  },
                } : {}),
              },
            }).then(async (assignment) => {
              if (data.balanceAmount > 0) {
                await applyCreditsToAssignment(
                  data.studentProfileId, assignment.id, data.balanceAmount, academicSessionId,
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
            logger.error({ err: r.reason }, 'Failed to create fee assignment in worker');
          }
        }

        // Checkpoint after each batch
        await createAuditLog(
          requestedByUserId,
          'FEE_GENERATION_CHECKPOINT',
          'FEE_ASSIGNMENT',
          generatedForMonth,
          { batchIndex: i, batchSize: BATCH_SIZE, generated, skipped, totalStudents: toCreate.length },
        );
      }

      // Final audit log
      await createAuditLog(requestedByUserId, 'GENERATE_FEES', 'FEE_ASSIGNMENT', generatedForMonth, {
        generatedForMonth, classId, generated, skipped,
      });

      return { success: true, generated, skipped };
    } catch (error: unknown) {
      await createAuditLog(
        requestedByUserId,
        'GENERATE_FEES_FAILED',
        'FEE_ASSIGNMENT',
        generatedForMonth,
        { error: error instanceof Error ? error.message : 'Unknown workflow error' },
      );
      throw error;
    }
  },
});
