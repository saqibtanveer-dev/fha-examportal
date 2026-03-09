import type {
  AllocationInput,
  AllocationResult,
  ChildAllocation,
  AssignmentAllocation,
  ChildWithAssignments,
} from './fee.types';

/**
 * Pure function that computes how a family's lump-sum payment should be
 * distributed across children and their pending fee assignments.
 *
 * Four strategies:
 *  OLDEST_FIRST  – pay oldest dues first across all children
 *  CHILD_PRIORITY – settle one child fully before moving to next
 *  EQUAL_SPLIT   – split evenly by child, apply oldest-first within each
 *  MANUAL        – user specifies per-child amounts
 */
export function computeAllocation(input: AllocationInput): AllocationResult {
  const { strategy } = input;

  switch (strategy) {
    case 'OLDEST_FIRST':
      return allocateOldestFirst(input);
    case 'CHILD_PRIORITY':
      return allocateChildPriority(input);
    case 'EQUAL_SPLIT':
      return allocateEqualSplit(input);
    case 'MANUAL':
      return allocateManual(input);
    default:
      return allocateOldestFirst(input);
  }
}

// ============================================
// OLDEST_FIRST
// ============================================

function allocateOldestFirst(input: AllocationInput): AllocationResult {
  let remaining = input.totalAmount;

  // Flatten all assignments across children, sorted by dueDate
  const allAssignments = flattenAndSort(input.children);

  // Track per-child allocated amounts
  const childAmounts = new Map<string, number>();
  const assignmentResults = new Map<string, AssignmentAllocation>();

  for (const item of allAssignments) {
    if (remaining <= 0) break;
    const toAllocate = Math.min(remaining, item.balanceAmount);
    remaining = round(remaining - toAllocate);

    const newBalance = round(item.balanceAmount - toAllocate);
    assignmentResults.set(item.assignmentId, {
      assignmentId: item.assignmentId,
      periodLabel: item.periodLabel,
      categoryName: item.categoryName,
      allocatedAmount: toAllocate,
      previousBalance: item.balanceAmount,
      newBalance,
      status: newBalance === 0 ? 'CLEARED' : toAllocate > 0 ? 'PARTIAL' : 'UNTOUCHED',
    });

    childAmounts.set(
      item.childId,
      round((childAmounts.get(item.childId) ?? 0) + toAllocate),
    );
  }

  return buildResult(input, childAmounts, assignmentResults, remaining);
}

// ============================================
// CHILD_PRIORITY
// ============================================

function allocateChildPriority(input: AllocationInput): AllocationResult {
  let remaining = input.totalAmount;
  const childAmounts = new Map<string, number>();
  const assignmentResults = new Map<string, AssignmentAllocation>();

  // Use priority order if given, else original order
  const orderedChildren = input.childPriorityOrder
    ? orderByPriority(input.children, input.childPriorityOrder)
    : input.children;

  for (const child of orderedChildren) {
    if (remaining <= 0) break;

    const sorted = [...child.assignments].sort(
      (a, b) => a.dueDate.localeCompare(b.dueDate),
    );

    let childTotal = 0;
    for (const a of sorted) {
      if (remaining <= 0) break;
      const toAllocate = Math.min(remaining, a.balanceAmount);
      remaining = round(remaining - toAllocate);
      childTotal = round(childTotal + toAllocate);

      const newBalance = round(a.balanceAmount - toAllocate);
      assignmentResults.set(a.assignmentId, {
        assignmentId: a.assignmentId,
        periodLabel: a.periodLabel,
        categoryName: a.categoryName,
        allocatedAmount: toAllocate,
        previousBalance: a.balanceAmount,
        newBalance,
        status: newBalance === 0 ? 'CLEARED' : toAllocate > 0 ? 'PARTIAL' : 'UNTOUCHED',
      });
    }

    childAmounts.set(child.childId, childTotal);
  }

  return buildResult(input, childAmounts, assignmentResults, remaining);
}

// ============================================
// EQUAL_SPLIT
// ============================================

function allocateEqualSplit(input: AllocationInput): AllocationResult {
  const childCount = input.children.length;
  if (childCount === 0) {
    return { allocations: [], totalAllocated: 0, unallocated: input.totalAmount };
  }

  const perChild = Math.floor((input.totalAmount / childCount) * 100) / 100;
  let remaining = input.totalAmount;
  const childAmounts = new Map<string, number>();
  const assignmentResults = new Map<string, AssignmentAllocation>();

  for (let i = 0; i < input.children.length; i++) {
    const child = input.children[i]!;
    // Last child gets remainder to avoid rounding loss
    const budget = i === childCount - 1 ? remaining : Math.min(perChild, remaining);
    let childRemaining = budget;

    const sorted = [...child.assignments].sort(
      (a, b) => a.dueDate.localeCompare(b.dueDate),
    );

    let childTotal = 0;
    for (const a of sorted) {
      if (childRemaining <= 0) break;
      const toAllocate = Math.min(childRemaining, a.balanceAmount);
      childRemaining = round(childRemaining - toAllocate);
      childTotal = round(childTotal + toAllocate);

      const newBalance = round(a.balanceAmount - toAllocate);
      assignmentResults.set(a.assignmentId, {
        assignmentId: a.assignmentId,
        periodLabel: a.periodLabel,
        categoryName: a.categoryName,
        allocatedAmount: toAllocate,
        previousBalance: a.balanceAmount,
        newBalance,
        status: newBalance === 0 ? 'CLEARED' : toAllocate > 0 ? 'PARTIAL' : 'UNTOUCHED',
      });
    }

    childAmounts.set(child.childId, childTotal);
    remaining = round(remaining - childTotal);
  }

  return buildResult(input, childAmounts, assignmentResults, remaining);
}

// ============================================
// MANUAL
// ============================================

function allocateManual(input: AllocationInput): AllocationResult {
  const manualMap = new Map(
    (input.manualAllocations ?? []).map((m) => [m.childId, m.amount]),
  );

  let totalUsed = 0;
  const childAmounts = new Map<string, number>();
  const assignmentResults = new Map<string, AssignmentAllocation>();

  for (const child of input.children) {
    let budget = manualMap.get(child.childId) ?? 0;
    const sorted = [...child.assignments].sort(
      (a, b) => a.dueDate.localeCompare(b.dueDate),
    );

    let childTotal = 0;
    for (const a of sorted) {
      if (budget <= 0) break;
      const toAllocate = Math.min(budget, a.balanceAmount);
      budget = round(budget - toAllocate);
      childTotal = round(childTotal + toAllocate);

      const newBalance = round(a.balanceAmount - toAllocate);
      assignmentResults.set(a.assignmentId, {
        assignmentId: a.assignmentId,
        periodLabel: a.periodLabel,
        categoryName: a.categoryName,
        allocatedAmount: toAllocate,
        previousBalance: a.balanceAmount,
        newBalance,
        status: newBalance === 0 ? 'CLEARED' : toAllocate > 0 ? 'PARTIAL' : 'UNTOUCHED',
      });
    }

    childAmounts.set(child.childId, childTotal);
    totalUsed = round(totalUsed + childTotal);
  }

  const unallocated = round(input.totalAmount - totalUsed);
  return buildResult(input, childAmounts, assignmentResults, unallocated);
}

// ============================================
// HELPERS
// ============================================

function flattenAndSort(
  children: ChildWithAssignments[],
): (ChildWithAssignments['assignments'][number] & { childId: string })[] {
  const items = children.flatMap((c) =>
    c.assignments.map((a) => ({ ...a, childId: c.childId })),
  );
  return items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

function orderByPriority(
  children: ChildWithAssignments[],
  order: string[],
): ChildWithAssignments[] {
  const map = new Map(children.map((c) => [c.childId, c]));
  const ordered: ChildWithAssignments[] = [];
  for (const id of order) {
    const child = map.get(id);
    if (child) ordered.push(child);
  }
  // Append any children not in priority list
  for (const child of children) {
    if (!order.includes(child.childId)) ordered.push(child);
  }
  return ordered;
}

function buildResult(
  input: AllocationInput,
  childAmounts: Map<string, number>,
  assignmentResults: Map<string, AssignmentAllocation>,
  unallocated: number,
): AllocationResult {
  const allocations: ChildAllocation[] = input.children.map((child) => {
    const childAllocations: AssignmentAllocation[] = child.assignments.map(
      (a) =>
        assignmentResults.get(a.assignmentId) ?? {
          assignmentId: a.assignmentId,
          periodLabel: a.periodLabel,
          categoryName: a.categoryName,
          allocatedAmount: 0,
          previousBalance: a.balanceAmount,
          newBalance: a.balanceAmount,
          status: 'UNTOUCHED' as const,
        },
    );

    return {
      childId: child.childId,
      childName: child.childName,
      className: child.className,
      allocatedAmount: childAmounts.get(child.childId) ?? 0,
      assignmentAllocations: childAllocations,
    };
  });

  const totalAllocated = round(input.totalAmount - unallocated);

  return { allocations, totalAllocated, unallocated: Math.max(0, unallocated) };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
