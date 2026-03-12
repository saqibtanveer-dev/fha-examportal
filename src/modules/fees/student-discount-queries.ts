import { prisma } from '@/lib/prisma';

// ── Active discounts for a student in a session ──
export async function findActiveStudentDiscounts(
  studentProfileId: string,
  academicSessionId: string,
) {
  const now = new Date();
  return prisma.studentFeeDiscount.findMany({
    where: {
      studentProfileId,
      academicSessionId,
      isActive: true,
      OR: [{ validUntil: null }, { validUntil: { gte: now } }],
    },
    include: {
      feeCategory: { select: { id: true, name: true } },
      approvedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

// ── All discounts for a student (including inactive) ──
export async function findAllStudentDiscounts(
  studentProfileId: string,
  academicSessionId: string,
) {
  return prisma.studentFeeDiscount.findMany({
    where: { studentProfileId, academicSessionId },
    include: {
      feeCategory: { select: { id: true, name: true } },
      approvedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ── Bulk fetch active discounts for multiple students (for fee generation) ──
export async function findActiveDiscountsForStudents(
  studentProfileIds: string[],
  academicSessionId: string,
) {
  if (studentProfileIds.length === 0) return [];
  const now = new Date();
  return prisma.studentFeeDiscount.findMany({
    where: {
      studentProfileId: { in: studentProfileIds },
      academicSessionId,
      isActive: true,
      OR: [{ validUntil: null }, { validUntil: { gte: now } }],
    },
    select: {
      studentProfileId: true,
      discountType: true,
      value: true,
      feeCategoryId: true,
    },
  });
}

// ── Compute discount amount for a set of line items ──
export function computeDiscountForLineItems(
  lineItems: { feeStructureId: string; categoryId: string; categoryName: string; amount: number }[],
  discounts: { discountType: string; value: number; feeCategoryId: string | null }[],
): { totalDiscount: number; lineItemDiscounts: Map<string, number> } {
  let totalDiscount = 0;
  const lineItemDiscounts = new Map<string, number>();

  for (const li of lineItems) {
    let discountForItem = 0;
    for (const d of discounts) {
      // If category-specific discount, only apply to matching category
      if (d.feeCategoryId && d.feeCategoryId !== li.categoryId) continue;

      if (d.discountType === 'FLAT') {
        discountForItem += d.value;
      } else if (d.discountType === 'PERCENTAGE') {
        discountForItem += Math.round((li.amount * d.value) / 100 * 100) / 100;
      }
    }
    // Cap discount at line item amount
    discountForItem = Math.min(discountForItem, li.amount);
    discountForItem = Math.round(discountForItem * 100) / 100;
    lineItemDiscounts.set(li.feeStructureId, discountForItem);
    totalDiscount += discountForItem;
  }

  return { totalDiscount: Math.round(totalDiscount * 100) / 100, lineItemDiscounts };
}
