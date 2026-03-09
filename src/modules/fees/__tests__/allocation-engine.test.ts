import { describe, it, expect } from 'vitest';
import { computeAllocation } from '../allocation-engine';
import type {
  AllocationInput,
  ChildWithAssignments,
} from '../fee.types';

// ── Test helpers ──

function makeAssignment(
  id: string,
  balance: number,
  dueDate: string,
  category = 'Tuition',
  period = 'Jan-2025',
) {
  return {
    assignmentId: id,
    periodLabel: period,
    categoryName: category,
    dueDate,
    balanceAmount: balance,
  };
}

function makeChild(
  id: string,
  assignments: ReturnType<typeof makeAssignment>[],
  name = 'Child',
  cls = 'Class 5',
): ChildWithAssignments {
  return { childId: id, childName: name, className: cls, assignments };
}

// ── OLDEST_FIRST ──

describe('computeAllocation – OLDEST_FIRST', () => {
  it('allocates to oldest due dates first across children', () => {
    const input: AllocationInput = {
      totalAmount: 500,
      strategy: 'OLDEST_FIRST',
      children: [
        makeChild('c1', [
          makeAssignment('a1', 300, '2025-03-01', 'Tuition', 'Mar-25'),
        ]),
        makeChild('c2', [
          makeAssignment('a2', 400, '2025-01-01', 'Tuition', 'Jan-25'),
        ]),
      ],
    };
    const result = computeAllocation(input);
    // a2 (Jan) should be paid first: allocate 400
    // a1 (Mar) gets remaining 100
    const a2 = result.allocations.find((a) => a.childId === 'c2')!;
    expect(a2.assignmentAllocations[0]!.allocatedAmount).toBe(400);
    expect(a2.assignmentAllocations[0]!.status).toBe('CLEARED');

    const a1 = result.allocations.find((a) => a.childId === 'c1')!;
    expect(a1.assignmentAllocations[0]!.allocatedAmount).toBe(100);
    expect(a1.assignmentAllocations[0]!.status).toBe('PARTIAL');
    expect(result.totalAllocated).toBe(500);
    expect(result.unallocated).toBe(0);
  });

  it('handles exact payment (no remainder)', () => {
    const input: AllocationInput = {
      totalAmount: 1000,
      strategy: 'OLDEST_FIRST',
      children: [
        makeChild('c1', [
          makeAssignment('a1', 500, '2025-01-01'),
          makeAssignment('a2', 500, '2025-02-01'),
        ]),
      ],
    };
    const result = computeAllocation(input);
    expect(result.totalAllocated).toBe(1000);
    expect(result.unallocated).toBe(0);
    for (const alloc of result.allocations[0]!.assignmentAllocations) {
      expect(alloc.status).toBe('CLEARED');
    }
  });

  it('returns unallocated when overpaying', () => {
    const input: AllocationInput = {
      totalAmount: 5000,
      strategy: 'OLDEST_FIRST',
      children: [
        makeChild('c1', [makeAssignment('a1', 1000, '2025-01-01')]),
      ],
    };
    const result = computeAllocation(input);
    expect(result.totalAllocated).toBe(1000);
    expect(result.unallocated).toBe(4000);
  });

  it('handles zero amount', () => {
    const input: AllocationInput = {
      totalAmount: 0,
      strategy: 'OLDEST_FIRST',
      children: [
        makeChild('c1', [makeAssignment('a1', 1000, '2025-01-01')]),
      ],
    };
    const result = computeAllocation(input);
    expect(result.totalAllocated).toBe(0);
    expect(result.unallocated).toBe(0);
    expect(result.allocations[0]!.assignmentAllocations[0]!.status).toBe('UNTOUCHED');
  });

  it('handles empty children array', () => {
    const input: AllocationInput = {
      totalAmount: 500,
      strategy: 'OLDEST_FIRST',
      children: [],
    };
    const result = computeAllocation(input);
    expect(result.allocations).toHaveLength(0);
    expect(result.totalAllocated).toBe(0);
    expect(result.unallocated).toBe(500);
  });

  it('handles child with no assignments', () => {
    const input: AllocationInput = {
      totalAmount: 500,
      strategy: 'OLDEST_FIRST',
      children: [makeChild('c1', [])],
    };
    const result = computeAllocation(input);
    expect(result.allocations[0]!.allocatedAmount).toBe(0);
    expect(result.unallocated).toBe(500);
  });
});

// ── CHILD_PRIORITY ──

describe('computeAllocation – CHILD_PRIORITY', () => {
  it('settles first child fully before moving to next', () => {
    const input: AllocationInput = {
      totalAmount: 1500,
      strategy: 'CHILD_PRIORITY',
      children: [
        makeChild('c1', [
          makeAssignment('a1', 800, '2025-02-01'),
          makeAssignment('a2', 400, '2025-01-01'),
        ]),
        makeChild('c2', [
          makeAssignment('a3', 600, '2025-01-01'),
        ]),
      ],
    };
    const result = computeAllocation(input);
    // c1: a2 (Jan, 400) + a1 (Feb, 800) = 1200
    // c2: remaining 300 to a3
    const c1 = result.allocations.find((a) => a.childId === 'c1')!;
    expect(c1.allocatedAmount).toBe(1200);

    const c2 = result.allocations.find((a) => a.childId === 'c2')!;
    expect(c2.allocatedAmount).toBe(300);
    expect(c2.assignmentAllocations[0]!.status).toBe('PARTIAL');
  });

  it('respects childPriorityOrder', () => {
    const input: AllocationInput = {
      totalAmount: 500,
      strategy: 'CHILD_PRIORITY',
      children: [
        makeChild('c1', [makeAssignment('a1', 400, '2025-01-01')]),
        makeChild('c2', [makeAssignment('a2', 400, '2025-01-01')]),
      ],
      childPriorityOrder: ['c2', 'c1'],
    };
    const result = computeAllocation(input);
    const c2 = result.allocations.find((a) => a.childId === 'c2')!;
    expect(c2.allocatedAmount).toBe(400);

    const c1 = result.allocations.find((a) => a.childId === 'c1')!;
    expect(c1.allocatedAmount).toBe(100);
  });

  it('appends children not in priority list at the end', () => {
    const input: AllocationInput = {
      totalAmount: 10000,
      strategy: 'CHILD_PRIORITY',
      children: [
        makeChild('c1', [makeAssignment('a1', 100, '2025-01-01')]),
        makeChild('c2', [makeAssignment('a2', 200, '2025-01-01')]),
        makeChild('c3', [makeAssignment('a3', 300, '2025-01-01')]),
      ],
      childPriorityOrder: ['c2'], // only c2 specified
    };
    const result = computeAllocation(input);
    // c2 first (200), then c1+c3 appended
    expect(result.totalAllocated).toBe(600);
    expect(result.unallocated).toBe(9400);
  });
});

// ── EQUAL_SPLIT ──

describe('computeAllocation – EQUAL_SPLIT', () => {
  it('splits evenly between children', () => {
    const input: AllocationInput = {
      totalAmount: 1000,
      strategy: 'EQUAL_SPLIT',
      children: [
        makeChild('c1', [makeAssignment('a1', 600, '2025-01-01')]),
        makeChild('c2', [makeAssignment('a2', 600, '2025-01-01')]),
      ],
    };
    const result = computeAllocation(input);
    expect(result.allocations[0]!.allocatedAmount).toBe(500);
    expect(result.allocations[1]!.allocatedAmount).toBe(500);
    expect(result.totalAllocated).toBe(1000);
  });

  it('last child absorbs rounding remainder', () => {
    const input: AllocationInput = {
      totalAmount: 100,
      strategy: 'EQUAL_SPLIT',
      children: [
        makeChild('c1', [makeAssignment('a1', 500, '2025-01-01')]),
        makeChild('c2', [makeAssignment('a2', 500, '2025-01-01')]),
        makeChild('c3', [makeAssignment('a3', 500, '2025-01-01')]),
      ],
    };
    const result = computeAllocation(input);
    // 100/3 = 33.33 each, last gets remainder
    const amounts = result.allocations.map((a) => a.allocatedAmount);
    expect(amounts[0]).toBe(33.33);
    expect(amounts[1]).toBe(33.33);
    // Last child gets 100 - 33.33 - 33.33 = 33.34
    expect(amounts[2]).toBe(33.34);
    expect(result.totalAllocated).toBe(100);
  });

  it('returns full amount as unallocated with empty children', () => {
    const input: AllocationInput = {
      totalAmount: 500,
      strategy: 'EQUAL_SPLIT',
      children: [],
    };
    const result = computeAllocation(input);
    expect(result.totalAllocated).toBe(0);
    expect(result.unallocated).toBe(500);
  });

  it('does not over-allocate when child balance is less than share', () => {
    const input: AllocationInput = {
      totalAmount: 1000,
      strategy: 'EQUAL_SPLIT',
      children: [
        makeChild('c1', [makeAssignment('a1', 100, '2025-01-01')]),
        makeChild('c2', [makeAssignment('a2', 800, '2025-01-01')]),
      ],
    };
    const result = computeAllocation(input);
    // c1 gets min(500, 100) = 100, c2 gets remaining budget
    expect(result.allocations[0]!.allocatedAmount).toBe(100);
    expect(result.unallocated).toBeGreaterThanOrEqual(0);
    expect(result.totalAllocated).toBeLessThanOrEqual(1000);
  });
});

// ── MANUAL ──

describe('computeAllocation – MANUAL', () => {
  it('allocates specified amounts per child', () => {
    const input: AllocationInput = {
      totalAmount: 1000,
      strategy: 'MANUAL',
      children: [
        makeChild('c1', [makeAssignment('a1', 500, '2025-01-01')]),
        makeChild('c2', [makeAssignment('a2', 500, '2025-01-01')]),
      ],
      manualAllocations: [
        { childId: 'c1', amount: 300 },
        { childId: 'c2', amount: 200 },
      ],
    };
    const result = computeAllocation(input);
    expect(result.allocations[0]!.allocatedAmount).toBe(300);
    expect(result.allocations[1]!.allocatedAmount).toBe(200);
    expect(result.totalAllocated).toBe(500);
    expect(result.unallocated).toBe(500);
  });

  it('limits allocation to child balance', () => {
    const input: AllocationInput = {
      totalAmount: 1000,
      strategy: 'MANUAL',
      children: [
        makeChild('c1', [makeAssignment('a1', 100, '2025-01-01')]),
      ],
      manualAllocations: [{ childId: 'c1', amount: 500 }],
    };
    const result = computeAllocation(input);
    expect(result.allocations[0]!.allocatedAmount).toBe(100);
    expect(result.unallocated).toBe(900);
  });

  it('handles missing manual allocation for a child', () => {
    const input: AllocationInput = {
      totalAmount: 1000,
      strategy: 'MANUAL',
      children: [
        makeChild('c1', [makeAssignment('a1', 500, '2025-01-01')]),
        makeChild('c2', [makeAssignment('a2', 500, '2025-01-01')]),
      ],
      manualAllocations: [{ childId: 'c1', amount: 300 }],
    };
    const result = computeAllocation(input);
    // c1 = 300, c2 = 0 (no manual allocation)
    expect(result.allocations[0]!.allocatedAmount).toBe(300);
    expect(result.allocations[1]!.allocatedAmount).toBe(0);
    expect(result.totalAllocated).toBe(300);
    expect(result.unallocated).toBe(700);
  });

  it('handles empty manualAllocations', () => {
    const input: AllocationInput = {
      totalAmount: 500,
      strategy: 'MANUAL',
      children: [
        makeChild('c1', [makeAssignment('a1', 500, '2025-01-01')]),
      ],
    };
    const result = computeAllocation(input);
    expect(result.allocations[0]!.allocatedAmount).toBe(0);
    expect(result.unallocated).toBe(500);
  });
});

// ── Edge cases & assignment-level detail ──

describe('computeAllocation – edge cases', () => {
  it('preserves previousBalance and newBalance correctly', () => {
    const input: AllocationInput = {
      totalAmount: 200,
      strategy: 'OLDEST_FIRST',
      children: [
        makeChild('c1', [makeAssignment('a1', 500, '2025-01-01')]),
      ],
    };
    const result = computeAllocation(input);
    const alloc = result.allocations[0]!.assignmentAllocations[0]!;
    expect(alloc.previousBalance).toBe(500);
    expect(alloc.newBalance).toBe(300);
    expect(alloc.allocatedAmount).toBe(200);
    expect(alloc.status).toBe('PARTIAL');
  });

  it('marks untouched assignments correctly', () => {
    const input: AllocationInput = {
      totalAmount: 100,
      strategy: 'OLDEST_FIRST',
      children: [
        makeChild('c1', [
          makeAssignment('a1', 100, '2025-01-01'),
          makeAssignment('a2', 500, '2025-03-01'),
        ]),
      ],
    };
    const result = computeAllocation(input);
    const allocs = result.allocations[0]!.assignmentAllocations;
    expect(allocs[0]!.status).toBe('CLEARED');
    expect(allocs[1]!.status).toBe('UNTOUCHED');
    expect(allocs[1]!.allocatedAmount).toBe(0);
  });

  it('handles floating-point precision (100/3 scenario)', () => {
    const input: AllocationInput = {
      totalAmount: 100,
      strategy: 'EQUAL_SPLIT',
      children: [
        makeChild('c1', [makeAssignment('a1', 1000, '2025-01-01')]),
        makeChild('c2', [makeAssignment('a2', 1000, '2025-01-01')]),
        makeChild('c3', [makeAssignment('a3', 1000, '2025-01-01')]),
      ],
    };
    const result = computeAllocation(input);
    // No floating-point dust: total should be exactly 100
    expect(result.totalAllocated).toBe(100);
    expect(result.unallocated).toBe(0);
  });

  it('unallocated is never negative', () => {
    const input: AllocationInput = {
      totalAmount: 50,
      strategy: 'OLDEST_FIRST',
      children: [
        makeChild('c1', [makeAssignment('a1', 50, '2025-01-01')]),
      ],
    };
    const result = computeAllocation(input);
    expect(result.unallocated).toBeGreaterThanOrEqual(0);
  });

  it('falls back to OLDEST_FIRST for unknown strategy', () => {
    const input: AllocationInput = {
      totalAmount: 100,
      strategy: 'UNKNOWN' as AllocationInput['strategy'],
      children: [
        makeChild('c1', [makeAssignment('a1', 200, '2025-01-01')]),
      ],
    };
    const result = computeAllocation(input);
    expect(result.totalAllocated).toBe(100);
    expect(result.allocations[0]!.assignmentAllocations[0]!.allocatedAmount).toBe(100);
  });

  it('multiple assignments per child are sorted by dueDate', () => {
    const input: AllocationInput = {
      totalAmount: 300,
      strategy: 'CHILD_PRIORITY',
      children: [
        makeChild('c1', [
          makeAssignment('a-march', 200, '2025-03-01', 'Tuition', 'Mar'),
          makeAssignment('a-jan', 200, '2025-01-01', 'Tuition', 'Jan'),
          makeAssignment('a-feb', 200, '2025-02-01', 'Tuition', 'Feb'),
        ]),
      ],
    };
    const result = computeAllocation(input);
    const allocs = result.allocations[0]!.assignmentAllocations;
    // Should allocate Jan fully (200), then Feb partially (100)
    const jan = allocs.find((a) => a.assignmentId === 'a-jan')!;
    const feb = allocs.find((a) => a.assignmentId === 'a-feb')!;
    const mar = allocs.find((a) => a.assignmentId === 'a-march')!;
    expect(jan.allocatedAmount).toBe(200);
    expect(jan.status).toBe('CLEARED');
    expect(feb.allocatedAmount).toBe(100);
    expect(feb.status).toBe('PARTIAL');
    expect(mar.allocatedAmount).toBe(0);
    expect(mar.status).toBe('UNTOUCHED');
  });
});
