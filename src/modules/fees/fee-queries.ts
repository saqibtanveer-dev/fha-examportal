import { prisma } from '@/lib/prisma';

// ── Shared selects ──
export const studentProfileSelect = {
  id: true,
  rollNumber: true,
  user: { select: { firstName: true, lastName: true } },
  class: { select: { id: true, name: true, grade: true } },
  section: { select: { id: true, name: true } },
} as const;

const lineItemSelect = { id: true, categoryName: true, amount: true } as const;

const paymentSelect = {
  id: true,
  amount: true,
  paymentMethod: true,
  referenceNumber: true,
  receiptNumber: true,
  status: true,
  paidAt: true,
  recordedBy: { select: { firstName: true, lastName: true } },
} as const;

// ── Fee Categories ──
export async function findAllFeeCategories(activeOnly = false) {
  return prisma.feeCategory.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { structures: true } } },
  });
}

export async function findFeeCategoryById(id: string) {
  return prisma.feeCategory.findUnique({
    where: { id },
    include: { _count: { select: { structures: true } } },
  });
}

// ── Fee Structures ──
export async function findFeeStructures(
  academicSessionId: string, classId?: string,
) {
  return prisma.feeStructure.findMany({
    where: {
      academicSessionId,
      isActive: true,
      ...(classId ? { classId } : {}),
    },
    include: {
      category: { select: { id: true, name: true, frequency: true } },
      class: { select: { id: true, name: true, grade: true } },
    },
    orderBy: [{ class: { grade: 'asc' } }, { category: { name: 'asc' } }],
  });
}

export async function findFeeStructureById(id: string) {
  return prisma.feeStructure.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, frequency: true } },
      class: { select: { id: true, name: true, grade: true } },
    },
  });
}

export async function findStructuresForClass(
  classId: string,
  academicSessionId: string,
) {
  return prisma.feeStructure.findMany({
    where: { classId, academicSessionId, isActive: true },
    include: {
      category: { select: { id: true, name: true, frequency: true } },
    },
    orderBy: { category: { name: 'asc' } },
  });
}

// ── Fee Assignments ──
export async function findStudentAssignments(
  studentProfileId: string, academicSessionId: string, month?: string, limit = 36,
) {
  return prisma.feeAssignment.findMany({
    where: {
      studentProfileId,
      academicSessionId,
      status: { not: 'CANCELLED' },
      ...(month ? { generatedForMonth: month } : {}),
    },
    include: {
      lineItems: { select: lineItemSelect },
      studentProfile: { select: studentProfileSelect },
    },
    orderBy: [{ generatedForMonth: 'asc' }, { dueDate: 'asc' }],
    take: limit,
  });
}

export async function findAssignmentById(id: string) {
  return prisma.feeAssignment.findUnique({
    where: { id },
    include: {
      lineItems: { select: lineItemSelect },
      studentProfile: { select: studentProfileSelect },
      payments: {
        where: { status: { in: ['COMPLETED', 'REVERSED'] } },
        orderBy: { paidAt: 'desc' },
        select: paymentSelect,
        take: 50,
      },
      discounts: {
        select: {
          id: true,
          reason: true,
          amount: true,
          source: true,
          createdAt: true,
          appliedBy: { select: { firstName: true, lastName: true } },
        },
        take: 50,
      },
    },
  });
}

export async function hasAssignmentsForMonth(
  academicSessionId: string,
  generatedForMonth: string,
  classId?: string,
) {
  const where: Record<string, unknown> = {
    academicSessionId,
    generatedForMonth,
    status: { not: 'CANCELLED' },
  };
  if (classId) where.studentProfile = { classId };
  const count = await prisma.feeAssignment.count({ where });
  return count > 0;
}

export async function findPendingAssignmentsForStudent(
  studentProfileId: string, academicSessionId: string,
) {
  return prisma.feeAssignment.findMany({
    where: {
      studentProfileId,
      academicSessionId,
      status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
      balanceAmount: { gt: 0 },
    },
    include: { lineItems: { select: lineItemSelect } },
    orderBy: { dueDate: 'asc' },
  });
}

// ── Fee Payments ──

export async function findPaymentsByAssignment(feeAssignmentId: string) {
  return prisma.feePayment.findMany({
    where: { feeAssignmentId, status: 'COMPLETED' },
    include: {
      recordedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { paidAt: 'desc' },
  });
}

export async function findPaymentByReceiptNumber(receiptNumber: string) {
  return prisma.feePayment.findUnique({
    where: { receiptNumber },
    include: {
      feeAssignment: {
        include: {
          studentProfile: { select: studentProfileSelect },
          lineItems: { select: lineItemSelect },
        },
      },
      recordedBy: { select: { firstName: true, lastName: true } },
    },
  });
}

export async function findFamilyPayments(familyProfileId: string, limit = 100) {
  return prisma.familyPayment.findMany({
    where: { familyProfileId },
    include: {
      recordedBy: { select: { firstName: true, lastName: true } },
      childPayments: {
        include: {
          feeAssignment: {
            select: {
              generatedForMonth: true,
              studentProfile: {
                select: {
                  rollNumber: true,
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { paidAt: 'desc' },
    take: limit,
  });
}

export async function findFamilyPaymentById(id: string) {
  return prisma.familyPayment.findUnique({
    where: { id },
    include: {
      familyProfile: {
        select: { user: { select: { firstName: true, lastName: true } } },
      },
      recordedBy: { select: { firstName: true, lastName: true } },
      childPayments: {
        include: {
          feeAssignment: {
            include: {
              studentProfile: { select: studentProfileSelect },
              lineItems: { select: lineItemSelect },
            },
          },
        },
        take: 100,
      },
    },
  });
}

// ── Fee Settings ──

export async function findFeeSettings(academicSessionId: string) {
  return prisma.feeSettings.findUnique({
    where: { academicSessionId },
  });
}

export async function upsertFeeSettings(
  academicSessionId: string,
  data: {
    dueDayOfMonth?: number; lateFeePerDay?: number; maxLateFee?: number;
    receiptPrefix?: string; familyReceiptPrefix?: string; gracePeriodDays?: number;
    autoApplyCreditsOnGeneration?: boolean;
  },
) {
  return prisma.feeSettings.upsert({
    where: { academicSessionId },
    create: { academicSessionId, ...data },
    update: data,
  });
}

// ── Helpers ──
export async function getCurrentAcademicSessionId(): Promise<string | null> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  return session?.id ?? null;
}
