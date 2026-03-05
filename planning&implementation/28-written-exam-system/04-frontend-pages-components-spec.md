# Written Exam System — Frontend Pages, Components & UI/UX Design

> **Date:** March 5, 2026  
> **Design Principle:** The marks entry experience must feel like Excel, not a web form. Speed, keyboard navigation, and zero friction are paramount.

---

## Pages Overview

### New Pages

| Page | Route | Purpose |
|------|-------|---------|
| Marks Entry Page | `/teacher/exams/[examId]/marks` | Main marks entry interface with two views |

### Modified Pages

| Page | Route | Change |
|------|-------|--------|
| Create Exam Dialog | `/teacher/exams` | Add delivery mode toggle |
| Exam List (Teacher) | `/teacher/exams` | Show delivery mode badge + "Enter Marks" action |
| Exam Detail (Teacher) | `/teacher/exams/[examId]` | Show "Enter Marks" button for written exams |
| Exam List (Student) | `/student/exams` | Filter out written exams |
| Results Page (Student) | `/student/results` | Show written exam results with delivery mode badge |
| Results Page (Teacher) | `/teacher/results` | Delivery mode filter + badge |
| Detailed Analytics | `/teacher/results/[examId]` | Conditional sections based on delivery mode |
| Grading Queue | `/teacher/grading` | Filter out written exams (they have marks entry, not grading) |

---

## Page 1: Marks Entry Page (NEW)

### Route: `/teacher/exams/[examId]/marks`

### Layout Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
│                                                                     │
│  ← Back to Exam                                                    │
│                                                                     │
│  Mathematics Midterm 2026                                           │
│  Class 10-A, 10-B  •  20 Questions  •  100 Total Marks             │
│  ╭──────────╮  ╭──────────╮  ╭──────────╮  ╭──────────╮           │
│  │ 40 Total │  │ 28 Done  │  │ 3 Partial│  │ 2 Absent │           │
│  │ Students │  │   ✅      │  │   ⏳     │  │   🚫     │           │
│  ╰──────────╯  ╰──────────╯  ╰──────────╯  ╰──────────╯           │
│                                                                     │
│  Progress: ████████████████████░░░░░░  78% complete                │
│                                                                     │
│  [Per Student View]  [Spreadsheet View]     🔍 Search Student      │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                          CONTENT AREA                                │
│                    (switches between views)                          │
│                                                                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
│  [Save Progress]                          [Finalize All Results →]  │
└─────────────────────────────────────────────────────────────────────┘
```

### Header Components

#### ExamMarkEntryHeader
```
Props:
  - exam: { title, totalMarks, questions count, classes }
  - stats: { total, completed, inProgress, absent, pending }
  - progresPercentage: number

Features:
  - Exam title + metadata
  - 4 stat cards (total, done, partial, absent)
  - Progress bar (animated, color-coded)
  - View toggle tabs (Per Student / Spreadsheet)
  - Student search input (filters student list)
```

---

### View A: Per-Student View

The teacher focuses on one student at a time. Best for detailed entry with feedback.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  STUDENT LIST (Left Sidebar - 280px)   │  MARKS FORM (Right Panel) │
│  ─────────────────────────────────     │  ────────────────────────  │
│                                         │                           │
│  Filter: [All ▼] [Search...___________]│                           │
│                                         │                           │
│  ┌─────────────────────────────────┐   │  Student: Ahmed Ali       │
│  │ ✅ Ahmed Ali (#12)     78/100   │ ← │  Roll Number: 12          │
│  ├─────────────────────────────────┤   │  Class: 10-A              │
│  │ ✅ Sara Khan (#13)     85/100   │   │                           │
│  ├─────────────────────────────────┤   │  ┌────────────────────────│
│  │ ⏳ Omar Raza (#14)     —/100    │   │  │ Q1. Solve: 2x+3=11    │
│  ├─────────────────────────────────┤   │  │ (MCQ, 2 marks)         │
│  │ 🚫 Fatima Shah (#15)  Absent   │   │  │ Marks: [2__]/2     ✅  │
│  ├─────────────────────────────────┤   │  │ Feedback: [________]   │
│  │ ○  Zain Malik (#16)   Not yet  │   │  ├────────────────────────│
│  ├─────────────────────────────────┤   │  │ Q2. Define polynomial  │
│  │ ...                             │   │  │ (Short Answer, 5 marks)│
│  └─────────────────────────────────┘   │  │ Marks: [4__]/5     ✅  │
│                                         │  │ Feedback: [Good but    │
│  Showing 40 students                    │  │  missed one key point] │
│                                         │  ├────────────────────────│
│                                         │  │ Q3. Prove Pythagoras   │
│                                         │  │ (Long Answer, 10 marks)│
│                                         │  │ Marks: [8__]/10    ✅  │
│                                         │  │ Feedback: [________]   │
│                                         │  ├────────────────────────│
│                                         │  │ ...more questions...   │
│                                         │  └────────────────────────│
│                                         │                           │
│                                         │  ──────────────────────── │
│                                         │  Total: 78/100 (78%)      │
│                                         │  Grade: B+   Status: Pass │
│                                         │                           │
│                                         │  [Mark Absent]  [Save All]│
│                                         │  [← Previous]  [Next →]   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Components

##### StudentListSidebar
```
Props:
  - sessions: WrittenExamSession[]
  - selectedSessionId: string
  - onSelectStudent: (sessionId: string) => void
  - filter: 'all' | 'completed' | 'in-progress' | 'absent' | 'pending'

Features:
  - Status icon per student (✅ completed, ⏳ partial, 🚫 absent, ○ not started)
  - Running total shown per student
  - Color-coded by status
  - Search by name or roll number
  - Filter dropdown
  - Keyboard navigation: ↑↓ to move between students
  - Click to select
```

##### StudentMarksForm
```
Props:
  - session: WrittenExamSessionDetail
  - questions: ExamQuestionWithDetails[]
  - onSave: (marks: MarksEntry[]) => Promise<void>
  - onMarkAbsent: () => Promise<void>
  - onNext: () => void
  - onPrevious: () => void

Features:
  - One row per question
  - Number input for marks (constrained 0 to max)
  - Optional feedback textarea (collapsed by default, expand on click)
  - Question metadata shown (title, type badge, difficulty badge, max marks)
  - Running total calculation at bottom
  - Auto-grade display (percentage, letter grade, pass/fail)
  - Tab navigation between marks inputs
  - Save All button (submits all marks at once via batchEnterWrittenMarksAction)
  - Mark Absent button (with confirmation dialog)
  - Previous/Next student navigation
```

##### QuestionMarkInput
```
Props:
  - question: { title, type, difficulty, maxMarks }
  - currentMarks: number | null
  - feedback: string | null
  - onChange: (marks: number, feedback?: string) => void

Features:
  - Question title + type badge (MCQ / Short / Long)
  - Difficulty badge (Easy / Medium / Hard)
  - Number input with max constraint
  - Slider alternative for visual entry (optional)
  - Feedback text input (collapsible)
  - Visual indicator: ✅ entered, ⚠️ over max, ○ empty
  - Instant validation: red border if marks > maxMarks
```

---

### View B: Spreadsheet View

Excel-like grid for fast bulk entry. The power-user experience.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  Filter: [All ▼]  Sort: [Roll No ▼]        Showing 40 of 40 students  │
│                                                                         │
│  ┌──────────────┬──────┬──────┬───────┬──────┬───────┬───────┬───────┐ │
│  │   Student    │ Q1   │ Q2   │ Q3    │ Q4   │ ...   │ Q20   │ Total │ │
│  │              │ /2   │ /5   │ /10   │ /2   │       │ /8    │ /100  │ │
│  │              │ MCQ  │Short │ Long  │ MCQ  │       │ Long  │       │ │
│  ├──────────────┼──────┼──────┼───────┼──────┼───────┼───────┼───────┤ │
│  │Ahmed Ali #12 │ [2]  │ [4]  │ [8]   │ [2]  │       │ [6]   │  78   │ │
│  │✅ Complete    │      │      │       │      │       │       │  PASS │ │
│  ├──────────────┼──────┼──────┼───────┼──────┼───────┼───────┼───────┤ │
│  │Sara Khan #13 │ [2]  │ [3]  │ [10]  │ [1]  │       │ [7]   │  85   │ │
│  │✅ Complete    │      │      │       │      │       │       │  PASS │ │
│  ├──────────────┼──────┼──────┼───────┼──────┼───────┼───────┼───────┤ │
│  │Omar Raza #14 │ [1]  │ [_]  │ [_]   │ [_]  │       │ [_]   │  1    │ │
│  │⏳ Partial     │      │      │       │      │       │       │  —    │ │
│  ├──────────────┼──────┼──────┼───────┼──────┼───────┼───────┼───────┤ │
│  │Fatima S. #15 │ ABS  │ ABS  │ ABS   │ ABS  │       │ ABS   │  —    │ │
│  │🚫 Absent      │      │      │       │      │       │       │       │ │
│  ├──────────────┼──────┼──────┼───────┼──────┼───────┼───────┼───────┤ │
│  │Zain M. #16   │ [_]  │ [_]  │ [_]   │ [_]  │       │ [_]   │  —    │ │
│  │○ Pending      │      │      │       │      │       │       │       │ │
│  ├──────────────┼──────┼──────┼───────┼──────┼───────┼───────┼───────┤ │
│  │ ...          │      │      │       │      │       │       │       │ │
│  └──────────────┴──────┴──────┴───────┴──────┴───────┴───────┴───────┘ │
│                                                                         │
│  Footer: Avg: 72.3  |  Highest: 92  |  Lowest: 38  |  Pass Rate: 85%  │
│                                                                         │
│  [Auto-save: ON ✅]                                 [Save All Changes] │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Components

##### SpreadsheetMarksGrid
```
Props:
  - exam: WrittenExamData
  - questions: ExamQuestionSummary[]
  - sessions: WrittenExamSession[]
  - onCellChange: (sessionId, examQuestionId, marks) => void
  - onToggleAbsent: (sessionId) => void

Features:
  - Virtualized table (handles 100+ students × 50+ questions smoothly)
  - Sticky first column (student name) + sticky header row
  - Tab between cells (left→right, then next row)
  - Enter to confirm and move down
  - Escape to revert cell edit
  - Auto-save on cell blur (debounced 500ms)
  - Visual validation:
    • Green cell: within range, entered
    • Red cell: exceeds max marks
    • Yellow cell: currently editing
    • Gray cell: absent student
    • Empty cell: not yet entered
  - Column header shows: Q number, max marks, question type badge
  - Row total auto-calculates as marks are entered
  - Pass/Fail indicator per student
  - Right-click context menu: Mark Absent, Clear Row, Fill Zero
  - Footer row: class average, highest, lowest, pass rate

Keyboard Shortcuts:
  - Tab: Next cell
  - Shift+Tab: Previous cell
  - Enter: Confirm & move down
  - Escape: Cancel edit
  - 0-9: Start typing marks (auto-focus)
  - A: Toggle absent for selected student
  - Ctrl+S: Save all
```

##### SpreadsheetCell
```
Props:
  - value: number | null
  - maxMarks: number
  - isAbsent: boolean
  - isEditing: boolean
  - onChange: (value: number) => void
  - onFocus: () => void
  - onBlur: () => void

Features:
  - Compact number input (no spinners, minimal padding)
  - Color-coded border/background based on state
  - Shows fraction: "4/5" when not editing, input when editing
  - Click to edit, blur to save
```

##### SpreadsheetFooter
```
Props:
  - sessions: WrittenExamSession[]
  - totalMarks: number

Features:
  - Class average (excluding absent)
  - Highest scorer
  - Lowest scorer
  - Pass rate percentage
  - Real-time updates as marks are entered
```

---

## Modified Component: Create Exam Dialog

### Change: Add Delivery Mode Selector

```
┌──────────────────────────────────────────────────────┐
│ Create New Exam                                       │
│                                                       │
│ Exam Type:    [MIDTERM ▼]                             │
│                                                       │
│ Delivery Mode:                                        │
│ ┌────────────────────┐ ┌────────────────────┐         │
│ │  🖥️  Online         │ │  📝  Written        │        │
│ │  Students take exam │ │  Paper-based exam  │         │
│ │  on portal          │ │  Teacher enters    │         │
│ │                     │ │  marks later       │         │
│ └────────────────────┘ └────────────────────┘         │
│                                      ↑ Selected       │
│                                                       │
│ Title:        [Mathematics Midterm 2026_________]     │
│ Subject:      [Mathematics ▼]                         │
│ Total Marks:  [100___]                                │
│ Passing Marks:[33____]                                │
│ Duration:     [180___] minutes (reference only)       │
│                                                       │
│ ╭─────────────────────────────────────────────╮       │
│ │ ℹ️  Written exam: Duration is for reference  │       │
│ │    only. Timer will not be enforced.         │       │
│ │    Questions define the marking scheme.       │       │
│ ╰─────────────────────────────────────────────╯       │
│                                                       │
│ Questions:    [Select from question bank...]          │
│ Assign to:    [Class 10-A ▼] [Section: All ▼]        │
│                                                       │
│ [Cancel]                             [Create Exam]    │
└──────────────────────────────────────────────────────┘
```

### Behavioral Changes When WRITTEN is Selected

| Field | Change |
|-------|--------|
| Duration | Label changes to "Duration (reference only)" |
| Shuffle Questions | Hidden (forced false) |
| Max Attempts | Hidden (forced 1) |
| Schedule Start/End | Label changes to "Exam Date (optional)" |
| Instructions | Hidden (not shown to students) |

---

## Modified Component: Exam Grid Cards

### Change: Delivery Mode Badge

```
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ 🖥️ ONLINE                    │    │ 📝 WRITTEN                    │
│                              │    │                              │
│ Mathematics Midterm 2026     │    │ Science Final 2026           │
│ MIDTERM  •  Published        │    │ FINAL  •  Published          │
│ 100 marks  •  180 min        │    │ 75 marks  •  120 min         │
│ 15 sessions  •  10 graded    │    │ 35 entered  •  5 remaining   │
│                              │    │                              │
│ [View]  [Edit]  [Results]    │    │ [View]  [Enter Marks]  [...]│
└──────────────────────────────┘    └──────────────────────────────┘
```

### Key Differences for Written Exam Cards
- Badge: "📝 WRITTEN" instead of "🖥️ ONLINE"
- Stats show: "X entered • Y remaining" instead of "X sessions • Y graded"
- Primary action: "Enter Marks" instead of "View Sessions"
- No "Start Exam" button for students

---

## Modified Component: Teacher Grading Queue

### Change: Filter Out Written Exams

Written exams never appear in the grading queue because:
1. They don't go through the SUBMITTED → GRADING → GRADED flow via student submission
2. They have their own dedicated marks entry page
3. There's no AI/manual grading step — teacher enters final marks directly

```
// In grading queue query:
where: {
  exam: {
    deliveryMode: 'ONLINE',  // ← Only show online exams in grading queue
  },
  status: { in: ['SUBMITTED', 'GRADING'] },
}
```

---

## Modified Component: Student Exam List

### Change: Hide Written Exams

Students should NEVER see written exams in their "Available Exams" list. They can't take them online.

```
// Filter query already handles this via deliveryMode: 'ONLINE' filter
// But also add visual safety:

// If somehow a written exam appears (data inconsistency):
{exam.deliveryMode === 'WRITTEN' && (
  <Badge variant="secondary">Paper-based • Results will be posted</Badge>
)}
```

---

## Modified Component: Student Results Page

### Change: Show Written Exam Results

Written exam results appear same as online results, with a delivery mode indicator:

```
┌──────────────────────────────────────────────────────┐
│ Your Results                                          │
│                                                       │
│ ┌────────┬───────────────────┬───────┬───────┬─────┐ │
│ │  Date  │  Exam             │ Type  │ Score │Grade│ │
│ ├────────┼───────────────────┼───────┼───────┼─────┤ │
│ │ Mar 1  │ Math Quiz 5  🖥️   │ QUIZ  │ 18/20 │ A   │ │
│ │ Feb 25 │ Science Mid  📝  │MIDTERM│ 65/75 │ A-  │ │
│ │ Feb 20 │ English Essay 🖥️  │CUSTOM │ 38/50 │ B+  │ │
│ │ Feb 15 │ Physics Final 📝 │ FINAL │ 82/100│ A   │ │
│ └────────┴───────────────────┴───────┴───────┴─────┘ │
└──────────────────────────────────────────────────────┘
```

The 📝 icon tells students this was a written/paper exam. Clicking the result shows per-question marks breakdown — same as online, minus the "your answer" column (since answers are on paper).

---

## Modified Component: Result Detail (Student View)

### Change: Adapted for Written Exams

For online exams:
```
│ Q1. Solve 2x+3=11                                │
│ Your Answer: x = 4  ✅ Correct                    │
│ Marks: 2/2                                        │
```

For written exams:
```
│ Q1. Solve 2x+3=11                                │
│ Marks: 2/2  ✅                                    │
│ Teacher Remarks: Correctly solved                 │
```

- No "Your Answer" shown (answer is on paper)
- "Teacher Remarks" instead of "Feedback" (semantic difference)
- Question title + max marks shown
- Pass/fail per question: ✅ full marks, ⚠️ partial, ❌ zero

---

## Modified Component: Exam Detailed Analytics

### Change: Conditional Sections

```typescript
// In analytics page:
const isWritten = exam.deliveryMode === 'WRITTEN';

return (
  <>
    {/* Always shown */}
    <OverallStatsSection />
    <ScoreDistributionChart />
    <GradeDistributionChart />
    <PerQuestionAnalysis />
    
    {/* Only for online exams */}
    {!isWritten && <TimeAnalyticsSection />}
    {!isWritten && <AntiCheatSection />}
    
    {/* Enhanced for written exams */}
    {isWritten && <MarksEntryAuditSection />}  {/* Who entered, when */}
  </>
);
```

---

## New Component: Finalize Dialog

When teacher clicks "Finalize All Results":

```
┌────────────────────────────────────────────────────┐
│ Finalize Written Exam Results                       │
│                                                     │
│ ⚠️  This will calculate results for all students.  │
│                                                     │
│ Summary:                                            │
│   • 35 students with complete marks → Will grade    │
│   • 3 students marked absent → Excluded             │
│   • 2 students with incomplete marks → BLOCKING ⚠️  │
│     - Omar Raza (#14): 5 questions remaining        │
│     - Ali Hassan (#22): 2 questions remaining       │
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ ❌ Cannot finalize with incomplete students.   │   │
│ │ Please complete marks or mark absent first.    │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ [Cancel]                            [Complete Marks]│
└────────────────────────────────────────────────────┘
```

When all students are complete or absent:

```
┌────────────────────────────────────────────────────┐
│ Finalize Written Exam Results                       │
│                                                     │
│ ✅ All student marks are complete.                  │
│                                                     │
│ Summary:                                            │
│   • 38 students → Results will be calculated        │
│   • 2 students marked absent → Excluded             │
│                                                     │
│ Preview:                                            │
│   Highest: Sara Khan (92/100)                       │
│   Lowest: Zain Malik (28/100)                       │
│   Average: 67.4/100                                 │
│   Pass Rate: 82%                                    │
│                                                     │
│ [Cancel]                     [Finalize & Calculate] │
└────────────────────────────────────────────────────┘
```

---

## State Management

### Marks Entry State (Zustand Store)

```typescript
interface WrittenMarksStore {
  // Data
  examId: string | null;
  questions: QuestionSummary[];
  sessions: SessionWithMarks[];
  selectedSessionId: string | null;
  
  // View
  view: 'per-student' | 'spreadsheet';
  filter: 'all' | 'completed' | 'in-progress' | 'absent' | 'pending';
  searchQuery: string;
  sortBy: 'rollNumber' | 'name' | 'totalMarks';
  
  // Dirty tracking
  unsavedChanges: Map<string, Map<string, number>>;  // sessionId → examQuestionId → marks
  isSaving: boolean;
  lastSavedAt: Date | null;
  
  // Actions
  setMarks: (sessionId: string, examQuestionId: string, marks: number) => void;
  savePending: () => Promise<void>;
  toggleAbsent: (sessionId: string) => void;
  switchView: (view: 'per-student' | 'spreadsheet') => void;
  selectStudent: (sessionId: string) => void;
  navigateStudent: (direction: 'next' | 'previous') => void;
}
```

### Auto-Save Strategy

```
User types marks → debounce(500ms) → save to pending queue
                                        │
                                        ▼
                              Auto-flush every 3 seconds
                                        │
                                        ▼
                            bulkEnterWrittenMarksAction()
                                        │
                                        ▼
                              Update local state on success
                              Show error toast on failure
```

- **Optimistic updates:** UI updates immediately, server sync happens async
- **Conflict detection:** If server returns different marks than local (race condition), show yellow warning
- **Unsaved indicator:** Show "● Unsaved changes" in header when dirty
- **Save on navigate:** Auto-save when switching students or views
- **Save on leave:** `beforeunload` handler warns about unsaved changes

---

## Responsive Design

### Desktop (≥1200px)
- Spreadsheet view: Full grid visible
- Per-student view: Sidebar + form side-by-side

### Tablet (768px - 1199px)
- Spreadsheet view: Horizontal scroll with sticky first column
- Per-student view: Sidebar collapses to top dropdown, form takes full width

### Mobile (< 768px)
- Spreadsheet view: Not available (forced to per-student view)
- Per-student view: Student dropdown at top, full-width form
- Touch-optimized number inputs (larger tap targets)

---

## Accessibility

| Feature | Implementation |
|---------|---------------|
| Keyboard navigation | Full Tab/Shift+Tab/Enter/Escape support |
| Screen reader | ARIA labels on all inputs: "Marks for Question 1 out of 2, Student Ahmed Ali" |
| Color blindness | Status uses icons + text, not just color |
| Focus management | Focus moves logically through marks inputs |
| Error announcement | Validation errors announced via aria-live |
| High contrast | All UI works in Windows High Contrast mode |

---

## File Structure

```
src/modules/written-exams/
├── written-exam-actions.ts              # All server actions
├── written-exam-queries.ts              # Data fetching queries
├── written-exam-fetch-actions.ts        # Server-side data fetching  
├── hooks/
│   ├── use-written-marks-store.ts       # Zustand store
│   ├── use-written-marks-query.ts       # React Query hooks
│   ├── use-spreadsheet-keyboard.ts      # Keyboard navigation hook
│   └── use-auto-save.ts                 # Auto-save debounce hook
└── components/
    ├── marks-entry-page.tsx             # Main page wrapper
    ├── marks-entry-header.tsx           # Header with stats + view toggle
    ├── per-student-view.tsx             # Per-student view container
    ├── student-list-sidebar.tsx         # Left sidebar student list
    ├── student-marks-form.tsx           # Right panel marks form
    ├── question-mark-input.tsx          # Single question marks input
    ├── spreadsheet-view.tsx             # Spreadsheet view container
    ├── spreadsheet-marks-grid.tsx       # The grid component
    ├── spreadsheet-cell.tsx             # Individual cell
    ├── spreadsheet-footer.tsx           # Summary footer
    ├── finalize-dialog.tsx              # Finalization confirmation
    ├── absent-dialog.tsx                # Mark absent confirmation
    └── index.ts                         # Barrel exports
```

---

## Interaction Flows

### Flow 1: Teacher Creates Written Exam
```
1. Teacher navigates to /teacher/exams
2. Clicks "Create Exam"
3. Selects delivery mode: "Written"
4. Fills form (title, subject, marks, questions, class)
5. Clicks "Create Exam"
6. Exam created as DRAFT
7. Teacher reviews questions
8. Teacher publishes exam (PUBLISHED)
9. Teacher conducts physical exam in class
10. Teacher checks papers offline
11. Teacher returns to enter marks
```

### Flow 2: Teacher Enters Marks (Per Student)
```
1. Teacher navigates to exam → clicks "Enter Marks"
2. System auto-initializes sessions (if first time)
3. Per-student view loads (default)
4. Teacher selects first student from sidebar
5. For each question: types marks in input, optionally adds feedback
6. Running total updates in real-time
7. Clicks "Save & Next" → auto-saves and moves to next student
8. Repeat for all students
9. Mark absent students via "Mark Absent" button
10. When all done → click "Finalize All Results"
```

### Flow 3: Teacher Enters Marks (Spreadsheet)
```
1. Teacher switches to "Spreadsheet View" tab
2. Full grid loads with all students × all questions
3. Teacher clicks first cell, types marks
4. Tab to next cell, type marks → Tab → type → Tab...
5. Auto-save fires on blur/debounce
6. Teacher can mark students absent via right-click or checkbox
7. Total column auto-calculates
8. Footer shows class stats in real-time
9. When all complete → click "Finalize All Results"
```

### Flow 4: Teacher Corrects Marks After Finalization
```
1. Teacher notices wrong marks for a student
2. Navigates to exam → "Enter Marks" (still accessible after finalization)
3. Per-student view opens with existing marks
4. Teacher corrects the marks
5. Clicks "Save"
6. Clicks "Re-finalize" → system recalculates affected result + all ranks
7. If results were published, students see updated marks
```
