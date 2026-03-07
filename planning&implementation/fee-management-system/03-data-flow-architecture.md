# Fee Management — Data Flow Architecture

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 5. Data Flow Architecture

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

### Fee Collection Flow (Admin) — DUAL-MODE

Admin sees a UNIFIED collection page with TWO search modes:

#### Mode 1: Search by Student (Direct Payment)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. IDENTIFY STUDENT                                           │
│    Admin → /admin/fees/collect                                │
│    Toggle: [🧑 Student] [👨‍👩‍👧‍👦 Family]  ← select Student mode    │
│    Search student by name, roll number, or registration       │
│    System shows: all pending/overdue FeeAssignments for       │
│    THIS ONE student only                                      │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. RECORD PAYMENT (inside $transaction)                       │
│    Admin selects assignment(s) to pay                         │
│    Enters: amount, method, reference, remarks                 │
│    ┌─ BEGIN TRANSACTION ────────────────────────────────────┐ │
│    │  a) Validate: amount <= sum of selected balances        │ │
│    │  b) Generate receiptNumber (atomic: "RCP-2026-XXXX")    │ │
│    │  c) Create FeePayment (familyPaymentId = null)          │ │
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
│ 3. GENERATE INDIVIDUAL RECEIPT                                │
│    Receipt "RCP-2026-0142" — single student, individual items │
│    Printable via browser print / PDF generation               │
└──────────────────────────────────────────────────────────────┘
```

#### Mode 2: Search by Family (Family Payment with Auto-Allocation)

```
┌──────────────────────────────────────────────────────────────┐
│ 1. IDENTIFY FAMILY                                            │
│    Admin → /admin/fees/collect                                │
│    Toggle: [🧑 Student] [👨‍👩‍👧‍👦 Family]  ← select Family mode     │
│    Search by guardian name, phone number, or family ID        │
│    System shows: ALL children linked to this family           │
│    + ALL pending/overdue assignments across ALL children      │
│    + Total family outstanding amount                          │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. FAMILY FEE OVERVIEW (consolidated view)                    │
│                                                                │
│  Family: Khan  | Total Outstanding: Rs. 23,000                │
│  ┌─ Ahmed (Class 5-A) ──────────────────────────────────┐   │
│  │  Jan: Rs. 5,000 (OVERDUE)  │  Feb: Rs. 5,000 (DUE)   │   │
│  └───────────────────────────────────────────────────────┘   │
│  ┌─ Sara (Class 8-B) ───────────────────────────────────┐   │
│  │  Jan: Rs. 8,000 (OVERDUE)                              │   │
│  └───────────────────────────────────────────────────────┘   │
│  ┌─ Fatima (Class 10-A) ────────────────────────────────┐   │
│  │  Feb: Rs. 10,000 (DUE)                                 │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. ENTER TOTAL AMOUNT + SELECT STRATEGY                       │
│    Amount: [Rs. 15,000______]                                 │
│    Strategy: [● Oldest First ○ Child Priority ○ Equal ○ Manual]│
│                                                                │
│    Preview allocation (auto-calculated):                       │
│    ┌────────────────────────────────────────────────────────┐ │
│    │  Ahmed:  Jan Rs. 5,000 ✅ (CLEAR)                      │ │
│    │  Sara:   Jan Rs. 8,000 → Rs. 7,000 (PARTIAL, bal 1K)  │ │
│    │  Fatima: Feb Rs. 0 (untouched)                          │ │
│    └────────────────────────────────────────────────────────┘ │
│                                                                │
│    Admin can OVERRIDE any child's allocation before confirming │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. RECORD FAMILY PAYMENT (inside $transaction)                │
│    ┌─ BEGIN TRANSACTION ────────────────────────────────────┐ │
│    │  a) Generate masterReceiptNumber ("FRCP-2026-XXXX")     │ │
│    │  b) Create FamilyPayment wrapper record                 │ │
│    │  c) FOR EACH child allocation:                          │ │
│    │     - Create FeePayment (familyPaymentId = wrapper.id)  │ │
│    │     - Create FeeTransaction (type: PAYMENT)             │ │
│    │     - Update FeeAssignment(s) per child                 │ │
│    │  d) Store allocationDetails JSON on FamilyPayment       │ │
│    │  e) Create AuditLog (one entry for entire family pay)   │ │
│    │  f) Create Notification for family                      │ │
│    │  g) Create Notification per child                       │ │
│    └─ COMMIT TRANSACTION ───────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. GENERATE FAMILY RECEIPT                                    │
│    Master receipt "FRCP-2026-0045" — shows:                   │
│    - Family name + guardian name                              │
│    - Total amount paid                                        │
│    - Per-child breakdown:                                     │
│      Ahmed (Class 5): Jan Tuition Rs. 5,000 ✅                │
│      Sara (Class 8):  Jan Tuition Rs. 7,000 (partial)        │
│    - Payment method + date + received by                      │
│    ONE receipt, ALL children, given to parent                 │
└──────────────────────────────────────────────────────────────┘
```

#### How Admin Decides: Student Mode or Family Mode?

```
Admin opens /admin/fees/collect → sees toggle:

  [🧑 Student Mode]  [👨‍👩‍👧‍👦 Family Mode]

→ Student Mode: When a SPECIFIC student's parent comes and says
  "Ahmed ki fee jama krao." Clear intent, single student.

→ Family Mode: When a parent comes and says "Bhai ye lo paisa,
  bacho ki fees hain." Unclear per-child split, multiple children,
  or parent has multiple kids in school.

Admin picks mode → search changes → form adapts:
- Student mode: search by student, single-student assignment list
- Family mode: search by guardian, multi-child consolidated view
```

### Dual-Mode Payment Flow Summary

```
MODE 1: DIRECT STUDENT PAYMENT (admin searches by student)
  1. Admin selects student → sees FeeAssignment(s)
  2. Admin records FeePayment (amount, method, reference)
  3. FeePayment.familyPaymentId = null (direct payment)
  4. System creates FeeTransaction (type: PAYMENT, amount: -X)
  5. System updates FeeAssignment (paidAmount += X, balanceAmount -= X)
  6. System updates FeeAssignment.status (PENDING → PARTIAL or PAID)
  7. System generates receipt number: "RCP-2026-XXXX"
  8. System creates AuditLog
  9. System creates Notification for student + family
  10. All in ONE Prisma $transaction()

MODE 2: FAMILY PAYMENT (admin searches by family/guardian)
  1. Admin selects family → sees ALL children + ALL pending assignments
  2. Admin enters TOTAL amount (Rs. 15,000) — does NOT need to specify per-child
  3. Admin selects allocation strategy (default: OLDEST_FIRST)
  4. System creates FamilyPayment wrapper (masterReceiptNumber: "FRCP-2026-XXXX")
  5. Allocation Engine distributes amount across children:
     For each child (ordered by strategy):
       For each assignment (ordered by dueDate ASC):
         - paymentForThis = min(remainingAmount, assignment.balanceAmount)
         - Create FeePayment (familyPaymentId = wrapper.id)
         - Create FeeTransaction (type: PAYMENT)
         - Update FeeAssignment (paidAmount, balanceAmount, status)
         - remainingAmount -= paymentForThis
  6. Store allocationDetails JSON on FamilyPayment
  7. System creates AuditLog (one entry for family payment)
  8. System creates Notification for family: "Rs. 15,000 received"
  9. System creates Notification per child: "Rs. X applied to your fee"
  10. All in ONE Prisma $transaction()

BOTH MODES RESULT IN THE SAME PER-STUDENT DATA:
  - FeePayment records (per student, per assignment)
  - FeeTransaction records (per student, per assignment)
  - FeeAssignment updated (paidAmount, balanceAmount, status)
  - Class reports, student reports, family reports — all work identically
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
    │   - Shows both individual receipts (RCP-) and family receipts (FRCP-)
    │   - Family receipt link shows master receipt with all children
    │
    └── Fee Breakdown (per category per period)
```
