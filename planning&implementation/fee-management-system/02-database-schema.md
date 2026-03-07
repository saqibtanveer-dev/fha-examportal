# Fee Management — Database Schema Design

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 4. Database Schema Design

### New Enums

```prisma
enum FeeType {
  TUITION           // Monthly tuition fee
  ADMISSION_FEE     // One-time admission charge
  EXAM_FEE          // Per-exam or per-term exam fee
  LAB_FEE           // Science lab / computer lab
  SPORTS_FEE        // Sports/games fee
  LIBRARY_FEE       // Library membership/book fee
  TRANSPORT_FEE     // School transport (if applicable)
  DEVELOPMENT_FUND  // Building/development levy
  SECURITY_DEPOSIT  // Refundable security deposit
  STATIONERY_FEE    // Notebooks/stationery provided by school
  UNIFORM_FEE       // School uniform charge
  MISCELLANEOUS     // Catch-all for any other fee type
}

enum FeeFrequency {
  MONTHLY           // Charged every month
  QUARTERLY         // Charged every 3 months
  SEMI_ANNUAL       // Charged every 6 months
  ANNUAL            // Charged once per year
  ONE_TIME          // Charged once (admission fee, security deposit)
}

enum PaymentStatus {
  PENDING           // Fee assigned but not paid
  PARTIAL           // Some amount paid, balance remaining
  PAID              // Fully paid
  OVERDUE           // Past due date, not paid
  WAIVED            // Fee waived entirely
  REFUNDED          // Payment reversed/refunded
}

enum PaymentMethod {
  CASH              // In-person cash payment
  BANK_TRANSFER     // Bank wire transfer
  CHEQUE            // Paper cheque
  ONLINE            // Online transfer (generic — not gateway-specific)
  DEMAND_DRAFT      // DD payment
  OTHER             // Any other method
}

enum FeeDiscountType {
  SCHOLARSHIP       // Automatic from scholarship system
  SIBLING           // Sibling discount (manual)
  STAFF_CHILD       // Staff child discount
  MERIT             // Merit-based discount
  FINANCIAL_AID     // Need-based financial aid
  CUSTOM            // Any other discount
}

enum FeeTransactionType {
  PAYMENT           // Money received
  REFUND            // Money returned
  REVERSAL          // Payment reversed (error correction)
  WAIVER            // Fee amount waived
  PENALTY           // Late fee / fine added
  ADJUSTMENT        // Manual balance adjustment
  CARRY_FORWARD     // Balance carried from previous session
}

enum AllocationStrategy {
  OLDEST_FIRST      // Clear oldest overdue assignments across all children first (DEFAULT)
  CHILD_PRIORITY    // Pay one child's dues completely before moving to next child
  EQUAL_SPLIT       // Divide equally among all children
  MANUAL            // Admin manually specifies per-child amounts
}
```

### New Models

#### 4.1 FeeCategory

**Purpose:** Defines the types of fees the school charges. Admin-configurable master list. These are TEMPLATES — not assigned directly to students.

```prisma
model FeeCategory {
  id                String        @id @default(uuid())
  name              String        // "Tuition Fee", "Lab Fee", "Sports Fee"
  code              String        @unique // "TUI", "LAB", "SPT" — short code for receipts
  type              FeeType
  description       String?
  isRefundable      Boolean       @default(false) // Security deposits are refundable
  isActive          Boolean       @default(true)
  sortOrder         Int           @default(0)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  feeStructures     FeeStructure[]
  feeLineItems      FeeLineItem[]

  @@index([type])
  @@index([isActive])
  @@index([sortOrder])
}
```

**Rationale:**
- Separate from `FeeStructure` so the same category (e.g., "Tuition") exists once, but has different amounts per class per session.
- `code` is unique short identifier for receipt printing (receipt shows "TUI: Rs. 5000" not full name).
- `isRefundable` flag enables tracking of deposits that must be returned on withdrawal.
- `sortOrder` controls display order in fee breakdowns (tuition first, miscellaneous last).

#### 4.2 FeeStructure

**Purpose:** Defines the fee schedule per class per academic session. This is WHERE you say "Class 5 Tuition = Rs. 5,000/month for 2025-2026 session."

```prisma
model FeeStructure {
  id                String        @id @default(uuid())
  feeCategoryId     String
  classId           String
  academicSessionId String
  amount            Decimal       @db.Decimal(12, 2) // Base amount before any discount
  frequency         FeeFrequency
  dueDay            Int?          // Day of month (1-28) for MONTHLY; null for ONE_TIME
  dueDateFixed      DateTime?     // Specific due date for ONE_TIME / ANNUAL
  lateFeePercentage Decimal?      @db.Decimal(5, 2)  // e.g., 5.00 = 5% per month late
  lateFeeFixedAmount Decimal?     @db.Decimal(12, 2) // OR fixed amount per month late
  gracePeriodDays   Int           @default(0) // Days after due date before late fee kicks in
  isActive          Boolean       @default(true)
  description       String?       // "Monthly tuition for Class 5"
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  feeCategory       FeeCategory     @relation(fields: [feeCategoryId], references: [id])
  class             Class           @relation(fields: [classId], references: [id])
  academicSession   AcademicSession @relation(fields: [academicSessionId], references: [id])
  feeAssignments    FeeAssignment[]

  @@unique([feeCategoryId, classId, academicSessionId])
  @@index([classId, academicSessionId])
  @@index([feeCategoryId])
  @@index([academicSessionId])
  @@index([isActive])
}
```

**Rationale:**
- `@@unique([feeCategoryId, classId, academicSessionId])` ensures one Tuition fee structure per class per session — no duplicates.
- Both `lateFeePercentage` and `lateFeeFixedAmount` exist — school chooses one. Business logic: if percentage is set, use it; else use fixed amount; if neither, no late fee.
- `dueDay` for monthly fees (e.g., 10th of every month). `dueDateFixed` for one-time/annual (e.g., April 15, 2026).
- `gracePeriodDays` = schools give 5-7 day grace before charging late fee.
- Relationship to `Class` (not Section) because fees are class-level. If a school charges different fees per section — that's an edge case handled via individual discounts.

#### 4.3 FeeAssignment

**Purpose:** The ACTUAL fee assigned to a SPECIFIC student for a SPECIFIC period. This is the "invoice" — the concrete instance of what a student owes.

```prisma
model FeeAssignment {
  id                String        @id @default(uuid())
  studentProfileId  String
  feeStructureId    String
  academicSessionId String
  periodLabel       String        // "January 2026", "Q1 2026", "2025-2026", "Admission"
  periodStartDate   DateTime      @db.Date
  periodEndDate     DateTime      @db.Date
  baseAmount        Decimal       @db.Decimal(12, 2) // Original amount from structure
  discountAmount    Decimal       @db.Decimal(12, 2) @default(0) // Total discounts applied
  penaltyAmount     Decimal       @db.Decimal(12, 2) @default(0) // Late fees / penalties
  netAmount         Decimal       @db.Decimal(12, 2) // baseAmount - discountAmount + penaltyAmount
  paidAmount        Decimal       @db.Decimal(12, 2) @default(0) // Total paid so far
  balanceAmount     Decimal       @db.Decimal(12, 2) // netAmount - paidAmount (computed, stored for query performance)
  dueDate           DateTime      @db.Date
  status            PaymentStatus @default(PENDING)
  isCarryForward    Boolean       @default(false) // Carried from previous session
  remarks           String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  studentProfile    StudentProfile  @relation(fields: [studentProfileId], references: [id])
  feeStructure      FeeStructure    @relation(fields: [feeStructureId], references: [id])
  academicSession   AcademicSession @relation(fields: [academicSessionId], references: [id])
  feeLineItems      FeeLineItem[]   // Breakdown (multiple fee categories in one assignment)
  feeDiscounts      FeeDiscount[]   // Discounts applied to this assignment
  feePayments       FeePayment[]    // Payments against this assignment
  feeTransactions   FeeTransaction[] // Full transaction log

  @@unique([studentProfileId, feeStructureId, periodLabel, academicSessionId])
  @@index([studentProfileId, academicSessionId])
  @@index([status])
  @@index([dueDate])
  @@index([academicSessionId])
  @@index([feeStructureId])
  @@index([balanceAmount]) // For "who owes money" queries
}
```

**Rationale:**
- `periodLabel` human-readable: "January 2026" for monthly, "Q1 Apr-Jun 2026" for quarterly. Easier for UI display + receipt printing than computing from dates.
- `periodStartDate` / `periodEndDate` for date-range queries and calendar calculations.
- `balanceAmount` is denormalized (netAmount - paidAmount) — stored for query performance. Every time `paidAmount` changes, `balanceAmount` is recomputed in the same transaction.
- `discountAmount` is the SUM of all FeeDiscount records for this assignment.
- `penaltyAmount` tracks late fees added.
- `netAmount = baseAmount - discountAmount + penaltyAmount` — always recomputed atomically.
- `isCarryForward` flag identifies balances brought forward from previous session.
- `status` is a computed state: `paidAmount = 0` → PENDING, `0 < paidAmount < netAmount` → PARTIAL, `paidAmount >= netAmount` → PAID, `dueDate past & status != PAID` → OVERDUE.

#### 4.4 FeeLineItem

**Purpose:** Breaks down a fee assignment into its component parts. For example, a monthly fee assignment might include: Tuition Rs. 5000 + Lab Rs. 500 + Sports Rs. 300 = Rs. 5800.

```prisma
model FeeLineItem {
  id                String        @id @default(uuid())
  feeAssignmentId   String
  feeCategoryId     String
  description       String        // "Tuition Fee - January 2026"
  amount            Decimal       @db.Decimal(12, 2)
  sortOrder         Int           @default(0)
  createdAt         DateTime      @default(now())

  feeAssignment     FeeAssignment @relation(fields: [feeAssignmentId], references: [id], onDelete: Cascade)
  feeCategory       FeeCategory   @relation(fields: [feeCategoryId], references: [id])

  @@index([feeAssignmentId])
  @@index([feeCategoryId])
}
```

**Rationale:**
- Enables receipt to show itemized breakdown (not just "Total: Rs. 5800").
- One assignment can have multiple line items from different fee categories.
- `description` is pre-computed at creation time ("Tuition Fee - January 2026") — not dynamically assembled. This makes receipts reproducible even if fee category name changes later.

#### 4.5 FeeDiscount

**Purpose:** Records discounts applied to a specific fee assignment. Scholarship discounts, sibling discounts, merit discounts, etc.

```prisma
model FeeDiscount {
  id                String          @id @default(uuid())
  feeAssignmentId   String
  discountType      FeeDiscountType
  description       String          // "50% Scholarship on Tuition", "Staff child 25% discount"
  percentage        Decimal?        @db.Decimal(5, 2)  // 50.00 = 50%
  fixedAmount       Decimal?        @db.Decimal(12, 2) // OR fixed amount discount
  calculatedAmount  Decimal         @db.Decimal(12, 2) // Actual amount discounted (resolved)
  scholarshipId     String?         // FK → ApplicantScholarship (if from scholarship system)
  approvedById      String          // Admin who approved the discount
  reason            String?         // Why this discount was given
  isActive          Boolean         @default(true)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  feeAssignment     FeeAssignment   @relation(fields: [feeAssignmentId], references: [id], onDelete: Cascade)

  @@index([feeAssignmentId])
  @@index([discountType])
  @@index([scholarshipId])
}
```

**Rationale:**
- Both `percentage` and `fixedAmount` — business logic resolves to `calculatedAmount`.
- `scholarshipId` links back to the admission/scholarship system if the discount originates from there. `null` for manual discounts.
- `approvedById` — every discount must be traceable to an admin who approved it.
- `isActive` allows revoking a discount without deleting the record (audit trail preserved).

#### 4.6 FeePayment

**Purpose:** Records actual money received against a SPECIFIC student's fee assignment. This is the CORE financial record. APPEND-ONLY — never updated, only complemented by reversals. Can exist independently (direct student payment) OR linked to a FamilyPayment wrapper (family-originated payment).

```prisma
model FeePayment {
  id                String          @id @default(uuid())
  feeAssignmentId   String
  familyPaymentId   String?         // null = direct student payment, set = originated from family payment
  receiptNumber     String          @unique // "RCP-2026-0001" — sequential, unique (sub-receipt for family payments)
  amount            Decimal         @db.Decimal(12, 2)
  paymentMethod     PaymentMethod
  paymentDate       DateTime        @db.Date
  referenceNumber   String?         // Cheque number, bank transfer reference, online txn ID
  bankName          String?         // Bank name for cheque/transfer
  receivedById      String          // Admin who collected this payment
  remarks           String?
  isReversed        Boolean         @default(false) // Soft flag — original record stays, reversal record created
  reversedAt        DateTime?
  reversedById      String?
  reversalReason    String?
  createdAt         DateTime        @default(now())

  feeAssignment     FeeAssignment   @relation(fields: [feeAssignmentId], references: [id])
  familyPayment     FamilyPayment?  @relation(fields: [familyPaymentId], references: [id])

  @@index([feeAssignmentId])
  @@index([familyPaymentId])
  @@index([receiptNumber])
  @@index([paymentDate])
  @@index([receivedById])
  @@index([paymentMethod])
  @@index([isReversed])
}
```

**Rationale:**
- **APPEND-ONLY**: No `updatedAt` — once created, a payment record is IMMUTABLE. Corrections happen via reversal records.
- `receiptNumber` is sequential, unique, and formatted: `{prefix}-{year}-{sequence}`. Generated atomically with the payment record.
- **`familyPaymentId` (CRITICAL FIELD):** This is the KEY field that enables dual-mode collection:
  - `null` → Direct student payment. Admin searched for a specific student, recorded payment. Normal flow.
  - `set` → This payment was generated as part of a FamilyPayment. The family paid Rs. X total, system distributed across children, each child got a FeePayment linked back to the FamilyPayment wrapper.
  - This means: **ALL reporting, queries, and ledger logic works at FeePayment level regardless of origin.** The FamilyPayment is just an organizational wrapper—the real financial records are always per-student FeePayment + FeeTransaction.
- `receivedById` tracks which admin collected the payment — accountability.
- `isReversed` is a soft flag. The original payment record remains. A new `FeeTransaction` with type `REVERSAL` or `REFUND` is created pointing to this payment.
- `referenceNumber` stores cheque number, bank transfer reference, or online transaction ID for cross-referencing.

#### 4.7 FeeTransaction

**Purpose:** Complete financial ledger. EVERY fee-related financial event creates a transaction record. This is the SINGLE SOURCE OF TRUTH for fee financials.

```prisma
model FeeTransaction {
  id                String              @id @default(uuid())
  feeAssignmentId   String
  type              FeeTransactionType  // PAYMENT | REFUND | REVERSAL | WAIVER | PENALTY | ADJUSTMENT | CARRY_FORWARD
  amount            Decimal             @db.Decimal(12, 2) // Positive for debit (what student owes more), negative for credit (what reduces balance)
  balanceAfter      Decimal             @db.Decimal(12, 2) // Running balance after this transaction
  referenceId       String?             // FK to FeePayment.id (for PAYMENT/REFUND/REVERSAL) or null for others
  description       String              // Human-readable: "Payment received - Cash - Rs. 5,000"
  performedById     String              // Who performed this transaction
  metadata          Json?               // Additional context (receipt number, cheque details, etc.)
  createdAt         DateTime            @default(now())

  feeAssignment     FeeAssignment       @relation(fields: [feeAssignmentId], references: [id])

  @@index([feeAssignmentId])
  @@index([type])
  @@index([createdAt])
  @@index([performedById])
}
```

**Rationale:**
- This is a **double-entry-style ledger**. Every event that changes a student's fee balance creates a transaction. The chain of transactions can reconstruct the balance at any point in time.
- `balanceAfter` is the running balance — enables audit without recalculating from scratch.
- `amount` is **signed**: positive = student owes more (penalty, new fee), negative = student owes less (payment, discount, refund).
- `referenceId` links to the concrete entity (FeePayment for payments, null for penalties/waivers).
- `metadata` stores any additional context (JSON) without schema changes.
- **APPEND-ONLY**: No `updatedAt`. Transactions are immutable.

#### 4.8 FamilyPayment (Family-Level Payment Wrapper)

**Purpose:** Wraps multiple child-level FeePayments into ONE family-level transaction. This is the answer to: *"Parent aa kr fee dy dy, na btaye ki konse child ki kitni."* ONE master receipt for the parent, system internally distributes to per-child FeePayments.

```prisma
model FamilyPayment {
  id                    String              @id @default(uuid())
  familyProfileId       String
  academicSessionId     String
  masterReceiptNumber   String              @unique // "FRCP-2026-0045" — family receipt, one number
  totalAmount           Decimal             @db.Decimal(12, 2)
  paymentMethod         PaymentMethod
  paymentDate           DateTime            @db.Date
  referenceNumber       String?             // Cheque number, bank transfer ref, etc.
  bankName              String?
  receivedById          String              // Admin who collected
  allocationStrategy    AllocationStrategy  @default(OLDEST_FIRST)
  allocationDetails     Json?               // Stores the allocation breakdown: { childId: amount }[]
  remarks               String?
  isReversed            Boolean             @default(false)
  reversedAt            DateTime?
  reversedById          String?
  reversalReason        String?
  createdAt             DateTime            @default(now())

  familyProfile         FamilyProfile       @relation(fields: [familyProfileId], references: [id])
  academicSession       AcademicSession     @relation(fields: [academicSessionId], references: [id])
  feePayments           FeePayment[]        // Per-child payments generated from this family payment

  @@index([familyProfileId])
  @@index([academicSessionId])
  @@index([masterReceiptNumber])
  @@index([paymentDate])
  @@index([receivedById])
  @@index([isReversed])
}
```

**Rationale:**
- **This solves 3 core problems simultaneously:**
  1. **Parent doesn't specify per-child split** → `allocationStrategy = OLDEST_FIRST` auto-distributes.
  2. **Parent wants ONE receipt** → `masterReceiptNumber` is the single receipt given to parent.
  3. **System needs per-student tracking** → Each child gets a `FeePayment` with `familyPaymentId` set.

- **`allocationStrategy`:** Determines HOW the total amount is distributed:
  - `OLDEST_FIRST` (default): System sorts ALL pending assignments across ALL children by `dueDate ASC`, allocates money oldest-first. This clears overdue fees first.
  - `CHILD_PRIORITY`: Admin selects which child to prioritize. That child's assignments filled first, then next child.
  - `EQUAL_SPLIT`: Total divided equally among children. E.g., Rs. 15,000 across 3 children = Rs. 5,000 each.
  - `MANUAL`: Admin types exact per-child amounts. Full control.

- **`allocationDetails` (Json):** Stores the actual breakdown for audit:
  ```json
  [
    { "childId": "ahmed-uuid", "childName": "Ahmed", "amount": 5000, "assignmentIds": ["a1", "a2"] },
    { "childId": "sara-uuid", "childName": "Sara", "amount": 8000, "assignmentIds": ["a3"] },
    { "childId": "fatima-uuid", "childName": "Fatima", "amount": 2000, "assignmentIds": ["a4"] }
  ]
  ```

- **`masterReceiptNumber`:** Uses a DIFFERENT prefix than individual receipts (`FRCP-` vs `RCP-`) to distinguish family receipts. But uses the SAME sequence counter (atomic increment from FeeSettings).

- **Reversal cascades:** When a FamilyPayment is reversed (e.g., cheque bounce), ALL linked FeePayments are reversed atomically. One operation → all children's balances restored.

- **APPEND-ONLY:** Like FeePayment, no `updatedAt`. Immutable once created.

#### How FamilyPayment and FeePayment Connect

```
FamilyPayment (Khan family, Rs. 15,000, OLDEST_FIRST)
│
├── FeePayment (Ahmed, Rs. 5,000, familyPaymentId = this)
│   └── FeeTransaction (PAYMENT, -5,000 on Ahmed's Jan assignment)
│
├── FeePayment (Sara, Rs. 8,000, familyPaymentId = this)
│   └── FeeTransaction (PAYMENT, -8,000 on Sara's Jan assignment)
│
└── FeePayment (Fatima, Rs. 2,000, familyPaymentId = this)
    └── FeeTransaction (PAYMENT, -2,000 on Fatima's Feb assignment, PARTIAL)

Direct Student Payment (no family wrapper):

FeePayment (Ali, Rs. 5,000, familyPaymentId = null)
└── FeeTransaction (PAYMENT, -5,000 on Ali's Jan assignment)
```

**Key Design Decision:** The `FeePayment` table is ALWAYS the single source of truth for per-student payments. The `FamilyPayment` is purely an organizational/receipt wrapper. This means:
- Class reports JOIN on `FeePayment` → works for BOTH direct and family payments.
- Student fee summaries query `FeePayment` WHERE `studentProfileId` → works regardless of origin.
- Receipt system checks: if `familyPaymentId` exists → show family master receipt; else → show individual receipt.

#### 4.9 FeeSettings (Separate Model for Clean Separation)

**Purpose:** Global fee configuration for the school.

```prisma
model FeeSettings {
  id                    String    @id @default(uuid())
  currency              String    @default("PKR") // ISO 4217 currency code
  currencySymbol        String    @default("Rs.") // Display symbol
  receiptPrefix         String    @default("RCP") // Receipt number prefix
  familyReceiptPrefix   String    @default("FRCP") // Family receipt prefix
  receiptNextSequence   Int       @default(1)     // Next receipt sequence number (shared for both individual + family)
  defaultLateFeePercent Decimal?  @db.Decimal(5, 2) // Default late fee % if structure doesn't define one
  defaultGracePeriodDays Int      @default(7)      // Default grace period
  enableLateFee         Boolean   @default(true)   // Global toggle for late fees
  enablePartialPayment  Boolean   @default(true)   // Allow partial payments
  feeReminderDaysBefore Int       @default(5)      // Send reminder N days before due date
  overdueAlertDaysAfter Int       @default(7)      // Send overdue alert N days after due date
  financialYearStart    Int       @default(4)      // Month number (4 = April for Pakistan fiscal year)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

**Rationale:**
- Separate model from `SchoolSettings` — fee configuration should not pollute general settings. Different admin panels manage them.
- `receiptNextSequence` is atomically incremented inside a transaction when generating receipts (prevents duplicate receipt numbers under concurrency). **Shared** for both individual and family receipts.
- `familyReceiptPrefix` (`FRCP`) distinguishes family receipts from individual receipts (`RCP`).
- `financialYearStart` enables reporting by financial year (April–March in Pakistan) vs. academic year.
- Global toggles (`enableLateFee`, `enablePartialPayment`) allow school-wide policy enforcement.

### Modified Existing Models

#### StudentProfile — Add relation
```prisma
// Add to StudentProfile
feeAssignments    FeeAssignment[]
```

#### Class — Add relation
```prisma
// Add to Class
feeStructures     FeeStructure[]
```

#### AcademicSession — Add relations
```prisma
// Add to AcademicSession
feeStructures     FeeStructure[]
feeAssignments    FeeAssignment[]
familyPayments    FamilyPayment[]
```

#### FamilyProfile — Add relation
```prisma
// Add to FamilyProfile
familyPayments    FamilyPayment[]
```

#### NotificationType enum — Add new types
```prisma
// Add to NotificationType
FEE_DUE_REMINDER      // "Your fee for January 2026 is due on 10th"
FEE_OVERDUE_ALERT     // "Your fee for December 2025 is overdue by 15 days"
FEE_PAYMENT_RECEIVED  // "Payment of Rs. 5,000 received. Receipt: RCP-2026-0001"
FEE_DISCOUNT_APPLIED  // "A 50% scholarship discount has been applied"
FEE_FAMILY_PAYMENT    // "Family payment of Rs. 15,000 received. Receipt: FRCP-2026-0045"
```

### Entity-Relationship Summary

```
FeeCategory (master list)
    └─── FeeStructure (per class, per session, per category)
              └─── FeeAssignment (per student, per period)
                        ├── FeeLineItem[] (itemized breakdown)
                        ├── FeeDiscount[] (discounts applied)
                        ├── FeePayment[] (payments received — direct OR from family)
                        └── FeeTransaction[] (complete ledger)

FamilyPayment (family-level wrapper — optional)
    └─── FeePayment[] (per-child payments distributed from family total)
         └─── FeeTransaction[] (per-child ledger entries)
```

### Why Class Reports Work Regardless of Payment Mode

```sql
-- Class 5 Fee Report:
SELECT 
  c.name as className,
  SUM(fa.netAmount) as totalAssigned,
  SUM(fa.paidAmount) as totalCollected,
  SUM(fa.balanceAmount) as totalOutstanding
FROM FeeAssignment fa
JOIN StudentProfile sp ON fa.studentProfileId = sp.id
JOIN Class c ON sp.classId = c.id
WHERE fa.academicSessionId = :sessionId
GROUP BY c.id, c.name

-- This query doesn't care if paidAmount came from a direct FeePayment or 
-- a FamilyPayment-originated FeePayment. It just reads the denormalized 
-- paidAmount on FeeAssignment. BOTH modes update this same field.
```
