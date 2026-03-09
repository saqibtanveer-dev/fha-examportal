import { describe, it, expect } from 'vitest';
import {
  createFeeCategorySchema,
  updateFeeCategorySchema,
  createFeeStructureSchema,
  updateFeeStructureSchema,
  bulkCreateStructuresSchema,
  generateFeesSchema,
  recordPaymentSchema,
  recordFamilyPaymentSchema,
  applyDiscountSchema,
  reversePaymentSchema,
  updateFeeSettingsSchema,
  cancelAssignmentSchema,
} from '@/validations/fee-schemas';

// ── FEE CATEGORY ──

describe('createFeeCategorySchema', () => {
  it('accepts valid input', () => {
    const result = createFeeCategorySchema.safeParse({
      name: 'Tuition Fee',
      frequency: 'MONTHLY',
    });
    expect(result.success).toBe(true);
  });

  it('applies defaults', () => {
    const result = createFeeCategorySchema.parse({
      name: 'Tuition Fee',
      frequency: 'ANNUAL',
    });
    expect(result.isMandatory).toBe(true);
    expect(result.isRefundable).toBe(false);
    expect(result.sortOrder).toBe(0);
  });

  it('rejects name shorter than 2 chars', () => {
    const result = createFeeCategorySchema.safeParse({
      name: 'A',
      frequency: 'MONTHLY',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid frequency', () => {
    const result = createFeeCategorySchema.safeParse({
      name: 'Tuition',
      frequency: 'WEEKLY',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid frequencies', () => {
    for (const freq of ['MONTHLY', 'TERM', 'ANNUAL', 'ONE_TIME']) {
      const result = createFeeCategorySchema.safeParse({
        name: 'Test',
        frequency: freq,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('updateFeeCategorySchema', () => {
  it('accepts partial updates', () => {
    const result = updateFeeCategorySchema.safeParse({ name: 'Updated' });
    expect(result.success).toBe(true);
  });

  it('accepts isActive field', () => {
    const result = updateFeeCategorySchema.safeParse({ isActive: false });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (all optional)', () => {
    const result = updateFeeCategorySchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ── FEE STRUCTURE ──

describe('createFeeStructureSchema', () => {
  const valid = {
    categoryId: '550e8400-e29b-41d4-a716-446655440000',
    classId: '550e8400-e29b-41d4-a716-446655440001',
    academicSessionId: '550e8400-e29b-41d4-a716-446655440002',
    amount: 5000,
  };

  it('accepts valid input', () => {
    expect(createFeeStructureSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects non-uuid categoryId', () => {
    expect(
      createFeeStructureSchema.safeParse({ ...valid, categoryId: 'abc' }).success,
    ).toBe(false);
  });

  it('rejects zero amount', () => {
    expect(
      createFeeStructureSchema.safeParse({ ...valid, amount: 0 }).success,
    ).toBe(false);
  });

  it('rejects negative amount', () => {
    expect(
      createFeeStructureSchema.safeParse({ ...valid, amount: -100 }).success,
    ).toBe(false);
  });

  it('rejects amount exceeding max', () => {
    expect(
      createFeeStructureSchema.safeParse({ ...valid, amount: 99999999999 }).success,
    ).toBe(false);
  });
});

describe('updateFeeStructureSchema', () => {
  it('accepts partial amount update', () => {
    expect(updateFeeStructureSchema.safeParse({ amount: 3000 }).success).toBe(true);
  });

  it('accepts isActive toggle', () => {
    expect(updateFeeStructureSchema.safeParse({ isActive: false }).success).toBe(true);
  });
});

describe('bulkCreateStructuresSchema', () => {
  const valid = {
    categoryId: '550e8400-e29b-41d4-a716-446655440000',
    academicSessionId: '550e8400-e29b-41d4-a716-446655440001',
    classAmounts: [
      { classId: '550e8400-e29b-41d4-a716-446655440002', amount: 5000 },
    ],
  };

  it('accepts valid input with one class', () => {
    expect(bulkCreateStructuresSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty classAmounts array', () => {
    expect(
      bulkCreateStructuresSchema.safeParse({ ...valid, classAmounts: [] }).success,
    ).toBe(false);
  });
});

// ── FEE GENERATION ──

describe('generateFeesSchema', () => {
  it('accepts valid YYYY-MM and YYYY-MM-DD', () => {
    const result = generateFeesSchema.safeParse({
      generatedForMonth: '2025-06',
      dueDate: '2025-06-10',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional classId', () => {
    const result = generateFeesSchema.safeParse({
      generatedForMonth: '2025-01',
      dueDate: '2025-01-15',
      classId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid month format', () => {
    expect(
      generateFeesSchema.safeParse({
        generatedForMonth: '2025-13',
        dueDate: '2025-01-15',
      }).success,
    ).toBe(false);
  });

  it('rejects invalid due date format', () => {
    expect(
      generateFeesSchema.safeParse({
        generatedForMonth: '2025-01',
        dueDate: 'Jan 15 2025',
      }).success,
    ).toBe(false);
  });

  it('rejects plain year without month', () => {
    expect(
      generateFeesSchema.safeParse({
        generatedForMonth: '2025',
        dueDate: '2025-01-15',
      }).success,
    ).toBe(false);
  });
});

// ── INDIVIDUAL PAYMENT ──

describe('recordPaymentSchema', () => {
  const valid = {
    feeAssignmentId: '550e8400-e29b-41d4-a716-446655440000',
    amount: 1000,
    paymentMethod: 'CASH',
  };

  it('accepts valid payment', () => {
    expect(recordPaymentSchema.safeParse(valid).success).toBe(true);
  });

  it('allows optional referenceNumber', () => {
    const result = recordPaymentSchema.parse({
      ...valid,
      referenceNumber: 'TXN-123',
    });
    expect(result.referenceNumber).toBe('TXN-123');
  });

  it('rejects zero amount', () => {
    expect(
      recordPaymentSchema.safeParse({ ...valid, amount: 0 }).success,
    ).toBe(false);
  });

  it('accepts all payment methods', () => {
    for (const m of ['CASH', 'BANK_TRANSFER', 'ONLINE', 'CHEQUE']) {
      expect(
        recordPaymentSchema.safeParse({ ...valid, paymentMethod: m }).success,
      ).toBe(true);
    }
  });

  it('rejects invalid payment method', () => {
    expect(
      recordPaymentSchema.safeParse({ ...valid, paymentMethod: 'BITCOIN' }).success,
    ).toBe(false);
  });
});

// ── FAMILY PAYMENT ──

describe('recordFamilyPaymentSchema', () => {
  const valid = {
    familyProfileId: '550e8400-e29b-41d4-a716-446655440000',
    totalAmount: 5000,
    paymentMethod: 'BANK_TRANSFER',
    allocationStrategy: 'OLDEST_FIRST',
  };

  it('accepts valid family payment', () => {
    expect(recordFamilyPaymentSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts with manual allocations', () => {
    const result = recordFamilyPaymentSchema.safeParse({
      ...valid,
      allocationStrategy: 'MANUAL',
      manualAllocations: [
        { childId: '550e8400-e29b-41d4-a716-446655440001', amount: 3000 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts all allocation strategies', () => {
    for (const s of ['OLDEST_FIRST', 'CHILD_PRIORITY', 'EQUAL_SPLIT', 'MANUAL']) {
      expect(
        recordFamilyPaymentSchema.safeParse({ ...valid, allocationStrategy: s }).success,
      ).toBe(true);
    }
  });

  it('rejects negative totalAmount', () => {
    expect(
      recordFamilyPaymentSchema.safeParse({ ...valid, totalAmount: -1 }).success,
    ).toBe(false);
  });
});

// ── DISCOUNT ──

describe('applyDiscountSchema', () => {
  const valid = {
    feeAssignmentId: '550e8400-e29b-41d4-a716-446655440000',
    amount: 500,
    reason: 'Sibling discount',
  };

  it('accepts valid discount', () => {
    expect(applyDiscountSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects reason shorter than 3 chars', () => {
    expect(
      applyDiscountSchema.safeParse({ ...valid, reason: 'ab' }).success,
    ).toBe(false);
  });

  it('rejects zero amount', () => {
    expect(
      applyDiscountSchema.safeParse({ ...valid, amount: 0 }).success,
    ).toBe(false);
  });
});

// ── REVERSAL ──

describe('reversePaymentSchema', () => {
  it('accepts valid reversal', () => {
    const result = reversePaymentSchema.safeParse({
      paymentId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'Duplicate payment',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short reason', () => {
    const result = reversePaymentSchema.safeParse({
      paymentId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'ab',
    });
    expect(result.success).toBe(false);
  });
});

// ── FEE SETTINGS ──

describe('updateFeeSettingsSchema', () => {
  it('accepts valid partial update', () => {
    const result = updateFeeSettingsSchema.safeParse({
      dueDayOfMonth: 15,
      lateFeePerDay: 50,
    });
    expect(result.success).toBe(true);
  });

  it('rejects dueDayOfMonth > 28', () => {
    expect(
      updateFeeSettingsSchema.safeParse({ dueDayOfMonth: 31 }).success,
    ).toBe(false);
  });

  it('rejects dueDayOfMonth < 1', () => {
    expect(
      updateFeeSettingsSchema.safeParse({ dueDayOfMonth: 0 }).success,
    ).toBe(false);
  });

  it('rejects negative lateFeePerDay', () => {
    expect(
      updateFeeSettingsSchema.safeParse({ lateFeePerDay: -10 }).success,
    ).toBe(false);
  });

  it('accepts gracePeriodDays between 0 and 30', () => {
    expect(updateFeeSettingsSchema.safeParse({ gracePeriodDays: 0 }).success).toBe(true);
    expect(updateFeeSettingsSchema.safeParse({ gracePeriodDays: 30 }).success).toBe(true);
  });

  it('rejects gracePeriodDays > 30', () => {
    expect(
      updateFeeSettingsSchema.safeParse({ gracePeriodDays: 31 }).success,
    ).toBe(false);
  });
});

// ── CANCEL ASSIGNMENT ──

describe('cancelAssignmentSchema', () => {
  it('accepts valid cancellation', () => {
    const result = cancelAssignmentSchema.safeParse({
      feeAssignmentId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'Student withdrew',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-uuid assignmentId', () => {
    const result = cancelAssignmentSchema.safeParse({
      feeAssignmentId: 'not-a-uuid',
      reason: 'Student withdrew',
    });
    expect(result.success).toBe(false);
  });
});
