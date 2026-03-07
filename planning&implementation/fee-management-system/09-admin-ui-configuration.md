# Fee Management — Admin UI: Configuration

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 11. Admin UI — Fee Structure & Configuration

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
│   └── page.tsx                     # Fee collection interface (DUAL-MODE)
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
│  │  FRCP-0045  │ Khan Family  │ Rs. 15,000│ Cash   │ Today      │   │
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
