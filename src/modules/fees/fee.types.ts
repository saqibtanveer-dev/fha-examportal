import type {
  FeeFrequency,
  FeeAssignmentStatus,
  PaymentMethod,
  PaymentStatus,
  AllocationStrategy,
} from '@prisma/client';

// ── Serialized types (numbers for Decimal fields, strings for dates) ──

export type SerializedFeeCategory = {
  id: string;
  name: string;
  description: string | null;
  frequency: FeeFrequency;
  isMandatory: boolean;
  isRefundable: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { structures: number };
};

export type SerializedFeeStructure = {
  id: string;
  categoryId: string;
  classId: string;
  academicSessionId: string;
  amount: number;
  effectiveFrom: string;
  isActive: boolean;
  category: { id: string; name: string; frequency: FeeFrequency };
  class: { id: string; name: string; grade: number };
};

export type SerializedFeeAssignment = {
  id: string;
  studentProfileId: string;
  academicSessionId: string;
  generatedForMonth: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  discountAmount: number;
  lateFeesApplied: number;
  dueDate: string;
  status: FeeAssignmentStatus;
  lineItems: SerializedLineItem[];
  studentProfile?: {
    id: string;
    rollNumber: string;
    user: { firstName: string; lastName: string };
    class: { id: string; name: string };
    section: { id: string; name: string };
  };
};

export type SerializedLineItem = {
  id: string;
  categoryName: string;
  amount: number;
};

export type SerializedPaymentRecord = {
  id: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  receiptNumber: string;
  paidAt: string;
};

export type SerializedFeeAssignmentWithPayments = SerializedFeeAssignment & {
  payments: SerializedPaymentRecord[];
};

export type SerializedFeePayment = {
  id: string;
  feeAssignmentId: string;
  familyPaymentId: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  receiptNumber: string;
  status: PaymentStatus;
  reversalReason: string | null;
  reversedAt: string | null;
  paidAt: string;
  recordedBy: { firstName: string; lastName: string };
  feeAssignment?: {
    generatedForMonth: string;
    studentProfile?: {
      rollNumber: string;
      user: { firstName: string; lastName: string };
    };
  };
};

export type SerializedFamilyPayment = {
  id: string;
  familyProfileId: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  masterReceiptNumber: string;
  allocationStrategy: AllocationStrategy;
  allocationDetails: Record<string, unknown> | null;
  status: PaymentStatus;
  paidAt: string;
  recordedBy: { firstName: string; lastName: string };
  childPayments: SerializedFeePayment[];
  familyProfile?: {
    user: { firstName: string; lastName: string };
  };
};

export type SerializedFeeSettings = {
  id: string;
  dueDayOfMonth: number;
  lateFeePerDay: number;
  maxLateFee: number;
  receiptPrefix: string;
  familyReceiptPrefix: string;
  gracePeriodDays: number;
  autoApplyCreditsOnGeneration: boolean;
  academicSessionId: string;
};

// ── Allocation engine types ──

export type ChildWithAssignments = {
  childId: string;
  childName: string;
  className: string;
  assignments: PendingAssignment[];
};

export type PendingAssignment = {
  assignmentId: string;
  periodLabel: string;
  categoryName: string;
  dueDate: string;
  balanceAmount: number;
};

export type AllocationInput = {
  totalAmount: number;
  strategy: AllocationStrategy;
  children: ChildWithAssignments[];
  manualAllocations?: { childId: string; amount: number }[];
  childPriorityOrder?: string[];
  customAllocations?: { feeAssignmentId: string; amount: number }[];
};

export type AllocationResult = {
  allocations: ChildAllocation[];
  totalAllocated: number;
  unallocated: number;
};

export type ChildAllocation = {
  childId: string;
  childName: string;
  className: string;
  allocatedAmount: number;
  assignmentAllocations: AssignmentAllocation[];
};

export type AssignmentAllocation = {
  assignmentId: string;
  periodLabel: string;
  categoryName: string;
  allocatedAmount: number;
  previousBalance: number;
  newBalance: number;
  status: 'CLEARED' | 'PARTIAL' | 'UNTOUCHED';
};

// ── Report types ──

export type ClassWiseSummary = {
  classId: string;
  className: string;
  grade: number;
  studentCount: number;
  totalDue: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionPercentage: number;
};

export type SectionWiseSummary = {
  sectionId: string;
  sectionName: string;
  studentCount: number;
  totalDue: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionPercentage: number;
};

export type StudentFeeSummary = {
  studentProfileId: string;
  studentName: string;
  rollNumber: string;
  sectionName: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
};

export type FeeOverview = {
  totalDue: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionPercentage: number;
  totalStudents: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
};
