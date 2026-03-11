# 06 — Implementation Roadmap

> **Date**: 2026-03-11
> **Depends On**: All previous documents (00–05)
> **Total Phases**: 6
> **Total Files**: 44 (33 changed + 11 new)

---

## PHASE OVERVIEW

```
Phase 1 ──┐
  Schema   │ Foundation Layer (no UI change, backward compatible)
  + Helpers│
───────────┘
Phase 2 ──┐
  Enrollment│ Elective enrollment management
  Management│
───────────┘
Phase 3 ──┐
  Timetable│ Timetable elective support
  Rewrite  │
───────────┘
Phase 4 ──┐
  Attendance│ Enrollment-aware attendance
  + Exam   │
───────────┘
Phase 5 ──┐
  Results  │ Report cards, analytics, diary
  + Diary  │
───────────┘
Phase 6 ──┐
  Family   │ Family portal + integrity checks
  + Polish │
───────────┘
```

---

## PHASE 1: FOUNDATION (Schema + Shared Helpers)

### Objective
Add database models and shared utility layer. Zero UI changes. Everything backward compatible.

### Tasks

| # | Task | Files | Risk |
|---|------|-------|------|
| 1.1 | Add `ElectiveSlotGroup` model to schema | `schema.prisma` | LOW — new table |
| 1.2 | Add `isElectiveSlot` + `electiveSlotGroupId` to `TimetableEntry` | `schema.prisma` | LOW — optional fields with defaults |
| 1.3 | Change `TimetableEntry` unique constraint | `schema.prisma` | MEDIUM — must verify no duplicates first |
| 1.4 | Create migration + run validation SQL | `prisma/migrations/` | LOW |
| 1.5 | Create shared `enrollment-helpers.ts` | `src/lib/enrollment-helpers.ts` | LOW — new file |
| 1.6 | Enhance `enrollment-queries.ts` with new functions | `src/modules/subjects/enrollment-queries.ts` | LOW — additive |
| 1.7 | Add enrollment validation schemas | `src/validations/enrollment-schemas.ts` | LOW — new file |

### Pre-Migration Validation

```sql
-- Run BEFORE Phase 1.3:
-- Verify no duplicate entries exist that would violate new constraint
SELECT "classId", "sectionId", "subjectId", "periodSlotId", "dayOfWeek", "academicSessionId", COUNT(*)
FROM "TimetableEntry"
GROUP BY "classId", "sectionId", "subjectId", "periodSlotId", "dayOfWeek", "academicSessionId"
HAVING COUNT(*) > 1;
-- MUST return 0 rows
```

### Success Criteria
- [  ] Migration runs without errors
- [  ] All existing timetable entries have `isElectiveSlot = false`
- [  ] `enrollment-helpers.ts` functions pass unit tests
- [  ] Existing UI works without changes (backward compat)

---

## PHASE 2: ENROLLMENT MANAGEMENT

### Objective
Admin can configure elective groups and assign students to subjects.

### Tasks

| # | Task | Files | Risk |
|---|------|-------|------|
| 2.1 | Add elective conflict validation to `enrollStudentInSubjectAction` | `enrollment-actions.ts` | MEDIUM — validation logic |
| 2.2 | Add `bulkEnrollByElectiveGroup` action | `enrollment-actions.ts` | LOW |
| 2.3 | Create `elective-enrollment-manager.tsx` component | NEW file | LOW — new page |
| 2.4 | Create `elective-group-card.tsx` component | NEW file | LOW |
| 2.5 | Create `student-enrollment-table.tsx` component | NEW file | LOW |
| 2.6 | Create `use-enrollment.ts` hook | NEW file | LOW |
| 2.7 | Add `/admin/subjects/elective-enrollment` page | App router page | LOW |
| 2.8 | Add unassigned student warning to admin dashboard | Dashboard widget | LOW |

### Dependency
Must complete Phase 1 first (schema + helpers).

### Success Criteria
- [  ] Admin can view elective groups for any class
- [  ] Admin can assign students to elective subjects
- [  ] System prevents double-enrollment in same group
- [  ] System shows unassigned students warning
- [  ] Bulk enrollment works for 60+ students
- [  ] Mobile layout works at 375px

---

## PHASE 3: TIMETABLE ELECTIVE SUPPORT

### Objective
Timetable grid supports multi-entry elective cells. Admin can create elective time blocks.

### Tasks

| # | Task | Files | Risk |
|---|------|-------|------|
| 3.1 | Update `timetable.types.ts` with new cell types | `timetable.types.ts` | LOW |
| 3.2 | Update `timetable.utils.ts` grid builder | `timetable.utils.ts` | MEDIUM — core logic change |
| 3.3 | Update `timetable-queries.ts` with group queries | `timetable-queries.ts` | LOW — additive |
| 3.4 | Create `elective-slot-actions.ts` | NEW file | MEDIUM — new action layer |
| 3.5 | Update `timetable-entry-actions.ts` for elective flow | `timetable-entry-actions.ts` | HIGH — modifies existing create/delete |
| 3.6 | Create `elective-slot-cell.tsx` component | NEW file | LOW |
| 3.7 | Update `timetable-grid.tsx` for multi-entry cells | `timetable-grid.tsx` | MEDIUM — render logic change |
| 3.8 | Update `timetable-entry-form.tsx` for elective detection | `timetable-entry-form.tsx` | MEDIUM |
| 3.9 | Create `elective-group-manager.tsx` (timetable context) | NEW file | LOW |
| 3.10 | Update `timetable-fetch-actions.ts` | `timetable-fetch-actions.ts` | LOW |
| 3.11 | Update `use-timetable.ts` hook | `use-timetable.ts` | LOW |
| 3.12 | Add room conflict validation | `timetable-entry-actions.ts` | LOW |
| 3.13 | Add student personal timetable (enrollment-filtered) | `timetable-queries.ts` | LOW |

### Dependency
Must complete Phase 2 (enrollment data must exist for validation).

### Success Criteria
- [  ] Admin can create elective time block with 2-4 parallel subjects
- [  ] Timetable grid shows stacked elective cells
- [  ] Non-elective periods work exactly as before
- [  ] Student sees only their enrolled subject
- [  ] Teacher schedule unaffected
- [  ] Room conflict detection works
- [  ] Mobile layout renders correctly

---

## PHASE 4: ATTENDANCE + EXAM (ENROLLMENT-AWARE)

### Objective
Attendance marking and exam sessions respect elective enrollment.

### Tasks

| # | Task | Files | Risk |
|---|------|-------|------|
| 4.1 | Update `subject-attendance-actions.ts` with enrollment check | `subject-attendance-actions.ts` | MEDIUM |
| 4.2 | Create `enrollment-aware-students.ts` helper | NEW file | LOW |
| 4.3 | Update `subject-attendance-form.tsx` student list | `subject-attendance-form.tsx` | MEDIUM |
| 4.4 | Update `attendance.utils.ts` percentage calculation | `attendance.utils.ts` | LOW |
| 4.5 | Update `attendance-queries.ts` with enrollment filter | `attendance-queries.ts` | LOW |
| 4.6 | Update exam session creation for enrollment filtering | `session-actions.ts` or equivalent | MEDIUM |
| 4.7 | Update create exam dialog with enrollment info | `create-exam-dialog.tsx` | LOW |
| 4.8 | Update written exam session initialization | Written exam module | MEDIUM |
| 4.9 | Update written exam marks entry student list | Written exam module | LOW |
| 4.10 | Update exam queries for enrollment | `exam-queries.ts` | LOW |

### Dependency
Must complete Phase 2 (enrollment data) and Phase 3 (timetable knows about electives).

### Success Criteria
- [  ] Bio teacher sees only 20 Bio students for attendance (not 45 section students)
- [  ] CS teacher sees only 15 CS students
- [  ] Bio exam creates sessions only for enrolled students
- [  ] Written exam marks entry shows only enrolled students
- [  ] Non-elective subjects still show all section students
- [  ] Attendance percentages use correct denominators

---

## PHASE 5: RESULTS, ANALYTICS, DIARY

### Objective
Results, report cards, analytics, and diary all respect elective enrollment.

### Tasks

| # | Task | Files | Risk |
|---|------|-------|------|
| 5.1 | Update result computation for enrollment-aware averages | `result-computation.ts` | MEDIUM |
| 5.2 | Create `report-card-builder.ts` | NEW file | LOW |
| 5.3 | Update result export with compulsory/elective sections | `result-export.ts` | MEDIUM |
| 5.4 | Update analytics dashboard | Analytics module | LOW |
| 5.5 | Update grading batch logic | `grading-actions.ts` | LOW |
| 5.6 | Update grading review UI | `grade-review.tsx` | LOW |
| 5.7 | Update diary queries for student filtering | `diary-queries.ts` | LOW |
| 5.8 | Update diary read receipts expected count | Diary module | LOW |

### Dependency
Must complete Phase 4 (attendance and exam data must exist correctly).

### Success Criteria
- [  ] Per-subject averages use only enrolled students
- [  ] Report card shows compulsory vs elective sections
- [  ] Diary for Bio only shows to Bio students
- [  ] Analytics dashboard enrollment-aware
- [  ] Grade review filters by enrollment

---

## PHASE 6: FAMILY PORTAL + DATA INTEGRITY + POLISH

### Objective
Family portal shows correct data. Automated integrity checks. Final polish.

### Tasks

| # | Task | Files | Risk |
|---|------|-------|------|
| 6.1 | Update `family-queries.ts` for child's subjects | `family-queries.ts` | LOW |
| 6.2 | Update family attendance view | Family module | LOW |
| 6.3 | Update family diary feed | Family module | LOW |
| 6.4 | Build admin data integrity checker | New admin page/action | LOW |
| 6.5 | Add orphaned student detection | Integrity checks | LOW |
| 6.6 | Add double-enrollment detection | Integrity checks | LOW |
| 6.7 | Add timetable-enrollment mismatch detection | Integrity checks | LOW |
| 6.8 | Add elective overview widget to admin dashboard | Dashboard | LOW |
| 6.9 | Mobile testing pass (all new UI at 375px) | All components | LOW |
| 6.10 | Performance testing with 1000 student seed | Seed script | MEDIUM |

### Dependency
Can partially start after Phase 4 for integrity checks.

### Success Criteria
- [  ] Parent sees only child's enrolled subjects
- [  ] Integrity checker runs and reports issues
- [  ] Admin dashboard shows elective overview
- [  ] All UIs responsive at 375px
- [  ] Performance targets met at 1000 students

---

## DEPENDENCY GRAPH

```
Phase 1 (Foundation)
   │
   ├──▶ Phase 2 (Enrollment Management)
   │       │
   │       ├──▶ Phase 3 (Timetable)
   │       │       │
   │       │       ├──▶ Phase 4 (Attendance + Exam)
   │       │       │       │
   │       │       │       ├──▶ Phase 5 (Results + Diary)
   │       │       │       │       │
   │       │       │       │       └──▶ Phase 6 (Family + Polish)
   │       │       │
   │       │       └──▶ Phase 6 (partial: integrity checks)
```

---

## RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Unique constraint change breaks existing data | LOW | HIGH | Run validation SQL before migration |
| Grid render performance with stacked cells | MEDIUM | MEDIUM | Virtual scroll, lazy render of expanded cells |
| Enrollment not configured → all modules break | HIGH | HIGH | Backward compat: if no enrollments, show all students |
| Teacher confusion on new UI | MEDIUM | LOW | Progressive disclosure, tooltips, help text |
| Admin forgets to enroll students | HIGH | MEDIUM | Dashboard warning widget, integrity checker |

---

## ROLLBACK STRATEGY

### Phase-Level Rollback

Each phase can be rolled back independently:

1. **Phase 1**: Drop new table, remove new columns (nullable → safe)
2. **Phase 2**: Remove enrollment UI page, keep enrollment data
3. **Phase 3**: Revert timetable grid to single-entry mode, ignore elective flags
4. **Phase 4**: Remove enrollment checks in attendance/exam (fall back to all students)
5. **Phase 5**: Remove enrollment filters in results/diary
6. **Phase 6**: Remove integrity checker, family portal filters

### Feature Flag Option

If needed, implement feature flag: `ENABLE_ELECTIVE_SYSTEM = true/false`
- When `false`: all modules behave as they do today
- When `true`: enrollment-aware logic activates
- One central check in `enrollment-helpers.ts` → controls all modules

---

## TESTING CHECKLIST (PER PHASE)

### Unit Tests
- [  ] Enrollment conflict validation
- [  ] Elective group detection
- [  ] Grid builder with multi-entry cells
- [  ] Attendance student list filtering
- [  ] Report card data builder

### Integration Tests
- [  ] Create elective slot → verify DB state
- [  ] Enroll student → verify conflict detection
- [  ] Mark attendance → verify only enrolled students
- [  ] Create exam → verify only enrolled students get sessions
- [  ] Student timetable → verify enrollment filtering

### E2E Tests
- [  ] Admin: configure electives → enroll students → create timetable → verify grid
- [  ] Teacher: mark attendance for elective period → verify student list
- [  ] Student: view personal timetable → verify correct subjects
- [  ] Parent: view child subjects → verify enrollment-filtered view

### Performance Tests
- [  ] Enrollment query at 1000 students: < 20ms
- [  ] Timetable grid with 5 elective periods: < 200ms
- [  ] Attendance batch save (60 students): < 100ms
- [  ] Result computation for 200 students: < 500ms
