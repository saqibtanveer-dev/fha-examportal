# Written Exam System — Core Architecture & Design Philosophy

> **Date:** March 5, 2026  
> **Principle:** One exam system, two delivery modes. Same stats. Same results. Different input method.

---

## Design Philosophy

### The Golden Rule

> **A written exam result and an online exam result must be indistinguishable in the results table, analytics dashboard, and student report card.**

The only difference is **how the data enters the system**:
- **Online:** Student inputs answers → system/AI/teacher grades → result
- **Written:** Teacher inputs marks per question → result

Both converge at the same point: `AnswerGrade` → `ExamResult` → analytics pipeline.

### Architectural Principle: Minimal Schema Surgery

We are NOT building a parallel exam system. We are adding a **delivery mode dimension** to the existing system and building a **teacher-side data entry flow** that feeds into the same grading/results pipeline.

```
                    ┌──────────────────────────────────────────────────────┐
                    │                 EXISTING PIPELINE                     │
                    │                                                      │
 ONLINE PATH        │  ExamSession → StudentAnswer → AnswerGrade           │
 (student inputs)   │       │              │              │                │
                    │       │              │              ▼                │
                    │       │              │        ExamResult             │
                    │       │              │              │                │
 WRITTEN PATH       │  ExamSession → StudentAnswer → AnswerGrade           │
 (teacher inputs)   │  (teacher      (teacher        (teacher             │
                    │   created)      created)        created)            │
                    │                                                      │
                    │  ──────────── CONVERGENCE POINT ─────────────        │
                    │                      │                                │
                    │                      ▼                                │
                    │            calculateResult()                         │
                    │                      │                                │
                    │                      ▼                                │
                    │      📊 Analytics, Stats, Reports                    │
                    └──────────────────────────────────────────────────────┘
```

---

## System Overview

### What Changes

| Layer | Change Type | Scope |
|-------|-------------|-------|
| **Prisma Schema** | ADD | 1 new enum (`ExamDeliveryMode`), 1 new field on `Exam`, 1 new session status value |
| **Exam Creation** | MODIFY | Add delivery mode toggle to create exam dialog |
| **Session Management** | ADD | New bulk session creation for written exams |
| **Marks Entry** | ADD (NEW) | Entire marks entry UI and actions — the core of this feature |
| **Grading Pipeline** | MINIMAL | Written exams skip auto-grade, go straight to teacher-entered grades |
| **Result Calculation** | NONE | Reuse `calculateResult()` as-is |
| **Analytics** | MODIFY | Conditional rendering: hide time/anti-cheat sections for written |
| **Student Portal** | MODIFY | Filter written exams from "take exam" list, show in results |

### What Does NOT Change

- Question bank (same questions work for both types)
- `grading-core.ts` (pure functions, delivery-mode agnostic)
- `ExamResult` model (same structure)
- Result queries (read from same tables)
- Student results page (just shows results)
- PDF/CSV export logic

---

## Delivery Mode Concept

### Enum Definition

```
ExamDeliveryMode {
  ONLINE    // Current behavior: student takes exam on portal
  WRITTEN   // New: teacher enters marks after paper-based exam
}
```

### Behavioral Differences Per Mode

| Feature | ONLINE | WRITTEN |
|---------|--------|---------|
| Student sees in exam list | ✅ Yes | ❌ No |
| Student starts session | ✅ Yes | ❌ No — teacher creates |
| Student submits answers | ✅ Yes | ❌ No — teacher enters marks |
| Timer enforcement | ✅ Yes | ❌ No |
| Anti-cheat monitoring | ✅ Yes | ❌ No |
| MCQ auto-grading | ✅ Yes | ❌ No — teacher marks on paper |
| AI grading available | ✅ Yes | ❌ No |
| Manual grading by teacher | ✅ Optional | ✅ Required (marks entry) |
| Question-level marks | ✅ Via AnswerGrade | ✅ Via AnswerGrade |
| Result calculation | ✅ Automatic | ✅ Same formula |
| Analytics: score distribution | ✅ Yes | ✅ Yes |
| Analytics: time distribution | ✅ Yes | ❌ Hidden |
| Analytics: anti-cheat stats | ✅ Yes | ❌ Hidden |
| Analytics: per-question accuracy | ✅ Yes | ✅ Yes |
| Analytics: discrimination index | ✅ Yes | ✅ Yes |
| Analytics: difficulty index | ✅ Yes | ✅ Yes |

---

## Written Exam Lifecycle

### Complete Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 1: EXAM CREATION (Same as online, with deliveryMode: WRITTEN)│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Teacher → Create Exam Dialog                                       │
│    ├── Set deliveryMode: WRITTEN ← NEW TOGGLE                      │
│    ├── Title: "Mathematics Midterm 2026"                            │
│    ├── Subject: Mathematics                                         │
│    ├── Type: MIDTERM                                                │
│    ├── Total Marks: 100                                             │
│    ├── Passing Marks: 33                                            │
│    ├── Duration: 180 min (for reference only — not enforced)        │
│    ├── Select questions from question bank                          │
│    │   ├── Q1: "Solve: 2x + 3 = 11" (MCQ, 2 marks)               │
│    │   ├── Q2: "Define polynomial" (SHORT_ANSWER, 5 marks)         │
│    │   ├── Q3: "Prove Pythagoras theorem" (LONG_ANSWER, 10 marks)  │
│    │   └── ...20 questions, total 100 marks                        │
│    └── Assign to classes: 10-A, 10-B                                │
│                                                                     │
│  Result: Exam created with status DRAFT, deliveryMode: WRITTEN      │
│                                                                     │
│  ⚠️ Key difference: Duration is INFORMATIONAL for written exams     │
│  ⚠️ Key difference: shuffle, maxAttempts, anti-cheat irrelevant     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 2: EXAM ACTIVATION (Publish + Prepare for marking)            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Teacher → Publish Exam                                             │
│    ├── Validation: ≥1 question, ≥1 class assignment                │
│    ├── Status: DRAFT → PUBLISHED                                    │
│    │                                                                │
│    │  📝 At this point the teacher takes the question paper to      │
│    │     class, conducts the physical exam, collects answer sheets, │
│    │     checks papers, and comes back to enter marks.              │
│    │                                                                │
│    └── ⚠️ For WRITTEN exams: NO notification sent to students      │
│            (they already took the exam physically)                   │
│                                                                     │
│  Teacher → Enter Marks (new feature)                                │
│    ├── Navigate to exam detail page                                 │
│    └── Click "Enter Marks" button (only for WRITTEN exams)          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 3: MARKS ENTRY (The core new workflow)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  3A. Initialize Sessions (Automatic or Manual)                      │
│  ─────────────────────────────────────────────────────────────────  │
│  When teacher opens marks entry for first time:                     │
│    → System auto-creates ExamSession for each student in assigned   │
│      classes (status: NOT_STARTED, attemptNumber: 1)                │
│    → Also creates empty StudentAnswer for each ExamQuestion         │
│    → This scaffolding allows per-question marks entry               │
│                                                                     │
│  Special cases:                                                     │
│    • Student was absent → Teacher marks session as ABSENT           │
│       (no marks entered, doesn't count in analytics)                │
│    • New student added to class → Teacher adds manually             │
│                                                                     │
│  3B. Enter Marks — Per Student View                                 │
│  ─────────────────────────────────────────────────────────────────  │
│  Teacher sees:                                                      │
│    ┌─────────────────────────────────────────────────────────────┐  │
│    │ Student: Ahmed Ali (Roll #12)        [Status: In Progress]  │  │
│    │                                                             │  │
│    │  Q1. Solve: 2x + 3 = 11       (MCQ, 2 marks)     [__]/2   │  │
│    │  Q2. Define polynomial         (Short, 5 marks)   [__]/5   │  │
│    │  Q3. Prove Pythagoras theorem  (Long, 10 marks)   [__]/10  │  │
│    │  Q4. Find area of circle       (MCQ, 2 marks)     [__]/2   │  │
│    │  ...                                                        │  │
│    │  Q20. Differentiate x²+3x+1   (Long, 8 marks)    [__]/8   │  │
│    │                                                             │  │
│    │  Total: [75]/100    Percentage: 75%    Grade: B+            │  │
│    │                                                             │  │
│    │  [← Previous Student]   [Save & Next →]   [Mark Absent]    │  │
│    └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  3C. Enter Marks — Spreadsheet View (Bulk Entry)                   │
│  ─────────────────────────────────────────────────────────────────  │
│  Teacher sees:                                                      │
│    ┌─────────────────────────────────────────────────────────────┐  │
│    │     Student    │ Q1/2 │ Q2/5 │ Q3/10 │ ... │ Q20/8 │Total │  │
│    │─────────────── │──────│──────│───────│─────│───────│──────│  │
│    │ Ahmed Ali (#12)│ [2]  │ [4]  │ [8]   │     │ [6]   │ 75   │  │
│    │ Sara Khan (#13)│ [2]  │ [3]  │ [10]  │     │ [7]   │ 82   │  │
│    │ Omar Raza (#14)│ [1]  │ [5]  │ [7]   │     │ [5]   │ 68   │  │
│    │ Fatima Shah(#15)│[ABS]│ [ABS]│ [ABS] │     │ [ABS] │  —   │  │
│    │ ...            │      │      │       │     │       │      │  │
│    └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Features:                                                          │
│    • Tab-navigable cells (like Excel)                               │
│    • Auto-calculate total per student                               │
│    • Color coding: red if marks > max, green if passing             │
│    • Instant validation per cell                                    │
│    • Auto-save on blur (debounced)                                  │
│    • "Mark Absent" toggle per student                               │
│    • Filter: All / Entered / Pending / Absent                       │
│    • Sort by: Roll number, Name, Total marks                        │
│                                                                     │
│  3D. Save Progress                                                  │
│  ─────────────────────────────────────────────────────────────────  │
│  On each entry save:                                                │
│    → Create/Update StudentAnswer (answerText: null, selectedOption: │
│      null — only the corresponding AnswerGrade matters)             │
│    → Create/Update AnswerGrade (marksAwarded, gradedBy: TEACHER)    │
│    → Update ExamSession status based on completion:                 │
│      • No marks entered yet → NOT_STARTED                          │
│      • Some marks entered → IN_PROGRESS (written context)          │
│      • All marks entered → SUBMITTED                               │
│    → Auto-calculate running total in UI                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 4: FINALIZATION                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  When teacher clicks "Finalize Results":                            │
│    ├── Validate: All non-absent students have complete marks        │
│    ├── For each student with all marks:                             │
│    │   ├── ExamSession.status → GRADED                              │
│    │   └── calculateResult(sessionId) → ExamResult created          │
│    │       ├── obtainedMarks = sum of all AnswerGrade.marksAwarded  │
│    │       ├── percentage = (obtained / total) * 100                │
│    │       ├── grade = deriveGrade(percentage)                      │
│    │       ├── isPassed = obtained >= passingMarks                  │
│    │       └── rank = ranked among class peers                      │
│    │                                                                │
│    ├── Absent students:                                              │
│    │   └── ExamSession.status → ABSENT (new status value)           │
│    │       (No ExamResult created)                                   │
│    │                                                                │
│    └── Exam.status → COMPLETED                                      │
│                                                                     │
│  Post-finalization:                                                  │
│    ├── Teacher can publish results (ExamResult.publishedAt)         │
│    ├── Students see results in their dashboard                      │
│    └── Analytics become available                                    │
│                                                                     │
│  ⚠️ After finalization:                                             │
│    • Teacher CAN still edit individual marks (re-totaling)          │
│    • Teacher CAN re-finalize (recalculates results)                │
│    • This supports post-exam grade corrections                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 5: RESULTS & ANALYTICS (Reuse existing pipeline)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Once ExamResults exist, everything converges:                      │
│                                                                     │
│  ✅ getResultsByExam(examId)          — Same query, same output     │
│  ✅ getResultsByStudent(studentId)     — Includes written results   │
│  ✅ getStudentResultDetail(resultId)   — Shows per-question marks   │
│  ✅ getExamAnalytics(examId)           — Distribution, pass rate    │
│  ✅ getExamDetailedAnalytics(examId)   — Full analytics             │
│     ├── Overall stats ✅                                            │
│     ├── Score distribution ✅                                       │
│     ├── Grade distribution ✅                                       │
│     ├── Per-question accuracy ✅                                    │
│     ├── Difficulty index ✅                                         │
│     ├── Discrimination index ✅                                     │
│     ├── Time analytics ❌ (hidden for WRITTEN)                      │
│     └── Anti-cheat stats ❌ (hidden for WRITTEN)                    │
│  ✅ getStudentAnalytics(studentId)     — Subject averages + timeline│
│                                                                     │
│  The beauty: **analytics code doesn't need modification.**          │
│  Only the frontend components conditionally render sections.        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## State Machine: Written Exam Session

```
 Teacher creates session
         │
         ▼
   ┌─────────────┐
   │ NOT_STARTED  │   (Session created, no marks entered)
   └──────┬──────┘
          │ Teacher enters first mark
          ▼
   ┌─────────────┐
   │ IN_PROGRESS  │   (Some marks entered, not all)
   └──────┬──────┘
          │ Teacher enters all marks
          ▼
   ┌─────────────┐
   │  SUBMITTED   │   (All marks entered, ready to finalize)
   └──────┬──────┘
          │ Teacher clicks "Finalize"
          ▼
   ┌─────────────┐
   │   GRADED     │   (ExamResult calculated, final)
   └─────────────┘

   Special path:
   ┌─────────────┐
   │   ABSENT     │   (Student was absent — no marks, no result)
   └─────────────┘
```

Note: `GRADING` status is NOT used for written exams (that's for AI/manual grading of online submissions). `TIMED_OUT` is also not used.

---

## Two Entry Modes: When to Use Which

### Per-Student View (Sequential Entry)
**Best for:** Small classes, subjective questions, when teacher wants to focus on one student at a time.

- See all questions for one student
- Enter marks one by one
- Navigate between students with Previous/Next
- Good for SHORT_ANSWER and LONG_ANSWER questions where teacher wants to add feedback

### Spreadsheet View (Bulk Entry)
**Best for:** Large classes, MCQ-heavy exams, quick result entry.

- See all students × all questions in a grid
- Tab between cells like Excel
- Auto-calculate totals as you type
- Color-coded validation
- Most efficient for quick numeric entry

### Teacher Chooses
Both views show the same data. Teacher switches between views freely. Data entered in one view appears in the other.

---

## Absent Student Handling

### Marking as Absent
- In per-student view: "Mark Absent" button
- In spreadsheet view: "ABS" toggle per student row
- Absent students have ExamSession.status = `ABSENT`

### What Absent Means
- No `StudentAnswer` records (or cleared if marks were entered then reverted)
- No `AnswerGrade` records
- No `ExamResult` created
- **Excluded from analytics calculations** (not counted in pass rate, averages, etc.)
- Student sees "Absent" in their results page (not "Failed")

### Reverting Absent
- Teacher can un-mark absent and enter marks
- Session moves back to `NOT_STARTED`

---

## Edge Cases & Design Decisions

### Q: What if teacher creates a written exam with MCQ questions?
**A:** Perfectly valid. In a physical exam, there ARE MCQ questions on paper. Teacher marks them as correct/incorrect and enters 0 or full marks. The system doesn't auto-grade MCQs for written exams — teacher enters all marks manually.

### Q: What if teacher wants to add feedback for a specific answer?
**A:** In per-student view, each question has an optional "feedback" text field that maps to `AnswerGrade.feedback`. In spreadsheet view, feedback is not shown (too cluttered) — teacher switches to per-student view for that.

### Q: What if teacher enters marks, finalizes, then realizes Q5 was marked wrong?
**A:** Teacher goes back to marks entry, edits Q5's marks for that student, clicks "Re-finalize." The system recalculates the ExamResult. Previous result is overwritten (upsert). Audit log tracks the change.

### Q: Can the same question be used in both online and written exams?
**A:** Yes. Questions are delivery-mode agnostic. The same question can appear in an online quiz and a written midterm.

### Q: What about negative marking for written exams?
**A:** Teacher enters the final marks. If the paper has negative marking, the teacher calculates it on paper and enters the net marks. The system doesn't enforce negative marking rules for written exams — it just validates `0 ≤ marks ≤ maxMarks`.

### Q: What if a student joins the class after the written exam?
**A:** Teacher manually adds the student to the exam. System creates a session + empty answers. If student didn't take the exam, teacher marks absent.

### Q: Can total marks in written exam differ from sum of question marks?
**A:** No. Same validation as online exams — `totalMarks` must equal sum of `ExamQuestion.marks`. This ensures per-question entry adds up correctly.
