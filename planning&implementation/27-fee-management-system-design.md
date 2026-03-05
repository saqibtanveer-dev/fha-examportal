# 27 — Fee Management System Design (Brutal Deep Plan)

> **Date:** 2026-03-05  
> **Status:** PLANNING  
> **Depends on:** Users Module (done), Classes/Sections (done), AcademicSession (done), StudentProfile (done), FamilyProfile (done), Notification System (done), Audit Log (done), Settings (done)  
> **Complexity:** VERY HIGH — new financial domain, touches ALL roles, 10+ new DB models, ledger-grade accuracy, receipt generation, concurrency-safe payments, family portal integration  

---

## Table of Contents

1. [Brutal Analysis — What Exists, What's Missing](#1-brutal-analysis)
2. [Why Fee Management Is Different](#2-why-fee-management-is-different)
3. [System Requirements — No Bullshit](#3-system-requirements)
4. [Database Schema Design](#4-database-schema-design)
5. [Data Flow Architecture](#5-data-flow-architecture)
6. [Module Structure — File-Level Breakdown](#6-module-structure)
7. [Server Actions Design](#7-server-actions-design)
8. [Query Layer Design](#8-query-layer-design)
9. [Validation Schemas](#9-validation-schemas)
10. [React Hooks Design](#10-react-hooks-design)
11. [Admin UI — Fee Structure & Configuration](#11-admin-ui-fee-structure)
12. [Admin UI — Fee Collection & Tracking](#12-admin-ui-fee-collection)
13. [Admin UI — Reports & Analytics](#13-admin-ui-reports)
14. [Student UI — Fee Dashboard](#14-student-ui)
15. [Family UI — Fee Dashboard](#15-family-ui)
16. [Principal UI — Monitoring Dashboard](#16-principal-ui)
17. [Receipt Generation System](#17-receipt-generation)
18. [Reusable Component Library](#18-reusable-components)
19. [RBAC & Authorization Matrix](#19-rbac-authorization)
20. [Business Rules & Edge Cases](#20-business-rules)
21. [Concurrency & Data Integrity](#21-concurrency-data-integrity)
22. [Performance & Scalability Strategy](#22-performance-scalability)
23. [Design Patterns Applied](#23-design-patterns)
24. [Migration Strategy](#24-migration-strategy)
25. [Scholarship-Fee Integration](#25-scholarship-fee-integration)
26. [Implementation Roadmap](#26-implementation-roadmap)

---

## 1. Brutal Analysis — What Exists, What's Missing {#1-brutal-analysis}

### What We HAVE (Foundation Already Built)

| Asset | Status | Relevance to Fee Management |
|-------|--------|----------------------------|
| `StudentProfile` model | ✅ Done | Every student has a profile — fee is assigned per student. `classId`, `sectionId` available for class-based fee structures |
| `FamilyProfile` + `FamilyStudentLink` | ✅ Done | Parents need to see fees. One family ↔ multiple children. Family portal must aggregate fees across children |
| `Class` / `Section` models | ✅ Done | Fee structures are typically class-based (Class 1 = Rs. X, Class 10 = Rs. Y) |
| `AcademicSession` model | ✅ Done | All fee records MUST be scoped to academic session. Fee structures change year-over-year |
| `SchoolSettings` model | ✅ Done | Needs extension for fee-specific config: currency, tax, penalty rules, receipt prefix |
| `UserRole` enum (ADMIN, PRINCIPAL, TEACHER, STUDENT, FAMILY) | ✅ Done | Admin manages fee setup + collection. Student/Family view fees. Principal monitors. Teacher has NO access |
| `Notification` model | ✅ Done | Fee due reminders, payment confirmations, overdue alerts |
| `AuditLog` model | ✅ Done | CRITICAL for financial module — every payment, refund, waiver MUST be audit-logged |
| `ApplicantScholarship` model | ✅ Done | Scholarship students get fee discounts — needs direct integration |
| `safeAction` wrapper | ✅ Done | Error handling for financial mutations |
| `actionSuccess` / `actionError` | ✅ Done | Standardized return types |
| `requireRole()` auth | ✅ Done | Role-based access control |
| `serialize()` utility | ✅ Done | Decimal serialization — CRITICAL for currency amounts |
| `queryKeys` factory | ✅ Done | Add `fees.*` namespace |
| `useReferenceStore` | ✅ Done | Cached classes, sessions — fee filters need these |
| `ClassSectionSelector` component | ✅ Done | Reusable for fee assignment filtering |
| `PageHeader`, `EmptyState`, `Spinner` | ✅ Done | Shared UI primitives |
| Zod v4 validation patterns | ✅ Done | Schema-first validation for financial data |
| Recharts | ✅ Done | Fee collection analytics charts |
| `@tanstack/react-table` | ✅ Done | Fee ledger tables with sorting/filtering |
| Prisma `Decimal` type | ✅ Done | Already used for exam marks — same pattern for currency |

### What's MISSING (Must Build)

| Gap | Severity | Notes |
|-----|----------|-------|
| **No FeeStructure model** | 🔴 CRITICAL | No way to define fee types, amounts, or schedules |
| **No FeeAssignment model** | 🔴 CRITICAL | No way to assign fees to individual students |
| **No Payment model** | 🔴 CRITICAL | No way to record payments |
| **No Receipt concept** | 🔴 CRITICAL | No way to generate or track receipts |
| **No FeeDiscount / FeeWaiver model** | 🟡 HIGH | Scholarship students need automatic discounts |
| **No LateFee / Penalty rules** | 🟡 HIGH | Schools charge late payment penalties |
| **No fee-related enums** | 🔴 CRITICAL | PaymentMethod, PaymentStatus, FeeType, FeeFrequency |
| **No `/admin/fees` routes** | 🔴 CRITICAL | No admin fee management pages |
| **No `/student/fees` route** | 🔴 CRITICAL | Students can't see their fee status |
| **No `/family/fees` route** | 🔴 CRITICAL | Parents can't see children's fee status |
| **No `src/modules/fees/` module** | 🔴 CRITICAL | No module directory |
| **No fee query keys** | 🟡 MEDIUM | Need `queryKeys.fees.*` |
| **No fee validation schemas** | 🟡 MEDIUM | New Zod schemas for financial data |
| **No receipt generation** | 🟡 HIGH | Schools need printable receipts |
| **No `ROUTES.ADMIN.FEES`** | 🟡 MEDIUM | Route constants missing |
| **No `ROUTES.STUDENT.FEES`** | 🟡 MEDIUM | Route constants missing |
| **No `ROUTES.FAMILY.FEES`** | 🟡 MEDIUM | Route constants missing |
| **No currency constants** | 🟡 MEDIUM | PKR formatting, decimal precision |
| **SchoolSettings missing fee config** | 🟡 MEDIUM | Need: currency, tax %, receipt prefix, penalty rules |

### Brutal Truths

1. **Fee management is a FINANCIAL module.** Unlike attendance or diary, financial data requires absolute accuracy. A single rounding error in fee calculation multiplied across 500 students = real money discrepancy. Every Decimal operation must be precise.

2. **Concurrency is a REAL problem.** Two admins collecting payment from the same student simultaneously. Two families paying online for the same invoice. Race conditions = double payments or lost payments. Every write operation must be transactional with proper locking.

3. **Audit trail is NON-NEGOTIABLE.** Unlike other modules where audit is "nice-to-have," fee management requires COMPLETE audit trail. Every payment, every refund, every waiver, every discount modification must be traceable to who did it, when, and why. This isn't optional — it's legally required for schools.

4. **Fee structure is deceptively complex.** It looks simple (Class 5 = Rs. 5,000/month) but in reality: tuition fee + lab fee + exam fee + sports fee + transport fee + library fee + development fund — all with different frequencies (monthly, quarterly, annual, one-time), different amounts per class, and different due dates.

5. **Scholarship integration is THE hardest part.** A student might have a 50% scholarship on tuition but NOT on lab fees. A scholarship might expire mid-year. A scholarship might be conditional on attendance > 90%. The fee assignment system must dynamically calculate net payable considering all discounts.

6. **The family portal adds a multiplier.** One parent with 3 children = 3 separate fee streams. The family dashboard must aggregate total fees, show per-child breakdown, and handle the case where one child has a scholarship and another doesn't.

7. **Receipt generation is a first-class feature.** Schools MUST give receipts. Parents DEMAND receipts. Receipts need: school logo, sequential numbering, breakdown of fees paid, payment method, date, signature space. This isn't a "nice to have" — it's a core requirement.

8. **This is NOT a payment gateway integration.** For a single school deployment, fee collection is MANUAL — a parent comes to the admin office, pays cash/bank transfer, admin records the payment. Online payment integration (Stripe, JazzCash, EasyPaisa) is V2 scope. V1 = manual recording with full tracking.

---

## 2. Why Fee Management Is Different {#2-why-fee-management-is-different}

### Financial Domain ≠ Academic Domain

| Dimension | Academic Modules (Exams, Attendance) | Fee Management |
|-----------|--------------------------------------|----------------|
| **Data sensitivity** | Medium — grades matter but aren't money | HIGH — actual money, legal implications |
| **Precision** | Percentages (2 decimal places OK) | Currency (exact to paisa/cent, no rounding errors) |
| **Concurrency risk** | Low — one teacher marks at a time | HIGH — multiple admins collecting simultaneously |
| **Audit requirements** | Nice-to-have | LEGALLY REQUIRED — complete paper trail |
| **Error impact** | Wrong grade = correction | Wrong payment = lost money, angry parents |
| **Immutability** | Grades can be updated | Payments should NEVER be silently modified — only reversed/refunded |
| **Reporting** | Academic analytics | Financial reports (tax, compliance, revenue tracking) |
| **User sensitivity** | Students view own grades | Parents EXTREMELY sensitive about money — any discrepancy = escalation |

### Design Principles for Financial Module

1. **APPEND-ONLY for payments** — Never UPDATE a payment record. If wrong, create a reversal/refund record. Original stays intact.
2. **Decimal precision** — Use Prisma `Decimal` with `@db.Decimal(12,2)` everywhere. Never use `Float`.
3. **Transactional writes** — Every payment recording must be wrapped in a `prisma.$transaction()`.
4. **Optimistic locking** — Use version fields or `updatedAt` checks to prevent concurrent overwrites on balances.
5. **Idempotency** — Payment actions must be idempotent (submitting same payment twice = one record, not two).
6. **Audit-everything** — Every mutation creates an audit log entry with full context.
7. **Receipt as proof** — A payment doesn't "exist" until it has a receipt number. Receipt generation is atomic with payment recording.

---

## 3. System Requirements — No Bullshit {#3-system-requirements}

### Admin Requirements

| # | Requirement | Priority |
|---|------------|----------|
| A1 | Admin can define fee types (Tuition, Lab Fee, Sports Fee, etc.) | P0 |
| A2 | Admin can create fee structures per class per academic session (Class 5 Tuition = Rs. 5,000/month) | P0 |
| A3 | Admin can define fee frequency: MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL, ONE_TIME | P0 |
| A4 | Admin can generate fee assignments for all students in a class (bulk assign) | P0 |
| A5 | Admin can generate fee assignments for a specific student (individual assign) | P0 |
| A6 | Admin can record a payment against a student's fee (cash, bank transfer, cheque, online) | P0 |
| A7 | Admin can generate a receipt for every payment (auto-sequential numbering) | P0 |
| A8 | Admin can view fee ledger (all payments) with filters: class, section, student, date range, status | P0 |
| A9 | Admin can view outstanding/overdue fees report | P0 |
| A10 | Admin can apply a discount/waiver to a student's fee (with reason) | P0 |
| A11 | Admin can apply late fee penalty (manual or auto-calculated) | P1 |
| A12 | Admin can reverse/refund a payment (with audit trail) | P1 |
| A13 | Admin can view fee collection summary (total collected, outstanding, overdue — per class, per month) | P0 |
| A14 | Admin can print/export fee defaulters list | P1 |
| A15 | Admin can configure fee settings: receipt prefix, late fee %, grace period, installment rules | P1 |
| A16 | Admin can carry forward unpaid balance from previous session | P1 |
| A17 | Admin can partially pay (e.g., student owes Rs. 10,000 but pays Rs. 6,000) — balance tracked per installment | P0 |
| A18 | Admin can send fee reminder notifications to students/families with overdue fees | P1 |
| A19 | Admin can clone fee structure from previous academic session to current session | P1 |

### Student Requirements

| # | Requirement | Priority |
|---|------------|----------|
| S1 | Student can view own fee summary: total payable, total paid, balance | P0 |
| S2 | Student can view payment history with receipt details | P0 |
| S3 | Student can view upcoming fee due dates | P0 |
| S4 | Student receives notification for: fee due reminder, overdue alert, payment confirmation | P0 |
| S5 | Student can download/print receipt (if admin has generated one) | P1 |

### Family Requirements

| # | Requirement | Priority |
|---|------------|----------|
| F1 | Family user sees aggregated fee summary across all linked children | P0 |
| F2 | Family user can see per-child fee breakdown | P0 |
| F3 | Family user can view payment history per child | P0 |
| F4 | Family user can view/download receipts per child | P1 |
| F5 | Family user receives notification for fee due dates, overdue alerts | P0 |
| F6 | Family user sees total outstanding amount across all children (overview widget) | P0 |

### Principal Requirements

| # | Requirement | Priority |
|---|------------|----------|
| P1 | Principal can view school-wide fee collection dashboard (total, collected, outstanding, overdue) | P0 |
| P2 | Principal can view class-wise fee collection comparison | P0 |
| P3 | Principal can view monthly/quarterly collection trends | P0 |
| P4 | Principal can view fee defaulters list (students with overdue > N days) | P0 |
| P5 | Principal can view scholarship impact on fee collection (total discounts given) | P1 |

### NON-Requirements (Out of Scope — V1)

| What | Why |
|------|-----|
| Online payment gateway (Stripe, JazzCash, EasyPaisa) | V2 feature — requires payment provider integration, webhook handling, 3D-Secure compliance |
| Fee installment auto-scheduling (EMI calculator) | V2 — keep it simple, admin defines structure, manual installment configuration |
| Tax (GST/VAT) calculation | Schools in Pakistan are typically tax-exempt on tuition. Add later if needed |
| Transport fee route management | Transport is a separate module — too complex for V1 |
| Fee-based SMS notifications | Email + in-app only for V1 |
| Sibling discount auto-calculation | V2 — admin can manually add discount for siblings |
| Fine/penalty for other reasons (library, discipline) | V2 — keep fee module focused on academic fees |
| Multi-currency support | Single school = single currency (PKR). Not SaaS |
| Bank reconciliation | V2 — requires bank statement parsing |

---

## 4. Database Schema Design {#4-database-schema-design}

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

**Purpose:** Records actual money received. This is the CORE financial record. APPEND-ONLY — never updated, only complemented by reversals.

```prisma
model FeePayment {
  id                String          @id @default(uuid())
  feeAssignmentId   String
  receiptNumber     String          @unique // "RCP-2026-0001" — sequential, unique
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

  @@index([feeAssignmentId])
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

#### 4.8 FeeSettings (Extends SchoolSettings — Separate Model for Clean Separation)

**Purpose:** Global fee configuration for the school.

```prisma
model FeeSettings {
  id                    String    @id @default(uuid())
  currency              String    @default("PKR") // ISO 4217 currency code
  currencySymbol        String    @default("Rs.") // Display symbol
  receiptPrefix         String    @default("RCP") // Receipt number prefix
  receiptNextSequence   Int       @default(1)     // Next receipt sequence number
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
- `receiptNextSequence` is atomically incremented inside a transaction when generating receipts (prevents duplicate receipt numbers under concurrency).
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
```

#### NotificationType enum — Add new types
```prisma
// Add to NotificationType
FEE_DUE_REMINDER      // "Your fee for January 2026 is due on 10th"
FEE_OVERDUE_ALERT     // "Your fee for December 2025 is overdue by 15 days"
FEE_PAYMENT_RECEIVED  // "Payment of Rs. 5,000 received. Receipt: RCP-2026-0001"
FEE_DISCOUNT_APPLIED  // "A 50% scholarship discount has been applied"
```

### Entity-Relationship Summary

```
FeeCategory (master list)
    └─── FeeStructure (per class, per session, per category)
              └─── FeeAssignment (per student, per period)
                        ├── FeeLineItem[] (itemized breakdown)
                        ├── FeeDiscount[] (discounts applied)
                        ├── FeePayment[] (payments received)
                        └── FeeTransaction[] (complete ledger)
```

```
Student pays fee:
  1. Admin selects student → sees FeeAssignment(s)
  2. Admin records FeePayment (amount, method, reference)
  3. System creates FeeTransaction (type: PAYMENT, amount: -X)
  4. System updates FeeAssignment (paidAmount += X, balanceAmount -= X)
  5. System updates FeeAssignment.status (PENDING → PARTIAL or PAID)
  6. System generates receipt number atomically
  7. System creates AuditLog
  8. System creates Notification for student + family
  9. All in ONE Prisma $transaction()
```

---

## 5. Data Flow Architecture {#5-data-flow-architecture}

### Fee Setup Flow (Admin)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. DEFINE FEE CATEGORIES (one-time setup)                    │
│    Admin → /admin/fees/categories                            │
│    Creates: Tuition (TUI), Lab Fee (LAB), Sports (SPT)...   │
│    Stored in: FeeCategory table                               │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. DEFINE FEE STRUCTURES (per session setup)                  │
│    Admin → /admin/fees/structures                             │
│    Defines: Class 5 + TUI + Monthly = Rs. 5,000              │
│    Defines: Class 5 + LAB + Quarterly = Rs. 1,500            │
│    Stored in: FeeStructure table                              │
│    Key: ONE structure per (category, class, session)          │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. GENERATE FEE ASSIGNMENTS (bulk or individual)              │
│    Admin → /admin/fees/generate                               │
│    Selects: Class 5, Month: January 2026                     │
│    System: Creates FeeAssignment for EVERY active student     │
│            in Class 5, with FeeLineItems per category         │
│    Stored in: FeeAssignment + FeeLineItem tables             │
│    Creates FeeTransaction (type: CARRY_FORWARD if applicable) │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. APPLY DISCOUNTS (if applicable)                            │
│    System auto-applies scholarship discounts                  │
│    Admin manually applies other discounts                     │
│    Stored in: FeeDiscount table                               │
│    FeeAssignment.discountAmount recalculated                  │
│    FeeAssignment.netAmount recalculated                       │
│    FeeTransaction created (type: WAIVER/ADJUSTMENT)           │
└──────────────────────────────────────────────────────────────┘
```

### Fee Collection Flow (Admin)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. IDENTIFY PAYEE                                             │
│    Admin → /admin/fees/collect                                │
│    Search student by name, roll number, or registration       │
│    System shows: all pending/overdue FeeAssignments           │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. RECORD PAYMENT (inside $transaction)                       │
│    Admin selects assignment(s) to pay                         │
│    Enters: amount, method, reference, remarks                 │
│    ┌─ BEGIN TRANSACTION ────────────────────────────────────┐ │
│    │  a) Validate: amount <= sum of selected balances        │ │
│    │  b) Generate receiptNumber (atomic sequence increment)  │ │
│    │  c) Create FeePayment record                           │ │
│    │  d) Create FeeTransaction (type: PAYMENT)               │ │
│    │  e) Update FeeAssignment.paidAmount += amount           │ │
│    │  f) Update FeeAssignment.balanceAmount -= amount         │ │
│    │  g) Update FeeAssignment.status (PARTIAL / PAID)        │ │
│    │  h) Create AuditLog                                     │ │
│    │  i) Create Notification (student + family)              │ │
│    └─ COMMIT TRANSACTION ───────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. GENERATE RECEIPT                                           │
│    Receipt data: school name, student name, class, items,     │
│    amount, method, receipt#, date, received by                │
│    Printable via browser print / PDF generation               │
└──────────────────────────────────────────────────────────────┘
```

### Fee Viewing Flow (Student / Family)

```
Student/Family → /student/fees OR /family/fees
    │
    ├── Summary Card: Total Payable | Total Paid | Balance
    │
    ├── Upcoming Dues (next 30 days)
    │
    ├── Payment History (table with receipt links)
    │
    └── Fee Breakdown (per category per period)
```

---

## 6. Module Structure — File-Level Breakdown {#6-module-structure}

```
src/modules/fees/
├── fees.types.ts                      # Domain types (FeeAssignmentWithDetails, PaymentSummary, etc.)
├── fees.constants.ts                  # Module constants (status colors, frequency labels, etc.)
├── fees.utils.ts                      # Pure utility functions (amount formatting, due date calculation, status resolution)
│
├── fee-category-queries.ts            # Prisma queries for fee categories
├── fee-category-actions.ts            # 'use server' mutations for categories
├── fee-category-fetch-actions.ts      # 'use server' read-only for categories
│
├── fee-structure-queries.ts           # Prisma queries for fee structures
├── fee-structure-actions.ts           # 'use server' mutations for structures
├── fee-structure-fetch-actions.ts     # 'use server' read-only for structures
│
├── fee-assignment-queries.ts          # Prisma queries for assignments
├── fee-assignment-actions.ts          # 'use server' mutations (generate, apply discount, penalty)
├── fee-assignment-fetch-actions.ts    # 'use server' read-only for assignments
│
├── fee-payment-actions.ts             # 'use server' mutations (record payment, reverse payment)
├── fee-payment-fetch-actions.ts       # 'use server' read-only (payment history, receipt data)
│
├── fee-reports-queries.ts             # Complex aggregation queries (collection summary, defaulters)
├── fee-reports-fetch-actions.ts       # 'use server' reporting actions
│
├── fee-receipt-service.ts             # Receipt number generation, receipt data assembly
│
├── hooks/
│   ├── index.ts                       # Barrel export
│   ├── use-fee-categories.ts          # React Query hooks for categories CRUD
│   ├── use-fee-structures.ts          # React Query hooks for structures
│   ├── use-fee-assignments.ts         # React Query hooks for assignments
│   ├── use-fee-payments.ts            # React Query hooks for payment recording + history
│   ├── use-fee-reports.ts             # React Query hooks for reports/analytics
│   └── use-fee-mutations.ts           # Mutation hooks (useServerAction wrappers)
│
├── components/
│   ├── index.ts                       # Barrel export
│   │
│   │ # ─── Admin: Fee Category Management ───
│   ├── fee-category-list.tsx           # List/grid of fee categories
│   ├── fee-category-form.tsx           # Create/edit fee category dialog
│   │
│   │ # ─── Admin: Fee Structure Management ───
│   ├── fee-structure-table.tsx         # Table: class × category matrix with amounts
│   ├── fee-structure-form.tsx          # Create/edit fee structure dialog
│   ├── fee-structure-clone-dialog.tsx  # Clone structures from previous session
│   │
│   │ # ─── Admin: Fee Assignment & Generation ───
│   ├── fee-generation-form.tsx         # Bulk fee generation wizard
│   ├── fee-assignment-table.tsx        # Per-student fee assignment list with filters
│   ├── fee-discount-form.tsx           # Apply discount/waiver dialog
│   ├── fee-penalty-form.tsx            # Apply late fee dialog
│   │
│   │ # ─── Admin: Fee Collection ───
│   ├── fee-collection-form.tsx         # Record payment form (the CORE form)
│   ├── student-fee-search.tsx          # Search student for fee collection
│   ├── student-fee-summary.tsx         # Student's fee overview when collecting
│   ├── payment-method-selector.tsx     # Cash/Bank/Cheque/Online selector
│   │
│   │ # ─── Admin: Reports & Analytics ───
│   ├── fee-collection-summary.tsx      # Collection dashboard (total/outstanding/overdue)
│   ├── fee-defaulters-table.tsx        # Defaulters list with export
│   ├── fee-class-comparison.tsx        # Class-wise collection comparison chart
│   ├── fee-monthly-trend-chart.tsx     # Monthly collection trend line chart
│   │
│   │ # ─── Shared: Receipt ───
│   ├── fee-receipt-view.tsx            # Printable receipt component
│   ├── fee-receipt-print-button.tsx    # Print trigger
│   │
│   │ # ─── Shared: Student/Family Views ───
│   ├── fee-summary-card.tsx            # Overview card (total/paid/balance)
│   ├── fee-dues-list.tsx               # Upcoming/overdue dues list
│   ├── fee-payment-history.tsx         # Payment history table
│   ├── fee-breakdown-table.tsx         # Category-wise breakdown
│   │
│   │ # ─── Shared: Reusable Primitives ───
│   ├── fee-status-badge.tsx            # PENDING/PARTIAL/PAID/OVERDUE badge
│   ├── fee-amount-display.tsx          # Formatted currency amount display
│   └── fee-filters.tsx                 # Date range, class, status filters
```

---

## 7. Server Actions Design {#7-server-actions-design}

### Fee Category Actions (`fee-category-actions.ts`)

```typescript
// All wrapped in safeAction()

createFeeCategoryAction(input: CreateFeeCategoryInput): ActionResult<FeeCategory>
  - requireRole('ADMIN')
  - Validate via feeCategorySchema
  - Check unique code
  - Create FeeCategory
  - Audit log: "FEE_CATEGORY_CREATED"
  - revalidatePath('/admin/fees')

updateFeeCategoryAction(input: UpdateFeeCategoryInput): ActionResult<FeeCategory>
  - requireRole('ADMIN')
  - Validate via feeCategorySchema
  - Check unique code (exclude self)
  - Update FeeCategory
  - Audit log: "FEE_CATEGORY_UPDATED"
  - revalidatePath('/admin/fees')

toggleFeeCategoryActiveAction(id: string): ActionResult<void>
  - requireRole('ADMIN')
  - Toggle isActive
  - If deactivating: check no active structures reference it
  - Audit log: "FEE_CATEGORY_TOGGLED"
  - revalidatePath('/admin/fees')
```

### Fee Structure Actions (`fee-structure-actions.ts`)

```typescript
createFeeStructureAction(input: CreateFeeStructureInput): ActionResult<FeeStructure>
  - requireRole('ADMIN')
  - Validate via feeStructureSchema
  - Check unique constraint (category + class + session)
  - Create FeeStructure
  - Audit log: "FEE_STRUCTURE_CREATED"
  - revalidatePath('/admin/fees/structures')

updateFeeStructureAction(input: UpdateFeeStructureInput): ActionResult<FeeStructure>
  - requireRole('ADMIN')
  - Validate via feeStructureSchema
  - Check: if assignments exist that reference this structure, warn (not block — amounts may need correction)
  - Update FeeStructure
  - Audit log: "FEE_STRUCTURE_UPDATED"
  - revalidatePath('/admin/fees/structures')

cloneFeeStructuresAction(input: CloneFeeStructuresInput): ActionResult<{ count: number }>
  - requireRole('ADMIN')
  - Input: sourceSessionId, targetSessionId, amountAdjustmentPercent (optional, e.g., +10% increase)
  - $transaction:
    - Fetch all structures from source session
    - Clone each to target session (with optional % adjustment)
    - Skip if already exists in target
  - Audit log: "FEE_STRUCTURES_CLONED"
  - Return count of cloned structures

deleteFeeStructureAction(id: string): ActionResult<void>
  - requireRole('ADMIN')
  - Check: no FeeAssignments reference this structure
  - If assignments exist → actionError("Cannot delete — fee assignments depend on this structure")
  - Delete FeeStructure
  - Audit log: "FEE_STRUCTURE_DELETED"
```

### Fee Assignment Actions (`fee-assignment-actions.ts`)

```typescript
generateFeeAssignmentsAction(input: GenerateFeeAssignmentsInput): ActionResult<{ count: number }>
  - requireRole('ADMIN')
  - Input: classId, sectionId?, academicSessionId, periodLabel, periodStartDate, periodEndDate
  - $transaction:
    - Fetch all active FeeStructures for class + session
    - Fetch all active students in class (+ section if provided)
    - For each student, for each structure:
      - Check if assignment already exists (skip if duplicate)
      - Create FeeAssignment with status PENDING
      - Create FeeLineItems per category
      - Auto-apply scholarship discount if student has active scholarship
      - Create FeeTransaction (type: CARRY_FORWARD if applicable)
    - Return count of assignments created
  - Audit log: "FEE_ASSIGNMENTS_GENERATED"
  - Create notifications for students + families: "Fee for {period} has been generated"

applyFeeDiscountAction(input: ApplyFeeDiscountInput): ActionResult<void>
  - requireRole('ADMIN')
  - Input: feeAssignmentId, discountType, percentage?, fixedAmount?, reason
  - $transaction:
    - Calculate discount amount
    - Create FeeDiscount record
    - Recalculate FeeAssignment: discountAmount, netAmount, balanceAmount
    - Create FeeTransaction (type: WAIVER, amount: -discountAmount)
    - If netAmount <= paidAmount → update status to PAID
  - Audit log: "FEE_DISCOUNT_APPLIED"
  - Notification to student + family

applyLateFeeAction(input: ApplyLateFeeInput): ActionResult<void>
  - requireRole('ADMIN')
  - Input: feeAssignmentId, amount, reason?
  - $transaction:
    - Add penalty to FeeAssignment.penaltyAmount
    - Recalculate netAmount, balanceAmount
    - Create FeeTransaction (type: PENALTY, amount: +penaltyAmount)
    - Update status if needed
  - Audit log: "LATE_FEE_APPLIED"
  - Notification to student + family

bulkApplyLateFeeAction(input: BulkLateFeeInput): ActionResult<{ count: number }>
  - requireRole('ADMIN')
  - Input: academicSessionId, periodLabel, overdueDate (calculate from due + grace)
  - Finds all overdue assignments past grace period WITHOUT existing penalty for that period
  - Applies late fee per structure's lateFeePercentage or global default
  - Returns count of penalties applied
```

### Fee Payment Actions (`fee-payment-actions.ts`)

```typescript
recordFeePaymentAction(input: RecordFeePaymentInput): ActionResult<{ receiptNumber: string }>
  - requireRole('ADMIN')
  - Input: feeAssignmentIds[], amount, paymentMethod, referenceNumber?, bankName?, remarks?
  - CRITICAL BUSINESS LOGIC — entire operation in $transaction:
    - Fetch FeeSettings for receipt sequence
    - Lock receipt sequence with SELECT ... FOR UPDATE (or atomic increment)
    - Generate receiptNumber: "{prefix}-{year}-{paddedSequence}"
    - Increment FeeSettings.receiptNextSequence
    - Validate: amount <= sum of selected assignments' balanceAmount
    - Distribute payment across selected assignments (oldest first):
      For each assignment (ordered by dueDate ASC):
        - paymentForThis = min(remainingAmount, assignment.balanceAmount)
        - Create FeePayment record
        - Create FeeTransaction (type: PAYMENT, amount: -paymentForThis)
        - Update assignment: paidAmount += paymentForThis, balanceAmount -= paymentForThis
        - Update assignment status: PARTIAL or PAID
        - remainingAmount -= paymentForThis
    - Create AuditLog with full payment details
    - Create Notification: "Payment of Rs. {amount} received"
    - Return receiptNumber
  
  - ERROR CASES:
    - Amount = 0 or negative → reject
    - Amount > total balance → reject (no overpayment allowed)
    - Assignment already PAID → skip
    - Assignment WAIVED → skip

reverseFeePaymentAction(input: ReverseFeePaymentInput): ActionResult<void>
  - requireRole('ADMIN')
  - Input: paymentId, reason
  - $transaction:
    - Fetch original FeePayment
    - Verify not already reversed
    - Mark payment as reversed (isReversed, reversedAt, reversedBy, reason)
    - Create FeeTransaction (type: REVERSAL, amount: +originalAmount)
    - Update FeeAssignment: paidAmount -= amount, balanceAmount += amount
    - Recalculate status
    - Create AuditLog with reversal reason
    - Create Notification: "Payment reversal"
  - NOTE: Does NOT delete the original payment — preserves audit trail
```

### Fee Report Actions (`fee-reports-fetch-actions.ts`)

```typescript
fetchFeeCollectionSummaryAction(input: FeeCollectionSummaryInput): Promise<FeeCollectionSummary>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: academicSessionId, periodLabel?, classId?, dateRange?
  - Returns: { totalAssigned, totalCollected, totalOutstanding, totalOverdue, totalWaived, collectionRate }

fetchFeeDefaultersAction(input: FeeDefaultersInput): Promise<FeeDefaulter[]>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: academicSessionId, overdueForDays, classId?, sectionId?
  - Returns: students with overdue balance > 0, sorted by overdue amount DESC

fetchClassWiseFeeReportAction(input: ClassFeeReportInput): Promise<ClassFeeReport[]>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: academicSessionId, periodLabel?
  - Returns: per-class aggregation { className, totalStudents, totalAssigned, totalCollected, collectionRate }

fetchMonthlyCollectionTrendAction(input: MonthlyTrendInput): Promise<MonthlyTrend[]>
  - requireRole('ADMIN', 'PRINCIPAL')
  - Input: academicSessionId
  - Returns: monthly collection amounts for chart { month, assigned, collected, outstanding }

fetchStudentFeeOverviewAction(input: StudentFeeOverviewInput): Promise<StudentFeeOverview>
  - requireRole('ADMIN', 'STUDENT', 'FAMILY')
  - Input: studentProfileId (admin provides any; student provides own; family provides linked child)
  - Authorization: student can only see own; family can only see linked children
  - Returns: { totalPayable, totalPaid, totalBalance, assignments[], recentPayments[] }
```

---

## 8. Query Layer Design {#8-query-layer-design}

### Fee Category Queries (`fee-category-queries.ts`)

```typescript
findAllFeeCategories(options?: { isActive?: boolean }): Promise<FeeCategory[]>
findFeeCategoryById(id: string): Promise<FeeCategory | null>
findFeeCategoryByCode(code: string): Promise<FeeCategory | null>
```

### Fee Structure Queries (`fee-structure-queries.ts`)

```typescript
findFeeStructures(filters: {
  academicSessionId: string;
  classId?: string;
  feeCategoryId?: string;
  isActive?: boolean;
}): Promise<FeeStructureWithCategory[]>

findFeeStructureById(id: string): Promise<FeeStructureWithCategory | null>

findFeeStructuresByClassAndSession(
  classId: string, 
  academicSessionId: string
): Promise<FeeStructureWithCategory[]>
```

### Fee Assignment Queries (`fee-assignment-queries.ts`)

```typescript
findFeeAssignments(filters: {
  academicSessionId: string;
  studentProfileId?: string;
  classId?: string;
  sectionId?: string;
  status?: PaymentStatus;
  periodLabel?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}, pagination: { page: number; pageSize: number }): Promise<PaginatedResult<FeeAssignmentWithDetails>>

findStudentFeeAssignments(
  studentProfileId: string, 
  academicSessionId: string
): Promise<FeeAssignmentWithDetails[]>

findOverdueFeeAssignments(
  academicSessionId: string, 
  asOfDate: Date
): Promise<FeeAssignmentWithStudent[]>

calculateStudentFeeSummary(
  studentProfileId: string, 
  academicSessionId: string
): Promise<{ totalPayable: Decimal; totalPaid: Decimal; totalBalance: Decimal; totalDiscount: Decimal }>
```

### Fee Payment Queries (`fee-payment-queries.ts`)

```typescript
findPaymentsByAssignment(feeAssignmentId: string): Promise<FeePayment[]>

findPaymentsByStudent(
  studentProfileId: string, 
  academicSessionId: string
): Promise<FeePaymentWithAssignment[]>

findPaymentByReceipt(receiptNumber: string): Promise<FeePaymentWithFullDetails | null>

findRecentPayments(filters: {
  academicSessionId: string;
  dateFrom?: Date;
  dateTo?: Date;
  paymentMethod?: PaymentMethod;
  receivedById?: string;
}, pagination: { page: number; pageSize: number }): Promise<PaginatedResult<FeePaymentWithStudentDetails>>
```

### Fee Report Queries (`fee-reports-queries.ts`)

```typescript
aggregateFeeCollection(
  academicSessionId: string, 
  filters?: { classId?: string; periodLabel?: string }
): Promise<FeeCollectionAggregation>

aggregateClassWiseCollection(
  academicSessionId: string
): Promise<ClassWiseAggregation[]>

aggregateMonthlyCollection(
  academicSessionId: string
): Promise<MonthlyAggregation[]>

findFeeDefaulters(
  academicSessionId: string, 
  overdueForDays: number, 
  filters?: { classId?: string; sectionId?: string }
): Promise<FeeDefaulterRecord[]>

calculateScholarshipImpact(
  academicSessionId: string
): Promise<{ totalDiscounts: Decimal; studentCount: number; byTier: ScholarshipTierImpact[] }>
```

---

## 9. Validation Schemas {#9-validation-schemas}

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

---

## 10. React Hooks Design {#10-react-hooks-design}

### Query Key Configuration (add to `src/lib/query-keys.ts`)

```typescript
fees: {
  all: ['fees'] as const,
  categories: {
    all: ['fees', 'categories'] as const,
    list: (filters?: { isActive?: boolean }) => ['fees', 'categories', 'list', filters] as const,
    detail: (id: string) => ['fees', 'categories', 'detail', id] as const,
  },
  structures: {
    all: ['fees', 'structures'] as const,
    list: (filters: { sessionId: string; classId?: string }) => ['fees', 'structures', 'list', filters] as const,
    detail: (id: string) => ['fees', 'structures', 'detail', id] as const,
  },
  assignments: {
    all: ['fees', 'assignments'] as const,
    list: (filters: Record<string, unknown>) => ['fees', 'assignments', 'list', filters] as const,
    student: (studentId: string, sessionId: string) => ['fees', 'assignments', 'student', studentId, sessionId] as const,
    detail: (id: string) => ['fees', 'assignments', 'detail', id] as const,
  },
  payments: {
    all: ['fees', 'payments'] as const,
    list: (filters: Record<string, unknown>) => ['fees', 'payments', 'list', filters] as const,
    student: (studentId: string, sessionId: string) => ['fees', 'payments', 'student', studentId, sessionId] as const,
    receipt: (receiptNumber: string) => ['fees', 'payments', 'receipt', receiptNumber] as const,
  },
  reports: {
    all: ['fees', 'reports'] as const,
    summary: (filters: Record<string, unknown>) => ['fees', 'reports', 'summary', filters] as const,
    defaulters: (filters: Record<string, unknown>) => ['fees', 'reports', 'defaulters', filters] as const,
    classWise: (sessionId: string) => ['fees', 'reports', 'classWise', sessionId] as const,
    monthlyTrend: (sessionId: string) => ['fees', 'reports', 'monthlyTrend', sessionId] as const,
    scholarshipImpact: (sessionId: string) => ['fees', 'reports', 'scholarshipImpact', sessionId] as const,
  },
  settings: ['fees', 'settings'] as const,
},
```

### Hook Files

#### `hooks/use-fee-categories.ts`

```typescript
useFeeCategories(options?: { isActive?: boolean }): UseQueryResult<FeeCategory[]>
  - queryKey: queryKeys.fees.categories.list(options)
  - queryFn: fetchFeeCategoriesAction(options)
  - staleTime: 10 minutes (rarely changes)
```

#### `hooks/use-fee-structures.ts`

```typescript
useFeeStructures(sessionId: string, classId?: string): UseQueryResult<FeeStructureWithCategory[]>
  - queryKey: queryKeys.fees.structures.list({ sessionId, classId })
  - queryFn: fetchFeeStructuresAction({ academicSessionId, classId })
  - enabled: !!sessionId

useFeeStructureDetail(id: string): UseQueryResult<FeeStructureWithCategory>
  - queryKey: queryKeys.fees.structures.detail(id)
  - queryFn: fetchFeeStructureByIdAction(id)
  - enabled: !!id
```

#### `hooks/use-fee-assignments.ts`

```typescript
useFeeAssignments(filters: FeeAssignmentFilters): UseQueryResult<PaginatedResult<FeeAssignmentWithDetails>>
  - queryKey: queryKeys.fees.assignments.list(filters)
  - queryFn: fetchFeeAssignmentsAction(filters)
  - enabled: !!filters.academicSessionId

useStudentFeeOverview(studentProfileId: string, sessionId: string): UseQueryResult<StudentFeeOverview>
  - queryKey: queryKeys.fees.assignments.student(studentProfileId, sessionId)
  - queryFn: fetchStudentFeeOverviewAction({ studentProfileId })
  - enabled: !!studentProfileId && !!sessionId
```

#### `hooks/use-fee-payments.ts`

```typescript
useStudentPayments(studentProfileId: string, sessionId: string): UseQueryResult<FeePaymentWithAssignment[]>
  - queryKey: queryKeys.fees.payments.student(studentProfileId, sessionId)
  - queryFn: fetchStudentPaymentsAction({ studentProfileId, academicSessionId: sessionId })
  - enabled: !!studentProfileId && !!sessionId

useReceiptData(receiptNumber: string): UseQueryResult<ReceiptData>
  - queryKey: queryKeys.fees.payments.receipt(receiptNumber)
  - queryFn: fetchReceiptDataAction(receiptNumber)
  - enabled: !!receiptNumber
```

#### `hooks/use-fee-reports.ts`

```typescript
useFeeCollectionSummary(filters: CollectionSummaryFilters): UseQueryResult<FeeCollectionSummary>
  - queryKey: queryKeys.fees.reports.summary(filters)
  - queryFn: fetchFeeCollectionSummaryAction(filters)
  - refetchInterval: 5 minutes (for live dashboard feel)

useFeeDefaulters(filters: DefaulterFilters): UseQueryResult<FeeDefaulter[]>
  - queryKey: queryKeys.fees.reports.defaulters(filters)
  - queryFn: fetchFeeDefaultersAction(filters)

useClassWiseFeeReport(sessionId: string): UseQueryResult<ClassFeeReport[]>
  - queryKey: queryKeys.fees.reports.classWise(sessionId)
  - queryFn: fetchClassWiseFeeReportAction({ academicSessionId: sessionId })
  - enabled: !!sessionId

useMonthlyCollectionTrend(sessionId: string): UseQueryResult<MonthlyTrend[]>
  - queryKey: queryKeys.fees.reports.monthlyTrend(sessionId)
  - queryFn: fetchMonthlyCollectionTrendAction({ academicSessionId: sessionId })
  - enabled: !!sessionId
```

#### `hooks/use-fee-mutations.ts`

```typescript
useCreateFeeCategory(): mutation wrapper → createFeeCategoryAction
  - invalidates: queryKeys.fees.categories.all

useCreateFeeStructure(): mutation wrapper → createFeeStructureAction
  - invalidates: queryKeys.fees.structures.all

useGenerateFeeAssignments(): mutation wrapper → generateFeeAssignmentsAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.reports.all

useRecordFeePayment(): mutation wrapper → recordFeePaymentAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.payments.all, queryKeys.fees.reports.all
  - onSuccess: opens receipt print dialog

useApplyFeeDiscount(): mutation wrapper → applyFeeDiscountAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.reports.all

useReverseFeePayment(): mutation wrapper → reverseFeePaymentAction
  - invalidates: queryKeys.fees.assignments.all, queryKeys.fees.payments.all, queryKeys.fees.reports.all
```

---

## 11. Admin UI — Fee Structure & Configuration {#11-admin-ui-fee-structure}

### Route Structure

```
src/app/(dashboard)/admin/fees/
├── page.tsx                         # Fee management hub / overview
├── loading.tsx                      # Skeleton loader
├── categories/
│   └── page.tsx                     # Fee category management
├── structures/
│   └── page.tsx                     # Fee structure configuration
├── generate/
│   └── page.tsx                     # Bulk fee generation wizard
├── collect/
│   └── page.tsx                     # Fee collection interface
├── reports/
│   └── page.tsx                     # Reports & analytics dashboard
└── settings/
    └── page.tsx                     # Fee settings configuration
```

### Fee Management Hub (`/admin/fees`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Fee Management"                                        │
│  Subtitle: "Manage fee structures, collect payments, view reports"   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │ Total      │ │ Collected  │ │ Outstanding│ │ Overdue    │       │
│  │ Assigned   │ │ This Month │ │ Balance    │ │ (>7 days)  │       │
│  │ Rs. 2.5M   │ │ Rs. 1.8M   │ │ Rs. 700K   │ │ Rs. 120K   │       │
│  │ ↑ 12% vs  │ │ 72% rate   │ │ 28% unpaid │ │ 24 students│       │
│  │ last month │ │            │ │            │ │            │       │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │
│                                                                      │
│  ┌── Quick Actions ─────────────────────────────────────────────┐   │
│  │  [📋 Categories] [📊 Structures] [⚡ Generate] [💰 Collect]   │   │
│  │  [📈 Reports] [⚙️ Settings]                                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Recent Payments ───────────────────────────────────────────┐   │
│  │  Receipt    │ Student      │ Amount    │ Method │ Date       │   │
│  │  RCP-0142   │ Ali Ahmed    │ Rs. 5,200 │ Cash   │ Today      │   │
│  │  RCP-0141   │ Sara Khan    │ Rs. 8,000 │ Bank   │ Yesterday  │   │
│  │  RCP-0140   │ Hassan Ali   │ Rs. 3,500 │ Cash   │ Yesterday  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Fee Defaulters (Top 10) ───────────────────────────────────┐   │
│  │  Student      │ Class  │ Overdue    │ Days  │ Contact         │   │
│  │  Ahmad Raza   │ 10-A   │ Rs. 15,000 │ 32    │ 0300-1234567   │   │
│  │  ...          │ ...    │ ...        │ ...   │ ...             │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Fee Categories Page (`/admin/fees/categories`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Fee Categories"    [+ Add Category]                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Code  │ Name             │ Type       │ Refundable │ Status   │ │
│  │ TUI   │ Tuition Fee      │ TUITION    │ No         │ Active   │ │
│  │ ADM   │ Admission Fee    │ ADMISSION  │ No         │ Active   │ │
│  │ LAB   │ Lab Fee          │ LAB_FEE    │ No         │ Active   │ │
│  │ SPT   │ Sports Fee       │ SPORTS_FEE │ No         │ Active   │ │
│  │ SEC   │ Security Deposit │ SECURITY   │ Yes        │ Active   │ │
│  │ ...   │ ...              │ ...        │ ...        │ ...      │ │
│  │                              [Edit]  [Toggle Active]           │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Fee Structures Page (`/admin/fees/structures`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Fee Structures"    [+ Add Structure] [Clone Session]   │
│  Filters: [Session: 2025-2026 ▼]  [Class: All ▼]                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌── Class 5 ───────────────────────────────────────────────────┐   │
│  │ Category        │ Amount     │ Frequency │ Due Day │ Actions  │   │
│  │ Tuition Fee     │ Rs. 5,000  │ Monthly   │ 10th    │ ✏️ 🗑️    │   │
│  │ Lab Fee         │ Rs. 1,500  │ Quarterly │ 15th    │ ✏️ 🗑️    │   │
│  │ Sports Fee      │ Rs. 800    │ Annual    │ Apr 1   │ ✏️ 🗑️    │   │
│  │ ─────────────── │ ────────── │ ───────── │ ─────── │          │   │
│  │ Monthly Total   │ Rs. 5,000  │           │         │          │   │
│  │ Annual Total    │ Rs. 62,300 │           │         │          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Class 6 ───────────────────────────────────────────────────┐   │
│  │ ...                                                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Fee Generation Page (`/admin/fees/generate`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Generate Fee Assignments"                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Step 1: Select Target                                               │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  Academic Session: [2025-2026 ▼]                          │       │
│  │  Class: [Class 5 ▼]     Section: [All Sections ▼]        │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                      │
│  Step 2: Define Period                                               │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  Period Label: [January 2026    ]                         │       │
│  │  Start Date: [01/01/2026]    End Date: [31/01/2026]       │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                      │
│  Step 3: Preview                                                     │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  Fee Structures Found: 3                                   │       │
│  │  Students Found: 42                                        │       │
│  │  ─────────────────────────────────────────────────────    │       │
│  │  Tuition Fee    × 42 students = Rs. 210,000               │       │
│  │  Lab Fee        × 42 students = Rs. 63,000                │       │
│  │  Sports Fee     × 0 students  = (not this period)         │       │
│  │  ─────────────────────────────────────────────────────    │       │
│  │  Total Assignments: 84 | Total Amount: Rs. 273,000        │       │
│  │  Scholarship Discounts: Rs. 21,000 (3 students)           │       │
│  │  Net Payable: Rs. 252,000                                 │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                      │
│  [Cancel]                                      [Generate Assignments]│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 12. Admin UI — Fee Collection & Tracking {#12-admin-ui-fee-collection}

### Fee Collection Page (`/admin/fees/collect`)

This is the PRIMARY admin workflow — collecting fee from a student who walks in.

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Collect Fee"                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌── Search Student ────────────────────────────────────────────┐   │
│  │  🔍 [Search by name, roll number, or registration number...  ] │   │
│  │                                                                │   │
│  │  Results:                                                      │   │
│  │  ┌─ Ali Ahmed (Reg: STU-2025-0042) — Class 5-A ─────────┐   │   │
│  │  │  Clicking shows fee details below                      │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Student Fee Summary ───────────────────────────────────────┐   │
│  │  Name: Ali Ahmed  │  Class: 5-A  │  Roll: 12               │   │
│  │  Total Payable: Rs. 32,000  │  Paid: Rs. 20,000            │   │
│  │  Balance: Rs. 12,000  │  Overdue: Rs. 5,000                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Pending Fees ──────────────────────────────────────────────┐   │
│  │  ☑ │ Period        │ Category     │ Net       │ Paid    │ Due   │   │
│  │  ☑ │ Dec 2025      │ Tuition      │ Rs. 5,000 │ Rs. 0   │ OVERDUE│  │
│  │  ☑ │ Jan 2026      │ Tuition      │ Rs. 5,000 │ Rs. 0   │ Due 10th│ │
│  │  ☐ │ Jan 2026      │ Lab Fee      │ Rs. 1,500 │ Rs. 0   │ Due 15th│ │
│  │  ☐ │ Feb 2026      │ Tuition      │ Rs. 5,000 │ Rs. 0   │ Future │  │
│  │  ────────────────────────────────────────────────────────   │   │
│  │  Selected Total: Rs. 10,000                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Record Payment ────────────────────────────────────────────┐   │
│  │  Amount: [Rs. 10,000     ]  (auto-filled from selection)     │   │
│  │  Method: [Cash ▼]     Date: [05/03/2026    ]                 │   │
│  │  Reference: [________________]  Bank: [________________]     │   │
│  │  Remarks: [_____________________________________________]    │   │
│  │                                                                │   │
│  │  [Cancel]                              [Record Payment & Print]│   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 13. Admin UI — Reports & Analytics {#13-admin-ui-reports}

### Reports Dashboard (`/admin/fees/reports`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Fee Reports & Analytics"                               │
│  Filters: [Session: 2025-2026 ▼]                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌── Collection Overview ───────────────────────────────────────┐   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │ Assigned │  │Collected │  │ Pending  │  │ Overdue  │   │   │
│  │  │ 25.0M    │  │ 18.5M    │  │ 4.5M     │  │ 2.0M     │   │   │
│  │  │          │  │ 74.0%    │  │ 18.0%    │  │ 8.0%     │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Monthly Collection Trend (Line Chart) ─────────────────────┐   │
│  │                                                                │   │
│  │  Rs.|                              ╱╲                         │   │
│  │     |           ╱─╲    ╱╲    ╱──╱  ╲╱                       │   │
│  │     |    ╱──╲  ╱   ╲──╱  ╲──╱                               │   │
│  │     |   ╱    ╲╱                                              │   │
│  │     |──╱                                                      │   │
│  │     └────────────────────────────────────────────             │   │
│  │       Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec  Jan  Feb   │   │
│  │                                                                │   │
│  │     ── Assigned  ── Collected                                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Class-Wise Collection (Bar Chart) ─────────────────────────┐   │
│  │  Class 1  ████████████████████████░░░░░░  82%                 │   │
│  │  Class 2  ███████████████████████░░░░░░░  76%                 │   │
│  │  Class 5  ██████████████████░░░░░░░░░░░░  62%                 │   │
│  │  Class 10 ████████████████████████████░░░  91%                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Defaulters List ───────────────────────────────────────────┐   │
│  │  [Export CSV]                                                  │   │
│  │  Student      │ Class │ Balance    │ Overdue Days │ Guardian  │   │
│  │  Ahmad Raza   │ 10-A  │ Rs. 15,000 │ 32           │ 0300-xxx  │   │
│  │  Fatima Ali   │ 8-B   │ Rs. 8,500  │ 25           │ 0301-xxx  │   │
│  │  ...                                                           │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Scholarship Impact ────────────────────────────────────────┐   │
│  │  Total Discounts Given: Rs. 850,000                           │   │
│  │  Students on Scholarship: 35                                  │   │
│  │  Full (100%): 5 students — Rs. 300,000                        │   │
│  │  75%: 8 students — Rs. 280,000                                │   │
│  │  50%: 12 students — Rs. 180,000                               │   │
│  │  25%: 10 students — Rs. 90,000                                │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 14. Student UI — Fee Dashboard {#14-student-ui}

### Route: `/student/fees`

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "My Fees"                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌── Fee Summary Card ──────────────────────────────────────────┐   │
│  │  Total Payable    │  Total Paid     │  Balance              │   │
│  │  Rs. 62,300       │  Rs. 45,000     │  Rs. 17,300           │   │
│  │                   │                 │                        │   │
│  │  Progress: ████████████████░░░░░░░░  72% paid               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Upcoming Dues ─────────────────────────────────────────────┐   │
│  │  ⚠️ Tuition Fee - February 2026           Rs. 5,000 — Due: 10th│   │
│  │  ⏳ Lab Fee - Q3 (Jan-Mar 2026)            Rs. 1,500 — Due: 15th│   │
│  │  📅 Tuition Fee - March 2026              Rs. 5,000 — Due: 10th│   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Payment History ───────────────────────────────────────────┐   │
│  │  Receipt    │ Date       │ Amount    │ Method │ Details       │   │
│  │  RCP-0098   │ 02/10/2026 │ Rs. 5,200 │ Cash   │ [View Receipt]│  │
│  │  RCP-0067   │ 01/10/2026 │ Rs. 5,000 │ Bank   │ [View Receipt]│  │
│  │  RCP-0031   │ 12/10/2025 │ Rs. 6,500 │ Cash   │ [View Receipt]│  │
│  │  ...                                                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Fee Breakdown (Current Session) ───────────────────────────┐   │
│  │  Category         │ Annual Total │ Paid     │ Remaining       │   │
│  │  Tuition Fee      │ Rs. 60,000   │ Rs. 40,000│ Rs. 20,000    │   │
│  │  Lab Fee          │ Rs. 6,000    │ Rs. 4,500 │ Rs. 1,500     │   │
│  │  Sports Fee       │ Rs. 800      │ Rs. 800   │ Rs. 0 ✅      │   │
│  │  ─────────────────│──────────────│──────────│───────────────   │   │
│  │  Total            │ Rs. 66,800   │ Rs. 45,300│ Rs. 21,500    │   │
│  │  Scholarship (50%)│              │           │ -Rs. 4,200     │   │
│  │  Net Total        │ Rs. 62,600   │ Rs. 45,300│ Rs. 17,300    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 15. Family UI — Fee Dashboard {#15-family-ui}

### Route: `/family/fees`

The family dashboard aggregates fees across ALL linked children with a child selector.

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Fees"     [Child: All Children ▼ / Ali / Sara / Ahmed]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ── When "All Children" selected ──                                  │
│                                                                      │
│  ┌── Total Family Fee Overview ─────────────────────────────────┐   │
│  │  Total Payable (All Children)    │ Rs. 186,900                │   │
│  │  Total Paid                      │ Rs. 135,300                │   │
│  │  Total Outstanding               │ Rs. 51,600                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Per-Child Summary ─────────────────────────────────────────┐   │
│  │                                                                │   │
│  │  ┌── Ali Ahmed (Class 5-A) ──────────────────────────────┐   │   │
│  │  │  Payable: Rs. 62,300 │ Paid: Rs. 45,300 │ Due: Rs. 17K│   │   │
│  │  │  Status: ████████████████░░░░░░░░  72%     [View →]    │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │                                                                │   │
│  │  ┌── Sara Ahmed (Class 8-B) ─────────────────────────────┐   │   │
│  │  │  Payable: Rs. 73,600 │ Paid: Rs. 55,000 │ Due: Rs. 18.6K│  │   │
│  │  │  Status: █████████████████░░░░░░░  75%     [View →]    │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │                                                                │   │
│  │  ┌── Ahmed Jr (Class 2-A) ───────────────────────────────┐   │   │
│  │  │  Payable: Rs. 51,000 │ Paid: Rs. 35,000 │ Due: Rs. 16K│   │   │
│  │  │  Status: █████████████████░░░░░░░  69%     [View →]    │   │   │
│  │  │  🏆 50% Scholarship Applied                            │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── When specific child selected ──                                  │
│  (Same layout as Student Fee Dashboard — Section 14)                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 16. Principal UI — Monitoring Dashboard {#16-principal-ui}

### Route: `/principal/fees`

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Fee Collection Dashboard"                              │
│  Subtitle: "School-wide fee collection monitoring"                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  (Same analytics layout as Admin Reports — Section 13)               │
│  Principal gets READ-ONLY version of admin reports.                  │
│  No collection actions, no settings, no structure editing.           │
│                                                                      │
│  Key Widgets:                                                        │
│  1. Collection Overview Cards (Assigned / Collected / Outstanding)   │
│  2. Monthly Collection Trend Chart                                   │
│  3. Class-Wise Collection Comparison                                 │
│  4. Top 10 Defaulters List                                          │
│  5. Scholarship Impact Summary                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 17. Receipt Generation System {#17-receipt-generation}

### Receipt Format

```
┌──────────────────────────────────────────────────────────────┐
│                     [SCHOOL LOGO]                              │
│                   SCHOOL NAME HERE                             │
│              Address Line 1, City, Pakistan                    │
│           Phone: 000-0000000 | Email: school@email.com         │
│                                                                │
│  ═══════════════════ FEE RECEIPT ═══════════════════════════ │
│                                                                │
│  Receipt No: RCP-2026-0142           Date: 05 March 2026      │
│                                                                │
│  Student: Ali Ahmed                   Class: 5-A               │
│  Roll No: 12                          Reg: STU-2025-0042       │
│  Guardian: Mr. Ahmed Ali              Session: 2025-2026       │
│                                                                │
│  ─────────────────────────────────────────────────────────── │
│  # │ Description                        │ Period    │ Amount  │
│  ─────────────────────────────────────────────────────────── │
│  1 │ Tuition Fee                        │ Dec 2025  │ 5,000   │
│  2 │ Tuition Fee                        │ Jan 2026  │ 5,000   │
│  ─────────────────────────────────────────────────────────── │
│                                         Subtotal: Rs. 10,000  │
│                                         Discount:  Rs. 0      │
│                                         Late Fee:  Rs. 0      │
│                                         ────────────────────  │
│                                         TOTAL:    Rs. 10,000   │
│                                                                │
│  Payment Method: Cash                                          │
│  Reference: —                                                  │
│  Received By: Admin User                                       │
│                                                                │
│  "Thank you for your payment"                                  │
│                                                                │
│  Signature: ________________                                   │
│                                                                │
│  ─────────────────────────────────────────────────────────── │
│  This is a computer-generated receipt.                         │
│  School Copy / Parent Copy                                     │
└──────────────────────────────────────────────────────────────┘
```

### Receipt Implementation

```
fee-receipt-service.ts:
  generateReceiptNumber(tx: PrismaTransaction): Promise<string>
    - Atomically reads and increments FeeSettings.receiptNextSequence
    - Format: "{prefix}-{year}-{paddedSequence}" (e.g., "RCP-2026-0142")
    - Uses Prisma raw query with FOR UPDATE to prevent concurrent duplicate sequences

  assembleReceiptData(paymentId: string): Promise<ReceiptData>
    - Fetches: SchoolSettings + FeePayment + FeeAssignment + StudentProfile + FeeLineItems
    - Returns complete ReceiptData object ready for rendering

fee-receipt-view.tsx:
  - Pure React component — renders receipt as HTML
  - Uses @media print CSS for clean printing
  - Browser's native window.print() for printing
  - No PDF library needed for V1 — browser print-to-PDF is sufficient
  - CSS: A4 size, proper margins, border, monospaced amounts
  - Dual copy: "School Copy" + "Parent Copy" on same page (separated by dashed line)
```

---

## 18. Reusable Component Library {#18-reusable-components}

### Components Shared Across Roles

| Component | Used By | Purpose |
|-----------|---------|---------|
| `<FeeSummaryCard>` | Admin, Student, Family, Principal | Overview card: Total/Paid/Balance with progress bar |
| `<FeeStatusBadge>` | Admin, Student, Family, Principal | Color-coded badge: PENDING (yellow), PARTIAL (blue), PAID (green), OVERDUE (red), WAIVED (gray) |
| `<FeeAmountDisplay>` | Everywhere | Formatted currency: "Rs. 5,000" with proper locale formatting |
| `<FeePaymentHistory>` | Admin, Student, Family | Table of past payments with receipt links |
| `<FeeDuesList>` | Student, Family | List of upcoming/overdue fees with status |
| `<FeeBreakdownTable>` | Admin, Student, Family | Category-wise fee breakdown per period |
| `<FeeReceiptView>` | Admin, Student, Family | Printable receipt component |
| `<FeeReceiptPrintButton>` | Admin, Student, Family | Triggers print dialog |
| `<FeeFilters>` | Admin, Principal | Session, class, section, status, date range filters |
| `<PaymentMethodSelector>` | Admin (collection form) | Cash/Bank/Cheque/Online radio group or dropdown |

### Components Admin-Only

| Component | Purpose |
|-----------|---------|
| `<FeeCategoryList>` | CRUD list of fee categories |
| `<FeeCategoryForm>` | Create/edit dialog for fee categories |
| `<FeeStructureTable>` | Fee structure matrix (class × category) |
| `<FeeStructureForm>` | Create/edit dialog for fee structures |
| `<FeeStructureCloneDialog>` | Clone from previous session |
| `<FeeGenerationForm>` | Bulk fee assignment wizard |
| `<FeeAssignmentTable>` | Per-student assignment list with actions |
| `<FeeCollectionForm>` | Record payment form |
| `<StudentFeeSearch>` | Search student for collection (cmdk-powered) |
| `<FeeDiscountForm>` | Apply discount dialog |
| `<FeePenaltyForm>` | Apply late fee dialog |
| `<FeeDefaultersTable>` | Defaulters list with export |
| `<FeeCollectionSummary>` | Dashboard overview cards |
| `<FeeClassComparison>` | Bar chart: class-wise collection |
| `<FeeMonthlyTrendChart>` | Line chart: monthly trend |

---

## 19. RBAC & Authorization Matrix {#19-rbac-authorization}

| Resource | Action | Admin | Principal | Teacher | Student | Family |
|----------|--------|-------|-----------|---------|---------|--------|
| Fee Categories | CRUD | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Structures | CRUD | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Structures | View | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Assignments | Generate | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Assignments | View (all) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Assignments | View (own) | ❌ | ❌ | ❌ | ✅ | ❌ |
| Fee Assignments | View (child) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Fee Discounts | Apply | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Penalties | Apply | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Payments | Record | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Payments | Reverse | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Payments | View (all) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Payments | View (own) | ❌ | ❌ | ❌ | ✅ | ❌ |
| Fee Payments | View (child) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Receipts | Generate | ✅ | ❌ | ❌ | ❌ | ❌ |
| Receipts | View/Print (own) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Receipts | View/Print (any) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Reports | Full Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Reports | Class Report | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Reports | Defaulters | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fee Settings | Configure | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fee Settings | View | ✅ | ✅ | ❌ | ❌ | ❌ |

### Teacher Explicitly Excluded

Teachers have ZERO access to fee data. This is intentional:
- Teachers should not know which students have fee issues — it can bias grading.
- Fee management is an administrative function, not academic.
- Schools handle fee inquiries through admin office, not classrooms.

### Family Authorization Rules

1. Family user can ONLY see fees for students linked via `FamilyStudentLink`.
2. Every fetch action for family must verify: `FamilyStudentLink.isActive = true && FamilyStudentLink.familyProfileId = currentUser.familyProfile.id`.
3. Family CANNOT see other students' fees — not even class averages.
4. Family data access is READ-ONLY — no payment recording, no discount requests.

---

## 20. Business Rules & Edge Cases {#20-business-rules}

### Fee Generation Rules

1. **No duplicate assignments.** If admin generates fees for "Class 5 - January 2026" twice, the second run skips students who already have an assignment for that period.
2. **Only ACTIVE students.** Fee assignments are generated only for `StudentProfile.status = ACTIVE`. Withdrawn/graduated students are excluded.
3. **Academic session scoping.** All fee operations are scoped to the current (or selected) academic session.
4. **Scholarship auto-apply.** If a student has an active `ApplicantScholarship` with `isAccepted = true`, the corresponding discount is auto-applied during generation.
5. **Structure required first.** Cannot generate assignments without at least one active `FeeStructure` for the selected class + session.

### Payment Recording Rules

1. **No overpayment.** Payment amount cannot exceed the sum of selected assignments' balance. If a parent overpays in real life, admin records exact balance and returns excess manually.
2. **Oldest-first allocation.** When paying for multiple periods, payment is allocated to the oldest (earliest due date) first. This ensures overdue fees are cleared first.
3. **Partial payments allowed (if enabled).** If `FeeSettings.enablePartialPayment = true`, admin can record Rs. 3,000 against a Rs. 5,000 fee.
4. **Receipt is non-negotiable.** Every payment MUST have a receipt number. Generated atomically.
5. **Payment date can be past.** Admin may need to enter yesterday's payment if they missed it. But NOT future dates.
6. **Cash needs no reference.** Bank transfer/cheque payments require reference number. Cash does not.

### Late Fee Rules

1. **Grace period first.** Late fee kicks in only after `gracePeriodDays` have passed since `dueDate`.
2. **Monthly late fee.** For ongoing overdue, late fee compounds monthly (not daily). Calculated as: `amount × lateFeePercentage × monthsOverdue` OR `lateFeeFixedAmount × monthsOverdue`.
3. **Admin override.** Admin can manually set or remove a late fee regardless of auto-calculation.
4. **No double penalty.** If late fee is already applied for a specific month, don't apply again.
5. **Global toggle.** If `FeeSettings.enableLateFee = false`, no late fees are ever applied.

### Discount & Waiver Rules

1. **Multiple discounts per assignment.** A student can have a scholarship discount + sibling discount on the same fee. They stack.
2. **Discount cannot exceed base amount.** Total `discountAmount` ≤ `baseAmount`. Prevents negative net amounts.
3. **Scholarship discounts are auto-applied.** Manual discounts are admin-applied.
4. **Waiver = 100% discount.** If admin waives a fee entirely, `status` becomes `WAIVED`.
5. **Revoking a discount.** Admin can deactivate (soft-delete) a discount. This triggers recalculation of `netAmount` and `balanceAmount`.

### Reversal Rules

1. **Reversals create COUNTER-entries.** Original payment stays. A new `FeeTransaction` with `type: REVERSAL` and positive amount is created.
2. **Must state reason.** Reversal reason is mandatory and stored in both the payment record and audit log.
3. **Cannot reverse a reversed payment.** Double-reversal is blocked.
4. **Recalculates assignment status.** After reversal, assignment goes back to PARTIAL or PENDING.

### Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Student transfers mid-year | Remaining fee assignments stay (don't auto-delete). Admin manually waives or adjusts |
| Student admitted mid-term | Generate fees only from the month of admission — use `periodStartDate` |
| Scholarship revoked mid-year | Admin deactivates discount. Future assignments don't get scholarship. Past assignments stay |
| Fee structure amount changes after assignments generated | Existing assignments keep original amount. New assignments use new amount. Admin can manually adjust specific assignments |
| Two admins open same student's collection page | Optimistic locking on `FeeAssignment.updatedAt`. If concurrent write detected → reject with "Data changed, please refresh" |
| Parent claims "I already paid" but no record | Receipt number is proof. No receipt number = no payment record. Admin searches by reference/date to confirm |
| Decimal precision issues (Rs. 4,999.999) | All Decimal(12,2). Prisma handles precision. No floating-point arithmetic |
| Student has ZERO fees (all waived) | Valid state. Fee summary shows Rs. 0 payable, Rs. 0 balance |
| Multiple academic sessions active | UI enforces single-session context via session selector. All queries scoped |

---

## 21. Concurrency & Data Integrity {#21-concurrency-data-integrity}

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

## 22. Performance & Scalability Strategy {#22-performance-scalability}

### Query Optimization

| Query Pattern | Optimization |
|---------------|-------------|
| Student fee summary | Denormalized `balanceAmount` on FeeAssignment — no SUM aggregation needed |
| Class fee collection report | Use `GROUP BY classId` with aggregate functions, not N+1 queries |
| Fee defaulters list | Index on `[status, dueDate]` — pre-filtered by OVERDUE + sorted by amount |
| Monthly trend | Pre-aggregate with `DATE_TRUNC('month', paymentDate)` |
| Receipt lookup | Unique index on `receiptNumber` — direct lookup |
| Student search for collection | Index on `[firstName, lastName]` + `rollNumber` + `registrationNo` |

### Indexing Strategy

```
Critical indexes (already in schema design above):
- FeeAssignment: [studentProfileId, academicSessionId] — student fee lookup
- FeeAssignment: [status] — filter by payment status
- FeeAssignment: [dueDate] — upcoming/overdue queries
- FeeAssignment: [balanceAmount] — "who owes money" queries
- FeePayment: [receiptNumber] — unique, receipt lookup
- FeePayment: [paymentDate] — date range queries
- FeePayment: [feeAssignmentId] — payment history per assignment
- FeeTransaction: [feeAssignmentId] — ledger per assignment
- FeeTransaction: [createdAt] — chronological ledger
```

### Caching Strategy

| Data | Cache Duration | Invalidation |
|------|---------------|-------------|
| Fee categories | 10 minutes (staleTime) | On category CRUD |
| Fee structures | 5 minutes | On structure CRUD |
| Fee assignments list | 2 minutes | On payment/discount/penalty |
| Fee reports/summary | 5 minutes + refetchInterval 5m | On any payment |
| Receipt data | Infinite (immutable) | Never (payments are append-only) |
| Student fee overview | 1 minute | On payment/discount |

### Pagination

- Fee assignment lists: server-side pagination (DEFAULT_PAGE_SIZE = 20)
- Payment history: server-side pagination
- Defaulters list: server-side pagination with sort by overdue amount DESC
- Fee categories & structures: client-side (small datasets, < 50 items)

---

## 23. Design Patterns Applied {#23-design-patterns}

| Pattern | Where | Why |
|---------|-------|-----|
| **Event Sourcing (Simplified)** | `FeeTransaction` table | Every balance change is an event. Can reconstruct any state by replaying transactions |
| **CQRS (Light)** | Separate queries vs. actions files | Read path (queries) optimized differently from write path (actions with transactions) |
| **Repository Pattern** | `*-queries.ts` files | Pure data access, no business logic, reusable across actions |
| **Service Layer** | `fee-receipt-service.ts` | Receipt generation logic separated from action handlers |
| **Command Pattern** | Server actions | Each action is a self-contained command with validation + auth + execution |
| **Strategy Pattern** | Late fee calculation | Percentage OR fixed amount — selected at runtime based on structure config |
| **Observer Pattern** | Notifications | Payment events trigger notifications to student + family |
| **Decorator Pattern** | `safeAction()` wrapper | Cross-cutting concerns (error handling, logging) applied to all actions |
| **Null Object Pattern** | Empty states | When student has no fees → show `<EmptyState>`, not error |
| **Immutability** | `FeePayment`, `FeeTransaction` | Append-only records, no UPDATE — ensures audit integrity |

---

## 24. Migration Strategy {#24-migration-strategy}

### Phase 1: Schema Migration

```bash
# Migration name: add_fee_management_system
prisma migrate dev --name add_fee_management_system

# Changes:
# 1. Add new enums: FeeType, FeeFrequency, PaymentStatus, PaymentMethod, FeeDiscountType, FeeTransactionType
# 2. Add new models: FeeCategory, FeeStructure, FeeAssignment, FeeLineItem, FeeDiscount, FeePayment, FeeTransaction, FeeSettings
# 3. Add relations to existing models: StudentProfile, Class, AcademicSession
# 4. Add new NotificationType values: FEE_DUE_REMINDER, FEE_OVERDUE_ALERT, FEE_PAYMENT_RECEIVED, FEE_DISCOUNT_APPLIED
```

### Phase 2: Seed Data

```typescript
// prisma/seed.ts — add fee seed data
// 1. Create default FeeSettings
// 2. Create standard FeeCategories:
//    - TUI: Tuition Fee (MONTHLY)
//    - ADM: Admission Fee (ONE_TIME)
//    - LAB: Lab Fee (QUARTERLY)
//    - SPT: Sports Fee (ANNUAL)
//    - LIB: Library Fee (ANNUAL)
//    - DEV: Development Fund (ANNUAL)
//    - SEC: Security Deposit (ONE_TIME, refundable)
```

### Phase 3: Route & Module Setup

```
1. Create src/modules/fees/ directory with all files
2. Create src/validations/fee-schemas.ts
3. Add fee query keys to src/lib/query-keys.ts
4. Add fee routes to src/lib/constants.ts
5. Create app routes: /admin/fees/*, /student/fees, /family/fees, /principal/fees
6. Add fee nav items to role navigation configs
```

### Backward Compatibility

- **ZERO breaking changes to existing modules.** Fee management is entirely additive.
- Existing tables only get new relations added (optional, nullable references).
- No existing API contracts change.
- Existing seed data continues to work.

---

## 25. Scholarship-Fee Integration {#25-scholarship-fee-integration}

### How Scholarships Connect to Fees

```
Admission System                              Fee System
─────────────────                             ──────────
ApplicantScholarship                          FeeAssignment
  - tier: HALF_50                               - Generate for student
  - percentageAwarded: 50                       - Auto-detect scholarship
  - isAccepted: true                            - Apply FeeDiscount:
  - validFrom: 2026-04-01                         - type: SCHOLARSHIP
  - validUntil: 2027-03-31                         - percentage: 50%
  - isRenewable: true                              - scholarshipId: FK
  - renewalCriteria: {                             - calculatedAmount: auto
      minAttendance: 90%                    
    }                                         On next period generation:
                                                - Check scholarship validity
                                                - Check renewal criteria
                                                - Auto-apply or flag for review
```

### Integration Logic

```typescript
// During fee generation (inside generateFeeAssignmentsAction):

for (const student of students) {
  // 1. Create base FeeAssignment
  
  // 2. Check for active scholarship
  const scholarship = await findActiveScholarship(student.id, academicSessionId);
  
  if (scholarship && scholarship.isAccepted && isWithinValidityPeriod(scholarship)) {
    // 3. Check renewal criteria if applicable
    if (scholarship.isRenewable && scholarship.renewalCriteria) {
      const criteria = scholarship.renewalCriteria;
      
      if (criteria.minAttendance) {
        const attendancePercent = await getStudentAttendancePercent(student.id, academicSessionId);
        if (attendancePercent < criteria.minAttendance) {
          // Scholarship paused — flag for admin review, don't auto-apply
          createNotification(adminId, "Scholarship review needed for student X — attendance below threshold");
          continue; // Skip auto-apply
        }
      }
    }
    
    // 4. Apply scholarship discount
    const discountAmount = calculateScholarshipDiscount(
      baseAmount, 
      scholarship.percentageAwarded,
      appliesTo: ['TUITION'] // Scholarship may only apply to tuition, not all categories
    );
    
    await createFeeDiscount({
      feeAssignmentId: assignment.id,
      discountType: 'SCHOLARSHIP',
      percentage: scholarship.percentageAwarded,
      calculatedAmount: discountAmount,
      scholarshipId: scholarship.id,
      approvedById: systemUserId, // Auto-applied by system
      reason: `${scholarship.tier} scholarship — ${scholarship.percentageAwarded}%`,
    });
    
    // 5. Recalculate assignment totals
    await recalculateFeeAssignment(assignment.id);
  }
}
```

### Scholarship Scope Configuration

Not all scholarships apply to all fee types. A 50% scholarship might cover:
- ✅ Tuition Fee (50% off)
- ✅ Lab Fee (50% off)
- ❌ Transport Fee (no discount)
- ❌ Security Deposit (no discount)
- ❌ Uniform Fee (no discount)

This is configured via `ApplicantScholarship.renewalCriteria` JSON field or a new `scholarshipFeeExclusions` JSON field on `CampaignScholarshipTier`.

---

## 26. Implementation Roadmap {#26-implementation-roadmap}

### Phase 1: Database & Foundation (2-3 days)

- [ ] Add all new enums to `schema.prisma`
- [ ] Add all new models to `schema.prisma` (7 models + 1 settings)
- [ ] Add relations to existing models (StudentProfile, Class, AcademicSession)
- [ ] Add new NotificationType values
- [ ] Run migration: `add_fee_management_system`
- [ ] Add fee seed data to `seed.ts`
- [ ] Create `src/modules/fees/` directory structure
- [ ] Create `fees.types.ts` with all domain types
- [ ] Create `fees.constants.ts` with status colors, frequency labels, currency formatting
- [ ] Create `fees.utils.ts` with amount formatting, status resolution, date helpers
- [ ] Create `src/validations/fee-schemas.ts` with all Zod schemas
- [ ] Add `fees.*` query keys to `src/lib/query-keys.ts`
- [ ] Add fee routes to `src/lib/constants.ts`
- [ ] Add fee nav items to all role navigation configs

### Phase 2: Query & Action Layer (3-4 days)

- [ ] Create `fee-category-queries.ts`
- [ ] Create `fee-category-actions.ts` + `fee-category-fetch-actions.ts`
- [ ] Create `fee-structure-queries.ts`
- [ ] Create `fee-structure-actions.ts` + `fee-structure-fetch-actions.ts`
- [ ] Create `fee-assignment-queries.ts`
- [ ] Create `fee-assignment-actions.ts` + `fee-assignment-fetch-actions.ts`
- [ ] Create `fee-payment-actions.ts` + `fee-payment-fetch-actions.ts`
- [ ] Create `fee-reports-queries.ts` + `fee-reports-fetch-actions.ts`
- [ ] Create `fee-receipt-service.ts` (receipt number generation + data assembly)
- [ ] Add audit logging to ALL mutation actions
- [ ] Add notification triggers to ALL payment/discount actions

### Phase 3: React Hooks Layer (1-2 days)

- [ ] Create `hooks/use-fee-categories.ts`
- [ ] Create `hooks/use-fee-structures.ts`
- [ ] Create `hooks/use-fee-assignments.ts`
- [ ] Create `hooks/use-fee-payments.ts`
- [ ] Create `hooks/use-fee-reports.ts`
- [ ] Create `hooks/use-fee-mutations.ts`
- [ ] Create `hooks/index.ts` barrel export

### Phase 4: Admin UI — Configuration (2-3 days)

- [ ] Create `/admin/fees/page.tsx` (hub with overview cards)
- [ ] Create `/admin/fees/loading.tsx`
- [ ] Create fee category components (list, form)
- [ ] Create `/admin/fees/categories/page.tsx`
- [ ] Create fee structure components (table, form, clone dialog)
- [ ] Create `/admin/fees/structures/page.tsx`
- [ ] Create fee settings components
- [ ] Create `/admin/fees/settings/page.tsx`

### Phase 5: Admin UI — Fee Generation & Collection (2-3 days)

- [ ] Create fee generation wizard component
- [ ] Create `/admin/fees/generate/page.tsx`
- [ ] Create student search component (for collection)
- [ ] Create fee collection form component
- [ ] Create payment method selector component
- [ ] Create `/admin/fees/collect/page.tsx`
- [ ] Create fee discount form dialog
- [ ] Create fee penalty form dialog
- [ ] Create fee assignment table with actions

### Phase 6: Receipt System (1-2 days)

- [ ] Create `fee-receipt-view.tsx` (printable HTML receipt)
- [ ] Create `fee-receipt-print-button.tsx`
- [ ] Create print CSS (A4, margins, dual copy)
- [ ] Wire receipt generation into payment flow
- [ ] Add receipt view/print in payment history

### Phase 7: Admin UI — Reports & Analytics (2 days)

- [ ] Create collection overview cards component
- [ ] Create monthly trend line chart component (Recharts)
- [ ] Create class-wise bar chart component (Recharts)
- [ ] Create fee defaulters table with CSV export
- [ ] Create scholarship impact summary component
- [ ] Create `/admin/fees/reports/page.tsx`

### Phase 8: Student & Family UI (2 days)

- [ ] Create shared fee summary card component
- [ ] Create shared fee dues list component
- [ ] Create shared payment history component
- [ ] Create shared fee breakdown table component
- [ ] Create `/student/fees/page.tsx`
- [ ] Create family fee client component (with child selector integration)
- [ ] Create `/family/fees/page.tsx`
- [ ] Add fee widget to family dashboard overview

### Phase 9: Principal UI (1 day)

- [ ] Create `/principal/fees/page.tsx` (read-only reports dashboard)
- [ ] Reuse all admin report components with principal-appropriate permissions

### Phase 10: Integration & Polish (1-2 days)

- [ ] Scholarship-fee auto-discount integration
- [ ] Fee reminder notification cron/trigger
- [ ] Overdue status auto-update logic
- [ ] Add fee nav items to all role shells
- [ ] Add fee data to relevant dashboard overview pages
- [ ] Empty states for all fee views
- [ ] Loading skeletons for all fee pages
- [ ] Error boundaries for all fee routes
- [ ] Mobile responsive testing for all fee pages

---

## Summary Timeline

```
Phase 1:  Database & Foundation           ~2-3 days
Phase 2:  Query & Action Layer            ~3-4 days
Phase 3:  React Hooks Layer               ~1-2 days
Phase 4:  Admin UI — Configuration        ~2-3 days
Phase 5:  Admin UI — Collection           ~2-3 days
Phase 6:  Receipt System                  ~1-2 days
Phase 7:  Admin UI — Reports              ~2 days
Phase 8:  Student & Family UI             ~2 days
Phase 9:  Principal UI                    ~1 day
Phase 10: Integration & Polish            ~1-2 days
──────────────────────────────────────────────────
Total:    ~17-24 working days (~3.5-5 weeks)
```

---

## Definition of Done (Fee Module)

For every feature in this module:
- [ ] Functional implementation complete
- [ ] Edit/update flow exists (not just create)
- [ ] Loading state handled (loading.tsx or skeleton)
- [ ] Error state handled (error.tsx or try-catch with toast)
- [ ] Empty state handled (EmptyState component with action)
- [ ] Notification triggered where applicable
- [ ] Audit log written for EVERY financial mutation
- [ ] Mobile responsive
- [ ] No file exceeds 300 lines
- [ ] TypeScript strict — zero errors
- [ ] Toast feedback on all mutations
- [ ] Decimal precision verified (no floating-point)
- [ ] Transactional writes for all financial operations
- [ ] Receipt generated for every payment
- [ ] Family portal shows aggregated data across children
- [ ] Concurrency handling (optimistic locking or transaction isolation)
