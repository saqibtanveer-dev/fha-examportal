# Fee Management — Concurrency & Performance

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 21. Concurrency & Data Integrity

### Transaction Strategy

Every write operation that touches financial data MUST be wrapped in `prisma.$transaction()`:

```
recordFeePayment:
  START TRANSACTION (serializable isolation)
    1. Lock FeeSettings row (for receipt sequence)
    2. Lock FeeAssignment rows (for balance update)
    3. Validate amounts against current balances
    4. Generate receipt number
    5. Create FeePayment
    6. Create FeeTransaction(s)
    7. Update FeeAssignment(s)
    8. Create AuditLog
    9. Create Notification
  COMMIT

If ANY step fails → ENTIRE transaction rolls back. No partial payment recording.
```

### Family Payment Transaction (more complex)

```
recordFamilyPayment:
  START TRANSACTION (serializable isolation)
    1. Lock FeeSettings row (for receipt sequence)
    2. Fetch ALL children's FeeAssignment rows with FOR UPDATE
    3. Validate totalAmount <= sum of all children's balances
    4. Generate masterReceiptNumber
    5. Run Allocation Engine (distribute amount)
    6. Create FamilyPayment wrapper
    7. FOR EACH child allocation:
       a. Create FeePayment (familyPaymentId = wrapper.id)
       b. Create FeeTransaction
       c. Update FeeAssignment (paidAmount, balanceAmount, status)
    8. Store allocationDetails JSON
    9. Create AuditLog
    10. Create Notifications (1 for family + N for children)
  COMMIT

More rows locked, longer transaction → but MUST be atomic.
If Ahmed's assignment update fails → Sara's payment is also rolled back.
No child gets partial treatment.
```

### Receipt Number Uniqueness

```
Receipt number generation MUST be atomic:
  1. SELECT receiptNextSequence FROM FeeSettings WHERE id = X FOR UPDATE
  2. new_number = receiptNextSequence
  3. UPDATE FeeSettings SET receiptNextSequence = new_number + 1
  4. Return formatted receipt number

The FOR UPDATE lock ensures no two concurrent transactions get the same number.
With Prisma, use: prisma.$executeRaw for the SELECT ... FOR UPDATE
Or use prisma.$transaction with interactive transaction mode.

Same mechanism for both individual (RCP-) and family (FRCP-) receipt numbers.
They can share the same sequence counter or have separate ones — design choice.
Recommendation: SEPARATE sequences for clarity. FeeSettings has both:
  receiptNextSequence (for RCP-)
  familyReceiptNextSequence (for FRCP-)
```

### Optimistic Locking for Concurrent Edits

```
When recording payment:
  1. Client sends feeAssignment.updatedAt along with payment data
  2. Server verifies: current assignment.updatedAt === sent.updatedAt
  3. If mismatch → reject: "Fee data has changed. Please refresh and try again."
  4. This prevents: Admin A opens collection → Admin B records payment → Admin A submits stale data
```

### Idempotency Key

```
For extra safety, each payment action can include an idempotency key:
  - Client generates UUID before submission
  - Server checks if a payment with this idempotency key exists
  - If exists → return existing payment (no double-charge)
  - If not → process normally

Implementation: Add optional idempotencyKey field to FeePayment with unique constraint.
```

---

## 22. Performance & Scalability Strategy

### Query Optimization

| Query Pattern | Optimization |
|---------------|-------------|
| Student fee summary | Denormalized `balanceAmount` on FeeAssignment — no SUM aggregation needed |
| Class fee collection report | Use `GROUP BY classId` with aggregate functions, not N+1 queries |
| Fee defaulters list | Index on `[status, dueDate]` — pre-filtered by OVERDUE + sorted by amount |
| Monthly trend | Pre-aggregate with `DATE_TRUNC('month', paymentDate)` |
| Receipt lookup | Unique index on `receiptNumber` — direct lookup |
| Student search for collection | Index on `[firstName, lastName]` + `rollNumber` + `registrationNo` |
| Family outstanding fees | Single query: JOIN FamilyStudentLink → StudentProfile → FeeAssignment WHERE status IN (PENDING, PARTIAL, OVERDUE) |
| Class drill-down report | Single query: GROUP BY studentProfileId with aggregate, filtered by classId |

### Indexing Strategy

```
Critical indexes (already in schema design above):
- FeeAssignment: [studentProfileId, academicSessionId] — student fee lookup
- FeeAssignment: [status] — filter by payment status
- FeeAssignment: [dueDate] — upcoming/overdue queries
- FeeAssignment: [balanceAmount] — "who owes money" queries
- FeeAssignment: [classId, academicSessionId] — class report queries
- FeePayment: [receiptNumber] — unique, receipt lookup
- FeePayment: [paymentDate] — date range queries
- FeePayment: [feeAssignmentId] — payment history per assignment
- FeePayment: [familyPaymentId] — find all child payments for a family payment
- FeeTransaction: [feeAssignmentId] — ledger per assignment
- FeeTransaction: [createdAt] — chronological ledger
- FamilyPayment: [masterReceiptNumber] — unique, receipt lookup
- FamilyPayment: [familyProfileId, academicSessionId] — family payment history
```

### Caching Strategy

| Data | Cache Duration | Invalidation |
|------|---------------|-------------|
| Fee categories | 10 minutes (staleTime) | On category CRUD |
| Fee structures | 5 minutes | On structure CRUD |
| Fee assignments list | 2 minutes | On payment/discount/penalty |
| Fee reports/summary | 5 minutes + refetchInterval 5m | On any payment |
| Class-wise report | 5 minutes | On any payment |
| Receipt data | Infinite (immutable) | Never (payments are append-only) |
| Family receipt data | Infinite (immutable) | Never |
| Student fee overview | 1 minute | On payment/discount |
| Family fee overview | 1 minute | On payment/discount |

### Pagination

- Fee assignment lists: server-side pagination (DEFAULT_PAGE_SIZE = 20)
- Payment history: server-side pagination
- Defaulters list: server-side pagination with sort by overdue amount DESC
- Class drill-down student list: server-side pagination (large classes)
- Fee categories & structures: client-side (small datasets, < 50 items)
- Family payment history: client-side (typically < 20 per session)
