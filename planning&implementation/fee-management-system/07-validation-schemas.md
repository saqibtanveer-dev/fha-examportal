# Fee Management — Validation Schemas

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 9. Validation Schemas

### File: `src/validations/fee-schemas.ts`

```typescript
// ─── Fee Category Schemas ───

feeCategorySchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric"),
  type: z.nativeEnum(FeeType),
  description: z.string().max(500).optional(),
  isRefundable: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
})

// ─── Fee Structure Schemas ───

feeStructureSchema = z.object({
  feeCategoryId: z.string().uuid(),
  classId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
  amount: z.number().positive("Amount must be greater than 0"),
  frequency: z.nativeEnum(FeeFrequency),
  dueDay: z.number().int().min(1).max(28).optional(), // 28 to avoid month-end issues
  dueDateFixed: z.coerce.date().optional(),
  lateFeePercentage: z.number().min(0).max(100).optional(),
  lateFeeFixedAmount: z.number().min(0).optional(),
  gracePeriodDays: z.number().int().min(0).max(90).default(7),
  description: z.string().max(500).optional(),
}).refine(
  data => !(data.lateFeePercentage && data.lateFeeFixedAmount),
  { message: "Cannot set both late fee percentage AND fixed amount" }
).refine(
  data => data.frequency === 'MONTHLY' ? !!data.dueDay : true,
  { message: "Due day is required for monthly fees" }
).refine(
  data => data.frequency === 'ONE_TIME' || data.frequency === 'ANNUAL' ? !!data.dueDateFixed : true,
  { message: "Fixed due date is required for one-time and annual fees" }
)

// ─── Fee Generation Schemas ───

generateFeeAssignmentsSchema = z.object({
  classId: z.string().uuid(),
  sectionId: z.string().uuid().optional(), // Optional — if null, generate for entire class
  academicSessionId: z.string().uuid(),
  periodLabel: z.string().min(1).max(50),
  periodStartDate: z.coerce.date(),
  periodEndDate: z.coerce.date(),
}).refine(
  data => data.periodStartDate <= data.periodEndDate,
  { message: "Period start must be before or equal to end" }
)

// ─── Fee Payment Schemas ───

recordFeePaymentSchema = z.object({
  feeAssignmentIds: z.array(z.string().uuid()).min(1, "Select at least one fee"),
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentDate: z.coerce.date(),
  referenceNumber: z.string().max(100).optional(),
  bankName: z.string().max(100).optional(),
  remarks: z.string().max(500).optional(),
}).refine(
  data => data.paymentMethod === 'CHEQUE' ? !!data.referenceNumber : true,
  { message: "Cheque number is required for cheque payments" }
).refine(
  data => ['BANK_TRANSFER', 'CHEQUE'].includes(data.paymentMethod) ? !!data.bankName : true,
  { message: "Bank name is required for bank transfer and cheque payments" }
)

// ─── Fee Discount Schemas ───

applyFeeDiscountSchema = z.object({
  feeAssignmentId: z.string().uuid(),
  discountType: z.nativeEnum(FeeDiscountType),
  percentage: z.number().min(0).max(100).optional(),
  fixedAmount: z.number().min(0).optional(),
  reason: z.string().min(5).max(500),
}).refine(
  data => data.percentage || data.fixedAmount,
  { message: "Must provide either percentage or fixed amount" }
).refine(
  data => !(data.percentage && data.fixedAmount),
  { message: "Cannot set both percentage AND fixed amount" }
)

// ─── Fee Reversal Schemas ───

reverseFeePaymentSchema = z.object({
  paymentId: z.string().uuid(),
  reason: z.string().min(10).max(500, "Reversal reason must be detailed"),
})

// ─── Family Payment Schemas ───

recordFamilyPaymentSchema = z.object({
  familyProfileId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
  totalAmount: z.number().positive("Total payment amount must be greater than 0"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentDate: z.coerce.date(),
  allocationStrategy: z.nativeEnum(AllocationStrategy).default('OLDEST_FIRST'),
  manualAllocations: z.array(z.object({
    childId: z.string().uuid(),
    amount: z.number().min(0),
  })).optional(),
  referenceNumber: z.string().max(100).optional(),
  bankName: z.string().max(100).optional(),
  remarks: z.string().max(500).optional(),
}).refine(
  data => data.paymentMethod === 'CHEQUE' ? !!data.referenceNumber : true,
  { message: "Cheque number is required for cheque payments" }
).refine(
  data => ['BANK_TRANSFER', 'CHEQUE'].includes(data.paymentMethod) ? !!data.bankName : true,
  { message: "Bank name is required for bank transfer and cheque payments" }
).refine(
  data => {
    if (data.allocationStrategy === 'MANUAL' && data.manualAllocations) {
      const sum = data.manualAllocations.reduce((s, a) => s + a.amount, 0);
      return Math.abs(sum - data.totalAmount) < 0.01; // floating point tolerance
    }
    return true;
  },
  { message: "Manual allocation sum must equal total amount" }
).refine(
  data => data.allocationStrategy !== 'MANUAL' || (data.manualAllocations && data.manualAllocations.length > 0),
  { message: "Manual allocations required when strategy is MANUAL" }
)

reverseFamilyPaymentSchema = z.object({
  familyPaymentId: z.string().uuid(),
  reason: z.string().min(10).max(500, "Reversal reason must be detailed"),
})

reallocateFamilyPaymentSchema = z.object({
  familyPaymentId: z.string().uuid(),
  newAllocations: z.array(z.object({
    childId: z.string().uuid(),
    amount: z.number().min(0),
  })).min(1, "At least one allocation required"),
})
// NOTE: sum of newAllocations.amount must equal original FamilyPayment.totalAmount
// Validated in the action (needs DB read to know original amount)

// ─── Fee Report Filter Schemas ───

feeCollectionSummaryFilterSchema = z.object({
  academicSessionId: z.string().uuid(),
  classId: z.string().uuid().optional(),
  periodLabel: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
})

feeDefaultersFilterSchema = z.object({
  academicSessionId: z.string().uuid(),
  overdueForDays: z.number().int().min(1).default(7),
  classId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
})

// ─── Class Fee Report Schemas ───

classFeeDetailFilterSchema = z.object({
  classId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
  sectionId: z.string().uuid().optional(),
  periodLabel: z.string().optional(),
})
// Drill-down: "Class 5 ki detail dikhao — konse student ne di, konse ne nhi"

sectionFeeReportFilterSchema = z.object({
  classId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
  periodLabel: z.string().optional(),
})

// ─── Fee Settings Schema ───

feeSettingsSchema = z.object({
  currency: z.string().length(3), // ISO 4217
  currencySymbol: z.string().min(1).max(5),
  receiptPrefix: z.string().min(1).max(10).regex(/^[A-Z]+$/, "Must be uppercase letters"),
  defaultLateFeePercent: z.number().min(0).max(50).optional(),
  defaultGracePeriodDays: z.number().int().min(0).max(90),
  enableLateFee: z.boolean(),
  enablePartialPayment: z.boolean(),
  feeReminderDaysBefore: z.number().int().min(1).max(30),
  overdueAlertDaysAfter: z.number().int().min(1).max(90),
})

// ─── Clone Fee Structures Schema ───

cloneFeeStructuresSchema = z.object({
  sourceSessionId: z.string().uuid(),
  targetSessionId: z.string().uuid(),
  amountAdjustmentPercent: z.number().min(-50).max(100).default(0), // -50% to +100% adjustment
}).refine(
  data => data.sourceSessionId !== data.targetSessionId,
  { message: "Source and target sessions must be different" }
)
```
