# Fee Management — Admin UI: Reports & Analytics

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 13. Admin UI — Reports & Analytics

### Reports Dashboard (`/admin/fees/reports`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Fee Reports & Analytics"                               │
│  Filters: [Session: 2025-2026 ▼]  [Period: All ▼]                   │
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
│  ┌── Payment Mode Breakdown ────────────────────────────────────┐   │
│  │  Direct Student Payments: 245 payments — Rs. 12.3M (66%)     │   │
│  │  Family Payments:          42 payments — Rs. 6.2M (34%)       │   │
│  │  (covering 98 children across 42 families)                    │   │
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
│  ┌── Class-Wise Collection ─────────────────────────────────────┐   │
│  │  (CLICKABLE — each row drills down to class detail view)      │   │
│  │                                                                │   │
│  │  Class   │ Students │ Assigned  │ Collected │ Pending │ Rate  │   │
│  │  ────────┼──────────┼───────────┼───────────┼─────────┼────── │   │
│  │  Class 1 │ 35       │ Rs. 1.2M  │ Rs. 1.0M  │ Rs. 200K│ 82%  →│  │
│  │  Class 2 │ 38       │ Rs. 1.4M  │ Rs. 1.1M  │ Rs. 300K│ 76%  →│  │
│  │  Class 5 │ 42       │ Rs. 2.1M  │ Rs. 1.3M  │ Rs. 800K│ 62%  →│  │
│  │  Class 8 │ 40       │ Rs. 2.5M  │ Rs. 2.0M  │ Rs. 500K│ 80%  →│  │
│  │  Class 10│ 36       │ Rs. 3.0M  │ Rs. 2.7M  │ Rs. 300K│ 91%  →│  │
│  │  ────────┼──────────┼───────────┼───────────┼─────────┼────── │   │
│  │  TOTAL   │ 450      │ Rs. 25.0M │ Rs. 18.5M │ Rs. 6.5M│ 74%  │   │
│  │                                                                │   │
│  │  📊 Bar Chart Toggle:                                          │   │
│  │  Class 1  ████████████████████████░░░░░░  82%                 │   │
│  │  Class 2  ███████████████████████░░░░░░░  76%                 │   │
│  │  Class 5  ██████████████████░░░░░░░░░░░░  62%  ← PROBLEM     │   │
│  │  Class 8  ████████████████████████░░░░░░  80%                 │   │
│  │  Class 10 ████████████████████████████░░░  91%                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ── DRILL-DOWN: When admin clicks "Class 5 →" above ──              │
│                                                                      │
│  ┌── Class 5 Fee Detail (drill-down view) ──────────────────────┐   │
│  │                                                                │   │
│  │  [← Back to Class-Wise Report]                                │   │
│  │                                                                │   │
│  │  Class: 5  │  Total Students: 42  │  Collection Rate: 62%     │   │
│  │  Assigned: Rs. 2.1M  │  Collected: Rs. 1.3M  │  Pending: 800K │   │
│  │                                                                │   │
│  │  ── Section-Wise Breakdown ──                                  │   │
│  │  ┌──────────────────────────────────────────────────────┐     │   │
│  │  │ Section │ Students │ Assigned │ Collected │ Rate     │     │   │
│  │  │ 5-A     │ 22       │ Rs. 1.1M │ Rs. 850K  │ 77%     │     │   │
│  │  │ 5-B     │ 20       │ Rs. 1.0M │ Rs. 450K  │ 45% ⚠️  │     │   │
│  │  └──────────────────────────────────────────────────────┘     │   │
│  │                                                                │   │
│  │  ── Category-Wise Breakdown ──                                 │   │
│  │  ┌──────────────────────────────────────────────────────┐     │   │
│  │  │ Category    │ Assigned  │ Collected │ Pending  │ Rate│     │   │
│  │  │ Tuition Fee │ Rs. 1.8M  │ Rs. 1.1M  │ Rs. 700K │ 61%│     │   │
│  │  │ Lab Fee     │ Rs. 200K  │ Rs. 150K  │ Rs. 50K  │ 75%│     │   │
│  │  │ Sports Fee  │ Rs. 100K  │ Rs. 50K   │ Rs. 50K  │ 50%│     │   │
│  │  └──────────────────────────────────────────────────────┘     │   │
│  │                                                                │   │
│  │  ── Per-Student Status ──                                      │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │ # │ Student      │ Roll │ Payable  │ Paid    │ Balance  │Status│
│  │  │ 1 │ Ali Ahmed    │ 12   │ Rs. 50K  │ Rs. 30K │ Rs. 20K  │ ⚠️ │
│  │  │ 2 │ Zara Khan    │ 15   │ Rs. 55K  │ Rs. 55K │ Rs. 0    │ ✅ │
│  │  │ 3 │ Hassan Ali   │ 18   │ Rs. 48K  │ Rs. 20K │ Rs. 28K  │ 🔴 │
│  │  │ 4 │ Fatima Bibi  │ 22   │ Rs. 50K  │ Rs. 50K │ Rs. 0    │ ✅ │
│  │  │...│ ...          │ ...  │ ...      │ ...     │ ...      │ ...│
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  │                                                                │   │
│  │  Filters: [Section: All ▼] [Status: All ▼] [Period: All ▼]   │   │
│  │  Sort by: [Balance DESC ▼]                                     │   │
│  │  [Export CSV]                                                  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌── Defaulters List ───────────────────────────────────────────┐   │
│  │  [Export CSV]  Filter: [Overdue > __ days]                    │   │
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

### Class Report Navigation Flow

```
Admin → /admin/fees/reports
  │
  ├── Sees class-wise summary table (all classes, one row each)
  │   ↓ Clicks "Class 5 →"
  │
  ├── Sees Class 5 drill-down:
  │   ├── Section-wise breakdown (5-A, 5-B)
  │   ├── Category-wise breakdown (Tuition, Lab, Sports)
  │   └── Per-student table (every student with their status)
  │       ↓ Clicks student name
  │
  └── Goes to that student's fee collection page (student mode)
      where admin can immediately record payment

This is THE workflow that answers:
  "Class 5 ki kitni fee baki hai?"           → class-wise row
  "Class 5-B mein kaun sa student baki hai?" → drill-down → section filter → student table
  "Ahmed ne kya pay kiya hai?"               → click student → fee collection page
```
