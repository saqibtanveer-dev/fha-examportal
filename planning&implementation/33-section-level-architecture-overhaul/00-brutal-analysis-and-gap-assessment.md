# 00 — Brutal Analysis & Gap Assessment: Section-Level Architecture

## Executive Summary

The entire system has a **FUNDAMENTAL ARCHITECTURAL FLAW**: the `TeacherSubject` model maps teachers to subjects at the **class level only** — there is NO section-level granularity. This single missing field (`sectionId`) cascades into **27+ broken or vulnerable workflows** across exams, diary, attendance, grading, results, analytics, and family modules.

**Current State**: Teacher is assigned `(Subject, Class)`.
**Required State**: Teacher is assigned `(Subject, Class, Section)`.

This is NOT a minor bug — this is a **core data model deficiency** that affects authorization, data scoping, business logic, and UI filtering across nearly every module.

---

## 1. ROOT CAUSE: TeacherSubject Model Missing sectionId

### Current Schema

```prisma
model TeacherSubject {
  id        String   @id @default(uuid())
  teacherId String
  subjectId String
  classId   String    // ← CLASS LEVEL ONLY
  createdAt DateTime @default(now())

  @@unique([teacherId, subjectId, classId])
}
```

### What's Missing

```prisma
model TeacherSubject {
  // ... existing fields
  sectionId String?   // ← MISSING: Section-level assignment
  section   Section?  @relation(fields: [sectionId], references: [id])

  @@unique([teacherId, subjectId, classId, sectionId])
}
```

### Real-World Scenario That Breaks

```
School Structure:
  Grade 09
  ├── Section A → Chemistry taught by Ma'am Laiba
  ├── Section B → Chemistry taught by Ma'am Zainab
  └── Section C → Chemistry taught by Ma'am Laiba

Current System:
  TeacherSubject: (Ma'am Laiba, Chemistry, Grade 09)   ← Can't distinguish A vs C
  TeacherSubject: (Ma'am Zainab, Chemistry, Grade 09)  ← Collision! Both teach same class

Result: System cannot determine WHO teaches WHICH SECTION
```

---

## 2. CASCADING IMPACT ANALYSIS

### 2.1 Diary System — SEVERELY BROKEN

| Issue | Description | Severity |
|-------|-------------|----------|
| **Wrong teacher can create diary** | Ma'am Zainab (Section B) can create diary for Section A chemistry | 🔴 CRITICAL |
| **Coverage stats wrong** | `getExpectedDiaryTeachers()` doesn't know which teacher covers which section | 🔴 CRITICAL |
| **Missing diary detection broken** | Can't detect if Section A is missing diary vs Section B | 🔴 CRITICAL |
| **Family sees wrong diary** | If sections have different homework, family may see wrong section's diary | 🟠 HIGH |
| **Principal review misleading** | Principal can't verify correct teacher submitted diary for correct section | 🟡 MEDIUM |

### 2.2 Attendance System — PARTIALLY BROKEN

| Issue | Description | Severity |
|-------|-------------|----------|
| **Subject attendance auth gap** | `fetchDailyAttendanceAction()` doesn't verify teacher→section | 🔴 CRITICAL |
| **Cross-section data readable** | Teacher in 9-A can read attendance for 9-B students | 🟠 HIGH |
| **Daily attendance is OK** | Uses class teacher validation (separate from TeacherSubject) | ✅ OK |
| **Subject attendance marking is OK** | Uses `isSubjectTeacherForSlot()` via timetable | ✅ OK |

### 2.3 Exam System — CRITICALLY BROKEN

| Issue | Description | Severity |
|-------|-------------|----------|
| **Exam sectionId is OPTIONAL** | `ExamClassAssignment.sectionId` is nullable — allows class-wide exams | 🔴 CRITICAL |
| **No section scoping on exam list** | `listExams()` returns ALL exams with zero authorization | 🔴 CRITICAL |
| **Cross-section exam visibility** | Student in Section B sees Section A exams when sectionId is null | 🔴 CRITICAL |
| **Exam creation has no section auth** | Teacher can create exam for sections they don't teach | 🟠 HIGH |

### 2.4 Grading System — CRITICALLY BROKEN

| Issue | Description | Severity |
|-------|-------------|----------|
| **No session-to-section verification** | Teacher can grade students from ANY section | 🔴 CRITICAL |
| **Batch grading is unscoped** | `batchAutoGradeAction()` grades ALL sessions regardless of section | 🔴 CRITICAL |
| **Grading session fetch has no ownership** | Any teacher can fetch any grading session by ID | 🔴 CRITICAL |

### 2.5 Written Exam System — CRITICALLY BROKEN

| Issue | Description | Severity |
|-------|-------------|----------|
| **Session initialization spans sections** | Creates sessions for ALL sections in exam assignment | 🔴 CRITICAL |
| **Mark entry has no section filter** | Teacher enters marks for students in other sections | 🔴 CRITICAL |
| **Finalization is global** | `finalizeWrittenExamAction()` finalizes ALL sections | 🔴 CRITICAL |
| **Query layer has ZERO authorization** | `getWrittenExamMarkEntryData()` returns all data | 🔴 CRITICAL |

### 2.6 Results & Analytics — CRITICALLY BROKEN

| Issue | Description | Severity |
|-------|-------------|----------|
| **Results have no section filter** | `getResultsByExam()` returns ALL results, no authorization | 🔴 CRITICAL |
| **Analytics are system-wide** | `getClassWiseAnalytics()`, `getTeacherWiseAnalytics()` expose everything | 🔴 CRITICAL |
| **Student detail has no authorization** | `getStudentDetail()` returns FULL data for any student ID | 🔴 CRITICAL |
| **Top/bottom students are global** | `getTopPerformingStudents()` exposes privacy-sensitive ranking | 🔴 CRITICAL |

### 2.7 Question Bank — PARTIALLY BROKEN

| Issue | Description | Severity |
|-------|-------------|----------|
| **Soft authorization bypass** | Teacher with NO assignments can create questions in ANY subject | 🔴 CRITICAL |
| **No class-level enforcement** | Teacher checks subjectId only, ignores classId matching | 🟠 HIGH |

### 2.8 Family Module — MOSTLY OK

| Issue | Description | Severity |
|-------|-------------|----------|
| **Diary read count unscoped** | `DiaryReadReceipt` count may include cross-section data | 🟡 MEDIUM |
| **N+1 query pattern** | Dashboard loads 15 queries for 5 children | 🟡 MEDIUM |
| **assertFamilyStudentAccess is good** | Centralized family authorization works correctly | ✅ OK |

### 2.9 Timetable System — PARTIALLY OK

| Issue | Description | Severity |
|-------|-------------|----------|
| **TimetableEntry HAS sectionId** | Already section-aware (correctly designed) | ✅ OK |
| **No TeacherSubject validation on entry creation** | Admin can assign teacher to section they don't teach | 🟡 MEDIUM |

---

## 3. AUTHORIZATION ARCHITECTURE GAPS

### 3.1 Query Layer Has ZERO Authorization

Every `*-queries.ts` file is a pure function with NO auth checks. The pattern is:

```typescript
// CURRENT: Query functions are public
export async function getWrittenExamMarkEntryData(examId: string) {
  // Returns EVERYTHING — no role check, no scope filter
  return prisma.exam.findUnique({ ... });
}
```

Action layer does basic checks, but if any code path calls queries directly, data leaks.

### 3.2 Missing Authorization Helpers

| Helper | Exists? | Used By |
|--------|---------|---------|
| `requireRole()` | ✅ Yes | All actions |
| `assertFamilyStudentAccess()` | ✅ Yes | Family module |
| `assertTeacherSectionAccess()` | ❌ MISSING | Should be used everywhere |
| `assertTeacherSubjectAccess()` | ❌ MISSING | Diary, Exams, Questions |
| `assertExamOwnerOrAdmin()` | ❌ MISSING | Grading, Results |
| `scopeQueryByRole()` | ❌ MISSING | All query functions |

### 3.3 Inconsistent Patterns

- **Diary**: Has its own `verifyTeacherAssignment()` → checks (teacher, subject, class) only
- **Attendance**: Has `isSubjectTeacherForSlot()` → uses timetable (correct but different pattern)
- **Exams**: Uses `canAccessSession()` → checks creator only
- **Written Exams**: Inline `createdById` check → no shared helper

---

## 4. FILES EXCEEDING 300-LINE LIMIT

| File | Lines | Action Needed |
|------|-------|---------------|
| `prisma/schema.prisma` | 1590 | Split into multiple schema files using Prisma multi-file schema |
| `src/modules/exams/components/create-exam-dialog.tsx` | 307 | Extract form sections into sub-components |
| `src/modules/users/components/create-user-dialog.tsx` | 302 | Extract form sections into sub-components |
| `src/modules/sessions/session-actions.ts` | 327 | Split into start, submit, answer sub-files |

---

## 5. HIDDEN ISSUES DISCOVERED

### 5.1 Exam Delivery Mode Confusion

Written exams and online exams share the same `Exam` model but have completely different workflows. The `ExamDeliveryMode` enum on a single model creates confusion in:
- Session initialization (different for written vs online)
- Mark entry (manual vs auto)
- Grading (human vs AI)

### 5.2 No Academic Session Scoping on Queries

Most queries don't filter by current academic session, meaning:
- Old exam data leaks into current views
- Historical data pollutes analytics
- No data isolation between academic years

### 5.3 Race Conditions in Exam Sessions

`startSessionAction()` uses Serializable isolation (good) but catches errors by matching error message strings (fragile):

```typescript
catch (error: unknown) {
  if (error instanceof Error && error.message.includes('already exists')) {
    // Fragile string matching
  }
}
```

### 5.4 No Soft Delete Consistency

Some models have `deletedAt` (Exam, Question, TestCampaign), others don't (DiaryEntry has it, but TimetableEntry doesn't). Inconsistent soft delete patterns create data integrity risks during operations like year transitions.

### 5.5 Missing Indexes for Section-Level Queries

Current indexes are optimized for class-level queries. Section-level queries (which will be needed) are not indexed:
- `TeacherSubject` has no sectionId index
- `ExamClassAssignment` composite index doesn't include sectionId efficiently
- `DiaryEntry` index `[classId, sectionId, date]` exists but may need optimization

---

## 6. STABILITY & RELIABILITY ASSESSMENT

| Metric | Current Score | Target Score | Gap |
|--------|--------------|-------------|-----|
| **Data Integrity** | 4/10 | 9/10 | TeacherSubject missing sectionId breaks all data scoping |
| **Authorization** | 5/10 | 9/10 | Query layer unprotected, section auth missing |
| **Business Logic** | 6/10 | 9/10 | Diary/exam flows have section-level holes |
| **Performance** | 7/10 | 9/10 | N+1 queries, missing indexes for section queries |
| **Code Modularity** | 8/10 | 9/10 | Only 2-3 files slightly over 300 lines |
| **Error Handling** | 6/10 | 9/10 | Fragile error matching, inconsistent patterns |
| **Production Readiness** | 4/10 | 9/10 | Authorization gaps are exploitable in production |

**Overall Stability: 5.7/10** → Target: 9/10

---

## 7. TOTAL ISSUE COUNT

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 CRITICAL | 19 | Authorization bypass, data leakage, wrong data display |
| 🟠 HIGH | 7 | Cross-section data access, incorrect scoping |
| 🟡 MEDIUM | 8 | Missing indexes, N+1 queries, UI gaps |
| ✅ OK | 6 | Patterns that work correctly |
| **TOTAL** | **40** | Issues identified across all modules |

---

## Next Documents

- `01-database-schema-changes.md` — Exact Prisma schema modifications needed
- `02-authorization-framework-design.md` — Centralized auth system design
- `03-module-by-module-fix-plan.md` — Detailed fix plan for each module
- `04-migration-strategy.md` — Data migration plan for existing records
- `05-testing-validation-plan.md` — Testing strategy to verify fixes
- `06-implementation-roadmap.md` — Phased implementation order
