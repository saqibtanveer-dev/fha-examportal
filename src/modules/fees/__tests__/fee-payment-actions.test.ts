import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mock objects (available inside vi.mock factories) ──

const {
  mockFeeAssignment,
  mockFeePayment,
  mockFeeDiscount,
  mockFeeCredit,
  mockExecuteRaw,
  mockTransaction,
} = vi.hoisted(() => {
  const _mockFeeAssignment = {
    findUnique: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue({}),
  };
  const _mockFeePayment = {
    create: vi.fn().mockResolvedValue({}),
    findUnique: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue({}),
    count: vi.fn().mockResolvedValue(0),
  };
  const _mockFeeDiscount = { create: vi.fn().mockResolvedValue({}) };
  const _mockFeeCredit = { create: vi.fn().mockResolvedValue({}), updateMany: vi.fn().mockResolvedValue({}) };
  const _mockExecuteRaw = vi.fn().mockResolvedValue(undefined);

  const _mockTransaction = vi.fn().mockImplementation(async (fnOrArray: unknown, _opts?: unknown) => {
    if (typeof fnOrArray === 'function') {
      const txClient = {
        feeAssignment: _mockFeeAssignment,
        feePayment: _mockFeePayment,
        feeDiscount: _mockFeeDiscount,
        feeCredit: _mockFeeCredit,
        $executeRaw: _mockExecuteRaw,
      };
      return (fnOrArray as (tx: typeof txClient) => Promise<unknown>)(txClient);
    }
    return undefined;
  });

  return {
    mockFeeAssignment: _mockFeeAssignment,
    mockFeePayment: _mockFeePayment,
    mockFeeDiscount: _mockFeeDiscount,
    mockFeeCredit: _mockFeeCredit,
    mockExecuteRaw: _mockExecuteRaw,
    mockTransaction: _mockTransaction,
  };
});

// ── Mock dependencies ──

vi.mock('@/lib/prisma', () => ({
  prisma: {
    feeAssignment: mockFeeAssignment,
    feePayment: mockFeePayment,
    feeDiscount: mockFeeDiscount,
    feeCredit: mockFeeCredit,
    $transaction: mockTransaction,
    $executeRaw: mockExecuteRaw,
  },
}));

vi.mock('@/lib/auth-utils', () => ({
  requireRole: vi.fn().mockResolvedValue({
    user: { id: 'admin-001', role: 'ADMIN' },
  }),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/modules/audit/audit-queries', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/modules/fees/fee-queries', () => ({
  getCurrentAcademicSessionId: vi.fn().mockResolvedValue('session-001'),
  findFeeSettings: vi.fn().mockResolvedValue({
    receiptPrefix: 'FRCP',
  }),
}));

vi.mock('@/modules/fees/receipt-generator', () => ({
  generateReceiptNumber: vi.fn().mockResolvedValue('FRCP-250615-0001'),
}));

import { prisma } from '@/lib/prisma';
import {
  recordPaymentAction,
  applyDiscountAction,
  reversePaymentAction,
} from '../fee-payment-actions';

const mockPrisma = prisma as unknown as {
  feeAssignment: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  feePayment: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  feeDiscount: { create: ReturnType<typeof vi.fn> };
  feeCredit: { create: ReturnType<typeof vi.fn>; updateMany: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
  // Restore interactive transaction mock after clearAllMocks
  mockPrisma.$transaction.mockImplementation(async (fnOrArray: unknown, _opts?: unknown) => {
    if (typeof fnOrArray === 'function') {
      const txClient = {
        feeAssignment: mockPrisma.feeAssignment,
        feePayment: mockPrisma.feePayment,
        feeDiscount: mockPrisma.feeDiscount,
        feeCredit: mockPrisma.feeCredit,
        $executeRaw: vi.fn().mockResolvedValue(undefined),
      };
      return (fnOrArray as (tx: typeof txClient) => Promise<unknown>)(txClient);
    }
    return undefined;
  });
  mockPrisma.feeAssignment.findUnique.mockResolvedValue(null);
  mockPrisma.feePayment.findUnique.mockResolvedValue(null);
});

// ── recordPaymentAction ──

describe('recordPaymentAction', () => {
  const validInput = {
    feeAssignmentId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    amount: 3000,
    paymentMethod: 'CASH' as const,
  };

  it('rejects invalid input (zero amount)', async () => {
    const result = await recordPaymentAction({ ...validInput, amount: 0 });
    expect(result.success).toBe(false);
  });

  it('returns error when assignment not found', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce(null);

    const result = await recordPaymentAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('rejects payment on cancelled assignment', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'CANCELLED',
    });

    const result = await recordPaymentAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('cancelled');
  });

  it('rejects payment on waived assignment', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'WAIVED',
    });

    const result = await recordPaymentAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('waived');
  });

  it('accepts overpayment and clamps to balance', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'PENDING',
      balanceAmount: 2000,
      paidAmount: 1000,
      totalAmount: 3000,
      studentProfileId: 'sp-001',
    });

    const result = await recordPaymentAction(validInput);
    expect(result.success).toBe(true);
  });

  it('records payment and returns receipt number', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'PENDING',
      balanceAmount: 5000,
      paidAmount: 0,
      totalAmount: 5000,
    });

    const result = await recordPaymentAction(validInput);
    expect(result.success).toBe(true);
    expect(result.data?.receiptNumber).toBe('FRCP-250615-0001');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});

// ── applyDiscountAction ──

describe('applyDiscountAction', () => {
  const validInput = {
    feeAssignmentId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    amount: 500,
    reason: 'Sibling discount',
  };

  it('rejects invalid input', async () => {
    const result = await applyDiscountAction({
      ...validInput,
      reason: 'ab', // too short
    });
    expect(result.success).toBe(false);
  });

  it('returns error when assignment not found', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce(null);

    const result = await applyDiscountAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('rejects discount on cancelled assignment', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'CANCELLED',
    });

    const result = await applyDiscountAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('cancelled');
  });

  it('rejects discount exceeding balance', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'PENDING',
      balanceAmount: 200,
      discountAmount: 0,
    });

    const result = await applyDiscountAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('exceeds balance');
  });

  it('applies discount successfully', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'PENDING',
      balanceAmount: 5000,
      discountAmount: 0,
    });

    const result = await applyDiscountAction(validInput);
    expect(result.success).toBe(true);
  });
});

// ── reversePaymentAction ──

describe('reversePaymentAction', () => {
  const validInput = {
    paymentId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    reason: 'Duplicate payment',
  };

  it('rejects invalid input', async () => {
    const result = await reversePaymentAction({
      paymentId: 'not-uuid',
      reason: 'Duplicate payment',
    });
    expect(result.success).toBe(false);
  });

  it('returns error when payment not found', async () => {
    mockPrisma.feePayment.findUnique.mockResolvedValueOnce(null);

    const result = await reversePaymentAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('rejects already reversed payment', async () => {
    mockPrisma.feePayment.findUnique.mockResolvedValueOnce({
      id: 'pay-001',
      status: 'REVERSED',
      amount: 1000,
      feeAssignment: { paidAmount: 0, totalAmount: 5000, discountAmount: 0 },
    });

    const result = await reversePaymentAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('already reversed');
  });

  it('reverses payment successfully', async () => {
    mockPrisma.feePayment.findUnique.mockResolvedValueOnce({
      id: 'pay-001',
      status: 'COMPLETED',
      amount: 1000,
      feeAssignmentId: 'fa-001',
      feeAssignment: {
        id: 'fa-001',
        paidAmount: 1000,
        totalAmount: 5000,
        discountAmount: 0,
      },
    });

    const result = await reversePaymentAction(validInput);
    expect(result.success).toBe(true);
  });
});
