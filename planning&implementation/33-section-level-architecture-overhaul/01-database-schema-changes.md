# 01 — Database Schema Changes: Section-Level Architecture

## Overview

This document specifies ALL database schema changes required to support section-level teacher-subject assignments and fix cascading authorization gaps.

---

## 1. CORE CHANGE: TeacherSubject Model

### Current Schema

```prisma
model TeacherSubject {
  id        String   @id @default(uuid())
  teacherId String
  subjectId String
  classId   String
  createdAt DateTime @default(now())

  teacher TeacherProfile @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  subject Subject        @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  class   Class          @relation(fields: [classId], references: [id])

  @@unique([teacherId, subjectId, classId])
  @@index([teacherId])
  @@index([classId])
}
```

### New Schema

```prisma
model TeacherSubject {
  id        String   @id @default(uuid())
  teacherId String
  subjectId String
  classId   String
  sectionId String        // ← NEW: REQUIRED section-level assignment
  createdAt DateTime @default(now())

  teacher TeacherProfile @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  subject Subject        @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  class   Class          @relation(fields: [classId], references: [id])
  section Section        @relation(fields: [sectionId], references: [id])   // ← NEW

  @@unique([teacherId, subjectId, classId, sectionId])   // ← CHANGED: composite unique
  @@index([teacherId])
  @@index([classId])
  @@index([sectionId])                                    // ← NEW index
  @@index([teacherId, subjectId])                         // ← NEW: for subject-level queries
  @@index([classId, sectionId])                           // ← NEW: for class-section queries
}
```

### Key Decisions

1. **`sectionId` is REQUIRED (not optional)** — We enforce section-level assignments from the start. If a teacher teaches ALL sections, they get multiple `TeacherSubject` records (one per section).

2. **Unique constraint includes sectionId** — Same teacher can teach same subject in same class but different sections. This is the core business requirement.

3. **No backward compatibility with null sectionId** — Clean break. Migration script will populate existing records.

### Why NOT Optional?

Making `sectionId` optional would:
- Allow old "class-level" assignments to coexist with new "section-level" ones
- Create ambiguity: does `sectionId = null` mean "all sections" or "legacy data"?
- Require null-handling in every query (error-prone)
- Defeat the purpose of the change

---

## 2. Section Model — Add TeacherSubjects Relation

### Changes

```prisma
model Section {
  // ... existing fields ...

  // ADD relation
  teacherSubjects    TeacherSubject[]   // ← NEW

  // ... existing relations ...
}
```

---

## 3. ExamClassAssignment — Make sectionId REQUIRED

### Current Schema

```prisma
model ExamClassAssignment {
  id        String   @id @default(uuid())
  examId    String
  classId   String
  sectionId String?    // ← CURRENTLY OPTIONAL
  createdAt DateTime @default(now())

  @@unique([examId, classId, sectionId])
}
```

### New Schema

```prisma
model ExamClassAssignment {
  id        String   @id @default(uuid())
  examId    String
  classId   String
  sectionId String     // ← NOW REQUIRED
  createdAt DateTime @default(now())

  exam    Exam     @relation(fields: [examId], references: [id], onDelete: Cascade)
  class   Class    @relation(fields: [classId], references: [id])
  section Section  @relation(fields: [sectionId], references: [id])  // ← non-optional

  @@unique([examId, classId, sectionId])
  @@index([examId])
  @@index([classId])
  @@index([sectionId])            // ← NEW
  @@index([examId, sectionId])    // ← NEW: for exam-section queries
}
```

### Impact

- **Exam creation**: Must now specify section(s) — can still select multiple sections
- **Exam queries**: Remove the `OR: [{ sectionId: null }, ...]` pattern
- **Student visibility**: Students only see exams assigned to their specific section
- **Migration**: Existing records with `sectionId = null` must be expanded to all sections

---

## 4. SubjectClassLink — Consider Section Awareness

### Analysis

`SubjectClassLink` maps which subjects are taught in which classes. Currently class-level only:

```prisma
model SubjectClassLink {
  subjectId String
  classId   String
  isElective Boolean @default(false)
  // ...
  @@unique([subjectId, classId])
}
```

### Decision: KEEP AS-IS

Subject availability is correctly at class level — "Chemistry is offered in Grade 9" applies to all sections. The section-level granularity is in **who teaches it** (TeacherSubject), not **what's offered** (SubjectClassLink).

If a subject is elective, the per-student enrollment (`StudentSubjectEnrollment`) already handles individual assignment.

---

## 5. DatesheetEntry — Already Correct

```prisma
model DatesheetEntry {
  sectionId String?   // Optional — some datesheets apply to entire class
}
```

**Keep as-is.** Datesheets CAN be class-wide (e.g., "Final exam schedule for Grade 9"). The nullable sectionId here is intentional and correct — it means "applies to all sections of this class."

---

## 6. DiaryEntry — Already Correct

```prisma
model DiaryEntry {
  teacherProfileId  String
  classId           String
  sectionId         String    // REQUIRED — already section-level ✅
  subjectId         String
  // ...
  @@unique([teacherProfileId, classId, sectionId, subjectId, date, academicSessionId])
}
```

Schema is correct. The GAP is in **validation logic** (diary-mutation-actions.ts doesn't verify teacher→section assignment), not in the schema.

---

## 7. Attendance Models — Already Correct

Both `DailyAttendance` and `SubjectAttendance` already have required `sectionId`. Schema is fine. The GAP is in **fetch action authorization**, not schema.

---

## 8. TimetableEntry — Already Correct

```prisma
model TimetableEntry {
  classId          String
  sectionId        String     // REQUIRED ✅
  subjectId        String
  teacherProfileId String
  // ...
  @@unique([classId, sectionId, periodSlotId, dayOfWeek, academicSessionId])
}
```

Already section-aware. No changes needed.

---

## 9. New Indexes Summary

### New Indexes to Add

| Model | Index | Purpose |
|-------|-------|---------|
| `TeacherSubject` | `[sectionId]` | Section-level queries |
| `TeacherSubject` | `[teacherId, subjectId]` | Subject-level teacher lookup |
| `TeacherSubject` | `[classId, sectionId]` | Class-section teacher lookup |
| `ExamClassAssignment` | `[sectionId]` | Section-filtered exam queries |
| `ExamClassAssignment` | `[examId, sectionId]` | Exam-section join queries |

---

## 10. Prisma Schema Multi-File Split

### Current: Single file (1590 lines)

### Proposed Split

```
prisma/
├── schema.prisma              // Datasource + generator config (20 lines)
├── schema/
│   ├── enums.prisma           // All enums (~150 lines)
│   ├── user.prisma            // User, StudentProfile, TeacherProfile, FamilyProfile (~120 lines)
│   ├── organization.prisma    // Department, Subject, Class, Section, SubjectClassLink (~100 lines)
│   ├── teacher-assignment.prisma // TeacherSubject, StudentSubjectEnrollment (~60 lines)
│   ├── question-bank.prisma   // Tag, Question, McqOption, QuestionTag (~100 lines)
│   ├── exam.prisma            // Exam, ExamQuestion, ExamClassAssignment, ExamSession, StudentAnswer (~150 lines)
│   ├── grading-results.prisma // AnswerGrade, ExamResult (~80 lines)
│   ├── academic.prisma        // AcademicSession, StudentPromotion (~80 lines)
│   ├── system.prisma          // SchoolSettings, AuditLog, Notification, PasswordResetToken (~80 lines)
│   ├── admission.prisma       // TestCampaign + all admission models (~300 lines)
│   ├── timetable.prisma       // PeriodSlot, TimetableEntry (~80 lines)
│   ├── attendance.prisma      // DailyAttendance, SubjectAttendance (~80 lines)
│   ├── diary.prisma           // DiaryEntry, DiaryReadReceipt, DiaryPrincipalNote (~80 lines)
│   ├── datesheet.prisma       // Datesheet, DatesheetEntry, DatesheetDuty (~80 lines)
│   └── family.prisma          // FamilyStudentLink (~40 lines)
```

**Requires**: `prismaSchemaFolder` preview feature in Prisma config.

---

## 11. Migration Script Design

### Phase 1: Add sectionId to TeacherSubject (nullable first)

```sql
ALTER TABLE "TeacherSubject" ADD COLUMN "sectionId" TEXT;
```

### Phase 2: Populate from TimetableEntry

```sql
-- For each TeacherSubject record, find sections via TimetableEntry
INSERT INTO "TeacherSubject" ("id", "teacherId", "subjectId", "classId", "sectionId", "createdAt")
SELECT 
  gen_random_uuid(),
  ts."teacherId",
  ts."subjectId",
  ts."classId",
  te."sectionId",
  NOW()
FROM "TeacherSubject" ts
JOIN "TimetableEntry" te ON 
  te."teacherProfileId" = ts."teacherId" 
  AND te."subjectId" = ts."subjectId" 
  AND te."classId" = ts."classId"
WHERE ts."sectionId" IS NULL
GROUP BY ts."teacherId", ts."subjectId", ts."classId", te."sectionId";

-- Delete old records without sectionId
DELETE FROM "TeacherSubject" WHERE "sectionId" IS NULL;
```

### Phase 3: For records WITHOUT timetable entries

```sql
-- Assign to ALL sections of the class (safe default)
INSERT INTO "TeacherSubject" ("id", "teacherId", "subjectId", "classId", "sectionId", "createdAt")
SELECT
  gen_random_uuid(),
  ts."teacherId",
  ts."subjectId",
  ts."classId",
  s."id",
  NOW()
FROM "TeacherSubject" ts
JOIN "Section" s ON s."classId" = ts."classId" AND s."isActive" = true
WHERE ts."sectionId" IS NULL;

DELETE FROM "TeacherSubject" WHERE "sectionId" IS NULL;
```

### Phase 4: Make sectionId REQUIRED

```sql
ALTER TABLE "TeacherSubject" ALTER COLUMN "sectionId" SET NOT NULL;
```

### Phase 5: Update unique constraint

```sql
ALTER TABLE "TeacherSubject" DROP CONSTRAINT "TeacherSubject_teacherId_subjectId_classId_key";
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_teacherId_subjectId_classId_sectionId_key" 
  UNIQUE ("teacherId", "subjectId", "classId", "sectionId");
```

### Phase 6: ExamClassAssignment migration

```sql
-- Expand null-sectionId exam assignments to all sections
INSERT INTO "ExamClassAssignment" ("id", "examId", "classId", "sectionId", "createdAt")
SELECT 
  gen_random_uuid(),
  eca."examId",
  eca."classId",
  s."id",
  NOW()
FROM "ExamClassAssignment" eca
JOIN "Section" s ON s."classId" = eca."classId" AND s."isActive" = true
WHERE eca."sectionId" IS NULL;

DELETE FROM "ExamClassAssignment" WHERE "sectionId" IS NULL;
ALTER TABLE "ExamClassAssignment" ALTER COLUMN "sectionId" SET NOT NULL;
```

---

## 12. Validation Rules

After migration, these invariants MUST hold:

1. **Every TeacherSubject has a valid sectionId** — no nulls
2. **Every ExamClassAssignment has a valid sectionId** — no nulls
3. **TeacherSubject.sectionId references a Section that belongs to TeacherSubject.classId** — referential integrity
4. **No duplicate (teacher, subject, class, section) tuples** — unique constraint
5. **TimetableEntry.teacherProfileId + subjectId matches a TeacherSubject record** — consistency
6. **DiaryEntry.teacherProfileId + subjectId + classId + sectionId matches a TeacherSubject record** — authorization
