# Fee Management — Class-Level Reporting

> Part of: [Fee Management System Design](./00-overview-and-analysis.md)

---

## 29. Class-Level Reporting Design

### The Core Question This Section Answers

> "Kis class ki kitni fee baki hy?" — How much fee is outstanding per class?

This is the #1 question an admin/principal asks daily. The system MUST answer this with one click and then allow drill-down to section → category → individual student.

---

### Report Navigation Hierarchy

```
Level 0: Collection Overview Dashboard
  ├── Total Collected vs. Outstanding
  ├── Payment Mode Breakdown (Cash/Bank/Online)
  └── Monthly Trend Chart

Level 1: Class-Wise Summary Table (The Main Report)
  ┌─────────────────────────────────────────────────────────────────┐
  │ Class │ Students │ Total Due │ Collected │ Outstanding │ %Coll  │
  │ ──────┼──────────┼───────────┼───────────┼─────────────┼──────  │
  │ 1     │ 120      │ 6,00,000  │ 5,50,000  │ 50,000      │ 91.7%  │
  │ 2     │ 100      │ 5,00,000  │ 4,20,000  │ 80,000      │ 84.0%  │
  │ ...   │ ...      │ ...       │ ...       │ ...         │ ...    │
  │ 10    │ 80       │ 8,00,000  │ 6,50,000  │ 1,50,000    │ 81.2%  │
  │ ──────┼──────────┼───────────┼───────────┼─────────────┼──────  │
  │ TOTAL │ 1,200    │ 78,00,000 │ 65,00,000 │ 13,00,000   │ 83.3%  │
  └─────────────────────────────────────────────────────────────────┘
  
  • Each row is CLICKABLE → navigates to Level 2
  • Visual bar chart version alongside the table
  • Color coding: >90% green, 70-90% yellow, <70% red
  • Filter by: month, academic session, fee category
  • Sort by: any column (default: class ascending)
```

### Level 2: Class Detail Page (Drill-Down)

When admin clicks "Class 5" in the summary table, they navigate to:
`/admin/fees/reports/class/[classId]`

This page has three tabs/sections:

#### Tab 1: Section-Wise Breakdown

```
  Class 5 — Fee Report
  ┌──────────────────────────────────────────────────────────────┐
  │ Section │ Students │ Total Due │ Collected │ Outstanding │ %  │
  │ ────────┼──────────┼───────────┼───────────┼─────────────┼──  │
  │ 5-A     │ 35       │ 1,75,000  │ 1,60,000  │ 15,000      │91% │
  │ 5-B     │ 34       │ 1,70,000  │ 1,40,000  │ 30,000      │82% │
  │ 5-C     │ 36       │ 1,80,000  │ 1,50,000  │ 30,000      │83% │
  │ ────────┼──────────┼───────────┼───────────┼─────────────┼──  │
  │ TOTAL   │ 105      │ 5,25,000  │ 4,50,000  │ 75,000      │86% │
  └──────────────────────────────────────────────────────────────┘
```

#### Tab 2: Category-Wise Breakdown

```
  Class 5 — By Fee Category
  ┌──────────────────────────────────────────────────────────────┐
  │ Category        │ Per-Student │ Total Due │ Collected │ Out  │
  │ ────────────────┼────────────┼───────────┼───────────┼────  │
  │ Monthly Tuition │ 3,000      │ 3,15,000  │ 2,90,000  │25K  │
  │ Lab Fee         │ 500        │ 52,500    │ 45,000    │7.5K │
  │ Sports Fee      │ 1,000      │ 1,05,000  │ 90,000    │15K  │
  │ Exam Fee        │ 500        │ 52,500    │ 25,000    │27.5K│
  │ ────────────────┼────────────┼───────────┼───────────┼────  │
  │ TOTAL           │ 5,000      │ 5,25,000  │ 4,50,000  │75K  │
  └──────────────────────────────────────────────────────────────┘
```

#### Tab 3: Per-Student Table (The Final Drill-Down)

```
  Class 5 — All Students
  ┌─────────────────────────────────────────────────────────────────────┐
  │ # │ Student     │ Section │ Total Due │ Paid    │ Balance │ Status  │
  │ ──┼─────────────┼─────────┼───────────┼─────────┼─────────┼─────── │
  │ 1 │ Ahmed Khan  │ 5-A     │ 5,000     │ 5,000   │ 0       │ ✅ PAID│
  │ 2 │ Sara Ali    │ 5-A     │ 5,000     │ 3,000   │ 2,000   │ ⚠ PART│
  │ 3 │ Bilal Shah  │ 5-B     │ 5,000     │ 0       │ 5,000   │ ❌ UNPD│
  │ ..│ ...         │ ...     │ ...       │ ...     │ ...     │ ...    │
  │ ──┴─────────────┴─────────┴───────────┴─────────┴─────────┴─────── │
  │ Filter: [All Sections ▼] [All Categories ▼] [All Statuses ▼]      │
  │ Sort: [Student Name ▼]                                              │
  │ Actions: [Export CSV] [Print] [Send Reminders to Unpaid]            │
  └─────────────────────────────────────────────────────────────────────┘
  
  Clicking a student row → opens student's individual fee detail panel/modal
  with payment history, discounts, and "Collect Fee" button (Student Mode)
```

---

### Query Design for Class Reports

#### Query 1: Class-Wise Summary (Level 1)

```sql
-- This is the PRIMARY REPORT QUERY
-- Groups by class, aggregates all fee assignments for the selected period

SELECT
  c.id AS class_id,
  c.name AS class_name,
  c.numeric_class,
  COUNT(DISTINCT fa.student_id) AS student_count,
  SUM(fa.total_amount) AS total_due,
  SUM(fa.paid_amount) AS total_collected,
  SUM(fa.balance_amount) AS total_outstanding,
  ROUND(SUM(fa.paid_amount) * 100.0 / NULLIF(SUM(fa.total_amount), 0), 1) AS collection_percentage
FROM fee_assignments fa
  JOIN students s ON fa.student_id = s.id
  JOIN sections sec ON s.section_id = sec.id
  JOIN classes c ON sec.class_id = c.id
WHERE fa.academic_session_id = :sessionId
  AND fa.generated_for_month >= :startMonth
  AND fa.generated_for_month <= :endMonth
  AND fa.status != 'CANCELLED'
GROUP BY c.id, c.name, c.numeric_class
ORDER BY c.numeric_class ASC;
```

**Important**: This query does NOT differentiate between Student Mode and Family Mode payments. `paid_amount` on `FeeAssignment` is incremented the same way regardless of payment source. This is by design — the report is about collections, not about how they were collected.

#### Query 2: Section-Wise for a Class (Level 2, Tab 1)

```sql
SELECT
  sec.id AS section_id,
  sec.name AS section_name,
  COUNT(DISTINCT fa.student_id) AS student_count,
  SUM(fa.total_amount) AS total_due,
  SUM(fa.paid_amount) AS total_collected,
  SUM(fa.balance_amount) AS total_outstanding,
  ROUND(SUM(fa.paid_amount) * 100.0 / NULLIF(SUM(fa.total_amount), 0), 1) AS pct
FROM fee_assignments fa
  JOIN students s ON fa.student_id = s.id
  JOIN sections sec ON s.section_id = sec.id
WHERE sec.class_id = :classId
  AND fa.academic_session_id = :sessionId
  AND fa.generated_for_month >= :startMonth
  AND fa.generated_for_month <= :endMonth
  AND fa.status != 'CANCELLED'
GROUP BY sec.id, sec.name
ORDER BY sec.name ASC;
```

#### Query 3: Category-Wise for a Class (Level 2, Tab 2)

```sql
SELECT
  fc.id AS category_id,
  fc.name AS category_name,
  fc.amount AS per_student_amount,
  SUM(fa.total_amount) AS total_due,
  SUM(fa.paid_amount) AS total_collected,
  SUM(fa.balance_amount) AS total_outstanding
FROM fee_assignments fa
  JOIN fee_line_items fli ON fli.fee_assignment_id = fa.id
  JOIN fee_structures fs ON fli.fee_structure_id = fs.id
  JOIN fee_categories fc ON fs.category_id = fc.id
WHERE fa.academic_session_id = :sessionId
  AND fa.generated_for_month >= :startMonth
  AND fa.generated_for_month <= :endMonth
  -- Filter to specific class:
  AND fa.student_id IN (
    SELECT s.id FROM students s
    JOIN sections sec ON s.section_id = sec.id
    WHERE sec.class_id = :classId
  )
  AND fa.status != 'CANCELLED'
GROUP BY fc.id, fc.name, fc.amount
ORDER BY fc.name ASC;
```

#### Query 4: Per-Student for a Class (Level 2, Tab 3)

```sql
SELECT
  s.id AS student_id,
  s.roll_number,
  u.name AS student_name,
  sec.name AS section_name,
  SUM(fa.total_amount) AS total_due,
  SUM(fa.paid_amount) AS total_paid,
  SUM(fa.balance_amount) AS balance,
  CASE
    WHEN SUM(fa.balance_amount) = 0 THEN 'PAID'
    WHEN SUM(fa.paid_amount) > 0 THEN 'PARTIAL'
    ELSE 'UNPAID'
  END AS status
FROM fee_assignments fa
  JOIN students s ON fa.student_id = s.id
  JOIN users u ON s.user_id = u.id
  JOIN sections sec ON s.section_id = sec.id
WHERE sec.class_id = :classId
  AND fa.academic_session_id = :sessionId
  AND fa.generated_for_month >= :startMonth
  AND fa.generated_for_month <= :endMonth
  AND fa.status != 'CANCELLED'
GROUP BY s.id, s.roll_number, u.name, sec.name
ORDER BY u.name ASC;
```

---

### How Both Payment Modes Feed Into Reports

```
                 Student Mode Payment              Family Mode Payment
                      │                                    │
                      ▼                                    ▼
            FeePayment created                  FamilyPayment wrapper created
            (familyPaymentId=null)              └→ N × FeePayment created
                      │                            (familyPaymentId=SET)
                      ▼                                    ▼
              FeeAssignment.paidAmount += X      FeeAssignment.paidAmount += Y
              FeeAssignment.balanceAmount -= X   FeeAssignment.balanceAmount -= Y
                      │                                    │
                      └──────────────┬─────────────────────┘
                                     ▼
                          FeeAssignment table
                          (source-agnostic)
                                     ▼
                          Class Reports query
                          FeeAssignment directly
                          (no joins to FeePayment)

Key insight: Class reports NEVER need to know about the payment mode.
They only read FeeAssignment aggregate columns.
This makes reports fast and simple.

Family-specific reporting (which family paid what) is a SEPARATE report
accessible via /admin/fees/reports/family-payments — NOT part of class reports.
```

---

### Report Performance Optimization

For a school with 2,000 students, 5 fee categories, 12 months = ~120,000 FeeAssignment rows per year. The class-wise query groups ~120K rows into ~15 class rows. This is manageable but should be optimized:

#### Indexing Strategy for Report Queries

```
Required composite indexes:

1. fee_assignments(academic_session_id, generated_for_month, status)
   → Filters by session + month range + not cancelled

2. fee_assignments(student_id, academic_session_id, generated_for_month)
   → Join path from student to filtered assignments

3. students(section_id)
   → Quick lookup for class drill-down

4. sections(class_id)
   → Group students by class

These should already exist from 15-concurrency-performance.md
```

#### Caching Strategy

```
Class-wise summary (Level 1):
  - Cache key: classWiseSummary:{sessionId}:{startMonth}:{endMonth}
  - TTL: 5 minutes (payments happen frequently during school hours)
  - Invalidated on: any payment recorded, any reversal, any fee generation
  - Cache location: React Query client with staleTime: 5 * 60 * 1000

Section-wise and category-wise (Level 2):
  - Cache key: classDetail:{classId}:{sessionId}:{startMonth}:{endMonth}
  - TTL: 5 minutes
  - Same invalidation as Level 1

Per-student list (Level 2, Tab 3):
  - NOT cached server-side (data is too dynamic, too personalized)
  - React Query client cache only with staleTime: 2 * 60 * 1000
```

#### Export Functionality

Every report table should support:
- **CSV Export**: All visible rows with all columns (no pagination)
- **Print**: Clean printable view with school header, date, filters applied
- **PDF** (future): For principal to share with school board

Export is client-side for V1:
- Fetches ALL rows (no pagination) via separate query
- Generates CSV in browser
- Triggers download

---

### Payment Mode Breakdown (Bonus Report)

While class reports don't differentiate payment modes, the admin needs a separate view:

```
Collection Breakdown — This Month
┌──────────────────────────────────────────────────┐
│ Mode            │ Count │ Amount    │ % of Total  │
│ ────────────────┼───────┼───────────┼───────────  │
│ Student Payment │ 450   │ 22,50,000 │ 69.2%       │
│ Family Payment  │ 85    │ 10,00,000 │ 30.8%       │
│ ────────────────┼───────┼───────────┼───────────  │
│ TOTAL           │ 535   │ 32,50,000 │ 100%        │
└──────────────────────────────────────────────────┘

Sub-breakdown by payment method:
│ Cash            │ 320   │ 18,00,000 │ 55.4%       │
│ Bank Transfer   │ 150   │ 10,00,000 │ 30.8%       │
│ Online          │ 65    │ 4,50,000  │ 13.8%       │
```

This report queries `FeePayment` + `FamilyPayment` tables directly (unlike class reports which query `FeeAssignment`).
