# Fee Management — Receipt System

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 17. Receipt Generation System

### Individual Student Receipt Format

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

### Family Master Receipt Format

```
┌──────────────────────────────────────────────────────────────┐
│                     [SCHOOL LOGO]                              │
│                   SCHOOL NAME HERE                             │
│              Address Line 1, City, Pakistan                    │
│           Phone: 000-0000000 | Email: school@email.com         │
│                                                                │
│  ═══════════════ FAMILY FEE RECEIPT ════════════════════════ │
│                                                                │
│  Receipt No: FRCP-2026-0045          Date: 05 March 2026      │
│                                                                │
│  Family: Khan Family                                           │
│  Guardian: Mr. Ahmed Khan             Phone: 0300-1234567      │
│  Session: 2025-2026                                            │
│                                                                │
│  ─────────────────────────────────────────────────────────── │
│  CHILD 1: Ali Ahmed (Class 5-A, Roll: 12)                     │
│  ───────────────────────────────────────────────────────────  │
│  # │ Description                        │ Period    │ Amount  │
│  1 │ Tuition Fee                        │ Jan 2026  │ 5,000   │
│                                            Subtotal: Rs. 5,000 │
│                                            Status: CLEARED ✅  │
│                                                                │
│  ─────────────────────────────────────────────────────────── │
│  CHILD 2: Sara Khan (Class 8-B, Roll: 8)                      │
│  ───────────────────────────────────────────────────────────  │
│  # │ Description                        │ Period    │ Amount  │
│  1 │ Tuition Fee                        │ Jan 2026  │ 8,000   │
│                                            Subtotal: Rs. 8,000 │
│                                            Status: CLEARED ✅  │
│                                                                │
│  ─────────────────────────────────────────────────────────── │
│  CHILD 3: Fatima Khan (Class 10-A, Roll: 3)                   │
│  ───────────────────────────────────────────────────────────  │
│  # │ Description                        │ Period    │ Amount  │
│  1 │ Tuition Fee (partial)              │ Feb 2026  │ 2,000   │
│                                            Subtotal: Rs. 2,000 │
│                                   Status: PARTIAL (bal: Rs. 3K)│
│                                                                │
│  ═══════════════════════════════════════════════════════════ │
│                                                                │
│                         GRAND TOTAL:    Rs. 15,000              │
│                         Children: 3                             │
│                         Strategy: Oldest First                  │
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

  generateFamilyReceiptNumber(tx: PrismaTransaction): Promise<string>
    - Same atomic mechanism, but uses familyReceiptPrefix
    - Format: "{familyPrefix}-{year}-{paddedSequence}" (e.g., "FRCP-2026-0045")

  assembleReceiptData(paymentId: string): Promise<ReceiptData>
    - Fetches: SchoolSettings + FeePayment + FeeAssignment + StudentProfile + FeeLineItems
    - Returns complete ReceiptData object ready for rendering

  assembleFamilyReceiptData(familyPaymentId: string): Promise<FamilyReceiptData>
    - Fetches: SchoolSettings + FamilyPayment + all FeePayments + per-child details
    - Returns: FamilyReceiptData with children array + per-child line items

fee-receipt-view.tsx (individual):
  - Pure React component — renders receipt as HTML
  - Uses @media print CSS for clean printing
  - Browser's native window.print() for printing
  - No PDF library needed for V1 — browser print-to-PDF is sufficient
  - CSS: A4 size, proper margins, border, monospaced amounts
  - Dual copy: "School Copy" + "Parent Copy" on same page (separated by dashed line)

family-receipt-view.tsx (family):
  - Same approach — pure HTML + @media print CSS
  - Shows one receipt with ALL children's line items grouped per child
  - Grand total at bottom
  - Single receipt given to parent — covers all children
```

---

## 18. Reusable Component Library

### Components Shared Across Roles

| Component | Used By | Purpose |
|-----------|---------|---------|
| `<FeeSummaryCard>` | Admin, Student, Family, Principal | Overview card: Total/Paid/Balance with progress bar |
| `<FeeStatusBadge>` | Admin, Student, Family, Principal | Color-coded badge: PENDING (yellow), PARTIAL (blue), PAID (green), OVERDUE (red), WAIVED (gray) |
| `<FeeAmountDisplay>` | Everywhere | Formatted currency: "Rs. 5,000" with proper locale formatting |
| `<FeePaymentHistory>` | Admin, Student, Family | Table of past payments with receipt links (shows both RCP- and FRCP- receipts) |
| `<FeeDuesList>` | Student, Family | List of upcoming/overdue fees with status |
| `<FeeBreakdownTable>` | Admin, Student, Family | Category-wise fee breakdown per period |
| `<FeeReceiptView>` | Admin, Student, Family | Printable individual receipt component |
| `<FamilyReceiptView>` | Admin, Family | Printable family master receipt component |
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
| `<FeeCollectionModeToggle>` | [Student] [Family] mode switch |
| `<StudentFeeSearch>` | Search student for collection (student mode) |
| `<FamilyFeeSearch>` | Search family/guardian for collection (family mode) |
| `<FeeCollectionForm>` | Record payment form — adapts to mode |
| `<FamilyAllocationPreview>` | Per-child allocation preview before family payment confirm |
| `<AllocationStrategySelector>` | Oldest-first / Child-priority / Equal / Manual |
| `<FeeDiscountForm>` | Apply discount dialog |
| `<FeePenaltyForm>` | Apply late fee dialog |
| `<FeeDefaultersTable>` | Defaulters list with export |
| `<FeeCollectionSummary>` | Dashboard overview cards |
| `<FeeClassComparison>` | Table + Bar chart: class-wise collection (clickable → drill-down) |
| `<FeeClassDetailTable>` | Per-class drill-down: section + category + student detail |
| `<FeeSectionComparison>` | Section-wise breakdown within class |
| `<FeeMonthlyTrendChart>` | Line chart: monthly trend |
| `<FeePaymentModeBreakdown>` | Direct vs Family payment analytics |
