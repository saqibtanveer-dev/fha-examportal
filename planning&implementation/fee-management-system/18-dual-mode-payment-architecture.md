# Fee Management — Dual-Mode Payment Architecture

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 27. Dual-Mode Payment Architecture

### Why Dual-Mode?

Pakistani schools (and most South Asian schools) face a unique reality: parents walk into the school office with cash. They don't always specify which child's fee they're paying, or they might pay a lump sum for all their children. The school admin needs to handle BOTH scenarios:

1. **Student Mode**: Parent says "Ahmed ki fee jama krao" — clear, single student.
2. **Family Mode**: Parent says "Ye lo paisa, bacchon ki fees hain" — vague, multiple children.

A fee system that only supports Mode 1 forces the admin to manually split the payment and record N transactions. This is error-prone and slow. Mode 2 automates this.

### Architecture Decision: Unified Collection Page, Dual Mode

**Decision**: One collection page at `/admin/fees/collect` with a mode toggle — NOT two separate pages.

**Rationale**:
- Admin doesn't know in advance which mode they'll need until the parent speaks.
- Switching between pages adds friction.
- Shared components (payment method, date, reference) don't need duplication.
- Form state resets cleanly on mode switch.

### How the Two Modes Relate at Data Level

```
                   ┌──────────────────────┐
                   │    FeeAssignment      │  ← Per student, per period
                   │  (paidAmount, balance)│
                   └──────────┬───────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                                      │
    Student Mode                           Family Mode
           │                                      │
    ┌──────┴──────┐                     ┌────────┴─────────┐
    │ FeePayment  │                     │  FamilyPayment   │
    │ familyPay-  │                     │  (wrapper)       │
    │ mentId=null │                     │  masterReceipt#  │
    └─────────────┘                     │  totalAmount     │
                                        │  strategy        │
                                        └────────┬─────────┘
                                                 │
                                    ┌────────────┼────────────┐
                                    │            │            │
                              ┌─────┴─────┐ ┌───┴──────┐ ┌──┴───────┐
                              │FeePayment │ │FeePayment│ │FeePayment│
                              │familyPay- │ │familyPay-│ │familyPay-│
                              │mentId=SET │ │mentId=SET│ │mentId=SET│
                              │(child 1)  │ │(child 2) │ │(child 3) │
                              └───────────┘ └──────────┘ └──────────┘

Key insight: FeePayment is ALWAYS per-student/per-assignment.
The difference is:
  - Student Mode: FeePayment.familyPaymentId = null
  - Family Mode:  FeePayment.familyPaymentId = wrapper.id

FeeAssignment doesn't know or care about the origin of payment.
Its paidAmount and balanceAmount are updated identically in both modes.
This means ALL reports (class-wise, defaulters, collection summary) work
the same regardless of how the payment was made.
```

### Mode Detection Heuristic (Optional Auto-Switch)

In a future iteration, the system could auto-suggest family mode:

```
Admin searches for "Ahmed" in Student Mode:
  → System finds Ahmed (Class 5-A)
  → System detects: Ahmed has 2 siblings (Sara 8-B, Fatima 10-A)
  → System shows info banner: 
     "This student is part of Khan Family (3 children total). 
      Switch to Family Mode for consolidated payment?"
     [Switch to Family Mode]  [Continue in Student Mode]

This is OPTIONAL UX sugar — not required for V1.
```

### State Management for Mode Toggle

```
Component: FeeCollectionPage

State:
  mode: 'student' | 'family'           // current mode
  selectedStudent: StudentProfile | null // student mode
  selectedFamily: FamilyProfile | null   // family mode
  studentFees: FeeAssignment[] | null    // student mode
  familyOverview: FamilyFeeOverview | null // family mode
  paymentForm: PaymentFormState          // shared
  allocationPreview: ChildAllocation[] | null // family mode only

On mode switch:
  - Reset selectedStudent, selectedFamily
  - Reset studentFees, familyOverview
  - Reset paymentForm to defaults
  - Reset allocationPreview
  - Clear search input
  - Focus search input

On search:
  - Student mode: debounced search → fetchStudents → show results
  - Family mode: debounced search → fetchFamilies → show results

On select:
  - Student mode: fetchStudentFeeOverview → populate studentFees
  - Family mode: fetchFamilyFeeOverview → populate familyOverview

On amount change (Family mode):
  - Re-run allocation engine preview (client-side, fast)
  - Update allocationPreview with new amounts

On submit:
  - Student mode: recordFeePaymentAction → receipt
  - Family mode: recordFamilyPaymentAction → family receipt
```

### When to Use Which Mode — Admin Training Guide

| Scenario | Recommended Mode | Reason |
|----------|-----------------|--------|
| Parent specifies child by name | Student | Clear intent, single student |
| Parent brings exact fee amount for one child | Student | Single assignment payment |
| Parent has only one child in school | Student | No family complexity |
| Parent has multiple children, pays lump sum | Family | System allocates automatically |
| Parent says "bacchon ki fees hain" (vague) | Family | Parent doesn't specify |
| Parent pays partial for all children | Family | System distributes evenly or by strategy |
| Admin processing bank transfer from a family | Family | Bank transfers often don't specify child |
| Admin processing scholarship adjustment | Student | Scholarship is per-student |
| Admin applying late fee | Student | Late fees are per-assignment |
| Parent wants to clear specific child's fees only | Student or Family (Manual) | If one child, use Student Mode; if specifying amounts per child, use Family Mode with MANUAL strategy |
