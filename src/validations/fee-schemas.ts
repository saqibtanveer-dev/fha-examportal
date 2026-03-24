import { z } from 'zod/v4';

// ============================================
// ENUMS
// ============================================

const feeFrequencyEnum = z.enum(['MONTHLY', 'TERM', 'ANNUAL', 'ONE_TIME']);
const paymentMethodEnum = z.enum(['CASH', 'BANK_TRANSFER', 'ONLINE', 'CHEQUE']);
const allocationStrategyEnum = z.enum([
  'OLDEST_FIRST', 'CHILD_PRIORITY', 'EQUAL_SPLIT', 'MANUAL', 'CUSTOM',
]);

// ============================================
// FEE CATEGORY
// ============================================

export const createFeeCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  frequency: feeFrequencyEnum,
  isMandatory: z.boolean().default(true),
  isRefundable: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export type CreateFeeCategoryInput = z.infer<typeof createFeeCategorySchema>;

export const updateFeeCategorySchema = createFeeCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateFeeCategoryInput = z.infer<typeof updateFeeCategorySchema>;

// ============================================
// FEE STRUCTURE
// ============================================

export const createFeeStructureSchema = z.object({
  categoryId: z.string().uuid('Invalid category'),
  classId: z.string().uuid('Invalid class'),
  academicSessionId: z.string().uuid('Invalid session'),
  amount: z.number().positive('Amount must be positive').max(9999999999, 'Amount too large'),
});

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;

export const updateFeeStructureSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(9999999999).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateFeeStructureInput = z.infer<typeof updateFeeStructureSchema>;

export const bulkCreateStructuresSchema = z.object({
  categoryId: z.string().uuid('Invalid category'),
  academicSessionId: z.string().uuid('Invalid session'),
  classAmounts: z.array(z.object({
    classId: z.string().uuid('Invalid class'),
    amount: z.number().positive('Amount must be positive'),
  })).min(1, 'At least one class required'),
});

export type BulkCreateStructuresInput = z.infer<typeof bulkCreateStructuresSchema>;

// ============================================
// FEE GENERATION
// ============================================

export const generateFeesSchema = z.object({
  generatedForMonth: z.string().regex(
    /^\d{4}-(0[1-9]|1[0-2])$/,
    'Month must be YYYY-MM format',
  ),
  classId: z.string().uuid('Invalid class').optional(),
  sectionId: z.string().uuid('Invalid section').optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
  studentProfileIds: z.array(z.string().uuid()).optional(),
  familyProfileId: z.string().uuid('Invalid family').optional(),
  categoryIds: z.array(z.string().uuid('Invalid category')).optional(),
});

export type GenerateFeesInput = z.infer<typeof generateFeesSchema>;

// ============================================
// INDIVIDUAL PAYMENT (student mode)
// ============================================

export const recordPaymentSchema = z.object({
  feeAssignmentId: z.string().uuid('Invalid assignment'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: paymentMethodEnum,
  referenceNumber: z.string().max(100).optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

// ============================================
// FAMILY PAYMENT
// ============================================

const manualAllocationItem = z.object({
  childId: z.string().uuid(),
  amount: z.number().min(0),
});

export const recordFamilyPaymentSchema = z.object({
  familyProfileId: z.string().uuid('Invalid family'),
  totalAmount: z.number().positive('Amount must be positive'),
  paymentMethod: paymentMethodEnum,
  referenceNumber: z.string().max(100).optional(),
  allocationStrategy: allocationStrategyEnum,
  manualAllocations: z.array(manualAllocationItem).optional(),
  childPriorityOrder: z.array(z.string().uuid()).optional(),
  customAllocations: z.array(z.object({
    feeAssignmentId: z.string().uuid(),
    amount: z.number().min(0),
  })).optional(),
}).superRefine((data, ctx) => {
  if (data.allocationStrategy === 'MANUAL' && (!data.manualAllocations || data.manualAllocations.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['manualAllocations'],
      message: 'Manual allocations are required for MANUAL strategy',
    });
  }

  if (data.allocationStrategy === 'CUSTOM' && (!data.customAllocations || data.customAllocations.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['customAllocations'],
      message: 'Custom allocations are required for CUSTOM strategy',
    });
  }
});

export type RecordFamilyPaymentInput = z.infer<typeof recordFamilyPaymentSchema>;

// ============================================
// DISCOUNT
// ============================================

export const applyDiscountSchema = z.object({
  feeAssignmentId: z.string().uuid('Invalid assignment'),
  amount: z.number().positive('Discount must be positive'),
  reason: z.string().min(3, 'Reason required').max(500),
});

export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>;

// ============================================
// REVERSAL
// ============================================

export const reversePaymentSchema = z.object({
  paymentId: z.string().uuid('Invalid payment'),
  reason: z.string().min(3, 'Reason required').max(500),
});

export type ReversePaymentInput = z.infer<typeof reversePaymentSchema>;

// ============================================
// FEE SETTINGS
// ============================================

export const updateFeeSettingsSchema = z.object({
  dueDayOfMonth: z.number().int().min(1).max(28).optional(),
  lateFeePerDay: z.number().min(0).optional(),
  maxLateFee: z.number().min(0).optional(),
  receiptPrefix: z.string().min(1).max(10).optional(),
  familyReceiptPrefix: z.string().min(1).max(10).optional(),
  gracePeriodDays: z.number().int().min(0).max(30).optional(),
  autoApplyCreditsOnGeneration: z.boolean().optional(),
});

export type UpdateFeeSettingsInput = z.infer<typeof updateFeeSettingsSchema>;

// ============================================
// CANCEL ASSIGNMENT
// ============================================

export const cancelAssignmentSchema = z.object({
  feeAssignmentId: z.string().uuid('Invalid assignment'),
  reason: z.string().min(3, 'Reason required').max(500),
});

export type CancelAssignmentInput = z.infer<typeof cancelAssignmentSchema>;

// ============================================
// FAMILY DISCOUNT
// ============================================

const familyDiscountItem = z.object({
  feeAssignmentId: z.string().uuid(),
  amount: z.number().positive('Discount must be positive'),
});

export const applyFamilyDiscountSchema = z.object({
  familyProfileId: z.string().uuid('Invalid family'),
  discounts: z.array(familyDiscountItem).min(1, 'At least one discount required'),
  reason: z.string().min(3, 'Reason required').max(500),
});

export type ApplyFamilyDiscountInput = z.infer<typeof applyFamilyDiscountSchema>;

// ============================================
// COMBINED FEE COLLECTION (payment + discount in one operation)
// ============================================

export const collectStudentFeeSchema = z.object({
  feeAssignmentId: z.string().uuid('Invalid assignment'),
  paymentAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  paymentMethod: paymentMethodEnum,
  referenceNumber: z.string().max(100).optional(),
  discountReason: z.string().min(3).max(500).optional(),
});

export type CollectStudentFeeInput = z.infer<typeof collectStudentFeeSchema>;

export const collectFamilyFeeSchema = z.object({
  familyProfileId: z.string().uuid('Invalid family'),
  items: z.array(z.object({
    feeAssignmentId: z.string().uuid(),
    paymentAmount: z.number().min(0).default(0),
    discountAmount: z.number().min(0).default(0),
  })).min(1, 'At least one assignment required'),
  paymentMethod: paymentMethodEnum,
  referenceNumber: z.string().max(100).optional(),
  discountReason: z.string().min(3).max(500).optional(),
});

export type CollectFamilyFeeInput = z.infer<typeof collectFamilyFeeSchema>;

export const applyAssignmentCreditsSchema = z.object({
  feeAssignmentId: z.string().uuid('Invalid assignment'),
});

export type ApplyAssignmentCreditsInput = z.infer<typeof applyAssignmentCreditsSchema>;

// ============================================
// CUSTOM ALLOCATION (per-assignment amounts)
// ============================================

const customAllocationItem = z.object({
  feeAssignmentId: z.string().uuid(),
  amount: z.number().min(0),
});

export const recordCustomFamilyPaymentSchema = z.object({
  familyProfileId: z.string().uuid('Invalid family'),
  totalAmount: z.number().positive('Amount must be positive'),
  paymentMethod: paymentMethodEnum,
  referenceNumber: z.string().max(100).optional(),
  customAllocations: z.array(customAllocationItem).min(1, 'At least one allocation required'),
});

export type RecordCustomFamilyPaymentInput = z.infer<typeof recordCustomFamilyPaymentSchema>;

// ============================================
// STUDENT-LEVEL PERMANENT DISCOUNT
// ============================================

const studentDiscountTypeEnum = z.enum(['FLAT', 'PERCENTAGE']);

export const createStudentFeeDiscountSchema = z.object({
  studentProfileId: z.string().uuid('Invalid student'),
  discountType: studentDiscountTypeEnum,
  value: z.number().positive('Discount value must be positive'),
  reason: z.string().min(3, 'Reason required').max(500),
  feeCategoryId: z.string().uuid().optional(), // null = all categories
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
}).refine(
  (d) => d.discountType !== 'PERCENTAGE' || d.value <= 100,
  { message: 'Percentage cannot exceed 100', path: ['value'] },
);

export type CreateStudentFeeDiscountInput = z.infer<typeof createStudentFeeDiscountSchema>;

export const updateStudentFeeDiscountSchema = z.object({
  id: z.string().uuid('Invalid discount'),
  value: z.number().positive('Discount value must be positive').optional(),
  reason: z.string().min(3).max(500).optional(),
  isActive: z.boolean().optional(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

export type UpdateStudentFeeDiscountInput = z.infer<typeof updateStudentFeeDiscountSchema>;

// ============================================
// ADVANCE PAYMENT (explicit advance — no assignment needed)
// ============================================

export const recordAdvancePaymentSchema = z.object({
  studentProfileId: z.string().uuid('Invalid student'),
  familyProfileId: z.string().uuid().optional(),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().max(500).optional(),
  referenceNumber: z.string().max(100).optional(),
});

export type RecordAdvancePaymentInput = z.infer<typeof recordAdvancePaymentSchema>;
