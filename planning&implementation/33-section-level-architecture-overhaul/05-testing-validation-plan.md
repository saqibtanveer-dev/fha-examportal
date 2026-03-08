# 05 — Testing & Validation Plan

## Overview

This document defines the testing strategy to validate that section-level architecture changes work correctly, don't introduce regressions, and meet the stability/reliability targets (9/10).

---

## 1. TESTING STRATEGY

### Test Pyramid

```
                    ┌──────────┐
                    │   E2E    │  ← 5-10 critical flows
                   ┌┴──────────┴┐
                   │ Integration │  ← 30-40 authorization scenarios
                  ┌┴────────────┴┐
                  │  Unit Tests   │  ← 50+ guard functions, utils
                 ┌┴──────────────┴┐
                 │ DB Validation   │  ← SQL integrity checks
                 └────────────────┘
```

---

## 2. UNIT TESTS

### 2.1 Authorization Guards

**File**: `src/lib/__tests__/authorization-guards.test.ts`

```
Test Suite: assertTeacherSubjectSectionAccess
  ✅ allows teacher with valid (subject, class, section) assignment
  ✅ rejects teacher with valid (subject, class) but WRONG section
  ✅ rejects teacher with valid (subject, section) but WRONG class
  ✅ rejects teacher with NO assignments at all
  ✅ rejects non-teacher users

Test Suite: assertTeacherSectionAccess
  ✅ allows class teacher of the section
  ✅ allows subject teacher assigned to the section
  ✅ rejects teacher not assigned to the section (neither class teacher nor subject teacher)
  ✅ allows if teacher is BOTH class teacher and subject teacher

Test Suite: assertExamAccess
  ✅ ADMIN can access any exam
  ✅ PRINCIPAL can access any exam
  ✅ TEACHER who created exam can access it
  ✅ TEACHER assigned to exam's section can access it
  ✅ TEACHER not assigned to exam's section CANNOT access
  ✅ STUDENT in assigned section can access
  ✅ STUDENT in different section CANNOT access
  ✅ throws NotFoundError for non-existent exam

Test Suite: assertStudentDataAccess
  ✅ ADMIN can view any student
  ✅ PRINCIPAL can view any student
  ✅ TEACHER assigned to student's section can view
  ✅ TEACHER NOT assigned to student's section CANNOT view
  ✅ FAMILY with linked student can view
  ✅ FAMILY without link to student CANNOT view
  ✅ STUDENT can view own data only

Test Suite: assertGradingAccess
  ✅ allows exam creator to grade if student is in their section
  ✅ rejects exam creator if student is NOT in their section
  ✅ allows ADMIN to grade any session
  ✅ rejects TEACHER who didn't create exam
```

### 2.2 Query Scope Builder

**File**: `src/lib/__tests__/query-scope.test.ts`

```
Test Suite: buildQueryScope
  ✅ returns admin scope for ADMIN role
  ✅ returns principal scope for PRINCIPAL role
  ✅ returns teacher scope with teacherProfileId
  ✅ returns student scope with classId and sectionId
  ✅ returns family scope with linked children's sections
  ✅ throws for inactive user
```

---

## 3. INTEGRATION TESTS

### 3.1 TeacherSubject Assignment (with sections)

```
Test Suite: TeacherSubject CRUD
  ✅ creates assignment with sectionId
  ✅ rejects assignment without sectionId
  ✅ allows same teacher for same subject in different sections
  ✅ rejects duplicate (teacher, subject, class, section)
  ✅ bulk assign creates section-level records
  ✅ bulk assign removes unselected section assignments
  ✅ removal of single section doesn't affect other sections
```

### 3.2 Diary Authorization

```
Test Suite: Diary Creation Authorization
  ✅ teacher can create diary for assigned (subject, class, section)
  ✅ teacher CANNOT create diary for unassigned section
  ✅ teacher A (section A) cannot create diary for section B
  ✅ teacher B (section B) cannot create diary for section A
  ✅ admin can create diary for ANY section
  ✅ diary coverage correctly shows per-section status
  ✅ getExpectedDiaryTeachers returns section-level assignments
  ✅ copy diary between sections requires both section assignments
```

### 3.3 Exam Section Scoping

```
Test Suite: Exam Section Scoping
  ✅ exam created for section A is NOT visible to section B students
  ✅ exam created for sections A and C visible to both
  ✅ exam MUST have at least one section (no class-wide)
  ✅ teacher can only assign exam to their sections
  ✅ listExams for teacher only returns their section exams + created exams
  ✅ student getExamsForStudent returns only their section's exams
```

### 3.4 Grading Authorization

```
Test Suite: Grading Section Access
  ✅ teacher can grade student in their section
  ✅ teacher CANNOT grade student in other section
  ✅ batch grading filters to teacher's section students
  ✅ admin can grade any student
  ✅ fetchGradingSession verifies teacher → student section match
```

### 3.5 Written Exam Authorization

```
Test Suite: Written Exam Section Access
  ✅ initialize sessions creates only for assigned sections
  ✅ mark entry validates student in teacher's section
  ✅ finalize only processes students in teacher's sections
  ✅ mark entry data only returns teacher's section students
  ✅ admin can process all sections
```

### 3.6 Attendance Authorization

```
Test Suite: Attendance Fetch Authorization
  ✅ teacher can only fetch attendance for their sections
  ✅ fetchDailyAttendance validates section assignment
  ✅ fetchStudentsForMarking validates section assignment
  ✅ family attendance requires assertFamilyStudentAccess
```

### 3.7 Results & Analytics Scoping

```
Test Suite: Results Scoping
  ✅ teacher sees results only for their section students
  ✅ admin sees all results
  ✅ student sees only own results
  ✅ family sees only linked children's results

Test Suite: Analytics Authorization
  ✅ principal analytics queries are admin/principal only
  ✅ class detail requires admin/principal role
  ✅ student detail requires proper authorization
  ✅ top/bottom students only visible to admin/principal
```

### 3.8 Cross-Section Attack Vectors

```
Test Suite: Security — Cross-Section Data Leakage
  ✅ teacher A fetching section B attendance → REJECTED
  ✅ teacher A fetching section B diary → REJECTED
  ✅ teacher A grading section B student → REJECTED
  ✅ teacher A viewing section B exam results → REJECTED
  ✅ student A viewing section B exam list → EMPTY
  ✅ family accessing non-linked child → REJECTED
  ✅ teacher with NO assignments creating question → REJECTED
```

---

## 4. DATABASE VALIDATION TESTS

### 4.1 Referential Integrity

```sql
-- Run after EVERY migration phase

-- 1. All TeacherSubject.sectionId references valid Section
SELECT ts.id FROM "TeacherSubject" ts
LEFT JOIN "Section" s ON s.id = ts."sectionId"
WHERE s.id IS NULL AND ts."sectionId" IS NOT NULL;
-- Must return 0 rows

-- 2. Section belongs to correct Class
SELECT ts.id FROM "TeacherSubject" ts
JOIN "Section" s ON s.id = ts."sectionId"
WHERE s."classId" != ts."classId";
-- Must return 0 rows

-- 3. No orphaned TeacherSubject (teacher still exists)
SELECT ts.id FROM "TeacherSubject" ts
LEFT JOIN "TeacherProfile" tp ON tp.id = ts."teacherId"
WHERE tp.id IS NULL;
-- Must return 0 rows

-- 4. ExamClassAssignment section integrity
SELECT eca.id FROM "ExamClassAssignment" eca
JOIN "Section" s ON s.id = eca."sectionId"
WHERE s."classId" != eca."classId";
-- Must return 0 rows
```

### 4.2 Business Logic Integrity

```sql
-- 1. TimetableEntry teacher matches TeacherSubject
SELECT te.id, te."teacherProfileId", te."subjectId", te."classId", te."sectionId"
FROM "TimetableEntry" te
LEFT JOIN "TeacherSubject" ts ON 
  ts."teacherId" = te."teacherProfileId"
  AND ts."subjectId" = te."subjectId"
  AND ts."classId" = te."classId"
  AND ts."sectionId" = te."sectionId"
WHERE ts.id IS NULL AND te."isActive" = true;
-- Should be 0 (timetable entries should have matching assignment)

-- 2. DiaryEntry teacher has assignment for that section
SELECT de.id, de."teacherProfileId", de."subjectId", de."classId", de."sectionId"
FROM "DiaryEntry" de
LEFT JOIN "TeacherSubject" ts ON 
  ts."teacherId" = de."teacherProfileId"
  AND ts."subjectId" = de."subjectId"
  AND ts."classId" = de."classId"
  AND ts."sectionId" = de."sectionId"
WHERE ts.id IS NULL AND de."deletedAt" IS NULL
  AND de."createdAt" > '2026-03-08';  -- Only check new entries
-- Future entries should match
```

---

## 5. E2E TEST SCENARIOS

### 5.1 Complete Flow: Section-Aware Diary

```
Scenario: Two teachers, same subject, different sections
  Given: Ma'am Laiba teaches Chemistry in Grade 9, Section A
  And: Ma'am Zainab teaches Chemistry in Grade 9, Section B
  
  When: Ma'am Laiba creates diary for Chemistry, Grade 9, Section A
  Then: Section A students see the diary ✅
  And: Section B students do NOT see it ✅
  
  When: Ma'am Zainab creates diary for Chemistry, Grade 9, Section B
  Then: Section B students see the diary ✅
  And: Section A students do NOT see it ✅
  
  When: Ma'am Laiba tries to create diary for Section B
  Then: System rejects with "not assigned to this section" ✅
  
  When: Principal views diary coverage
  Then: Shows Section A: ✅ Laiba submitted, Section B: ✅ Zainab submitted ✅
```

### 5.2 Complete Flow: Section-Aware Exam

```
Scenario: Teacher creates exam for their section only
  Given: Teacher X teaches Physics in Grade 10, Section A only
  
  When: Teacher X creates an exam for Physics
  Then: Can select Section A ✅
  And: CANNOT see/select Section B or C ✅
  
  When: Exam is published
  Then: Section A students see exam ✅
  And: Section B students do NOT see exam ✅
  
  When: Teacher X views grading
  Then: Only sees Section A students ✅
```

### 5.3 Complete Flow: Admin Assigns Teacher to Sections

```
Scenario: Admin manages teacher-subject-section assignments
  Given: Admin opens teacher profile editor
  
  When: Admin selects subjects for teacher
  Then: UI shows section checkboxes per class ✅
  
  When: Admin assigns Chemistry → Grade 9 → Sections A, C
  Then: Teacher has 2 TeacherSubject records ✅
  And: Teacher can create diary for A and C only ✅
  And: Teacher can create exams for A and C only ✅
```

---

## 6. PERFORMANCE TESTS

### 6.1 Authorization Overhead

```
Benchmark: assertTeacherSubjectSectionAccess
  Target: < 5ms per call (single DB query)
  Test: 1000 calls with varying inputs
  
Benchmark: assertExamAccess
  Target: < 10ms per call (2 DB queries max)
  Test: 500 calls with varying roles/exams

Benchmark: buildQueryScope
  Target: < 15ms per call
  Test: 200 calls with teacher scope (requires teacher assignment fetch)
```

### 6.2 Authorization Caching

```
Benchmark: getTeacherAssignments (cached)
  First call: < 10ms (DB query)
  Subsequent calls: < 1ms (cache hit)
  After 5 minutes: < 10ms (cache expired, new DB query)
```

### 6.3 Query Performance with Section Filtering

```
Benchmark: listExams with section scope
  Target: < 100ms for teacher with 5 section assignments
  
Benchmark: getResultsByExam with section scope
  Target: < 200ms for exam with 200 students across 4 sections

Benchmark: getDiaryEntries with section scope
  Target: < 50ms for single section, single day
```

---

## 7. REGRESSION TESTS

### 7.1 Existing Workflows Must Not Break

```
✅ Admin can still manage classes and sections
✅ Admin can still create users with all roles
✅ Student can still start and submit online exams
✅ Teacher can still create questions
✅ Principal dashboard still shows correct totals
✅ Family portal still shows correct child data
✅ Timetable creation still works
✅ Daily attendance marking still works
✅ Datesheet creation still works
✅ Notifications still delivered correctly
✅ Year transition / promotion still works
✅ Admission system unaffected
```

### 7.2 Specific Regression Checks

```
✅ Exam creation does NOT break for exams assigned to all sections
✅ Diary entry is NOT blocked for teachers who teach all sections
✅ Attendance history before migration is still visible
✅ Old exam results (from before migration) still accessible
✅ Teacher dashboard shows correct subject/class/section count
✅ Principal analytics numbers match pre-migration (no data loss)
```

---

## 8. TEST DATA SETUP

### 8.1 Test Fixtures Required

```typescript
// Fixture: School with section-level teacher assignments
const testSchool = {
  classes: [
    {
      name: "Grade 9", grade: 9,
      sections: [
        { name: "A", classTeacher: "teacher1" },
        { name: "B", classTeacher: "teacher2" },
        { name: "C", classTeacher: "teacher3" }
      ]
    },
    {
      name: "Grade 10", grade: 10,
      sections: [
        { name: "A", classTeacher: "teacher4" },
        { name: "B", classTeacher: "teacher5" }
      ]
    }
  ],
  teacherAssignments: [
    // Same subject, different teachers per section
    { teacher: "teacher1", subject: "Chemistry", class: "Grade 9", section: "A" },
    { teacher: "teacher6", subject: "Chemistry", class: "Grade 9", section: "B" },
    { teacher: "teacher1", subject: "Chemistry", class: "Grade 9", section: "C" },
    
    // Same teacher across multiple sections
    { teacher: "teacher2", subject: "Physics", class: "Grade 9", section: "A" },
    { teacher: "teacher2", subject: "Physics", class: "Grade 9", section: "B" },
    
    // One teacher per section exclusive
    { teacher: "teacher7", subject: "Urdu", class: "Grade 9", section: "A" },
    { teacher: "teacher8", subject: "Urdu", class: "Grade 9", section: "B" },
    { teacher: "teacher9", subject: "Urdu", class: "Grade 9", section: "C" }
  ],
  students: [
    // 5 students per section for testing
    { section: "Grade 9 A", count: 5 },
    { section: "Grade 9 B", count: 5 },
    { section: "Grade 9 C", count: 5 },
    { section: "Grade 10 A", count: 5 },
    { section: "Grade 10 B", count: 5 }
  ]
};
```

---

## 9. ACCEPTANCE CRITERIA

### Stability Target: 9/10

| Criterion | Weight | Pass Condition |
|-----------|--------|----------------|
| All unit tests pass | 20% | 100% pass rate |
| All integration tests pass | 30% | 100% pass rate |
| No cross-section data leakage | 20% | 0 leakage scenarios |
| Authorization overhead < 15ms | 10% | P99 < 15ms |
| No regression in existing flows | 15% | All regression tests pass |
| Database integrity checks pass | 5% | All SQL checks return 0 |

### Reliability Target: 9/10

| Criterion | Weight | Pass Condition |
|-----------|--------|----------------|
| Error handling for auth failures | 25% | Graceful error messages, no crashes |
| Migration rollback tested | 25% | Rollback script verified on staging |
| Cache invalidation works | 20% | Assignment changes reflected in < 5min |
| Concurrent access safe | 15% | No race conditions in grading/marking |
| Audit trail complete | 15% | All auth failures logged |
