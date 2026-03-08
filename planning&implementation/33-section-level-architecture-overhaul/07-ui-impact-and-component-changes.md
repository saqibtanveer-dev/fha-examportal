# 07 — UI Impact & Component Changes

## Overview

This document specifies all frontend component changes required for section-level support. Every UI that currently shows class-level data must be updated to show section-level granularity.

---

## 1. TEACHER SUBJECT ASSIGNER — Major Redesign

### Current Component: `src/modules/users/components/teacher-subject-assigner.tsx`

**Current UX Flow:**
```
[Subject Group Card]
  ☑️ Chemistry — Grade 9
  ☐ Chemistry — Grade 10
  ☑️ Physics — Grade 9
```

**New UX Flow:**
```
[Subject Group Card]
  Chemistry
    Grade 9
      ☑️ Section A    ☑️ Section B    ☐ Section C
      [Select All Sections]
    Grade 10
      ☐ Section A    ☐ Section B
  Physics
    Grade 9
      ☑️ Section A    ☑️ Section B    ☑️ Section C
      [Select All Sections] ← Already all selected
```

### Component Breakdown (New Structure)

```
TeacherSubjectAssigner (~120 lines)
├── SubjectDepartmentGroup (~60 lines)
│   ├── SubjectClassRow (~50 lines)
│   │   ├── SectionCheckboxGroup (~40 lines)
│   │   │   ├── Checkbox per section
│   │   │   └── SelectAllToggle
│   │   └── ClassLabel
│   └── SubjectLabel
├── CurrentAssignmentsBadges (~40 lines)
│   └── Badge: "Chemistry → Grade 9 → Section A"
└── SaveButton + Dialog
```

### Data Flow

```typescript
// Current selection key format
type OldKey = `${subjectId}:${classId}`;

// New selection key format
type NewKey = `${subjectId}:${classId}:${sectionId}`;

// Current assignment shape
interface OldAssignment {
  subjectId: string;
  classId: string;
  subject: { name: string };
  class: { name: string };
}

// New assignment shape
interface NewAssignment {
  subjectId: string;
  classId: string;
  sectionId: string;
  subject: { name: string };
  class: { name: string };
  section: { name: string };
}
```

### Badge Display Change

```
Current: "Chemistry — Grade 9"
New:     "Chemistry — 9A" (compact format)
         or expanded: "Chemistry — Grade 9 — Section A"
```

---

## 2. CREATE EXAM DIALOG — Split + Section Selector

### Current: `src/modules/exams/components/create-exam-dialog.tsx` (307 lines)

### New File Structure

```
src/modules/exams/components/
├── create-exam-dialog.tsx           (~120 lines) — Dialog shell + form orchestration
├── exam-basic-info-form.tsx         (~80 lines)  — Title, type, subject, duration, marks
├── exam-class-section-selector.tsx  (~80 lines)  — Class + section multi-select (NEW)
└── exam-settings-form.tsx           (~60 lines)  — Shuffle, show results, attempts
```

### New Section Selector Component

```
ExamClassSectionSelector
├── ClassAccordion (per class)
│   ├── ClassHeader: "Grade 9" + section count badge
│   ├── SectionCheckbox: "☑️ Section A"
│   ├── SectionCheckbox: "☐ Section B"
│   └── SelectAllSections toggle
└── SelectedSummary: "3 sections selected across 2 classes"
```

### Filtering by Teacher Assignment

For TEACHER role, the selector only shows sections where they have TeacherSubject assignments:

```typescript
// Teacher creates Chemistry exam → only sees their assigned sections
// TeacherSubject records: Chemistry → Grade 9 → Section A, Section C
// Selector shows:
//   Grade 9
//     ☑️ Section A  (available)
//     ☐ Section C  (available)
//     — Section B  (disabled, not assigned)
```

For ADMIN role, all sections are available.

---

## 3. DIARY COMPONENTS — Section-Aware Filtering

### Affected Components

| Component | Change |
|-----------|--------|
| `diary-filters.tsx` | Section filter auto-populated from teacher assignments |
| `diary-entry-form.tsx` | Section dropdown only shows assigned sections |
| `diary-coverage-matrix.tsx` | Show per-section coverage status |
| `diary-missing-list.tsx` | Missing entries per section, not per class |
| `diary-stats-cards.tsx` | Stats per section |
| `diary-today-summary.tsx` | Summary per section |

### Diary Filters Component

**Current:**
```
Filters: [Subject ▼] [Class ▼] [Date ▼]
```

**New:**
```
Filters: [Subject ▼] [Class ▼] [Section ▼] [Date ▼]
```

Section dropdown auto-populates based on:
- TEACHER: only assigned sections
- PRINCIPAL/ADMIN: all sections of selected class

### Diary Entry Form

**Current:**
```
Subject: [Chemistry ▼]
Class:   [Grade 9 ▼]
Section: [Section A ▼]    ← Shows ALL sections of the class
Date:    [2026-03-08]
Title:   [____________]
Content: [____________]
```

**New:**
```
Subject: [Chemistry ▼]
Class:   [Grade 9 ▼]
Section: [Section A ▼]    ← Shows ONLY assigned sections for this subject+class
Date:    [2026-03-08]
Title:   [____________]
Content: [____________]
```

### Diary Coverage Matrix

**Current:**
```
                  | Chemistry | Physics | Math
Grade 9          |   ✅      |   ❌    |  ✅
Grade 10         |   ✅      |   ✅    |  ❌
```

**New:**
```
                  | Chemistry      | Physics        | Math
Grade 9 - Sec A  | ✅ Ma'am Laiba | ❌ Missing     | ✅ Sir Ahmed
Grade 9 - Sec B  | ✅ Ma'am Zainab| ✅ Sir Ali     | ✅ Sir Ahmed
Grade 9 - Sec C  | ❌ Missing     | ✅ Sir Ali     | ✅ Ma'am Sara
```

---

## 4. ATTENDANCE COMPONENTS — Section Filter Fix

### Affected Components

| Component | Change |
|-----------|--------|
| `attendance-filters.tsx` | Add section authorization check |
| `daily-attendance-marker.tsx` | Pre-select teacher's assigned section |
| `subject-attendance-marker.tsx` | Filter to teacher's assigned section |

### Teacher View Enhancement

**Current:** Teacher selects class → sees all sections
**New:** Teacher selects class → sees only their assigned sections

```typescript
// Attendance filter behavior for TEACHER
const availableSections = teacherAssignments
  .filter(a => a.classId === selectedClassId)
  .map(a => a.section);
// Only these sections are selectable
```

---

## 5. GRADING INTERFACE — Section Scoping

### Affected Components

| Component | Change |
|-----------|--------|
| `grading-interface.tsx` | Filter student list by teacher's section |
| `grading-sub-components.tsx` | Show section badge per student |

### Student List in Grading

**Current:** Shows all students who took the exam
**New:** Shows only students in teacher's assigned sections

```
Grading Interface:
  Students (Section A - 25 students):
    [ ] Ahmed Ali — Section A — Not Graded
    [ ] Fatima Khan — Section A — Not Graded
    ...
  
  (Students in Section B not shown for this teacher)
```

---

## 6. WRITTEN EXAM COMPONENTS — Section Scoping

### Affected Components

| Component | Change |
|-----------|--------|
| `marks-entry-page-client.tsx` | Section filter for mark entry |
| `spreadsheet-view.tsx` | Show section column |
| `student-list-sidebar.tsx` | Filter by teacher's section |
| `per-student-view.tsx` | Section badge |

### Spreadsheet View

**Current:**
```
| Roll # | Student Name  | Q1 | Q2 | Q3 | Total |
|--------|---------------|----|----|----| ------|
| 001    | Ahmed Ali     |  8 | 15 | 12 |   35  |
| 002    | Fatima Khan   |  9 | 14 | 10 |   33  |
```

**New:**
```
| Section | Roll # | Student Name  | Q1 | Q2 | Q3 | Total |
|---------|--------|---------------|----|----|----| ------|
| A       | 001    | Ahmed Ali     |  8 | 15 | 12 |   35  |
| A       | 002    | Fatima Khan   |  9 | 14 | 10 |   33  |

[Section B students not shown - not your assignment]
```

---

## 7. RESULTS COMPONENTS — Section Awareness

### Affected Components

| Component | Change |
|-----------|--------|
| `results-table.tsx` | Add section column, filter by role |
| `analytics-charts.tsx` | Section-level analytics |
| `exam-detailed-analytics.tsx` | Per-section breakdown |
| `student-results-page-client.tsx` | Section badge |

### Results Table Enhancement

**Current:** Shows all students across all assigned classes
**New (Teacher):** Shows only students in their sections
**New (Principal):** Shows all with section column

```
| Section | Student       | Marks | Grade | Rank |
|---------|---------------|-------|-------|------|
| A       | Ahmed Ali     | 85/100| A     | 1    |
| A       | Fatima Khan   | 82/100| A     | 2    |
| A       | Zainab Bukhari| 78/100| B+    | 3    |
```

### Analytics Section Breakdown

```
Section-wise Performance:
  Section A: Avg 78%, Pass Rate 92%
  Section B: Avg 72%, Pass Rate 85%
  Section C: Avg 81%, Pass Rate 95%
```

---

## 8. PRINCIPAL DASHBOARD — Section Drill-Down

### Affected Components

| Component | Change |
|-----------|--------|
| `classes-tab.tsx` | Section-level performance cards |
| `teachers-tab.tsx` | Show teacher's section assignments |
| `students-tab.tsx` | Section filter in student list |
| `overview-tab.tsx` | Section distribution in overview |

### Class Detail Enhancement

**Current:**
```
Grade 9 — 75 students — Avg: 76%
  Subjects: Chemistry, Physics, Math, English, Urdu
```

**New:**
```
Grade 9 — 75 students total
  Section A — 25 students — Avg: 78%
    Chemistry: Ma'am Laiba | Physics: Sir Ali | ...
  Section B — 25 students — Avg: 72%
    Chemistry: Ma'am Zainab | Physics: Sir Ali | ...
  Section C — 25 students — Avg: 81%
    Chemistry: Ma'am Laiba | Physics: Sir Bilal | ...
```

---

## 9. FAMILY PORTAL — Section Badge

### Affected Components

| Component | Change |
|-----------|--------|
| `child-selector.tsx` | Show section next to child name |
| `child-stats-card.tsx` | Show section badge |
| `family-diary-client.tsx` | Section label on diary entries |

### Child Display

**Current:** "Ahmed Ali — Grade 9"
**New:** "Ahmed Ali — Grade 9, Section A"

---

## 10. SHARED COMPONENTS — New Utilities

### New Component: Section Badge

```typescript
// src/components/shared/section-badge.tsx
// A small badge showing "Sec A" or "Section A"
<SectionBadge section={section} compact />
// Renders: <Badge variant="outline">A</Badge>
```

### New Component: Class Section Selector (Reusable)

```typescript
// src/components/shared/class-section-selector.tsx
// Used in: ExamCreation, DiaryFilters, AttendanceFilters
<ClassSectionSelector
  classes={classes}
  selected={selectedSections}
  onChange={setSelectedSections}
  scope={teacherAssignments}  // Optional: limits available sections
/>
```

### Updated Component: Page Header

```typescript
// Add section info to page headers where applicable
<PageHeader 
  title="Chemistry Diary"
  subtitle="Grade 9 — Section A"  // NEW: Section context
/>
```

---

## 11. UI IMPLEMENTATION NOTES

### State Management

No new stores needed. Section data flows through:
1. Server action returns section info in data
2. Client component receives + renders
3. Filters use local state (already pattern)

### Responsive Design

Section selector on mobile:
- Collapse section checkboxes into a multi-select dropdown
- Show section badges as compact "A", "B", "C" instead of "Section A"

### Performance

- Section data is lightweight (id + name)
- No additional API calls needed (TeacherSubject already includes section)
- Filter operations are client-side (no server round-trips for UI filtering)

---

## 12. COMPONENT CHANGE SUMMARY

| Component Area | Files Changed | New Files | Total |
|----------------|--------------|-----------|-------|
| Subject Assignment | 2 | 2 sub-components | 4 |
| Exam Creation | 1 | 3 sub-components | 4 |
| Diary | 6 | 0 | 6 |
| Attendance | 3 | 0 | 3 |
| Grading | 2 | 0 | 2 |
| Written Exam | 4 | 0 | 4 |
| Results | 4 | 0 | 4 |
| Principal Dashboard | 5 | 0 | 5 |
| Family Portal | 3 | 0 | 3 |
| Shared | 0 | 2 new components | 2 |
| **TOTAL** | **30** | **7** | **37** |
