# 03 — Module-by-Module Impact & Fix Plan

> **Date**: 2026-03-11
> **Depends On**: `01-database-schema-design.md`, `02-timetable-enrollment-architecture.md`
> **Scope**: Every module that needs changes, file by file

---

## 1. MODULE CHANGE MATRIX

| Module | Files Changed | Files Added | Severity | Effort |
|--------|:------------:|:-----------:|----------|--------|
| Timetable | 8 | 3 | 🔴 CRITICAL | Large |
| Subjects/Enrollment | 3 | 4 | 🔴 CRITICAL | Large |
| Attendance | 4 | 1 | 🔴 CRITICAL | Medium |
| Exam | 3 | 0 | 🟡 HIGH | Medium |
| Written Exam | 3 | 0 | 🟡 HIGH | Medium |
| Grading | 2 | 0 | 🟡 HIGH | Small |
| Results | 3 | 1 | 🟡 HIGH | Medium |
| Diary | 2 | 0 | 🟡 HIGH | Small |
| Family | 3 | 0 | 🟡 HIGH | Small |
| Validations | 2 | 1 | 🟡 HIGH | Small |
| **TOTAL** | **33** | **10** | | |

---

## 2. TIMETABLE MODULE — 8 Changed, 3 New

### Changed Files

#### `timetable.types.ts`
- Add `ElectiveSlotGroup` type
- Change `TimetableGridCell` from single entry to discriminated union
- Add `ElectiveCellData` type with entries array
- Add `isElectiveSlot` and `electiveSlotGroupId` to entry types

#### `timetable.utils.ts`
- Modify `buildTimetableGrid()` to handle multi-entry elective cells
- Add `groupEntriesBySlot()` function to separate regular vs elective
- Add `buildElectiveCell()` helper

#### `timetable-queries.ts`
- Modify `getWeeklyTimetable()` to include `electiveSlotGroup` relation
- Add `getElectiveSlotGroups()` query
- Add `getStudentPersonalTimetable()` that filters by enrollment
- Modify teacher timetable query to include `isElectiveSlot` flag

#### `timetable-entry-actions.ts`
- Modify `createTimetableEntryAction` to handle elective flow
  - Check if subject is elective → create/find ElectiveSlotGroup
  - Validate: no mixing elective + non-elective in same period
  - Add room conflict check
- Modify `deleteTimetableEntryAction` to clean up empty ElectiveSlotGroups
- Add `createElectiveSlotGroupAction`
- Add `removeElectiveEntryAction`

#### `timetable-fetch-actions.ts`
- Add `fetchElectiveSlotGroups` action
- Add `fetchStudentTimetable` action (enrollment-filtered)

#### `components/timetable-grid.tsx`
- Handle new cell types in grid rendering
- Regular cells: existing behavior
- Elective cells: render stacked subject cards with color coding
- Mobile: render as expandable accordion

#### `components/timetable-entry-form.tsx`
- Add "Is Elective Slot" detection (auto-detect from SubjectClassLink)
- When adding to an existing elective group, show existing entries
- Room field with conflict validation

#### `hooks/use-timetable.ts`
- Update to handle new grid cell types
- Add elective group state management

### New Files

#### `components/elective-slot-cell.tsx` (NEW)
- Renders a timetable cell with multiple stacked entries
- Color-coded subject cards
- Click to expand/manage individual entries
- Badge showing student count per subject

#### `components/elective-group-manager.tsx` (NEW)
- Modal/dialog to manage an entire elective slot group
- Add/remove subjects from the group
- View student distribution
- Quick links to enrollment management

#### `elective-slot-actions.ts` (NEW)
- `createElectiveSlotGroup` — create group + first entry
- `addEntryToElectiveGroup` — add parallel subject
- `removeEntryFromElectiveGroup` — remove subject (with validation)
- `deleteElectiveSlotGroup` — remove entire group (with cascade check)

---

## 3. SUBJECTS/ENROLLMENT MODULE — 3 Changed, 4 New

### Changed Files

#### `enrollment-actions.ts`
- Add elective group conflict validation in `enrollStudentInSubjectAction`
- Add `validateElectiveGroupConflict()` check before enrollment
- Add `bulkEnrollByElectiveGroup` action — assign students to entire group at once

#### `enrollment-queries.ts`
- Add `getElectiveGroupsForClass()` — returns groups with subject counts
- Add `getUnassignedStudentsForElectiveGroup()` — students without enrollment
- Add `getStudentsForSubjectInSection()` — enrollment-filtered by section
- Add `validateStudentElectiveConflict()` — check if student already enrolled in competing subject

#### `subject-queries.ts`
- Add `getSubjectsForStudent()` — compulsory + enrolled electives
- Add `getElectiveSubjectIdsForClass()` — quick lookup Set

### New Files

#### `components/elective-enrollment-manager.tsx` (NEW)
- Full-page or large modal component
- Shows elective groups for a class
- Per-section student assignment tables
- Drag-and-drop or checkbox-based assignment
- Real-time conflict detection
- Shows unassigned student warnings

#### `components/elective-group-card.tsx` (NEW)
- Card showing one elective group
- Subject names with student count badges
- Progress bar: "35/45 students assigned"
- Click to open enrollment manager

#### `components/student-enrollment-table.tsx` (NEW)
- Table of students with their current elective choice
- Columns: Roll No, Name, Section, Current Elective, [Change]
- Filters: By section, by assigned/unassigned
- Bulk select + assign

#### `hooks/use-enrollment.ts` (NEW)
- React hook for enrollment state
- Manages optimistic updates for enrollment changes
- Handles conflict error state

---

## 4. ATTENDANCE MODULE — 4 Changed, 1 New

### Changed Files

#### `subject-attendance-actions.ts`
- Add enrollment check before accepting attendance records
- If subject is elective, validate each `studentProfileId` is enrolled
- Reject records for non-enrolled students with clear error

#### `attendance-queries.ts`
- Modify `getSubjectAttendanceForSection()` to accept enrollment filter
- Add `getEnrollmentAwareStudentList()` — returns correct student list
- Student attendance summary: only count subjects student is enrolled in

#### `components/subject-attendance-form.tsx`
- Use enrollment-aware student list for elective subjects
- Show "Elective: Biology (20 students)" header instead of "Section 11-A (45 students)"
- Non-elective subjects: existing behavior (all section students)

#### `attendance.utils.ts`
- `calculateAttendancePercentage()` — use enrollment-aware denominator
- `getExpectedAttendanceDays()` — only count days where subject was scheduled

### New Files

#### `helpers/enrollment-aware-students.ts` (NEW)
- Shared helper used by attendance, exam, diary, grading
- `getStudentsForSubject(subjectId, classId, sectionId, sessionId)` → StudentProfile[]
- If elective → returns enrolled students only
- If compulsory → returns all section students
- Cached per request (React cache or simple memoization)

---

## 5. EXAM MODULE — 3 Changed

### Changed Files

#### `exam session creation logic`
- When creating sessions for an exam:
  - Check if exam subject is elective
  - If yes: create sessions ONLY for enrolled students
  - If no: create sessions for all section students

#### `create-exam-dialog.tsx`
- When subject is selected and it's elective:
  - Show "This exam will be assigned to X enrolled students" info
  - Don't show section-wide student count

#### `exam-queries.ts`
- Student exam list: filter by enrollment for elective subjects
- Admin exam overview: show "(Elective)" badge next to subject name

---

## 6. WRITTEN EXAM MODULE — 3 Changed

### Changed Files

#### `session initialization`
- Same pattern as online exam: enrollment-aware session creation
- Only create `ExamSession` for enrolled students

#### `marks entry UI`
- Student list for marks entry: enrollment-filtered
- Show "20 students (Biology)" not "45 students (Section 11-A)"

#### `result computation`
- Pass/fail/percentage: only includes enrolled students
- Section averages: per-subject average only counts enrolled students

---

## 7. GRADING MODULE — 2 Changed

### Changed Files

#### `batch grading logic`
- When auto-grading: only grade sessions for enrolled students
- Skip sessions that shouldn't exist (if they were created before enrollment system)

#### `grade review UI`
- Show enrollment status badge on grade review cards
- Filter option: "Show only enrolled students"

---

## 8. RESULTS MODULE — 3 Changed, 1 New

### Changed Files

#### `result computation logic`
- Per-subject averages: only enrolled students
- Overall section average: weighted by actual subjects per student
- Class ranking: based on subjects each student actually takes

#### `result export`
- Report card template: separate compulsory vs elective sections
- Show elective group name
- Don't show N/A for subjects student never took

#### `result analytics dashboard`
- Subject performance charts: enrollment-aware
- Section comparison: enrollment-aware

### New Files

#### `helpers/report-card-builder.ts` (NEW)
- Builds report card data structure with:
  - Compulsory subjects section
  - Elective subjects section (grouped by electiveGroupName)
  - Overall marks/percentage/grade
  - Enrollment-aware rankings

---

## 9. DIARY MODULE — 2 Changed

### Changed Files

#### `diary-queries.ts`
- Student diary feed: filter by enrollment for elective subjects
- `getDiariesForStudent()` → only show diaries for enrolled subjects

#### `diary read receipt logic`
- Expected read count: only enrolled students
- Coverage percentage: enrolled students as denominator

---

## 10. FAMILY MODULE — 3 Changed

### Changed Files

#### `family-queries.ts`
- `getChildSubjects()` → returns compulsory + enrolled electives
- `getChildAttendance()` → filtered by enrolled subjects
- `getChildDiaries()` → filtered by enrolled subjects

---

## 11. VALIDATIONS — 2 Changed, 1 New

### Changed Files

#### `timetable-schemas.ts`
- Add `isElectiveSlot: z.boolean().optional()`
- Add `electiveSlotGroupId: z.string().uuid().optional()`
- Update create schema to handle elective flow

#### `attendance-schemas.ts`
- No schema changes needed (validation moves to action layer)

### New Files

#### `enrollment-schemas.ts` (NEW)
- `enrollStudentSchema` — enhanced with conflict check field
- `bulkEnrollByGroupSchema` — for group-level enrollment
- `validateEnrollmentSchema` — dry-run validation

---

## 12. SHARED UTILITIES — 1 New

### New Files

#### `src/lib/enrollment-helpers.ts` (NEW)
- Central enrollment utility used across ALL modules
- `isSubjectElectiveForClass(subjectId, classId)` → boolean
- `getEnrolledStudentsForSubject(subjectId, classId, sectionId, sessionId)` → StudentProfile[]
- `getStudentElectiveSubjects(studentProfileId, sessionId)` → Subject[]
- `isStudentEnrolledInSubject(studentProfileId, subjectId, sessionId)` → boolean
- Implements request-level caching to avoid repeated DB queries

---

## 13. TOTAL FILE COUNT SUMMARY

| Category | Changed | New | Total |
|----------|:-------:|:---:|:-----:|
| Timetable | 8 | 3 | 11 |
| Subjects/Enrollment | 3 | 4 | 7 |
| Attendance | 4 | 1 | 5 |
| Exam | 3 | 0 | 3 |
| Written Exam | 3 | 0 | 3 |
| Grading | 2 | 0 | 2 |
| Results | 3 | 1 | 4 |
| Diary | 2 | 0 | 2 |
| Family | 3 | 0 | 3 |
| Validations | 2 | 1 | 3 |
| Shared Utilities | 0 | 1 | 1 |
| **TOTAL** | **33** | **11** | **44** |

---

## 14. FILE SIZE ENFORCEMENT

Every new/changed file MUST stay under 300 lines. Strategy:

| Large Logic | Split Into |
|-------------|-----------|
| Timetable grid (currently ~250 lines) | `timetable-grid.tsx` + `elective-slot-cell.tsx` |
| Enrollment manager | `elective-enrollment-manager.tsx` + `student-enrollment-table.tsx` + `elective-group-card.tsx` |
| Enrollment actions | `enrollment-actions.ts` (existing) + `enrollment-validation.ts` (new) |
| Report card builder | `report-card-builder.ts` (new, isolated) |
| Shared enrollment helpers | `enrollment-helpers.ts` (new, <100 lines) |
