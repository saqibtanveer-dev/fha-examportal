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
  createStudentFeeDiscountSchema,
  updateStudentFeeDiscountSchema,
  type CreateStudentFeeDiscountInput,
  type UpdateStudentFeeDiscountInput,
} from '@/validations/fee-schemas';
import { getCurrentAcademicSessionId } from './fee-queries';

const FEE_PATHS = ['/admin/fees', '/admin/fees/discounts'];
const revalidateFeePaths = () => FEE_PATHS.forEach((p) => revalidatePath(p));

// ── Create permanent student discount ──

export const createStudentFeeDiscountAction = safeAction(
  async function createStudentFeeDiscountAction(
    input: CreateStudentFeeDiscountInput,
  ): Promise<ActionResult<{ discountId: string }>> {
    const session = await requireRole('ADMIN');
    const parsed = createStudentFeeDiscountSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { studentProfileId, discountType, value, reason, feeCategoryId, validUntil } = parsed.data;

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    // Verify student exists and get their class for fee validation
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: { id: true, classId: true, user: { select: { firstName: true, lastName: true } } },
    });
    if (!student) return actionError('Student not found');
    if (!student.classId) return actionError('Student has no class assigned');

    // Verify category if specified
    if (feeCategoryId) {
      const cat = await prisma.feeCategory.findUnique({ where: { id: feeCategoryId }, select: { id: true } });
      if (!cat) return actionError('Fee category not found');
    }

    // Validate FLAT discount doesn't exceed the actual fee amount
    if (discountType === 'FLAT') {
      const structures = await prisma.feeStructure.findMany({
        where: {
          academicSessionId,
          classId: student.classId,
          isActive: true,
          ...(feeCategoryId ? { categoryId: feeCategoryId } : {}),
        },
        select: { amount: true, categoryId: true },
      });

      if (structures.length === 0) {
        return actionError('No fee structures found for this student\'s class. Configure fees first.');
      }

      const maxFee = feeCategoryId
        ? Number(structures[0]?.amount ?? 0)
        : structures.reduce((sum, s) => sum + Number(s.amount), 0);

      if (value > maxFee) {
        return actionError(
          `Discount Rs. ${value} exceeds the ${feeCategoryId ? 'category' : 'total monthly'} fee of Rs. ${maxFee}. Maximum allowed: Rs. ${maxFee}.`,
        );
      }
    }

    // Check for duplicate (same student + session + category)
    const existing = await prisma.studentFeeDiscount.findFirst({
      where: {
        studentProfileId,
        academicSessionId,
        feeCategoryId: feeCategoryId ?? null,
      },
    });

    if (existing) {
      return actionError(
        feeCategoryId
          ? 'A discount already exists for this student + category this session. Edit or deactivate it first.'
          : 'A global discount already exists for this student this session. Edit or deactivate it first.',
      );
    }

    const discount = await prisma.studentFeeDiscount.create({
      data: {
        studentProfileId,
        academicSessionId,
        discountType,
        value,
        reason,
        feeCategoryId: feeCategoryId ?? null,
        isActive: true,
        validUntil: validUntil ? new Date(validUntil + 'T23:59:59.999Z') : null,
        approvedById: session.user.id,
      },
    });

    createAuditLog(session.user.id, 'CREATE_STUDENT_FEE_DISCOUNT', 'STUDENT_FEE_DISCOUNT', discount.id, {
      studentProfileId,
      discountType,
      value,
      reason,
      feeCategoryId,
    }).catch((err) => logger.error({ err }, 'Audit log failed for student fee discount'));

    revalidateFeePaths();
    return actionSuccess({ discountId: discount.id });
  },
);

// ── Update student discount ──

export const updateStudentFeeDiscountAction = safeAction(
  async function updateStudentFeeDiscountAction(
    input: UpdateStudentFeeDiscountInput,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');
    const parsed = updateStudentFeeDiscountSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const { id, value, reason, isActive, validUntil } = parsed.data;

    const existing = await prisma.studentFeeDiscount.findUnique({
      where: { id },
      select: {
        id: true, discountType: true, feeCategoryId: true,
        studentProfile: { select: { classId: true } },
        academicSessionId: true,
      },
    });
    if (!existing) return actionError('Discount not found');

    // Validate percentage cap
    if (value !== undefined && existing.discountType === 'PERCENTAGE' && value > 100) {
      return actionError('Percentage cannot exceed 100');
    }

    // Validate FLAT value doesn't exceed fee
    if (value !== undefined && existing.discountType === 'FLAT' && existing.studentProfile.classId) {
      const structures = await prisma.feeStructure.findMany({
        where: {
          academicSessionId: existing.academicSessionId,
          classId: existing.studentProfile.classId,
          isActive: true,
          ...(existing.feeCategoryId ? { categoryId: existing.feeCategoryId } : {}),
        },
        select: { amount: true },
      });
      const maxFee = existing.feeCategoryId
        ? Number(structures[0]?.amount ?? 0)
        : structures.reduce((sum, s) => sum + Number(s.amount), 0);
      if (value > maxFee) {
        return actionError(`Discount Rs. ${value} exceeds the fee of Rs. ${maxFee}.`);
      }
    }

    await prisma.studentFeeDiscount.update({
      where: { id },
      data: {
        ...(value !== undefined ? { value } : {}),
        ...(reason !== undefined ? { reason } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(validUntil !== undefined
          ? { validUntil: validUntil ? new Date(validUntil + 'T23:59:59.999Z') : null }
          : {}),
      },
    });

    createAuditLog(session.user.id, 'UPDATE_STUDENT_FEE_DISCOUNT', 'STUDENT_FEE_DISCOUNT', id, {
      value, reason, isActive,
    }).catch((err) => logger.error({ err }, 'Audit log failed for update student fee discount'));

    revalidateFeePaths();
    return actionSuccess();
  },
);

// ── Delete student discount ──

export const deleteStudentFeeDiscountAction = safeAction(
  async function deleteStudentFeeDiscountAction(
    discountId: string,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const existing = await prisma.studentFeeDiscount.findUnique({
      where: { id: discountId },
      select: { id: true, studentProfileId: true },
    });
    if (!existing) return actionError('Discount not found');

    await prisma.studentFeeDiscount.delete({ where: { id: discountId } });

    createAuditLog(session.user.id, 'DELETE_STUDENT_FEE_DISCOUNT', 'STUDENT_FEE_DISCOUNT', discountId, {
      studentProfileId: existing.studentProfileId,
    }).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidateFeePaths();
    return actionSuccess();
  },
);
