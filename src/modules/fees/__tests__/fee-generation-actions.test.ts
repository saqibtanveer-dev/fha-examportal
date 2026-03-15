import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks (available inside vi.mock factories) ──

const { mockGetSessionId } = vi.hoisted(() => ({
  mockGetSessionId: vi.fn().mockResolvedValue('session-001'),
}));

// ── Mock all dependencies BEFORE imports ──

vi.mock('@/lib/prisma', () => ({
  prisma: {
    studentProfile: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    feeStructure: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    feeLineItem: { findMany: vi.fn().mockResolvedValue([]) },
    feeAssignment: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'fa-001' }),
      update: vi.fn().mockResolvedValue({}),
    },
    feePayment: { count: vi.fn().mockResolvedValue(0) },
  },
}));

vi.mock('@/lib/auth-utils', () => ({
  requireRole: vi.fn().mockResolvedValue({
    user: { id: 'admin-001', role: 'ADMIN' },
  }),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/modules/audit/audit-queries', () => ({
  createAuditLog: vi.fn().mockResolvedValue({ id: 'audit-lock-001' }),
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/modules/fees/fee-queries', () => ({
  getCurrentAcademicSessionId: mockGetSessionId,
  findFeeSettings: vi.fn().mockResolvedValue({
    lateFeePerDay: 50,
    maxLateFee: 5000,
    gracePeriodDays: 5,
    receiptPrefix: 'FRCP',
  }),
}));

vi.mock('@/modules/fees/student-discount-queries', () => ({
  findActiveDiscountsForStudents: vi.fn().mockResolvedValue([]),
  computeDiscountForLineItems: vi.fn().mockReturnValue({
    totalDiscount: 0,
    breakdown: [],
  }),
}));

const { mockTrigger } = vi.hoisted(() => ({
  mockTrigger: vi.fn().mockResolvedValue({ id: 'run-001' }),
}));

vi.mock('@trigger.dev/sdk/v3', () => ({
  tasks: { trigger: mockTrigger },
}));

import { prisma } from '@/lib/prisma';
import { generateFeesAction } from '../fee-generation-actions';
import { cancelAssignmentAction } from '../fee-management-actions';

// ── Typed mock accessor ──

const mockPrisma = prisma as unknown as {
  studentProfile: { findMany: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
  feeStructure: { findMany: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
  feeLineItem: { findMany: ReturnType<typeof vi.fn> };
  feeAssignment: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  // Restore defaults cleared by clearAllMocks
  mockGetSessionId.mockResolvedValue('session-001');
  mockTrigger.mockResolvedValue({ id: 'run-001' });
  mockPrisma.studentProfile.findMany.mockResolvedValue([]);
  mockPrisma.studentProfile.count.mockResolvedValue(0);
  mockPrisma.feeStructure.findMany.mockResolvedValue([]);
  mockPrisma.feeStructure.count.mockResolvedValue(0);
  mockPrisma.feeLineItem.findMany.mockResolvedValue([]);
  mockPrisma.feeAssignment.findMany.mockResolvedValue([]);
  mockPrisma.feeAssignment.findUnique.mockResolvedValue(null);
  mockPrisma.feeAssignment.create.mockResolvedValue({ id: 'fa-001' });
});

// ── generateFeesAction ──

describe('generateFeesAction', () => {
  const validInput = {
    generatedForMonth: '2025-06',
    dueDate: '2025-06-15',
  };

  it('rejects invalid input', async () => {
    const result = await generateFeesAction({
      generatedForMonth: 'invalid',
      dueDate: '2025-06-15',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error when no academic session is active', async () => {
    mockGetSessionId.mockResolvedValueOnce(null);

    const result = await generateFeesAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('academic session');
  });

  it('returns error when no active students found', async () => {
    mockPrisma.studentProfile.count.mockResolvedValueOnce(0);
    mockPrisma.feeStructure.count.mockResolvedValueOnce(5);

    const result = await generateFeesAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('No active students');
  });

  it('returns error when no fee structures configured', async () => {
    mockPrisma.studentProfile.count.mockResolvedValueOnce(10);
    mockPrisma.feeStructure.count.mockResolvedValueOnce(0);

    const result = await generateFeesAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain('No fee structures');
  });

  it('queues fee generation when pre-flight checks pass', async () => {
    mockPrisma.studentProfile.count.mockResolvedValueOnce(2);
    mockPrisma.feeStructure.count.mockResolvedValueOnce(1);

    const result = await generateFeesAction(validInput);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ queued: true });
    expect(mockTrigger).toHaveBeenCalledWith(
      'fees-generation-workflow',
      expect.objectContaining({ generatedForMonth: '2025-06' }),
      expect.objectContaining({ maxAttempts: 3 }),
    );
  });

  it('includes classId in trigger payload when provided', async () => {
    mockPrisma.studentProfile.count.mockResolvedValueOnce(1);
    mockPrisma.feeStructure.count.mockResolvedValueOnce(1);

    const result = await generateFeesAction({
      ...validInput,
      classId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    });
    expect(result.success).toBe(true);
    expect(mockTrigger).toHaveBeenCalledWith(
      'fees-generation-workflow',
      expect.objectContaining({ classId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' }),
      expect.anything(),
    );
  });
});

// ── cancelAssignmentAction ──

describe('cancelAssignmentAction', () => {
  it('rejects invalid input', async () => {
    const result = await cancelAssignmentAction({
      feeAssignmentId: 'not-a-uuid',
      reason: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('returns error when assignment not found', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce(null);

    const result = await cancelAssignmentAction({
      feeAssignmentId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      reason: 'Student left school',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('rejects already cancelled assignment', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'CANCELLED',
      payments: [],
    });

    const result = await cancelAssignmentAction({
      feeAssignmentId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      reason: 'Student left school',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Already cancelled');
  });

  it('rejects cancellation when payments exist', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'PARTIAL',
      payments: [{ id: 'pay-001' }],
    });

    const result = await cancelAssignmentAction({
      feeAssignmentId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      reason: 'Student left school',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('payments exist');
  });

  it('successfully cancels assignment with no payments', async () => {
    mockPrisma.feeAssignment.findUnique.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'PENDING',
      payments: [],
    });
    mockPrisma.feeAssignment.update.mockResolvedValueOnce({
      id: 'fa-001',
      status: 'CANCELLED',
    });

    const result = await cancelAssignmentAction({
      feeAssignmentId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      reason: 'Student left school',
    });
    expect(result.success).toBe(true);
  });
});
