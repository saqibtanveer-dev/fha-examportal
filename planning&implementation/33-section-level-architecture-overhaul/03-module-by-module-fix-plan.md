# 03 — Module-by-Module Fix Plan

## Overview

This document specifies the EXACT changes needed in each module to support section-level teacher-subject assignments. Each module section includes: files affected, current behavior, required behavior, and specific code changes.

---

## 1. SUBJECTS MODULE — TeacherSubject Assignment

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/subjects/subject-actions.ts` | ~245 | Major refactor |
| `src/modules/subjects/subject-queries.ts` | ~75 | Minor update |
| `src/modules/users/components/teacher-subject-assigner.tsx` | ~145 | Major refactor |

### 1.1 subject-actions.ts Changes

**`assignTeacherToSubjectAction`**
- Current: Accepts `{ teacherId, subjectId, classId }`
- New: Accepts `{ teacherId, subjectId, classId, sectionId }`
- Unique check: `teacherId_subjectId_classId_sectionId`

**`bulkAssignTeacherSubjectsAction`**
- Current: Uses `subjectId:classId` as composite key
- New: Uses `subjectId:classId:sectionId` as composite key
- Delete/create logic updated for section level
- Comparison set changes from 2-part to 3-part key

**`removeTeacherFromSubjectAction`**
- Current: Deletes ALL classes for teacher+subject
- New: Accepts optional `classId` + `sectionId` for targeted removal
- Default behavior: remove only specified section assignment

### 1.2 teacher-subject-assigner.tsx Changes

**Current UI Flow:**
```
1. Show subjects grouped by department
2. For each subject, show checkboxes for classes (e.g., "Chemistry — Grade 9")
3. Selection key: `subjectId:classId`
```

**New UI Flow:**
```
1. Show subjects grouped by department
2. For each subject, show classes
3. For each class, show sections with checkboxes
   e.g., "Chemistry — Grade 9 — Section A ☑️"
        "Chemistry — Grade 9 — Section B ☐"
        "Chemistry — Grade 9 — Section C ☑️"
4. Selection key: `subjectId:classId:sectionId`
5. Add "Select All Sections" toggle per class-subject pair
```

**Component Structure:**
```
TeacherSubjectAssigner
├── SubjectGroupCard (per department)
│   ├── SubjectClassRow (per subject-class pair)
│   │   ├── SectionCheckbox[] (per section)
│   │   └── SelectAllSectionsToggle
│   └── ...
└── SaveButton
```

### 1.3 subject-queries.ts Changes

**`getTeacherSubjects`**
- Add `section` include to query
- Return format: `{ subjectId, subjectName, classId, className, sectionId, sectionName }`

---

## 2. DIARY MODULE — Section-Level Authorization

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/diary/diary-mutation-actions.ts` | ~180 | Authorization fix |
| `src/modules/diary/diary-queries.ts` | ~310 | Query scoping |
| `src/modules/diary/diary-fetch-actions.ts` | ~230 | Authorization fix |
| `src/modules/diary/diary-copy-actions.ts` | ~140 | Authorization fix |

### 2.1 diary-mutation-actions.ts Changes

**`verifyTeacherAssignment()` — CRITICAL FIX**

Current:
```typescript
const assignment = await prisma.teacherSubject.findFirst({
  where: { teacherId, subjectId, classId }  // ← Missing sectionId
});
```

New:
```typescript
const assignment = await prisma.teacherSubject.findFirst({
  where: { teacherId, subjectId, classId, sectionId }  // ← Section-level check
});
```

This single change fixes: teacher can no longer create diary entries for sections they don't teach.

**`createDiaryEntryAction()`**
- Pass `sectionId` from input to `verifyTeacherAssignment()`
- Already has sectionId in input schema — just needs to pass it through

**`updateDiaryEntryAction()`**
- Verify teacher still has assignment for the entry's section
- Prevent changing sectionId on update (or re-verify new section)

**`deleteDiaryEntryAction()`**
- Verify teacher has assignment for the entry's section before allowing delete

### 2.2 diary-queries.ts Changes

**`getExpectedDiaryTeachers()`**

Current: Returns all active teacher-subject-class assignments (no section info)
New: Returns teacher-subject-class-SECTION assignments

```typescript
// Include section in the expected teachers calculation
return prisma.teacherSubject.findMany({
  where: { teacher: { user: { isActive: true } } },
  select: { 
    teacherId: true, 
    subjectId: true, 
    classId: true,
    sectionId: true,    // ← ADD
    teacher: { /* ... */ },
    subject: { /* ... */ },
    class: { /* ... */ },
    section: { /* ... */ }  // ← ADD
  }
});
```

**`getTeacherSubjectClasses()`**

Current: Returns `{ subjectId, classId, className, sections[] }` — sections fetched separately
New: Returns `{ subjectId, classId, sectionId, sectionName }` — direct from TeacherSubject

```typescript
const assignments = await prisma.teacherSubject.findMany({
  where: { teacherId: teacherProfileId },
  include: {
    subject: { select: { id: true, name: true, code: true } },
    class: { select: { id: true, name: true } },
    section: { select: { id: true, name: true } }   // ← Direct section from assignment
  }
});
```

**`getDiaryEntries()` — Add teacher scoping**

For TEACHER role: filter diary entries to only sections where teacher has assignment.

### 2.3 diary-fetch-actions.ts Changes

**`fetchDiaryEntriesAction()`**
- For TEACHER: add section-level filtering (only entries for assigned sections)
- For PRINCIPAL/ADMIN: no change (see all)
- For STUDENT: already filtered by own section ✅
- For FAMILY: already filtered by child's section ✅

**`fetchDiaryCoverageAction()`**
- Use section-aware expected teachers list
- Coverage = (diary entries per section) / (expected entries per section)

### 2.4 diary-copy-actions.ts Changes

**`copyDiaryToSectionAction()`**
- Verify teacher has assignment for BOTH source and target sections
- Should already exist conceptually — may need to create if missing
- This is a NEW workflow: teacher teaches Subject in Section A and Section C, wants to copy diary from A to C

---

## 3. EXAM MODULE — Section-Level Scoping

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/exams/exam-actions.ts` | ~200 | Major refactor |
| `src/modules/exams/exam-queries.ts` | ~200 | Authorization + scoping |
| `src/modules/exams/exam-fetch-actions.ts` | ~120 | Scoping fix |
| `src/modules/exams/components/create-exam-dialog.tsx` | ~307 | UI update + split |

### 3.1 exam-actions.ts Changes

**`createExamAction()`**
- `classAssignments` must include `sectionId` (REQUIRED)
- Validate teacher has TeacherSubject for each (class, section, subject) combo
- Remove ability to create class-wide exams without section
- If teacher teaches multiple sections, they can SELECT which sections to assign

**`publishExamAction()`**
- No change needed (operates on examId)

### 3.2 exam-queries.ts Changes

**`listExams()` — ADD AUTHORIZATION**

```typescript
export async function listExams(params, filters, scope: QueryScope) {
  const where: Prisma.ExamWhereInput = { deletedAt: null };

  if (scope.role === 'TEACHER' && scope.teacherProfileId) {
    // Teacher sees: exams they created + exams in their sections
    const assignments = await getTeacherAssignments(scope.teacherProfileId);
    where.OR = [
      { createdById: scope.userId },
      { examClassAssignments: { 
        some: { 
          OR: assignments.map(a => ({ classId: a.classId, sectionId: a.sectionId }))
        }
      }}
    ];
  }
  // ... rest of query
}
```

**`getExamsForStudent()` — FIX SECTION LOGIC**

Remove the `sectionId: null` fallback:

```typescript
// REMOVE: { sectionId: null }
// KEEP: exact section match only
examClassAssignments: {
  some: {
    classId: studentProfile.classId,
    sectionId: studentProfile.sectionId  // ← Exact match, no null fallback
  }
}
```

### 3.3 create-exam-dialog.tsx — SPLIT + UPDATE

**File is 307 lines — needs splitting:**

```
src/modules/exams/components/
├── create-exam-dialog.tsx          (~120 lines) — Main dialog shell
├── exam-basic-info-form.tsx        (~80 lines)  — Title, subject, type, etc.
├── exam-class-section-selector.tsx (~80 lines)  — NEW: Class + section multi-select
└── exam-settings-form.tsx          (~80 lines)  — Duration, marks, options
```

**New section selector UI:**
```
Select Classes & Sections:
  ☑️ Grade 9
    ☑️ Section A
    ☑️ Section B
    ☐ Section C
  ☐ Grade 10
    ☐ Section A
    ☐ Section B
```

---

## 4. GRADING MODULE — Section-Level Access Control

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/grading/grading-actions.ts` | ~263 | Authorization fix |
| `src/modules/grading/grading-fetch-actions.ts` | ~56 | Authorization fix |
| `src/modules/grading/grading-core.ts` | varies | Minor update |

### 4.1 grading-actions.ts Changes

**`autoGradeSessionAction()`**
- Add: Verify student's section is in teacher's assigned sections
- After creator check, add section check:

```typescript
if (session.user.role === 'TEACHER') {
  await assertGradingAccess(session.user.id, session.user.role, sessionId);
}
```

**`gradeAnswerAction()` / `batchGradeAnswersAction()`**
- Add section verification for each student being graded
- If teacher grades student from another section → reject

**`batchAutoGradeAction()`**
- Filter sessions to only those with students in teacher's sections
- Don't grade cross-section students

### 4.2 grading-fetch-actions.ts Changes

**`fetchGradingSessionDetailAction()`**
- Add session ownership + section verification
- Teacher can only fetch sessions for students in their sections

**`fetchGradingSessionsAction()`**
- Filter sessions by teacher's assigned sections
- Teacher can only see grading sessions for their students

---

## 5. WRITTEN EXAM MODULE — Section-Level Scoping

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/written-exams/written-exam-actions.ts` | ~220 | Major refactor |
| `src/modules/written-exams/written-exam-fetch-actions.ts` | ~60 | Scoping fix |
| `src/modules/written-exams/written-exam-result-actions.ts` | ~219 | Scoping fix |
| `src/modules/written-exams/written-exam-queries.ts` | ~95 | Add scope param |

### 5.1 written-exam-actions.ts Changes

**`initializeWrittenExamSessionsAction()`**
- For TEACHER: only initialize sessions for students in their assigned sections
- For ADMIN: initialize for all assigned sections
- Add section-level filtering to student query

**`enterWrittenMarksAction()`**
- Add: Verify student's section matches teacher's assignment
- Reject mark entry for cross-section students

### 5.2 written-exam-fetch-actions.ts Changes

**`fetchWrittenExamMarkEntryAction()`**
- For TEACHER: filter returned data to only their section's students
- For ADMIN: return all data
- Pass scope to query function

### 5.3 written-exam-result-actions.ts Changes

**`finalizeWrittenExamAction()`**
- For TEACHER: only finalize results for students in their sections
- For ADMIN: finalize all
- Section-level ranking (rank within section, not across all)

### 5.4 written-exam-queries.ts Changes

**`getWrittenExamMarkEntryData()`**
- Accept scope parameter
- Filter `examSessions` by section when teacher

---

## 6. RESULTS MODULE — Section-Scoped Queries

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/results/result-fetch-actions.ts` | ~35 | Add scoping |
| `src/modules/results/queries/result-core-queries.ts` | ~35 | Add scope param |
| `src/modules/results/queries/result-analytics-queries.ts` | varies | Add scope param |
| `src/modules/results/queries/result-detailed-analytics.ts` | varies | Add scope param |

### Changes Pattern

For every result query:
1. Accept `QueryScope` parameter
2. If TEACHER: filter results to students in assigned sections
3. If STUDENT: filter to own results only  
4. If FAMILY: filter to linked children's results only
5. If ADMIN/PRINCIPAL: return all

---

## 7. ATTENDANCE MODULE — Authorization Fixes

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/attendance/attendance-fetch-actions.ts` | ~220 | Authorization fix |

### Changes

**`fetchDailyAttendanceAction()`**
- Add: For TEACHER, verify they are class teacher or subject teacher for the requested section
- Current: Only checks role, not section assignment

**`fetchStudentsForMarkingAction()`**
- Same fix: verify teacher → section assignment before returning student list

**`fetchStudentDailyAttendanceAction()` for FAMILY role**
- Add: `assertFamilyStudentAccess()` call (currently missing)

---

## 8. QUESTION MODULE — Authorization Fix

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/questions/question-actions.ts` | ~248 | Authorization fix |

### Changes

**`createQuestionAction()` — FIX SOFT CHECK**

Current (BROKEN):
```typescript
if (assignments.length > 0) {
  // Only then check authorization
}
// If no assignments → skip check entirely!
```

New:
```typescript
// Teacher MUST have at least one subject assignment
if (session.user.role === 'TEACHER') {
  if (assignments.length === 0) {
    return { success: false, error: 'You have no subject assignments' };
  }
  if (!assignedSubjectIds.includes(data.subjectId)) {
    return { success: false, error: 'You are not assigned to this subject' };
  }
}
```

---

## 9. PRINCIPAL/ANALYTICS MODULE — Scoping

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/principal/queries/analytics-queries.ts` | varies | Add scope/filter params |
| `src/modules/principal/queries/dashboard-queries.ts` | varies | OK for principal, add role check |
| `src/modules/principal/queries/class-queries.ts` | varies | Add authorization |
| `src/modules/principal/queries/student-queries.ts` | varies | Add authorization |
| `src/modules/principal/queries/teacher-queries.ts` | varies | Add authorization |

### Pattern

These queries are used for principal dashboard — they SHOULD show system-wide data for principals. The fix is:

1. **Ensure these queries are ONLY callable by ADMIN/PRINCIPAL** — add role verification at fetch-action level
2. **Add optional class/section filters** — for future section-head role support
3. **Do NOT expose through teacher or student endpoints** — verify at action layer

---

## 10. FAMILY MODULE — Minor Fixes

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/family/family-dashboard-actions.ts` | ~250 | N+1 fix, section filter |
| `src/modules/family/family-attendance-actions.ts` | empty | Needs implementation |

### Changes

**`family-dashboard-actions.ts`**
- Fix N+1 query pattern: batch load children data
- Add section filter to diary read receipt count

**`family-attendance-actions.ts`**  
- Implement proper family attendance fetching with `assertFamilyStudentAccess()`

---

## 11. TIMETABLE MODULE — Validation Enhancement

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/timetable/timetable-entry-actions.ts` | varies | Add validation |

### Changes

**`createTimetableEntryAction()`**
- Add: Verify the teacher has a TeacherSubject record for the (subject, class, section) being assigned
- This prevents admin from accidentally assigning teacher to section they don't teach
- Warning only (admin can override) — not a hard block

---

## 12. SESSION/ANTI-CHEAT MODULE — Minor

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/sessions/session-actions.ts` | ~327 | Split + fix |

### Changes

**Split into sub-files (exceeds 300 lines):**
```
src/modules/sessions/
├── session-start-actions.ts     (~120 lines)
├── session-answer-actions.ts    (~100 lines)
├── session-submit-actions.ts    (~100 lines)
└── session-actions.ts           (re-exports only)
```

**`startSessionAction()`**
- Fix fragile error string matching
- Use typed Prisma errors instead

---

## 13. SETTINGS/REFERENCE MODULE — Update for Sections

### Files Affected

| File | Lines | Change Type |
|------|-------|-------------|
| `src/modules/settings/reference-actions.ts` | ~63 | Update teacher subject fetch |

### Changes

**`fetchTeacherReferenceData()`**
- Include section information in teacher's subject assignments
- Return `{ subjectId, classId, sectionId, sectionName }` instead of just `{ subjectId, classId }`

---

## Summary: Total Files to Change

| Category | Files | Effort |
|----------|-------|--------|
| Schema + Migration | 2 | High |
| New Authorization Framework | 3 | High |
| Subject/Assignment Module | 3 | High |
| Diary Module | 4 | Medium |
| Exam Module | 4 | High |
| Grading Module | 3 | Medium |
| Written Exam Module | 4 | High |
| Results Module | 4 | Medium |
| Attendance Module | 1 | Low |
| Question Module | 1 | Low |
| Principal/Analytics Module | 5 | Medium |
| Family Module | 2 | Low |
| Timetable Module | 1 | Low |
| Sessions Module | 1 | Low (split only) |
| Settings Module | 1 | Low |
| **TOTAL** | **39 files** | — |
