# 01 — Database Schema Design: Elective Split-Group System

> **Date**: 2026-03-11
> **Depends On**: `00-brutal-analysis-and-gap-assessment.md`
> **Changes**: 2 new models, 3 modified models, 5 new indexes

---

## 1. DESIGN PHILOSOPHY

### Core Principle

**"An elective period slot creates N parallel entries. Each entry has a defined set of students via enrollment."**

We do NOT create a separate "group" model. Instead, the grouping emerges naturally from:
- `SubjectClassLink.electiveGroupName` → defines which subjects compete (Bio vs CS)
- `StudentSubjectEnrollment` → defines which student takes which subject
- `TimetableEntry` (modified) → allows multiple entries per section+period for elective subjects
- **NEW** `ElectiveSlotGroup` → groups parallel timetable entries that happen simultaneously

### What Changes vs. What Stays

| Model | Action | Reason |
|-------|--------|--------|
| `SubjectClassLink` | ✅ KEEP AS-IS | Already has `isElective` + `electiveGroupName` |
| `StudentSubjectEnrollment` | ✅ KEEP AS-IS | Already tracks student→subject enrollment |
| `TimetableEntry` | 🟡 MODIFY | Remove unique constraint, add `electiveSlotGroupId` |
| `PeriodSlot` | ✅ KEEP AS-IS | Time slots are shared, not per-group |
| **NEW** `ElectiveSlotGroup` | 🆕 CREATE | Groups parallel entries for same section+period |
| **NEW** `CrossSectionGroup` | 🆕 CREATE | Optional: combines students across sections |

---

## 2. NEW MODEL: `ElectiveSlotGroup`

### Purpose

When an admin creates a timetable for an elective period, they create an `ElectiveSlotGroup` that says: "In this section, during this period, on this day, there are N parallel subjects happening."

Each `TimetableEntry` in that group represents ONE of those parallel classes.

### Schema

```prisma
model ElectiveSlotGroup {
  id                String   @id @default(uuid())
  classId           String
  sectionId         String
  periodSlotId      String
  dayOfWeek         DayOfWeek
  academicSessionId String
  name              String?  // Optional label: "Science Elective Block"
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  class           Class           @relation(fields: [classId], references: [id])
  section         Section         @relation(fields: [sectionId], references: [id])
  periodSlot      PeriodSlot      @relation(fields: [periodSlotId], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])
  entries         TimetableEntry[]

  @@unique([classId, sectionId, periodSlotId, dayOfWeek, academicSessionId])
  @@index([classId, sectionId, academicSessionId])
  @@index([periodSlotId, dayOfWeek])
}
```

### Why This Model Exists

Without this model, we can't distinguish between:
- **Bug**: "Someone accidentally added Biology twice to Period 3"
- **Intentional**: "Period 3 is an elective block with Bio + CS + Stats"

The `ElectiveSlotGroup` explicitly marks a period as "this is an elective block" with defined parallel entries.

---

## 3. MODIFIED MODEL: `TimetableEntry`

### Current Constraint (MUST CHANGE)

```prisma
// CURRENT — BLOCKS ELECTIVE PARALLEL ENTRIES
@@unique([classId, sectionId, periodSlotId, dayOfWeek, academicSessionId])
```

### New Design

```prisma
model TimetableEntry {
  id                    String     @id @default(uuid())
  classId               String
  sectionId             String
  subjectId             String
  teacherProfileId      String
  periodSlotId          String
  dayOfWeek             DayOfWeek
  academicSessionId     String
  room                  String?
  isElectiveSlot        Boolean    @default(false)
  electiveSlotGroupId   String?    // null for regular entries, set for elective
  isActive              Boolean    @default(true)
  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt

  class               Class              @relation(fields: [classId], references: [id])
  section             Section            @relation(fields: [sectionId], references: [id])
  subject             Subject            @relation(fields: [subjectId], references: [id])
  teacherProfile      TeacherProfile     @relation(fields: [teacherProfileId], references: [id])
  periodSlot          PeriodSlot         @relation(fields: [periodSlotId], references: [id])
  academicSession     AcademicSession    @relation(fields: [academicSessionId], references: [id])
  electiveSlotGroup   ElectiveSlotGroup? @relation(fields: [electiveSlotGroupId], references: [id])
  subjectAttendance   SubjectAttendance[]

  // NEW: For non-elective entries, keep uniqueness.
  // For elective entries, allow multiple but prevent same subject twice.
  @@unique([classId, sectionId, subjectId, periodSlotId, dayOfWeek, academicSessionId])
  @@index([teacherProfileId, dayOfWeek, academicSessionId])
  @@index([classId, sectionId, academicSessionId])
  @@index([electiveSlotGroupId])
  @@index([periodSlotId])
  @@index([isActive])
  @@index([subjectId])
  @@index([academicSessionId])
  @@index([dayOfWeek])
  @@index([isElectiveSlot])
}
```

### Key Changes Explained

1. **Unique constraint changed**: From `[classId, sectionId, periodSlotId, dayOfWeek, academicSessionId]` to `[classId, sectionId, subjectId, periodSlotId, dayOfWeek, academicSessionId]`
   - **Old**: Only 1 entry per section+period → BLOCKS electives
   - **New**: Only 1 entry per section+period+subject → ALLOWS Bio AND CS in same period, PREVENTS Bio twice

2. **`isElectiveSlot`**: Boolean flag for quick filtering
   - Regular entries: `false` — normal "whole section attends"
   - Elective entries: `true` — only enrolled students attend

3. **`electiveSlotGroupId`**: Links to the parent group
   - Enables query: "Get ALL parallel classes for this period"
   - Enables UI: "Show stacked subjects in timetable cell"

---

## 4. NEW MODEL: `CrossSectionGroup` (OPTIONAL — Phase 2)

### Purpose

For small schools where 11-A has 5 CS students and 11-B has 5 CS students. The school combines them into a single group of 10 taught together.

```prisma
model CrossSectionGroup {
  id                String   @id @default(uuid())
  name              String   // "Combined CS — 11-A + 11-B"
  subjectId         String
  classId           String
  academicSessionId String
  teacherProfileId  String
  room              String?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  subject         Subject         @relation(fields: [subjectId], references: [id])
  class           Class           @relation(fields: [classId], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])
  teacherProfile  TeacherProfile  @relation(fields: [teacherProfileId], references: [id])
  sectionLinks    CrossSectionGroupSection[]

  @@unique([subjectId, classId, academicSessionId])
  @@index([classId, academicSessionId])
  @@index([teacherProfileId])
}

model CrossSectionGroupSection {
  id                    String @id @default(uuid())
  crossSectionGroupId   String
  sectionId             String
  createdAt             DateTime @default(now())

  crossSectionGroup CrossSectionGroup @relation(fields: [crossSectionGroupId], references: [id], onDelete: Cascade)
  section           Section           @relation(fields: [sectionId], references: [id])

  @@unique([crossSectionGroupId, sectionId])
  @@index([crossSectionGroupId])
  @@index([sectionId])
}
```

> **NOTE**: This is Phase 2. Most schools can work without this by creating separate timetable entries per section. Only implement if cross-section teaching is a real requirement.

---

## 5. VALIDATION RULES (DATABASE-LEVEL)

### Rule 1: Elective Group Mutual Exclusion

**Business Rule**: A student can only be enrolled in ONE subject from each `electiveGroupName` per class per session.

**Enforcement**: Application-level check in `enrollStudentInSubjectAction`:

```
BEFORE enrolling student S in subject X (class C, session AS):
1. Find SubjectClassLink for (X, C) → get electiveGroupName
2. If electiveGroupName is not null:
   a. Find ALL subjects in same electiveGroupName for class C
   b. Check if student S has active enrollment in ANY of those subjects
   c. If yes → REJECT with "Student already enrolled in [other subject] from this group"
```

### Rule 2: Elective Timetable Entry Requires Group

**Business Rule**: If `isElectiveSlot = true`, then `electiveSlotGroupId` MUST be set.

**Enforcement**: Application-level in `createTimetableEntryAction`.

### Rule 3: Non-Elective Entry Uniqueness

**Business Rule**: For non-elective entries, only 1 subject per section+period (existing behavior).

**Enforcement**: The new unique constraint `[classId, sectionId, subjectId, periodSlotId, dayOfWeek, academicSessionId]` handles same-subject duplication. For non-elective entries, the application enforces: "if any non-elective entry exists for this section+period, reject."

### Rule 4: Teacher Can't Be in Two Places

**Business Rule**: A teacher can't teach two DIFFERENT classes/groups at the same time.

**Enforcement**: Existing `hasTeacherConflict` — already works, no change needed. One teacher can only have one entry per period+day.

### Rule 5: Room Conflict Detection (NEW)

**Business Rule**: Two entries in the same period+day can't share the same room (unless room is null).

**Enforcement**: New check in `createTimetableEntryAction`:

```
IF room is provided:
  Check TimetableEntry WHERE periodSlotId + dayOfWeek + academicSessionId + room = same
  IF exists → REJECT "Room [room] is already occupied in this period"
```

---

## 6. RELATIONSHIP MAP

```
SubjectClassLink (defines curriculum)
  ├── isElective: true
  ├── electiveGroupName: "Science Elective"
  └── classId: "11th class"

StudentSubjectEnrollment (defines who takes what)
  ├── studentProfileId → Student
  ├── subjectId → Biology (from elective group)
  └── academicSessionId → 2025-26

ElectiveSlotGroup (groups parallel timetable entries)
  ├── classId + sectionId + periodSlotId + dayOfWeek
  └── entries: [
        TimetableEntry (Biology, Teacher A, Room 201),
        TimetableEntry (Computer Sci, Teacher B, Lab),
        TimetableEntry (Statistics, Teacher C, Room 205),
      ]

Attendance Flow:
  Teacher opens "Mark Attendance" for Biology, Period 3, Monday
  → System finds TimetableEntry for Bio
  → Entry has isElectiveSlot = true
  → System queries StudentSubjectEnrollment for Biology
  → Shows ONLY enrolled students (not full section)
  → Teacher marks attendance for their 20 students
```

---

## 7. INDEX STRATEGY

### New Indexes Required

```prisma
// ElectiveSlotGroup — fast lookup for timetable grid
@@index([classId, sectionId, academicSessionId])
@@index([periodSlotId, dayOfWeek])

// TimetableEntry — elective grouping
@@index([electiveSlotGroupId])
@@index([isElectiveSlot])

// StudentSubjectEnrollment — enrollment verification
// Already has: @@index([studentProfileId, academicSessionId])
// Already has: @@index([classId, subjectId, academicSessionId])
// Add for attendance page (get all enrolled students for a subject+section):
@@index([subjectId, academicSessionId, isActive])
```

### Query Performance Impact

| Query | Before | After | Notes |
|-------|--------|-------|-------|
| Build timetable grid | O(entries) | O(entries + groups) | One extra JOIN |
| Get students for attendance | O(all section students) | O(enrolled students) | BETTER — smaller result set |
| Check enrollment conflict | N/A (no check) | O(1) via unique index | NEW check |
| Room conflict check | N/A (no check) | O(1) via index | NEW check |

---

## 8. MIGRATION SAFETY

### Phase 1: Non-Breaking Changes

1. Add `ElectiveSlotGroup` model (new table, no impact)
2. Add `isElectiveSlot` to `TimetableEntry` with default `false` (no impact)
3. Add `electiveSlotGroupId` to `TimetableEntry` as optional (no impact)

### Phase 2: Constraint Change (CAREFUL)

4. Drop old unique constraint on `TimetableEntry`
5. Add new unique constraint with `subjectId` included
6. **Validation**: Run query to ensure no existing duplicates with same subject

```sql
-- Check for duplicates before migration
SELECT classId, sectionId, subjectId, "periodSlotId", "dayOfWeek", "academicSessionId", COUNT(*)
FROM "TimetableEntry"
GROUP BY classId, sectionId, subjectId, "periodSlotId", "dayOfWeek", "academicSessionId"
HAVING COUNT(*) > 1;
-- Expected: 0 rows (no duplicates)
```

### Rollback Plan

If the new constraint causes issues:
1. All new fields are optional/have defaults → safe to ignore
2. `ElectiveSlotGroup` is a new table → can be dropped
3. Old unique constraint can be re-added (data is unchanged for existing entries)

---

## 9. MODELS NOT CHANGED (AND WHY)

| Model | Reason |
|-------|--------|
| `SubjectClassLink` | Already has `isElective` + `electiveGroupName` — perfect |
| `StudentSubjectEnrollment` | Already tracks student→subject — perfect |
| `PeriodSlot` | Time slots don't change based on electives |
| `DailyAttendance` | Daily attendance = whole section, unaffected |
| `SubjectAttendance` | Already has `subjectId` — just needs enrollment filtering in LOGIC |
| `ExamClassAssignment` | Already has `sectionId` — just needs enrollment filtering in LOGIC |
| `DiaryEntry` | Already has `subjectId` — just needs enrollment filtering in LOGIC |
| `ExamSession` | Already per-student — just need to filter WHO gets a session |
