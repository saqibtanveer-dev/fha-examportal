# Fee Management — Payment Allocation Engine

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 28. Payment Allocation Engine

### Overview

The allocation engine is a pure function that takes a total payment amount and distributes it across multiple children's fee assignments based on a strategy. It runs in two contexts:

1. **Preview (client-side)**: When admin enters an amount, the engine runs instantly to show allocation preview. No DB writes.
2. **Execution (server-side)**: Inside the `$transaction`, the engine's output drives the actual payment recording.

### File: `src/modules/fees/allocation-engine.ts`

### Input/Output Contract

```typescript
// Input to the allocation engine
interface AllocationInput {
  totalAmount: Decimal;               // What the parent is paying
  strategy: AllocationStrategy;       // OLDEST_FIRST | CHILD_PRIORITY | EQUAL_SPLIT | MANUAL
  children: ChildWithAssignments[];   // All children with their pending assignments
  manualAllocations?: ManualAllocation[]; // Only for MANUAL strategy
  childPriorityOrder?: string[];      // Only for CHILD_PRIORITY — ordered childIds
}

interface ChildWithAssignments {
  childId: string;
  childName: string;
  className: string;
  assignments: PendingAssignment[];   // Only PENDING/PARTIAL/OVERDUE, sorted by dueDate ASC
}

interface PendingAssignment {
  assignmentId: string;
  periodLabel: string;
  categoryName: string;
  dueDate: Date;
  balanceAmount: Decimal;             // How much is still owed on this assignment
}

// Output from the allocation engine
interface AllocationResult {
  allocations: ChildAllocation[];
  totalAllocated: Decimal;
  unallocated: Decimal;              // Should always be 0 if validation passes
}

interface ChildAllocation {
  childId: string;
  childName: string;
  className: string;
  allocatedAmount: Decimal;
  assignmentAllocations: AssignmentAllocation[];
}

interface AssignmentAllocation {
  assignmentId: string;
  periodLabel: string;
  categoryName: string;
  allocatedAmount: Decimal;
  previousBalance: Decimal;
  newBalance: Decimal;                // previousBalance - allocatedAmount
  status: 'CLEARED' | 'PARTIAL' | 'UNTOUCHED';
}
```

### Strategy 1: OLDEST_FIRST (Default)

The most common and recommended strategy. Clears the oldest debts first across ALL children, regardless of which child owns them.

```
Algorithm:
  1. Collect ALL pending assignments from ALL children
  2. Sort by dueDate ASC (oldest first), then by childName ASC (tiebreaker)
  3. Walk through sorted list:
     For each assignment:
       payThis = min(remainingAmount, assignment.balanceAmount)
       allocation[child].push({ assignmentId, payThis })
       remainingAmount -= payThis
       if remainingAmount == 0: break

Example:
  Parent pays: Rs. 15,000

  All assignments (sorted by dueDate):
    [1] Ahmed - Dec 2025 Tuition - Rs. 5,000 (OVERDUE)     ← oldest
    [2] Sara  - Dec 2025 Tuition - Rs. 8,000 (OVERDUE)     ← same month, Sara
    [3] Ahmed - Jan 2026 Tuition - Rs. 5,000 (DUE)
    [4] Sara  - Jan 2026 Tuition - Rs. 8,000 (DUE)
    [5] Fatima- Feb 2026 Tuition - Rs. 10,000 (DUE)

  Allocation:
    [1] Ahmed  Dec: pay 5,000 → CLEARED      remaining: 10,000
    [2] Sara   Dec: pay 8,000 → CLEARED      remaining: 2,000
    [3] Ahmed  Jan: pay 2,000 → PARTIAL      remaining: 0

  Result:
    Ahmed:  Rs. 7,000 (Dec cleared + Jan partial)
    Sara:   Rs. 8,000 (Dec cleared)
    Fatima: Rs. 0
```

**Why this is the default**: It clears overdue fees first, which:
- Reduces the school's outstanding overdue amount
- Prevents late fees from accumulating further
- Makes the defaulters list shorter
- Is what most school accountants would do manually

### Strategy 2: CHILD_PRIORITY

Admin specifies an order of children. The system fills each child's fees COMPLETELY before moving to the next.

```
Algorithm:
  1. Order children by admin-specified priority (childPriorityOrder[])
  2. For each child (in priority order):
     For each assignment (sorted by dueDate ASC):
       payThis = min(remainingAmount, assignment.balanceAmount)
       allocation[child].push({ assignmentId, payThis })
       remainingAmount -= payThis
       if remainingAmount == 0: break outer

Example:
  Parent pays: Rs. 15,000
  Admin priority: [Sara, Ahmed, Fatima]

  Sara's assignments (dueDate ASC):
    Dec Tuition: Rs. 8,000
    Jan Tuition: Rs. 8,000

  Ahmed's assignments:
    Dec Tuition: Rs. 5,000
    Jan Tuition: Rs. 5,000

  Allocation:
    Sara  Dec: pay 8,000 → CLEARED      remaining: 7,000
    Sara  Jan: pay 7,000 → PARTIAL      remaining: 0
    Ahmed: Rs. 0
    Fatima: Rs. 0

  Result:
    Sara:   Rs. 15,000 (Dec cleared + Jan mostly cleared)
    Ahmed:  Rs. 0
    Fatima: Rs. 0
```

**When to use**: Parent explicitly says "Sara ki fee pehle di jaye" or one child is at risk of being held back from exams.

### Strategy 3: EQUAL_SPLIT

Divides the total equally among all children with pending fees, then allocates per child using oldest-first.

```
Algorithm:
  1. Count children with pending fees (childrenWithBalance)
  2. perChildShare = totalAmount / childrenWithBalance
  3. For each child:
     childRemaining = perChildShare
     For each assignment (sorted by dueDate ASC):
       payThis = min(childRemaining, assignment.balanceAmount)
       allocation[child].push({ assignmentId, payThis })
       childRemaining -= payThis
       if childRemaining == 0: break
     If childRemaining > 0:
       redistributePot += childRemaining  // child had less balance than share
  4. If redistributePot > 0:
     Re-run for remaining children with redistributePot (recursive/iterative)

Example:
  Parent pays: Rs. 15,000
  3 children with balance → Rs. 5,000 each

  Ahmed (Dec: 5K, Jan: 5K):
    Dec: pay 5,000 → CLEARED      childRemaining: 0

  Sara (Dec: 8K):
    Dec: pay 5,000 → PARTIAL      childRemaining: 0

  Fatima (Feb: 10K):
    Feb: pay 5,000 → PARTIAL      childRemaining: 0

  Result:
    Ahmed:  Rs. 5,000 (Dec cleared)
    Sara:   Rs. 5,000 (Dec partial, bal 3K)
    Fatima: Rs. 5,000 (Feb partial, bal 5K)
```

**When to use**: Parent wants "fair" distribution. No child should feel left out.

### Strategy 4: MANUAL

Admin specifies exact amount per child. System validates sum = totalAmount, then allocates per child using oldest-first within each child.

```
Algorithm:
  1. Validate: sum(manualAllocations.amount) == totalAmount
  2. For each manual allocation:
     childRemaining = allocation.amount
     For each child's assignment (dueDate ASC):
       payThis = min(childRemaining, assignment.balanceAmount)
       allocation[child].push({ assignmentId, payThis })
       childRemaining -= payThis
     Validate: childRemaining == 0 (allocated amount <= child's total balance)

Example:
  Parent pays: Rs. 15,000
  Admin specifies: Ahmed 10K, Sara 3K, Fatima 2K

  Ahmed (Dec: 5K, Jan: 5K):
    Dec: pay 5,000 → CLEARED
    Jan: pay 5,000 → CLEARED

  Sara (Dec: 8K):
    Dec: pay 3,000 → PARTIAL (bal 5K)

  Fatima (Feb: 10K):
    Feb: pay 2,000 → PARTIAL (bal 8K)

  Result:
    Ahmed:  Rs. 10,000 (fully clear for 2 months)
    Sara:   Rs. 3,000 (partial Dec)
    Fatima: Rs. 2,000 (partial Feb)
```

**When to use**: Parent gives specific instructions per child, or admin has specific knowledge about which child's fees are more urgent.

### Edge Cases in Allocation

| Edge Case | Handling |
|-----------|----------|
| Amount > total family balance | REJECTED before engine runs (validation in action) |
| Amount = 0 | REJECTED before engine runs |
| One child has all fees paid | Skip that child in allocation. Only children with balance > 0 participate |
| EQUAL_SPLIT but one child has less balance than share | The share is capped at child's balance. Excess is redistributed to other children |
| MANUAL but allocated amount > child's balance | REJECTED: "Cannot allocate Rs. X to Ahmed — only Rs. Y outstanding" |
| MANUAL but sum ≠ totalAmount | REJECTED: "Manual allocation sum (Rs. X) ≠ payment amount (Rs. Y)" |
| All assignments for a child are OVERDUE | Normal behavior — engine processes them by dueDate, no special handling |
| Child has both OVERDUE and DUE fees | OVERDUE are sorted first (earlier dueDate), so they get allocated first |
| Decimal precision: Rs. 15,000 / 3 children = Rs. 5,000 exactly | No issue. But Rs. 10,000 / 3 = Rs. 3,333.33 per child with Rs. 0.01 remainder → assign remainder to first child |

### Allocation Preview Flow (Client-Side)

```
1. Admin enters totalAmount → triggers preview calculation
2. Engine runs in-browser (pure function, no API call)
3. Preview table updates in real-time:
   ┌─────────────────────────────────────────────────────────┐
   │  Child       │ Allocated │ Against                       │
   │  Ahmed (5-A) │ Rs. 7,000 │ Dec ✅ (clear) + Jan (partial)│
   │  Sara (8-B)  │ Rs. 8,000 │ Dec ✅ (cleared)              │
   │  Fatima(10-A)│ Rs. 0     │ (no funds remaining)          │
   │  ───────────────────────────────────────────────────────  │
   │  Total: Rs. 15,000 / Rs. 15,000  ✅                     │
   └─────────────────────────────────────────────────────────┘

4. Admin can:
   - Change totalAmount → preview updates
   - Change strategy → preview updates
   - Switch to MANUAL → edit per-child amounts → preview validates
   - Confirm → submit to server

5. Server re-runs same engine with FRESH data (in case balances changed)
   - If server result differs from preview → inform admin before committing
   - This handles the race condition where another admin recorded a payment
     between preview and submission
```

### Engine Implementation Notes

```
The allocation engine is a PURE FUNCTION:
  - Input: AllocationInput
  - Output: AllocationResult
  - No side effects, no DB access, no mutations
  - Can run client-side (preview) or server-side (execution)
  - Same code, same result — deterministic

Server-side wraps it:
  1. Fetch fresh data from DB (inside $transaction)
  2. Run engine with fresh data
  3. Use engine output to create FeePayment records + update FeeAssignment records
  4. Store engine output as allocationDetails JSON on FamilyPayment

Client-side uses it:
  1. Already has data from useFamilyOutstandingFees hook
  2. Run engine with cached data
  3. Display preview table
  4. NO mutation — just visual preview
```
