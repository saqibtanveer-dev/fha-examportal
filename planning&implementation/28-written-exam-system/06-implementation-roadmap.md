# Written Exam System — Implementation Roadmap

> **Date:** March 5, 2026  
> **Approach:** Incremental, layer-by-layer. Schema first, then backend, then frontend.  
> **Dependencies:** Each phase builds on the previous. No skipping.

---

## Phase Overview

```
Phase 1: Schema & Migration          ████  Foundation
Phase 2: Server Actions & Queries    ████████  Backend logic
Phase 3: Exam Creation Modifications ████  Modify existing
Phase 4: Marks Entry — Per Student   ████████████  Core UI
Phase 5: Marks Entry — Spreadsheet   ████████████  Power-user UI
Phase 6: Finalization & Results      ████████  Complete the loop
Phase 7: Analytics Adaptation        ████  Conditional rendering
Phase 8: Student-Side Filtering      ██  Small but important
Phase 9: Testing & Polish            ████████  Production-ready
```

---

## Phase 1: Schema & Migration

### Tasks

- [ ] **1.1** Add `ExamDeliveryMode` enum to `schema.prisma`
  ```prisma
  enum ExamDeliveryMode {
    ONLINE
    WRITTEN
  }
  ```

- [ ] **1.2** Add `deliveryMode` field to `Exam` model
  ```prisma
  deliveryMode ExamDeliveryMode @default(ONLINE)
  ```

- [ ] **1.3** Add `ABSENT` to `SessionStatus` enum

- [ ] **1.4** Add `enteredById` to `ExamSession` model with relation to `User`

- [ ] **1.5** Add new indexes
  ```prisma
  @@index([deliveryMode])  // on Exam
  @@index([enteredById])   // on ExamSession
  ```

- [ ] **1.6** Run `prisma migrate dev --name add_written_exam_support`

- [ ] **1.7** Verify migration — all existing exams should have `deliveryMode: ONLINE`

- [ ] **1.8** Update Prisma client types — run `prisma generate`

### Acceptance Criteria
- Migration runs without errors
- Existing data is untouched
- `prisma studio` shows new fields with correct defaults
- TypeScript types are updated

---

## Phase 2: Server Actions & Queries

### Tasks

- [ ] **2.1** Create `src/validations/written-exam-schemas.ts`
  - `enterWrittenMarksSchema`
  - `batchEnterWrittenMarksSchema`
  - `bulkEnterWrittenMarksSchema`
  - `markStudentAbsentSchema`
  - `finalizeWrittenExamSchema`

- [ ] **2.2** Create `src/modules/written-exams/written-exam-queries.ts`
  - `getWrittenExamMarkEntryData(examId)` — fetches exam, questions, sessions with marks
  - `getWrittenExamStudentDetail(sessionId)` — single student's marks

- [ ] **2.3** Create `src/modules/written-exams/written-exam-actions.ts`
  - `initializeWrittenExamSessionsAction(examId)` — bulk session + answer creation
  - `enterWrittenMarksAction(sessionId, examQuestionId, marks, feedback?)` — single entry
  - `batchEnterWrittenMarksAction(sessionId, marks[])` — per-student batch
  - `bulkEnterWrittenMarksAction(examId, entries[])` — spreadsheet batch
  - `markStudentAbsentAction(sessionId)` — mark absent
  - `unmarkStudentAbsentAction(sessionId)` — revert absent
  - `finalizeWrittenExamAction(examId)` — calculate all results + ranks
  - `refinalizeWrittenExamAction(examId)` — recalculate after corrections

- [ ] **2.4** Create `src/modules/written-exams/written-exam-fetch-actions.ts`
  - Server-side data fetching functions for marks entry pages

- [ ] **2.5** Modify `src/validations/exam-schemas.ts`
  - Add `deliveryMode` field to `createExamSchema`
  - Add refinement: if WRITTEN → maxAttempts = 1, shuffleQuestions = false

- [ ] **2.6** Modify `src/modules/exams/exam-actions.ts`
  - `createExamAction`: Accept and persist `deliveryMode`
  - `publishExamAction`: Skip notification for WRITTEN exams

- [ ] **2.7** Modify `src/modules/exams/exam-queries.ts`
  - `getExamsForStudent`: Add `deliveryMode: 'ONLINE'` filter

- [ ] **2.8** Modify `src/modules/grading/grading-fetch-actions.ts`
  - Grading queue: Add `deliveryMode: 'ONLINE'` filter

### Acceptance Criteria
- All actions validate input via Zod schemas
- All actions check authorization (teacher owns exam)
- All actions verify `deliveryMode === 'WRITTEN'` before proceeding
- `initializeWrittenExamSessionsAction` is idempotent
- `bulkEnterWrittenMarksAction` handles partial failures gracefully
- `finalizeWrittenExamAction` blocks on incomplete entries
- Existing online exam flow is unaffected

---

## Phase 3: Exam Creation Modifications

### Tasks

- [ ] **3.1** Modify `src/modules/exams/components/create-exam-dialog.tsx`
  - Add delivery mode selector (toggle between ONLINE and WRITTEN)
  - Card-style selector with icons and descriptions
  - Conditionally hide/modify fields based on delivery mode:
    - WRITTEN: hide shuffle, maxAttempts; change duration label; show info banner
    - ONLINE: current behavior unchanged

- [ ] **3.2** Modify `src/modules/exams/components/create-exam-types.ts`
  - Update form type to include `deliveryMode`

- [ ] **3.3** Modify `src/modules/exams/components/exam-grid.tsx`
  - Add delivery mode badge (🖥️ Online / 📝 Written)
  - Change actions for WRITTEN exams: "Enter Marks" instead of session-related actions
  - Show entry progress (X/Y students complete) instead of session count

- [ ] **3.4** Add delivery mode badge component
  ```
  Components:
    - DeliveryModeBadge: { mode: 'ONLINE' | 'WRITTEN' } → visual badge
  ```

### Acceptance Criteria
- Creating an online exam works exactly as before
- Creating a written exam auto-sets correct defaults
- Exam list clearly distinguishes delivery modes
- Written exam cards show "Enter Marks" primary action

---

## Phase 4: Marks Entry — Per-Student View

### Tasks

- [ ] **4.1** Create page: `src/app/(dashboard)/teacher/exams/[examId]/marks/page.tsx`
  - Server component, fetches exam data
  - Verifies exam is WRITTEN and teacher owns it
  - Renders `MarksEntryPage` client component

- [ ] **4.2** Create `src/modules/written-exams/hooks/use-written-marks-store.ts`
  - Zustand store for marks entry state
  - View toggle, filter, search, sort
  - Dirty tracking for unsaved changes
  - Auto-save queue management

- [ ] **4.3** Create `src/modules/written-exams/hooks/use-written-marks-query.ts`
  - React Query hooks for fetching and invalidating marks data

- [ ] **4.4** Create `src/modules/written-exams/hooks/use-auto-save.ts`
  - Debounced auto-save hook
  - Flushes pending changes every 3 seconds
  - Shows save status indicator

- [ ] **4.5** Create `src/modules/written-exams/components/marks-entry-page.tsx`
  - Main container with header, view toggle, content area
  - Auto-initializes sessions on first load (calls `initializeWrittenExamSessionsAction`)

- [ ] **4.6** Create `src/modules/written-exams/components/marks-entry-header.tsx`
  - Exam title, class info, question count, total marks
  - 4 stat cards (Total, Completed, In Progress, Absent)
  - Progress bar
  - View toggle tabs
  - Student search input

- [ ] **4.7** Create `src/modules/written-exams/components/student-list-sidebar.tsx`
  - Scrollable student list with status icons
  - Running total per student
  - Filter and search
  - Click to select, keyboard navigation

- [ ] **4.8** Create `src/modules/written-exams/components/student-marks-form.tsx`
  - Student info header (name, roll number, class)
  - List of question inputs
  - Running total with percentage and grade
  - Save All, Mark Absent, Previous/Next buttons

- [ ] **4.9** Create `src/modules/written-exams/components/question-mark-input.tsx`
  - Question metadata (title, type badge, difficulty, max marks)
  - Number input with validation (0 to maxMarks)
  - Optional feedback textarea (collapsible)
  - Status indicator (✅ entered, ○ empty)

- [ ] **4.10** Create `src/modules/written-exams/components/per-student-view.tsx`
  - Container that composes sidebar + form
  - Responsive: side-by-side on desktop, stacked on mobile

- [ ] **4.11** Create `src/modules/written-exams/components/absent-dialog.tsx`
  - Confirmation dialog for marking absent
  - Shows warning about clearing entered marks

### Acceptance Criteria
- Teacher can navigate to marks entry page from exam list
- Sessions auto-initialize on first visit
- Teacher can enter marks for each question of each student
- Tab navigates between marks inputs
- Running total updates in real-time
- Mark absent works with confirmation
- Save persists to database
- Previous/Next navigation works
- Filter and search work in sidebar

---

## Phase 5: Marks Entry — Spreadsheet View

### Tasks

- [ ] **5.1** Create `src/modules/written-exams/components/spreadsheet-view.tsx`
  - Container for spreadsheet grid
  - Filter, sort controls
  - Auto-save toggle

- [ ] **5.2** Create `src/modules/written-exams/components/spreadsheet-marks-grid.tsx`
  - Virtualized table (tanstack-table or custom with react-virtual)
  - Sticky first column (student) + sticky header row
  - Cell-based editing with Tab/Enter navigation
  - Color-coded cells based on state
  - Auto-calculate total column

- [ ] **5.3** Create `src/modules/written-exams/components/spreadsheet-cell.tsx`
  - Compact editable number cell
  - Click to enter edit mode
  - Show "X/Y" in view mode, input in edit mode
  - Color: green (valid), red (over max), yellow (editing), gray (absent)

- [ ] **5.4** Create `src/modules/written-exams/components/spreadsheet-footer.tsx`
  - Class average, highest, lowest, pass rate
  - Real-time updates

- [ ] **5.5** Create `src/modules/written-exams/hooks/use-spreadsheet-keyboard.ts`
  - Keyboard navigation hook
  - Tab: next cell, Shift+Tab: prev cell
  - Enter: confirm & move down
  - Escape: cancel edit
  - A: toggle absent

- [ ] **5.6** Integrate auto-save with spreadsheet
  - Cell blur triggers debounced save
  - Batch save via `bulkEnterWrittenMarksAction`
  - Visual save indicator

### Acceptance Criteria
- Full grid renders with all students × all questions
- Tab navigation works fluidly between cells
- Auto-save fires on blur
- Total column auto-calculates
- Footer shows live class stats
- Marking absent grays out the row
- Color coding works correctly
- Virtualization handles large datasets (100+ students)

---

## Phase 6: Finalization & Results

### Tasks

- [ ] **6.1** Create `src/modules/written-exams/components/finalize-dialog.tsx`
  - Shows pre-finalization summary
  - Lists incomplete students (if any, blocks finalization)
  - Shows preview stats (highest, lowest, average, pass rate)
  - Confirm button calculates all results

- [ ] **6.2** Implement result ranking in `finalizeWrittenExamAction`
  - After all results calculated, rank by obtainedMarks DESC
  - Handle ties (same rank)
  - Update all ExamResult.rank values

- [ ] **6.3** Implement `refinalizeWrittenExamAction`
  - Recalculate individual results after marks correction
  - Rerank all students

- [ ] **6.4** Modify `src/modules/results/components/results-table.tsx`
  - Add delivery mode badge column
  - Add delivery mode filter

- [ ] **6.5** Modify result detail page components
  - For WRITTEN exams: hide "Your Answer" column
  - Show "Teacher Remarks" instead of "Feedback"
  - Show delivery mode badge in header

- [ ] **6.6** Test result publishing flow for written exams
  - Verify `publishedAt` works correctly
  - Verify `showResultAfter` policy works for written exams

### Acceptance Criteria
- Finalization blocked when students have incomplete entries
- Finalization calculates correct results for all students
- Ranks are correct (including ties)
- Re-finalization works after corrections
- Results table shows delivery mode
- Student result detail adapts for written mode
- Published results visible to students

---

## Phase 7: Analytics Adaptation

### Tasks

- [ ] **7.1** Modify `src/modules/results/components/exam-detailed-analytics.tsx`
  - Accept `deliveryMode` prop
  - Conditionally render time analytics section
  - Conditionally render anti-cheat section
  - Show all score/grade/question analytics for both modes

- [ ] **7.2** Modify analytics chart components
  - Time distribution chart: hide for WRITTEN
  - Anti-cheat section: hide for WRITTEN
  - MCQ option analysis: hide for WRITTEN (selectedOptionId is null)

- [ ] **7.3** Add marks entry audit section for WRITTEN analytics
  - Show `enteredById` teacher name
  - Show when marks were entered (timestamps)
  - Show finalization date

- [ ] **7.4** Modify student analytics (if timeline shows delivery mode)
  - Add `deliveryMode` badge to timeline items

### Acceptance Criteria
- Written exam analytics don't show time/anti-cheat sections
- All score-based analytics work correctly
- Per-question analysis shows correct stats
- MCQ option analysis hidden for written
- Audit information visible for written exams

---

## Phase 8: Student-Side Filtering

### Tasks

- [ ] **8.1** Verify student exam list filters out WRITTEN exams
  - Query already modified in Phase 2
  - Test that no written exams appear in student's "Available Exams"

- [ ] **8.2** Verify student results include WRITTEN exam results
  - Written exam results should appear in results list with 📝 badge

- [ ] **8.3** Modify student result detail view for WRITTEN exams
  - No "Your Answer" section
  - Show per-question marks and teacher remarks

- [ ] **8.4** Handle edge case: student dashboard stats
  - "Total exams" count should include written exams
  - "Average score" should include written exam scores

### Acceptance Criteria
- Students never see written exams in "take exam" section
- Students see written exam results in their results page
- Written result detail shows marks without answers
- Dashboard stats include both exam types

---

## Phase 9: Testing & Polish

### Tasks

- [ ] **9.1** End-to-end test: Create written exam → Enter marks → Finalize → View results
- [ ] **9.2** Test with edge cases:
  - All students absent
  - Single student in class
  - 100+ students (performance)
  - 50+ questions (grid usability)
  - Marks correction after finalization
  - Re-finalization with rank changes
- [ ] **9.3** Test concurrent access: Two teachers entering marks simultaneously
- [ ] **9.4** Test validation: Marks > max, negative marks, non-numeric input
- [ ] **9.5** Loading states for all new components
- [ ] **9.6** Error states and recovery for all new actions
- [ ] **9.7** Responsive testing (desktop, tablet, mobile)
- [ ] **9.8** Accessibility audit (keyboard nav, screen reader, contrast)
- [ ] **9.9** Performance profiling: Marks entry page with large datasets

### Acceptance Criteria
- All happy paths work
- All edge cases handled gracefully
- Performance acceptable with large datasets
- Responsive on all viewports
- Accessible to all users
- No regressions in online exam flow

---

## File Creation Summary

### New Files (16 files)

```
prisma/migrations/XXXXXXX_add_written_exam_support/migration.sql

src/validations/written-exam-schemas.ts

src/modules/written-exams/
├── written-exam-actions.ts
├── written-exam-queries.ts
├── written-exam-fetch-actions.ts
├── hooks/
│   ├── use-written-marks-store.ts
│   ├── use-written-marks-query.ts
│   ├── use-spreadsheet-keyboard.ts
│   └── use-auto-save.ts
└── components/
    ├── marks-entry-page.tsx
    ├── marks-entry-header.tsx
    ├── per-student-view.tsx
    ├── student-list-sidebar.tsx
    ├── student-marks-form.tsx
    ├── question-mark-input.tsx
    ├── spreadsheet-view.tsx
    ├── spreadsheet-marks-grid.tsx
    ├── spreadsheet-cell.tsx
    ├── spreadsheet-footer.tsx
    ├── finalize-dialog.tsx
    ├── absent-dialog.tsx
    └── index.ts

src/app/(dashboard)/teacher/exams/[examId]/marks/
├── page.tsx
└── loading.tsx
```

### Modified Files (12 files)

```
prisma/schema.prisma                           (add enum, fields)
src/validations/exam-schemas.ts                (add deliveryMode)
src/modules/exams/exam-actions.ts              (deliveryMode support)
src/modules/exams/exam-queries.ts              (student filter)
src/modules/exams/components/create-exam-dialog.tsx  (delivery mode selector)
src/modules/exams/components/create-exam-types.ts    (form types)
src/modules/exams/components/exam-grid.tsx            (badges + actions)
src/modules/grading/grading-fetch-actions.ts         (queue filter)
src/modules/results/components/results-table.tsx     (delivery mode column)
src/modules/results/components/exam-detailed-analytics.tsx  (conditional sections)
src/modules/sessions/components/student-dashboard-page-client.tsx  (filter)
src/lib/constants.ts                           (add written exam constants)
```

---

## Dependency Graph

```
Phase 1 (Schema)
    ↓
Phase 2 (Backend Actions + Queries)
    ↓
    ├── Phase 3 (Exam Creation Mods) — can parallel with Phase 4
    │
    ├── Phase 4 (Per-Student Marks Entry)
    │       ↓
    │   Phase 5 (Spreadsheet View) — depends on Phase 4 store
    │
    └── Phase 8 (Student Filtering) — can start after Phase 2
    
Phase 4 + Phase 5
    ↓
Phase 6 (Finalization & Results)
    ↓
Phase 7 (Analytics Adaptation)

All Phases
    ↓
Phase 9 (Testing & Polish)
```

**Parallelizable work:**
- Phase 3 + Phase 4 can be developed simultaneously (different files)
- Phase 7 + Phase 8 can be developed simultaneously after Phase 6
- Phase 5 can start once Phase 4's store is done (shares state management)
