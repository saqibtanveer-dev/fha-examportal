# 39 — Report & Print System: Master Plan

> **Created:** 2026-03-13  
> **Status:** PLANNING — Awaiting Review  
> **Priority:** CRITICAL — No reports/print = system is incomplete for production  

---

## Table of Contents

1. [Current State Analysis (Brutal)](#1-current-state-analysis-brutal)
2. [What a Real School Needs (Complete Report Catalog)](#2-what-a-real-school-needs-complete-report-catalog)
3. [Exam Result Consolidation — Deep Analysis](#3-exam-result-consolidation--deep-analysis)
4. [DMC (Detailed Marks Certificate) System](#4-dmc-detailed-marks-certificate-system)
5. [Report Architecture & Engine Design](#5-report-architecture--engine-design)
6. [Print System Design](#6-print-system-design)
7. [Database Schema Changes](#7-database-schema-changes)
8. [API / Server Action Design](#8-api--server-action-design)
9. [Frontend Pages & Components](#9-frontend-pages--components)
10. [Role-Based Access Matrix](#10-role-based-access-matrix)
11. [Performance & Scalability Plan](#11-performance--scalability-plan)
12. [Implementation Phases](#12-implementation-phases)

---

## 1. Current State Analysis (Brutal)

### What EXISTS Today

| Layer | What's There | Verdict |
|-------|-------------|---------|
| **Database** | `ExamResult` (per-exam, per-student, per-session). Stores `totalMarks`, `obtainedMarks`, `percentage`, `grade`, `isPassed`, `rank`. | ❌ **Single-exam only**. No consolidated/multi-exam view. |
| **Report Queries** | `report-queries.ts` — system overview KPIs, department performance (SQL), subject performance (SQL), recent exams table, grade distribution | ❌ **Admin-level dashboards only**. Not actual "reports". Not printable. No class/section/student level. |
| **Export** | `export-actions.ts` — CSV export per-exam results, CSV export per-student results | ⚠️ **Rudimentary**. CSV only. No PDF. No DMC. No formatted output. |
| **Result Views** | Student sees their own results per exam. Teacher sees per-exam result table. Admin sees overview dashboard. | ❌ **No consolidated view across exams**. No DMC. No class-level gazettes. |
| **Analytics** | `result-detailed-analytics.ts` — per-exam analytics (score distribution, question-level analysis, difficulty/discrimination indices) | ✅ Good analytics for individual exams, but not report-level. |
| **Print** | **NOTHING**. Zero print stylesheets. Zero print layouts. Zero PDF generation. | ❌ **Total gap**. |

### What is COMPLETELY MISSING

1. **Consolidated Result View** — combining multiple exams (midterm + final + quizzes) for a student across all subjects
2. **DMC (Detailed Marks Certificate)** — the single most important document a school produces
3. **Class Gazette / Tabulation Sheet** — showing all students of a class with marks in all subjects
4. **Per-Section Result Summary** — aggregate pass/fail, averages, toppers per section
5. **Report Cards** — printable student report cards combining academic + attendance + teacher remarks
6. **Attendance Reports** — monthly/term/annual attendance summaries (daily + subject-wise)
7. **Fee Reports** — collection summaries, defaulters, receipts
8. **Teacher Workload Reports** — exams created, sessions graded, etc.
9. **Print Engine** — CSS print stylesheets, PDF generation API, batch printing
10. **Report Configuration** — school header/logo/principal signature on all reports
11. **Result Gazette** — public/printable merit list per class
12. **Student Portfolio/Transcript** — multi-year academic record
13. **Promotion Report** — tracking who was promoted/held back/withdrawn

---

## 2. What a Real School Needs (Complete Report Catalog)

### Category A: Exam & Academic Reports (CRITICAL)

| # | Report | Description | Audience | Format |
|---|--------|-------------|----------|--------|
| A1 | **DMC (Detailed Marks Certificate)** | Per-student, per-term. All subjects, marks (obtained/total), grades, percentage, rank, position. School header, signatures. | Student, Family, Admin | Print / PDF |
| A2 | **Class Tabulation Sheet (Gazette)** | All students × all subjects matrix. Shows marks per subject per student. Totals, percentages, ranks, pass/fail. | Teacher, Admin, Principal | Print / PDF / Excel |
| A3 | **Section Result Summary** | Aggregate stats per section: total appeared, passed, failed, avg percentage, highest/lowest, toppers list. | Admin, Principal | Screen / Print |
| A4 | **Subject-wise Result Report** | For one subject across a class/section: all students' marks, avg, pass rate, grade distribution. | Teacher, Admin | Screen / Print / Excel |
| A5 | **Exam-wise Result Report** | Single exam: all students who appeared, their marks, grades, pass/fail, ranks. | Teacher, Admin | Screen / Print / CSV |
| A6 | **Consolidated Result** | Multi-exam (midterm + final, or Phase 1 + Phase 2 + Phase 3) combined result with weightage. | Admin, Principal | Screen / Print |
| A7 | **Student Report Card** | Full report card: all subjects, marks per exam type, total, grade, attendance %, teacher remarks, principal remarks. | Student, Family | Print / PDF |
| A8 | **Merit List / Topper List** | Top N students of class/section/school by percentage across all subjects. | Admin, Principal | Screen / Print |
| A9 | **Fail List / At-Risk Students** | Students who failed 1+ subjects or overall, with subject-wise breakdown. | Admin, Principal, Teacher | Screen |
| A10 | **Comparative Result Analysis** | Compare results between sections (A vs B vs C), or between exam types (midterm vs final). | Admin, Principal | Screen (Charts) |
| A11 | **Student Academic Transcript** | Multi-year academic history: all sessions, all exams, grades, promotions. | Admin | Print / PDF |
| A12 | **Grade Sheet** | Per-exam grading breakdown by question for one student — used for re-check/re-evaluation disputes. | Admin, Teacher | Screen / Print |

### Category B: Attendance Reports

| # | Report | Description | Audience | Format |
|---|--------|-------------|----------|--------|
| B1 | **Daily Attendance Register** | Per-class/section: all students with P/A/L/E status for selected date. | Teacher, Admin | Screen / Print |
| B2 | **Monthly Attendance Summary** | Per-student: days present/absent/late/excused for a month. Or per-class summary. | Teacher, Admin, Family | Screen / Print |
| B3 | **Term/Annual Attendance Report** | Cumulative attendance percentages per student over a term or full year. | Admin, Family | Screen / Print |
| B4 | **Attendance Defaulters** | Students below X% attendance threshold. | Admin, Principal | Screen |
| B5 | **Subject-wise Attendance** | Per-subject attendance percentages (for period-based attendance). | Teacher, Admin | Screen |

### Category C: Fee & Financial Reports

| # | Report | Description | Audience | Format |
|---|--------|-------------|----------|--------|
| C1 | **Fee Collection Summary** | Monthly/term: total collected, pending, overdue. By class/section breakdown. | Admin | Screen / Print |
| C2 | **Fee Defaulters List** | Students with overdue fees. Shows amount owed, months pending. | Admin | Screen / Print |
| C3 | **Student Fee Ledger** | Per-student: all fee assignments, payments, discounts, credits, balance. | Admin, Family | Screen / Print |
| C4 | **Fee Receipt** | Printable payment receipt with school header, receipt #, breakdown. | Admin, Family | Print / PDF |
| C5 | **Daily Collection Register** | Summary of all payments received on a specific date. | Admin | Screen / Print |
| C6 | **Family Payment Summary** | For families with multiple children: consolidated payment view. | Admin, Family | Screen |

### Category D: Administrative Reports

| # | Report | Description | Audience | Format |
|---|--------|-------------|----------|--------|
| D1 | **Class Strength Report** | Number of students per class/section with gender breakdown. | Admin, Principal | Screen |
| D2 | **Teacher Workload Report** | Subjects taught, exams created, sessions graded per teacher. | Admin, Principal | Screen |
| D3 | **Promotion Report** | Per-session: who was promoted/held back/withdrawn per class. | Admin | Screen / Print |
| D4 | **Student Enrollment Summary** | New admissions, withdrawals, transfers per period. | Admin | Screen |
| D5 | **Datesheet Report** | Formatted datesheet for printing/sharing with students. | All | Print / PDF |

### Category E: Admission & Scholarship Reports

| # | Report | Description | Audience | Format |
|---|--------|-------------|----------|--------|
| E1 | **Applicant Result Sheet** | Merit list of all applicants for a campaign with scores and ranks. | Admin | Screen / Print / PDF |
| E2 | **Scholarship Awardees** | List of scholarship recipients with tier, percentage, status. | Admin | Screen / Print |
| E3 | **Admission Decision Report** | All decisions (accepted/rejected/waitlisted) with audit trail. | Admin | Screen |

---

## 3. Exam Result Consolidation — Deep Analysis

> This is the **CORE challenge**. A school doesn't just run one exam. Students sit for **multiple exams** of different types across the academic year. The real value is in **consolidating** these into a single unified view.

### 3.1 How Exams Work in Pakistani/South Asian Schools

```
Academic Session (e.g., 2025-2026)
├── Phase 1 / First Term
│   ├── Monthly Test 1 (ExamType: CUSTOM / QUIZ)
│   ├── Monthly Test 2
│   └── Midterm Exam (ExamType: MIDTERM)
├── Phase 2 / Second Term  
│   ├── Monthly Test 3
│   ├── Monthly Test 4
│   └── Final Exam (ExamType: FINAL)
└── Optional Custom Phases
    ├── Phase 1 Exam
    ├── Phase 2 Exam
    └── Phase 3 Exam
```

Each subject in a class might have:
- **1 midterm** (e.g., 50 marks)
- **1 final** (e.g., 100 marks)  
- **2-4 quizzes** (e.g., 20 marks each)
- **Custom phase exams** (e.g., Phase 1 = 50 marks, Phase 2 = 50 marks)

### 3.2 Consolidation Strategies

#### Strategy A: Weighted Combination (Most Common)

```
Final Grade = (Midterm × 30%) + (Final × 50%) + (Quizzes Avg × 20%)
```

- Admin defines **weightage scheme** per academic session
- Each ExamType gets a percentage weight
- Quizzes can be averaged or best-N-of-M
- Custom phase exams get custom weights

#### Strategy B: Simple Addition

```
Total = Midterm Marks + Final Marks + Quiz Average
```

- Easy to understand but doesn't normalize across different total marks

#### Strategy C: Custom Term-Based

```
Term 1 Result = Phase 1 Exam + Monthly Tests Avg
Term 2 Result = Phase 2 Exam + Monthly Tests Avg  
Annual Result = (Term 1 × 40%) + (Term 2 × 60%)
```

### 3.3 The Real Data Flow for Consolidated Results

```
ExamResult (per exam, per student)
    ↓ aggregate by ExamType per subject
ConsolidatedSubjectResult (per student, per subject, per academic session)
    ↓ aggregate across subjects
ConsolidatedStudentResult (per student, per academic session)
    ↓ rank within class/section
Ranked Consolidated Result → DMC → Report Card → Gazette
```

### 3.4 What We Need to Store/Compute

For a **single student in a single subject** in one academic session:

| Field | Example |
|-------|---------|
| Midterm Marks | 42/50 |
| Final Marks | 87/100 |
| Quiz 1 | 18/20 |
| Quiz 2 | 16/20 |
| Quiz Average | 17/20 |
| Custom Phase 1 | 28/30 |
| **Weighted Total** | (42/50×30%) + (87/100×50%) + (17/20×20%) = 25.2 + 43.5 + 1.7 = **70.4/100** |
| Grade | A- |

For a **single student across all subjects**: sum/average all weighted totals, compute rank, pass/fail.

### 3.5 Handling Edge Cases (CRITICAL)

| Edge Case | How to Handle |
|-----------|---------------|
| **Student was absent for midterm** | Mark as "ABS" in that column. Options: (a) compute without it, (b) count as 0, (c) allow admin override |
| **No quiz conducted** | Skip quizzes in consolidation for that subject |
| **Different total marks per section** | Normalize to percentage first, then apply weightage |
| **Student joined mid-year** | Only include exams they were enrolled for |
| **Multiple attempts on same exam** | Take best attempt or latest (configurable) |
| **Elective subjects** | Only show enrolled subjects; don't penalize for non-enrolled |
| **Re-evaluation changed marks** | Propagate to consolidated result automatically |
| **Exam not yet graded/published** | Show "Awaiting Result" in consolidated view |

### 3.6 Custom Exam Type Groups

The current `ExamType` enum has: `QUIZ`, `MIDTERM`, `FINAL`, `PRACTICE`, `CUSTOM`.

This is INSUFFICIENT for real schools. We need the concept of **Result Terms / Exam Groups** that admin can define:

```
ResultTerm: "Annual Result 2025-26"
├── ExamGroup: "Midterm" (weight: 30%)
│   └── Links to: All exams with type=MIDTERM in this session for this class
├── ExamGroup: "Final" (weight: 50%)  
│   └── Links to: All exams with type=FINAL in this session for this class
└── ExamGroup: "Quizzes" (weight: 20%, aggregate: AVERAGE)
    └── Links to: All exams with type=QUIZ in this session for this class
```

OR for custom phase schools:

```
ResultTerm: "Phase Result 2025-26"
├── ExamGroup: "Phase 1 Exam" (weight: 25%)
├── ExamGroup: "Phase 2 Exam" (weight: 25%)
├── ExamGroup: "Phase 3 Exam" (weight: 25%)
└── ExamGroup: "Phase 4 Exam" (weight: 25%)
```

---

## 4. DMC (Detailed Marks Certificate) System

### 4.1 What is a DMC?

A DMC is **THE** most important document a school produces. Every student/parent expects to receive a DMC after every term. It's the **official academic record**.

### 4.2 DMC Contents (Complete Specification)

```
┌─────────────────────────────────────────────────────────────┐
│                    [SCHOOL LOGO]                             │
│               [SCHOOL NAME IN BOLD]                          │
│            [School Address, Phone, Email]                    │
│                                                             │
│          DETAILED MARKS CERTIFICATE                          │
│          ───────────────────────────                         │
│                                                             │
│  Academic Session: 2025-2026        Exam Type: Final/Annual │
│  Class: 10-A                        Date: March 2026        │
│                                                             │
│  Student Name: Ahmed Khan            Roll No: 15           │
│  Father's Name: Mohammad Khan       Reg. No: FHA-2025-0123 │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ #  │ Subject     │ Max  │ Mid  │ Final │ Total │ Grade│ │
│  │    │             │ Marks│ Term │       │       │      │ │
│  ├────┼─────────────┼──────┼──────┼───────┼───────┼──────┤ │
│  │ 1  │ Mathematics │ 100  │ 42   │ 87    │ 78.5  │ A-   │ │
│  │ 2  │ English     │ 100  │ 38   │ 72    │ 65.8  │ B+   │ │
│  │ 3  │ Urdu        │ 100  │ 45   │ 90    │ 82.5  │ A    │ │
│  │ 4  │ Physics     │ 100  │ 30   │ 65    │ 55.0  │ C+   │ │
│  │ 5  │ Chemistry   │ 100  │ 35   │ 78    │ 65.4  │ B+   │ │
│  │ 6  │ Computer Sc │ 100  │ 48   │ 95    │ 85.4  │ A+   │ │
│  │ 7  │ Islamiat    │  50  │ 22   │ 40    │ 35.8  │ A-   │ │
│  │ 8  │ Pak Studies │  50  │ 20   │ 38    │ 33.4  │ B+   │ │
│  ├────┴─────────────┴──────┴──────┴───────┴───────┴──────┤ │
│  │ Grand Total: 501.8 / 700    Percentage: 71.7%          │ │
│  │ Grade: B+       Rank in Class: 12/45                   │ │
│  │ Result: PASS                                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  Attendance: 92% (220/240 days)                            │
│                                                             │
│  Teacher Remarks: ________________________________          │
│  Principal Remarks: ________________________________        │
│                                                             │
│  ────────────        ────────────       ────────────        │
│  Class Teacher        Exam Controller    Principal          │
│                                                             │
│  Date of Issue: ___________                                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 DMC Variants

| Variant | Description |
|---------|-------------|
| **Midterm DMC** | Only midterm exam results. Single column per subject. |
| **Final DMC** | Final exam results. Single column per subject. |
| **Annual/Combined DMC** | Midterm + Final + Quizzes combined with weights. Multiple columns per subject. |
| **Custom Phase DMC** | Phase 1 + Phase 2 + ... combined. N columns per subject. |
| **Single Exam DMC** | Quick DMC for just one specific exam. |

### 4.4 DMC Generation Flow

```
1. Admin selects: Class → Section → Academic Session → Result Term
2. System identifies all linked exams per subject for this term
3. For each student in the section:
   a. Fetch ExamResults for all linked exams
   b. Apply weightage scheme  
   c. Compute per-subject consolidated marks
   d. Compute grand total, percentage, grade
   e. Compute rank within class/section
   f. Fetch attendance data for the period
4. Generate DMC document (HTML → Print / PDF)
5. Option: Batch generate for entire section
6. Option: Batch generate for entire class (all sections)
```

---

## 5. Report Architecture & Engine Design

### 5.1 Core Design Principles

1. **Data Layer (queries)** — Pure data fetching, aggregation, consolidation. No formatting.
2. **Report Templates (components)** — React components that render data into printable HTML.
3. **Print Engine** — CSS @media print rules + optional server-side PDF generation.
4. **Configuration Layer** — School branding, grading scales, weightage schemes, report layouts.
5. **Batch Processing** — Generate reports for entire class/section in one go.
6. **Caching** — Pre-compute consolidated results when all exams are finalized.

### 5.2 Module Structure

```
src/modules/reports/
├── types/
│   ├── report-types.ts              # All report data types
│   ├── consolidated-result-types.ts  # Consolidated result types
│   └── dmc-types.ts                 # DMC-specific types
├── queries/
│   ├── consolidated-result-queries.ts  # Core consolidation logic
│   ├── dmc-queries.ts                  # DMC data assembly
│   ├── gazette-queries.ts             # Class gazette data
│   ├── attendance-report-queries.ts   # Attendance aggregation
│   ├── fee-report-queries.ts          # Fee report aggregation
│   └── admin-report-queries.ts        # Admin/overview reports
├── actions/
│   ├── report-fetch-actions.ts        # Server actions for fetching
│   ├── report-export-actions.ts       # CSV/Excel/PDF export
│   ├── consolidated-result-actions.ts # Generate/publish consolidated results
│   └── report-config-actions.ts       # Configure weightage/grading
├── components/
│   ├── print/
│   │   ├── print-layout.tsx            # Base print layout (school header, footer)
│   │   ├── dmc-print.tsx               # DMC print template
│   │   ├── gazette-print.tsx           # Gazette print template
│   │   ├── report-card-print.tsx       # Report card print template
│   │   ├── attendance-print.tsx        # Attendance report print
│   │   └── fee-receipt-print.tsx       # Fee receipt print
│   ├── screens/
│   │   ├── report-hub.tsx              # Main reports dashboard
│   │   ├── dmc-generator.tsx           # DMC generation UI
│   │   ├── gazette-viewer.tsx          # Gazette screen
│   │   ├── result-consolidation.tsx    # Consolidation configuration
│   │   ├── attendance-reports.tsx      # Attendance report screens
│   │   └── fee-reports.tsx             # Fee report screens
│   └── shared/
│       ├── report-filters.tsx          # Common filter bar (class, section, session, exam type)
│       ├── report-toolbar.tsx          # Print/Export/Download buttons
│       ├── school-header.tsx           # Reusable school branding header
│       └── grading-table.tsx           # Reusable marks/grades table
├── config/
│   ├── grading-utils.ts               # Grade computation from percentage
│   └── report-constants.ts            # Default column widths, pagination, etc.
└── hooks/
    ├── use-report-filters.ts          # Filter state management
    └── use-print.ts                   # Print trigger hook
```

### 5.3 Report Engine Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Filters    │────│  Data Layer  │────│  Template    │────│   Output     │
│  (Class,     │    │  (Queries,   │    │  (React      │    │  (Screen,    │
│   Section,   │    │   Aggregate, │    │   Print      │    │   Print,     │
│   Session,   │    │   Consolidate│    │   Components)│    │   PDF,       │
│   ExamType)  │    │   Rank)      │    │              │    │   Excel)     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 6. Print System Design

### 6.1 Approach: CSS Print First, PDF as Enhancement

**Primary:** CSS `@media print` rules applied to React components. Users trigger `window.print()`.

**Secondary:** Server-side PDF generation using `puppeteer` or `@react-pdf/renderer` for batch downloads.

### 6.2 Print Stylesheet Architecture

```css
/* src/styles/print.css */

@media print {
  /* Hide non-printable elements */
  .no-print, nav, aside, .sidebar, .toolbar, header, footer { display: none !important; }
  
  /* Reset for paper */
  body { background: white; color: black; font-size: 11pt; }
  
  /* Page setup */
  @page { 
    size: A4 portrait; 
    margin: 15mm 10mm; 
  }
  
  @page:first { margin-top: 10mm; }
  
  /* Page breaks */
  .page-break { page-break-before: always; }
  .no-break { page-break-inside: avoid; }
  
  /* Print-specific layouts */
  .print-header { /* school logo, name, address */ }
  .print-table { border-collapse: collapse; width: 100%; }
  .print-table td, .print-table th { border: 1px solid #000; padding: 4px 6px; }
  
  /* Signature lines */
  .signature-block { 
    display: flex; justify-content: space-between; 
    margin-top: 40px; 
  }
  .signature-line { 
    border-top: 1px solid #000; 
    min-width: 120px; 
    text-align: center; 
    padding-top: 4px; 
  }
}
```

### 6.3 Print Layout Component (React)

```tsx
// Shared print wrapper component
<PrintLayout
  title="Detailed Marks Certificate"
  showSchoolHeader={true}
  showSignatures={['Class Teacher', 'Exam Controller', 'Principal']}
  orientation="portrait"  // or "landscape" for gazette
  pageSize="A4"
>
  {/* Report content goes here */}
</PrintLayout>
```

### 6.4 PDF Generation (Server-Side, For Batch Downloads)

- Use `puppeteer` to render the print template on server and generate PDF
- API endpoint: `POST /api/reports/pdf` with report type and filters
- Returns downloadable PDF file
- For batch (entire class): generate one PDF with page breaks per student

### 6.5 Excel Export

- Use `exceljs` or `xlsx` (already have Excel utilities in written-exams module)
- Formatted Excel with headers, merged cells, auto-column-widths
- Separate sheets: "Summary", "Detailed Results", "Grade Distribution"

---

## 7. Database Schema Changes

### 7.1 New Models Required

```prisma
// ============================================
// RESULT TERM / CONSOLIDATED RESULT CONFIG
// ============================================

model ResultTerm {
  id                String   @id @default(uuid())
  name              String   // "Annual Result 2025-26", "Midterm Result"
  academicSessionId String
  classId           String   // applicable class
  description       String?
  isActive          Boolean  @default(true)
  isPublished       Boolean  @default(false)
  publishedAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  academicSession  AcademicSession    @relation(fields: [academicSessionId], references: [id])
  class            Class              @relation(fields: [classId], references: [id])
  examGroups       ResultExamGroup[]
  consolidatedResults ConsolidatedResult[]

  @@unique([name, academicSessionId, classId])
  @@index([academicSessionId])
  @@index([classId])
  @@index([isPublished])
}

model ResultExamGroup {
  id             String   @id @default(uuid())
  resultTermId   String
  name           String   // "Midterm", "Final", "Quizzes", "Phase 1"
  weight         Decimal  // percentage weight (e.g., 30.00)
  aggregateMode  AggregateMode @default(SINGLE) // how to handle multiple exams
  sortOrder      Int
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  resultTerm     ResultTerm          @relation(fields: [resultTermId], references: [id], onDelete: Cascade)
  examLinks      ResultExamLink[]

  @@unique([resultTermId, sortOrder])
  @@index([resultTermId])
}

// Links specific exams to a group
model ResultExamLink {
  id             String   @id @default(uuid())
  examGroupId    String
  examId         String
  createdAt      DateTime @default(now())

  examGroup      ResultExamGroup @relation(fields: [examGroupId], references: [id], onDelete: Cascade)
  exam           Exam @relation(fields: [examId], references: [id])

  @@unique([examGroupId, examId])
  @@index([examGroupId])
  @@index([examId])
}

// Pre-computed consolidated results per student per subject
model ConsolidatedResult {
  id             String   @id @default(uuid())
  resultTermId   String
  studentId      String   // User.id
  subjectId      String
  
  // Per-group breakdown (JSON for flexibility)
  groupScores    Json     // [{ groupId, groupName, obtained, total, percentage }]
  
  // Consolidated scores
  totalMarks     Decimal
  obtainedMarks  Decimal
  percentage     Decimal
  grade          String?
  isPassed       Boolean
  
  // Ranking (computed per class or section)
  rankInClass    Int?
  rankInSection  Int?
  
  computedAt     DateTime @default(now())
  updatedAt      DateTime @updatedAt

  resultTerm     ResultTerm @relation(fields: [resultTermId], references: [id], onDelete: Cascade)
  student        User @relation(fields: [studentId], references: [id])
  subject        Subject @relation(fields: [subjectId], references: [id])

  @@unique([resultTermId, studentId, subjectId])
  @@index([resultTermId, studentId])
  @@index([resultTermId, subjectId])
  @@index([resultTermId, rankInClass])
  @@index([resultTermId, rankInSection])
}

// Overall student summary for a result term (across all subjects)
model ConsolidatedStudentSummary {
  id             String   @id @default(uuid())
  resultTermId   String
  studentId      String   // User.id
  
  totalSubjects  Int
  passedSubjects Int
  failedSubjects Int
  
  grandTotalMarks     Decimal
  grandObtainedMarks  Decimal
  overallPercentage   Decimal
  overallGrade        String?
  isOverallPassed     Boolean
  
  rankInClass    Int?
  rankInSection  Int?
  
  // Optional: attendance percentage for this period
  attendancePercentage Decimal?
  
  // Teacher/Principal remarks
  classTeacherRemarks  String?
  principalRemarks     String?
  
  computedAt     DateTime @default(now())
  updatedAt      DateTime @updatedAt

  resultTerm     ResultTerm @relation(fields: [resultTermId], references: [id], onDelete: Cascade)
  student        User @relation(fields: [studentId], references: [id])

  @@unique([resultTermId, studentId])
  @@index([resultTermId, rankInClass])
  @@index([resultTermId, rankInSection])
  @@index([resultTermId, overallPercentage])
}

enum AggregateMode {
  SINGLE    // Exactly one exam per subject expected
  AVERAGE   // Average all linked exams
  BEST_OF   // Best N of M
  SUM       // Sum all
}
```

### 7.2 Updates to Existing Models

```prisma
// Add to SchoolSettings:
model SchoolSettings {
  // ... existing fields ...
  
  // Report branding
  reportHeaderText    String?  // Custom text below school name
  principalName       String?  // For signature blocks
  examControllerName  String?  // For signature blocks
  reportFooterText    String?  // Custom disclaimer/footer
  signatureImageUrl   String?  // Principal's digital signature
}

// Add to AcademicSession:
model AcademicSession {
  // ... existing fields ...
  resultTerms    ResultTerm[]
}

// Add to Class:
model Class {
  // ... existing fields ...
  resultTerms    ResultTerm[]
}

// Add to Exam:
model Exam {
  // ... existing fields ...
  resultExamLinks ResultExamLink[]
}

// Add to User:
model User {
  // ... existing fields ...
  consolidatedResults        ConsolidatedResult[]
  consolidatedStudentSummaries ConsolidatedStudentSummary[]
}

// Add to Subject:
model Subject {
  // ... existing fields ...
  consolidatedResults ConsolidatedResult[]
}
```

---

## 8. API / Server Action Design

### 8.1 Result Term & Consolidation Actions

```typescript
// ============================================
// Result Term Management (Admin/Principal)
// ============================================

// CRUD for ResultTerm
createResultTerm(input: CreateResultTermInput)
updateResultTerm(id: string, input: UpdateResultTermInput)
deleteResultTerm(id: string)
getResultTerms(filters: { sessionId, classId })

// CRUD for ExamGroups within a ResultTerm
addExamGroup(resultTermId: string, input: ExamGroupInput)
updateExamGroup(groupId: string, input: ExamGroupInput)
removeExamGroup(groupId: string)

// Link exams to groups
linkExamToGroup(groupId: string, examId: string)
unlinkExamFromGroup(groupId: string, examId: string)
autoLinkExamsByType(resultTermId: string) // Auto-detect exams by ExamType

// ============================================
// Result Consolidation Engine (Admin/Principal)
// ============================================

// Compute consolidated results for a result term
computeConsolidatedResults(resultTermId: string, options: { 
  sectionId?: string,  // optional: compute for specific section only
  recompute?: boolean  // force recompute even if already computed
})

// Publish consolidated results (makes visible to students/family)
publishConsolidatedResults(resultTermId: string)
unpublishConsolidatedResults(resultTermId: string)

// Add teacher/principal remarks
addStudentRemarks(resultTermId: string, studentId: string, remarks: { 
  classTeacherRemarks?: string,
  principalRemarks?: string 
})
```

### 8.2 Report Fetch Actions

```typescript
// ============================================
// DMC Data Fetch
// ============================================
fetchDmcData(resultTermId: string, studentId: string): DmcData
fetchBatchDmcData(resultTermId: string, sectionId: string): DmcData[]

// ============================================
// Gazette Data Fetch
// ============================================
fetchGazetteData(resultTermId: string, sectionId: string): GazetteData
fetchGazetteDataByClass(resultTermId: string): GazetteData[]

// ============================================
// Report Summary Fetch
// ============================================
fetchSectionResultSummary(resultTermId: string, sectionId: string): SectionSummary
fetchClassResultSummary(resultTermId: string): ClassSummary
fetchSubjectResultReport(resultTermId: string, subjectId: string, sectionId?: string): SubjectReport

// ============================================
// Attendance Report Fetch
// ============================================
fetchMonthlyAttendance(classId: string, sectionId: string, month: string, sessionId: string)
fetchTermAttendance(classId: string, sectionId: string, startDate: Date, endDate: Date, sessionId: string)
fetchAttendanceDefaulters(threshold: number, sessionId: string)

// ============================================
// Export Actions
// ============================================
exportDmcPdf(resultTermId: string, studentId: string): Buffer
exportBatchDmcPdf(resultTermId: string, sectionId: string): Buffer
exportGazetteExcel(resultTermId: string, sectionId: string): Buffer
exportGazettePdf(resultTermId: string, sectionId: string): Buffer
```

---

## 9. Frontend Pages & Components

### 9.1 New Routes Required

```
Admin Routes:
├── /admin/reports/                     # Report Hub (main dashboard)
├── /admin/reports/result-terms/        # Manage Result Terms
├── /admin/reports/result-terms/[id]/   # Configure specific Result Term (groups, weights, linking)
├── /admin/reports/consolidation/       # Consolidation dashboard (run, monitor)
├── /admin/reports/dmc/                 # DMC Generator (select class/section/term → preview & print)
├── /admin/reports/gazette/             # Gazette Generator (select class/section/term → preview & print)
├── /admin/reports/academic/            # Academic reports hub
├── /admin/reports/attendance/          # Attendance reports
├── /admin/reports/merit-list/          # Merit list / toppers

Teacher Routes:
├── /teacher/reports/                   # Teacher's report hub
├── /teacher/reports/subject-results/   # Subject-wise results per class/section
├── /teacher/reports/gazette/           # Gazette view for their classes

Student Routes:
├── /student/reports/                   # Student's DMC / Report Card view
├── /student/reports/dmc/[termId]       # View/Print individual DMC

Family Routes:
├── /family/reports/                    # Family's children reports
├── /family/reports/[childId]/dmc/[termId]  # View/Print child's DMC

Principal Routes:
├── /principal/reports/                 # Principal's report hub
├── /principal/reports/consolidated/    # School-wide consolidated results
├── /principal/reports/compare/         # Comparative analysis
```

### 9.2 Key Components

```
ReportHub
├── Quick stats cards
├── Report category navigation
└── Recently generated reports

ResultTermManager
├── Create/edit result terms
├── Define exam groups with weights
├── Link exams to groups
├── One-click auto-link by ExamType
└── Validate weights sum to 100%

ConsolidationDashboard 
├── Select result term
├── Progress indicator (how many students computed)
├── Run consolidation button
├── Preview consolidated data
└── Publish/Unpublish toggle

DmcGenerator
├── Filter: Class → Section → Result Term
├── Student list with select all/individual
├── DMC Preview (single student)
├── Print button (single / batch)
├── Download PDF button (single / batch)
└── Add remarks inline

GazetteViewer
├── Filter: Class → Section → Result Term
├── Full tabulation table (students × subjects × marks)
├── Sorting by rank/name/percentage
├── Highlighting: toppers (green), failed (red), absent (grey)
├── Print button (landscape)
└── Export Excel button

DmcPrintTemplate
├── School header (logo, name, address)
├── Student info block
├── Marks table (subjects × exam groups)
├── Grand total, percentage, grade, rank
├── Attendance row
├── Remarks section
├── Signature blocks
└── Footer

GazettePrintTemplate
├── School header
├── Landscape orientation
├── Class/Section info
├── Full marks matrix
├── Subject column headers with max marks
├── Per-student rows with all marks
├── Totals, percentages, grades, ranks
└── Summary row (class average, pass rate)
```

---

## 10. Role-Based Access Matrix

| Report | ADMIN | PRINCIPAL | TEACHER | STUDENT | FAMILY |
|--------|-------|-----------|---------|---------|--------|
| Result Term Config | ✅ Create/Edit | ✅ View | ❌ | ❌ | ❌ |
| Run Consolidation | ✅ | ✅ | ❌ | ❌ | ❌ |
| Publish Results | ✅ | ✅ | ❌ | ❌ | ❌ |
| DMC (All Students) | ✅ | ✅ | ✅ (own classes) | ❌ | ❌ |
| DMC (Own) | ✅ | ✅ | ❌ | ✅ | ✅ (linked children) |
| Class Gazette | ✅ | ✅ | ✅ (own classes) | ❌ | ❌ |
| Section Summary | ✅ | ✅ | ✅ | ❌ | ❌ |
| Subject Report | ✅ | ✅ | ✅ (own subjects) | ❌ | ❌ |
| Merit List | ✅ | ✅ | ✅ | ❌ | ❌ |
| Attendance Report | ✅ | ✅ | ✅ (own sections) | ✅ (own) | ✅ (linked) |
| Fee Reports | ✅ | ✅ | ❌ | ❌ | ✅ (own) |
| Export PDF | ✅ | ✅ | ✅ (own scope) | ✅ (own DMC) | ✅ (linked DMC) |
| Print | ✅ | ✅ | ✅ (own scope) | ✅ (own) | ✅ (linked) |

---

## 11. Performance & Scalability Plan

### 11.1 For 1000+ Students

| Concern | Solution |
|---------|----------|
| **Consolidated result computation** | Run as background job with progress tracking. Process in batches of 50 students. Use transactions per student, not per entire class. |
| **DMC batch generation** | Generate DMCs one at a time in a loop, not all in memory. Stream PDF output for batch downloads. |
| **Gazette for large classes** | Paginate on screen (50 per page). Print in full but warn user about page count. |
| **Database queries** | Use raw SQL for complex aggregations. Index `resultTermId + studentId`, `resultTermId + subjectId`. |
| **PDF generation** | Use worker thread or separate serverless function for PDF generation to avoid blocking main thread. |
| **Caching** | Cache consolidated results in the database (already designed as stored models). Only recompute when underlying ExamResults change. |
| **Excel export for large data** | Use streaming Excel generation (`exceljs` supports streaming). Don't load all data into memory. |

### 11.2 Query Optimization Strategy

```sql
-- Consolidated result computation should be ONE query per student, not N queries per subject
-- Use lateral joins or window functions for ranking

WITH student_subject_results AS (
  SELECT 
    er."studentId",
    e."subjectId",
    reg."id" as group_id,
    reg."name" as group_name,
    reg."weight",
    reg."aggregateMode",
    SUM(er."obtainedMarks") as obtained,
    SUM(er."totalMarks") as total
  FROM "ExamResult" er
  JOIN "Exam" e ON e.id = er."examId"
  JOIN "ResultExamLink" rel ON rel."examId" = e.id
  JOIN "ResultExamGroup" reg ON reg.id = rel."examGroupId"
  WHERE reg."resultTermId" = $1
  GROUP BY er."studentId", e."subjectId", reg.id, reg.name, reg.weight, reg."aggregateMode"
)
-- ... then compute weighted totals
```

---

## 12. Implementation Phases

### Phase 1: Foundation (Reports Engine + DMC) — HIGHEST PRIORITY

1. [ ] Database: Add `ResultTerm`, `ResultExamGroup`, `ResultExamLink`, `ConsolidatedResult`, `ConsolidatedStudentSummary` models
2. [ ] Database: Update `SchoolSettings` with report branding fields
3. [ ] Backend: Result Term CRUD server actions  
4. [ ] Backend: Exam Group CRUD + linking logic
5. [ ] Backend: Consolidation Engine (compute consolidated results)
6. [ ] Backend: DMC data query
7. [ ] Frontend: Result Term Manager page
8. [ ] Frontend: DMC Print Template component
9. [ ] Frontend: DMC Generator page (select → preview → print)
10. [ ] CSS: Print stylesheet (`@media print`)
11. [ ] Frontend: School header component (logo, name, address from SchoolSettings)

### Phase 2: Gazette & Class Reports

12. [ ] Backend: Gazette data queries
13. [ ] Backend: Section/Class summary queries
14. [ ] Frontend: Gazette print template (landscape)
15. [ ] Frontend: Gazette viewer page
16. [ ] Frontend: Section result summary
17. [ ] Frontend: Merit list / Fail list

### Phase 3: Student & Family Report Access

18. [ ] Frontend: Student DMC view page
19. [ ] Frontend: Family DMC view page
20. [ ] Backend: Role-based access checks for reports
21. [ ] Frontend: Student report card (combined DMC + attendance)

### Phase 4: Attendance & Fee Reports

22. [ ] Backend: Attendance report queries (monthly, term, annual)
23. [ ] Frontend: Attendance report pages
24. [ ] Backend: Fee report queries (collection, defaulters, ledger)
25. [ ] Frontend: Fee report pages
26. [ ] Frontend: Fee receipt print template

### Phase 5: Export & PDF

27. [ ] Backend: PDF generation engine (puppeteer or react-pdf)
28. [ ] Backend: Batch DMC PDF generation
29. [ ] Backend: Gazette Excel export
30. [ ] Backend: API endpoint for PDF download
31. [ ] Frontend: Download buttons integration

### Phase 6: Advanced

32. [ ] Comparative analysis (section vs section, exam vs exam)
33. [ ] Student academic transcript (multi-year)
34. [ ] Teacher workload reports
35. [ ] Admin report scheduling
36. [ ] Report caching & invalidation

---

> **Next Step:** Review this plan and decide which phases to implement first. Phase 1 (DMC + Consolidation) is the absolute minimum for a functional school system.
