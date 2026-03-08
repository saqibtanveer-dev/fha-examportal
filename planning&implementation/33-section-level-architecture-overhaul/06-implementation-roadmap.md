# 06 — Implementation Roadmap

## Overview

This is the phased implementation roadmap for the section-level architecture overhaul. Each phase is designed to be independently deployable and testable. Total: **6 phases across ~39 files**.

---

## PHASE 1: Foundation — Schema + Authorization Framework
**Priority: HIGHEST | Risk: HIGH | Dependencies: None**

### 1A: Database Schema Migration

| Task | File | Effort |
|------|------|--------|
| Add `sectionId` (nullable) to `TeacherSubject` | `prisma/schema.prisma` | Medium |
| Add `Section` relation + indexes | `prisma/schema.prisma` | Low |
| Run migration | `prisma/migrations/` | Low |
| Create data population script | `prisma/migrations/populate-teacher-subject-sections.ts` | High |
| Execute population + validate | — | Medium |
| Make `sectionId` REQUIRED | `prisma/schema.prisma` + migration | Low |

### 1B: Authorization Framework

| Task | File | Effort |
|------|------|--------|
| Create `AuthorizationError` class | `src/errors/authorization-error.ts` | Low |
| Create guard: `assertTeacherSubjectSectionAccess` | `src/lib/authorization-guards.ts` | Medium |
| Create guard: `assertTeacherSectionAccess` | `src/lib/authorization-guards.ts` | Medium |
| Create guard: `assertExamAccess` | `src/lib/authorization-guards.ts` | Medium |
| Create guard: `assertStudentDataAccess` | `src/lib/authorization-guards.ts` | Medium |
| Create guard: `assertGradingAccess` | `src/lib/authorization-guards.ts` | Medium |
| Create `QueryScope` type + builder | `src/lib/query-scope.ts` | Medium |
| Create teacher assignment cache | `src/lib/authorization-cache.ts` | Medium |
| Integrate `AuthorizationError` in `safe-action.ts` | `src/lib/safe-action.ts` | Low |

### 1C: Unit Tests for Guards

| Task | Effort |
|------|--------|
| Test `assertTeacherSubjectSectionAccess` | Medium |
| Test `assertTeacherSectionAccess` | Medium |
| Test `assertExamAccess` | Medium |
| Test `assertStudentDataAccess` | Medium |
| Test `assertGradingAccess` | Medium |

### Deliverables

- ✅ TeacherSubject has required sectionId with populated data
- ✅ All authorization guards implemented and tested
- ✅ QueryScope system ready for use
- ✅ No existing functionality broken (backward compatible)

---

## PHASE 2: Subject Assignment UI + Actions
**Priority: HIGH | Risk: MEDIUM | Dependencies: Phase 1**

### Tasks

| Task | File | Effort |
|------|------|--------|
| Update `assignTeacherToSubjectAction` — add sectionId | `src/modules/subjects/subject-actions.ts` | Medium |
| Update `bulkAssignTeacherSubjectsAction` — section-level keys | `src/modules/subjects/subject-actions.ts` | High |
| Update `removeTeacherFromSubjectAction` — targeted removal | `src/modules/subjects/subject-actions.ts` | Low |
| Update `getTeacherSubjects` query — include section | `src/modules/subjects/subject-queries.ts` | Low |
| Refactor `teacher-subject-assigner.tsx` — section checkboxes | `src/modules/users/components/teacher-subject-assigner.tsx` | High |
| Update reference actions — include section in teacher data | `src/modules/settings/reference-actions.ts` | Low |
| Update user table display — show sections | `src/modules/users/components/user-table.tsx` | Low |
| Update validation schemas | `src/validations/` | Low |

### Deliverables

- ✅ Admin can assign teachers to specific sections in UI
- ✅ TeacherSubject records correctly track section assignments
- ✅ UI shows section-level assignments
- ✅ Bulk assignment works at section level

---

## PHASE 3: Diary Module Fix
**Priority: HIGH | Risk: MEDIUM | Dependencies: Phase 2**

### Tasks

| Task | File | Effort |
|------|------|--------|
| Fix `verifyTeacherAssignment` — add sectionId check | `src/modules/diary/diary-mutation-actions.ts` | Low |
| Fix `createDiaryEntryAction` — pass sectionId to verification | `src/modules/diary/diary-mutation-actions.ts` | Low |
| Fix `updateDiaryEntryAction` — section verification | `src/modules/diary/diary-mutation-actions.ts` | Low |
| Fix `deleteDiaryEntryAction` — section verification | `src/modules/diary/diary-mutation-actions.ts` | Low |
| Update `getExpectedDiaryTeachers` — include section | `src/modules/diary/diary-queries.ts` | Medium |
| Update `getTeacherSubjectClasses` — direct section from assignment | `src/modules/diary/diary-queries.ts` | Medium |
| Update `getDiaryEntries` for teacher role — section scoping | `src/modules/diary/diary-queries.ts` | Medium |
| Fix `fetchDiaryEntriesAction` — section-level filtering for teacher | `src/modules/diary/diary-fetch-actions.ts` | Medium |
| Fix `fetchDiaryCoverageAction` — section-aware coverage | `src/modules/diary/diary-fetch-actions.ts` | Medium |
| Update diary copy actions — verify both sections | `src/modules/diary/diary-copy-actions.ts` | Low |
| Update diary UI components — section awareness in filters | `src/modules/diary/components/` | Medium |

### Deliverables

- ✅ Teacher can ONLY create/edit/delete diary for assigned sections
- ✅ Diary coverage stats are section-accurate
- ✅ Teacher sees only their assigned sections in diary filters
- ✅ Copy diary requires assignment for both sections

---

## PHASE 4: Exam + Grading + Written Exam Fix
**Priority: HIGH | Risk: HIGH | Dependencies: Phase 2**

### 4A: Exam Module

| Task | File | Effort |
|------|------|--------|
| Update `createExamAction` — require sectionId, validate assignment | `src/modules/exams/exam-actions.ts` | High |
| Update `listExams` — add authorization scoping | `src/modules/exams/exam-queries.ts` | High |
| Fix `getExamsForStudent` — remove null sectionId fallback | `src/modules/exams/exam-queries.ts` | Medium |
| Split `create-exam-dialog.tsx` — extract sub-components | `src/modules/exams/components/` | Medium |
| Create `exam-class-section-selector.tsx` | `src/modules/exams/components/` | Medium |
| Migrate `ExamClassAssignment` — make sectionId required | `prisma/schema.prisma` + migration | Medium |

### 4B: Grading Module

| Task | File | Effort |
|------|------|--------|
| Fix `autoGradeSessionAction` — section verification | `src/modules/grading/grading-actions.ts` | Medium |
| Fix `gradeAnswerAction` — section verification | `src/modules/grading/grading-actions.ts` | Medium |
| Fix `batchGradeAnswersAction` — section verification | `src/modules/grading/grading-actions.ts` | Medium |
| Fix `batchAutoGradeAction` — filter by section | `src/modules/grading/grading-actions.ts` | Medium |
| Fix `fetchGradingSessionDetailAction` — ownership check | `src/modules/grading/grading-fetch-actions.ts` | Medium |

### 4C: Written Exam Module

| Task | File | Effort |
|------|------|--------|
| Fix `initializeWrittenExamSessionsAction` — section filter | `src/modules/written-exams/written-exam-actions.ts` | High |
| Fix `enterWrittenMarksAction` — section verification | `src/modules/written-exams/written-exam-actions.ts` | Medium |
| Fix `fetchWrittenExamMarkEntryAction` — scope by section | `src/modules/written-exams/written-exam-fetch-actions.ts` | Medium |
| Fix `finalizeWrittenExamAction` — section-scoped | `src/modules/written-exams/written-exam-result-actions.ts` | High |
| Fix `refinalizeWrittenExamAction` — same | `src/modules/written-exams/written-exam-result-actions.ts` | Medium |
| Add scope param to `getWrittenExamMarkEntryData` | `src/modules/written-exams/written-exam-queries.ts` | Medium |

### Deliverables

- ✅ Exams assigned at section level (not class-wide)
- ✅ Teacher can only create exams for their sections
- ✅ Grading restricted to teacher's section students
- ✅ Written exam mark entry restricted to teacher's section students
- ✅ Finalization scoped to section

---

## PHASE 5: Results, Analytics, Attendance, Questions Fix
**Priority: MEDIUM | Risk: MEDIUM | Dependencies: Phase 4**

### 5A: Results Module

| Task | File | Effort |
|------|------|--------|
| Add scope to `getResultsByExam` | `src/modules/results/queries/result-core-queries.ts` | Medium |
| Add scope to analytics queries | `src/modules/results/queries/result-analytics-queries.ts` | Medium |
| Fix `result-fetch-actions.ts` — section scoping | `src/modules/results/result-fetch-actions.ts` | Medium |

### 5B: Analytics Module

| Task | File | Effort |
|------|------|--------|
| Add role check to all analytics queries | `src/modules/principal/queries/analytics-queries.ts` | Medium |
| Add role check to dashboard queries | `src/modules/principal/queries/dashboard-queries.ts` | Low |
| Add authorization to class detail | `src/modules/principal/queries/class-queries.ts` | Medium |
| Add authorization to student detail | `src/modules/principal/queries/student-queries.ts` | Medium |
| Add authorization to teacher detail | `src/modules/principal/queries/teacher-queries.ts` | Medium |
| Fix principal fetch actions — enforce role | `src/modules/principal/principal-fetch-actions.ts` | Low |

### 5C: Attendance Module

| Task | File | Effort |
|------|------|--------|
| Fix `fetchDailyAttendanceAction` — section auth | `src/modules/attendance/attendance-fetch-actions.ts` | Medium |
| Fix `fetchStudentsForMarkingAction` — section auth | `src/modules/attendance/attendance-fetch-actions.ts` | Low |
| Add `assertFamilyStudentAccess` to family attendance | `src/modules/attendance/attendance-fetch-actions.ts` | Low |

### 5D: Question Module

| Task | File | Effort |
|------|------|--------|
| Fix soft authorization check | `src/modules/questions/question-actions.ts` | Low |
| Add class-level enforcement | `src/modules/questions/question-actions.ts` | Low |

### Deliverables

- ✅ Results scoped by role and section
- ✅ Analytics only accessible by authorized roles
- ✅ Attendance fetching validates section access
- ✅ Question creation has hard authorization check

---

## PHASE 6: Code Quality + File Splits + Cleanup
**Priority: LOW | Risk: LOW | Dependencies: Phase 5**

### Tasks

| Task | File | Effort |
|------|------|--------|
| Split `session-actions.ts` (327 lines) into sub-files | `src/modules/sessions/` | Medium |
| Split `create-user-dialog.tsx` (302 lines) if still over | `src/modules/users/components/` | Low |
| Fix fragile error string matching in session actions | `src/modules/sessions/` | Low |
| Implement family attendance actions | `src/modules/family/family-attendance-actions.ts` | Medium |
| Fix N+1 queries in family dashboard | `src/modules/family/family-dashboard-actions.ts` | Medium |
| Add audit logging for authorization failures | `src/lib/authorization-guards.ts` | Low |
| Plan Prisma multi-file schema split | `prisma/schema/` | Medium |
| Remove backward-compatibility null-handling code | Various | Low |

### Deliverables

- ✅ No file exceeds 300 lines
- ✅ Error handling is robust (no string matching)
- ✅ Family module fully functional
- ✅ Audit trail for security events

---

## DEPENDENCY GRAPH

```
Phase 1 (Foundation)
  ├── Phase 2 (Subject Assignment)
  │   ├── Phase 3 (Diary)
  │   └── Phase 4 (Exams + Grading)
  │       └── Phase 5 (Results + Analytics + Attendance)
  │           └── Phase 6 (Cleanup)
  └── (Unit tests run continuously)
```

---

## RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| Data loss during migration | Backup before every phase, validate after |
| Breaking existing workflows | Deploy behind feature flag, test on staging |
| Performance degradation from auth checks | Cache teacher assignments, optimize queries |
| UI regression | Manual testing of all role dashboards after each phase |
| Migration script bugs | Run on staging data first, validate counts |

---

## IMPLEMENTATION RULES

1. **No file exceeds 300 lines** — Split before committing
2. **Every authorization guard has unit tests** — No exceptions
3. **Every action change has integration test** — No exceptions  
4. **Database validates after every migration** — SQL check scripts
5. **No backward-compatible null handling remains after Phase 6** — Clean code
6. **Every PR must include test coverage** — Guard + action + query tests
7. **Security first** — Authorization before features, always
8. **Audit every cross-section attempt** — Logging for security monitoring
9. **Cache invalidation tested** — Assignment changes propagate within 5 minutes
10. **Code review required** — Every phase reviewed by a second person

---

## SUCCESS CRITERIA

After all phases complete:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Stability | ≥ 9/10 | All tests pass, no data leakage |
| Reliability | ≥ 9/10 | Error handling, audit trails, rollback tested |
| Maintainability | ≥ 9/10 | No file > 300 lines, centralized auth, documented |
| Scalability | ≥ 9/10 | Cached auth, indexed queries, scoped data |
| Production Readiness | ≥ 9/10 | All authorization gaps closed, audit logging |
| Performance | ≥ 9/10 | Auth overhead < 15ms, no N+1 queries |
