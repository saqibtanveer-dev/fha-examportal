# Fee Management — Admin UI: Collection & Tracking (DUAL-MODE)

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 12. Admin UI — Fee Collection & Tracking

### Fee Collection Page (`/admin/fees/collect`) — DUAL-MODE

This is the PRIMARY admin workflow — collecting fee from whoever walks in (student's parent OR family guardian with multiple children).

The page has a **mode toggle** at the top that switches between Student Mode and Family Mode.

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Collect Fee"                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌── Mode Toggle ───────────────────────────────────────────────┐   │
│  │  [🧑 Student Mode]  [👨‍👩‍👧‍👦 Family Mode]                           │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  Student Mode: Search by student, pay for ONE student        │   │
│  │  Family Mode:  Search by guardian, pay for ALL children      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
```

### Student Mode View

When admin selects **Student Mode**, the page shows single-student collection flow:

```
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
│  │  ☑ │ Period        │ Category     │ Net       │ Paid    │ Due    │
│  │  ☑ │ Dec 2025      │ Tuition      │ Rs. 5,000 │ Rs. 0   │ OVERDUE│
│  │  ☑ │ Jan 2026      │ Tuition      │ Rs. 5,000 │ Rs. 0   │ Due 10th│
│  │  ☐ │ Jan 2026      │ Lab Fee      │ Rs. 1,500 │ Rs. 0   │ Due 15th│
│  │  ☐ │ Feb 2026      │ Tuition      │ Rs. 5,000 │ Rs. 0   │ Future │
│  │  ────────────────────────────────────────────────────────    │   │
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

### Family Mode View

When admin selects **Family Mode**, the page shows multi-child family collection flow:

```
│  ┌── Search Family ─────────────────────────────────────────────┐   │
│  │  🔍 [Search by guardian name, phone, or family ID...         ] │   │
│  │                                                                │   │
│  │  Results:                                                      │   │
│  │  ┌─ Khan Family (Mr. Ahmed Khan — 0300-1234567) ─────────┐   │   │
│  │  │  3 children: Ali (5-A), Sara (8-B), Fatima (10-A)     │   │   │
│  │  │  Total Outstanding: Rs. 23,000                          │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Family Fee Overview ───────────────────────────────────────┐   │
│  │  Family: Khan  │  Guardian: Mr. Ahmed Khan                   │   │
│  │  Total Outstanding (all children): Rs. 23,000                 │   │
│  │                                                                │   │
│  │  ┌── Ali Ahmed (Class 5-A) ──────────────────────────────┐   │   │
│  │  │  Period     │ Category  │ Net      │ Paid    │ Balance │   │   │
│  │  │  Jan 2026   │ Tuition   │ Rs. 5,000│ Rs. 0   │ Rs. 5K  │   │   │
│  │  │  Feb 2026   │ Tuition   │ Rs. 5,000│ Rs. 0   │ Rs. 5K  │   │   │
│  │  │  Subtotal: Rs. 10,000                                  │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │                                                                │   │
│  │  ┌── Sara Khan (Class 8-B) ──────────────────────────────┐   │   │
│  │  │  Period     │ Category  │ Net       │ Paid    │ Balance│   │   │
│  │  │  Jan 2026   │ Tuition   │ Rs. 8,000 │ Rs. 0   │ Rs. 8K │   │   │
│  │  │  Subtotal: Rs. 8,000                                   │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │                                                                │   │
│  │  ┌── Fatima Khan (Class 10-A) ───────────────────────────┐   │   │
│  │  │  Period     │ Category  │ Net       │ Paid    │ Balance│   │   │
│  │  │  Feb 2026   │ Tuition   │ Rs. 10,000│ Rs. 5K  │ Rs. 5K │   │   │
│  │  │  Subtotal: Rs. 5,000                                   │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Record Family Payment ─────────────────────────────────────┐   │
│  │                                                                │   │
│  │  Total Amount: [Rs. 15,000     ]                              │   │
│  │                                                                │   │
│  │  Allocation Strategy:                                          │   │
│  │  [● Oldest First] [○ Child Priority] [○ Equal Split] [○ Manual]│   │
│  │                                                                │   │
│  │  ┌── Allocation Preview ─────────────────────────────────┐   │   │
│  │  │  Child         │ Allocated │ Against                    │   │   │
│  │  │  Ali (5-A)     │ Rs. 5,000 │ Jan Tuition — CLEAR ✅    │   │   │
│  │  │  Sara (8-B)    │ Rs. 8,000 │ Jan Tuition — CLEAR ✅    │   │   │
│  │  │  Fatima (10-A) │ Rs. 2,000 │ Feb Tuition — PARTIAL     │   │   │
│  │  │  ─────────────────────────────────────────────────────  │   │   │
│  │  │  Total Allocated: Rs. 15,000 / Rs. 15,000 ✅           │   │   │
│  │  │  Remaining Unallocated: Rs. 0                           │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │                                                                │   │
│  │  ⚠️ You can manually adjust per-child amounts above.          │   │
│  │  Total must equal the entered amount.                          │   │
│  │                                                                │   │
│  │  Method: [Cash ▼]     Date: [05/03/2026    ]                 │   │
│  │  Reference: [________________]  Bank: [________________]     │   │
│  │  Remarks: [_____________________________________________]    │   │
│  │                                                                │   │
│  │  [Cancel]                     [Record Family Payment & Print]  │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Mode Toggle Behavior

```
Admin opens /admin/fees/collect:
  1. Default mode: Student Mode (most common use case)
  2. Toggle is a segmented control at top: [🧑 Student] [👨‍👩‍👧‍👦 Family]
  3. Switching mode:
     - Clears any selected student/family
     - Resets form state
     - Changes search input placeholder
     - Changes form fields and layout

Student Mode flow:
  Search → Select student → See student's fees → Select fees → Enter amount → Record → Print receipt

Family Mode flow:
  Search → Select family → See ALL children's fees → Enter TOTAL amount → Pick strategy → 
  Preview allocation → Adjust if needed → Record → Print family receipt

Key UX difference:
  - Student Mode: Admin SELECTS specific fee assignments to pay
  - Family Mode: Admin enters TOTAL amount, system ALLOCATES across children automatically
```

### After Successful Payment

Both modes show the same success pattern:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✅ Payment Recorded Successfully                                    │
│                                                                      │
│  Student Mode: Receipt# RCP-2026-0142 — Rs. 10,000                  │
│  Family Mode:  Receipt# FRCP-2026-0045 — Rs. 15,000 (3 children)   │
│                                                                      │
│  [🖨️ Print Receipt]  [📋 Collect Another]  [← Back to Hub]          │
└─────────────────────────────────────────────────────────────────────┘
```
