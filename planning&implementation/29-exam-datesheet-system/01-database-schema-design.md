# Exam Datesheet System — Database Schema Design

> **Date:** March 5, 2026  
> **Principle:** Additive schema. Zero impact on existing tables. Maximum reuse of existing relationships.

---

## Schema Overview

```
┌────────────────┐      ┌───────────────────┐      ┌──────────────────────┐
│   Datesheet    │──1:N─│  DatesheetEntry   │──N:1─│    Subject           │
│ (exam period)  │      │ (date+class+subj) │      │  (existing table)    │
└───────┬────────┘      └──────────┬────────┘      └──────────────────────┘
        │                         │
        │                         │1:N
        │                         ▼
        │               ┌──────────────────────┐
        │               │   DatesheetDuty      │──N:1─► TeacherProfile
        │               │ (teacher invigilation)│         (existing table)
        │               └──────────────────────┘
        │
        └──1:N──► AcademicSession (existing)
                  Class (existing)
                  Section (existing)
```

---

## New Enums

```prisma
enum DatesheetStatus {
  DRAFT       // Being created/edited by admin
  PUBLISHED   // Visible to all stakeholders
  ARCHIVED    // Historical record, no longer active
}
```

**Why these three states and nothing more:**
- DRAFT: Admin is building the datesheet, editable
- PUBLISHED: Frozen, visible to everyone, triggers notifications
- ARCHIVED: Old datesheets, soft-hidden from active views

---

## New Models

### 1. Datesheet (The Container)

```prisma
model Datesheet {
  id                String           @id @default(uuid())
  title             String           // "Final Term Exam 2025-26", "Mid-Term March 2026"
  description       String?          // Optional notes
  examType          ExamType         // MIDTERM, FINAL, QUIZ, CUSTOM — reuses existing enum
  academicSessionId String
  status            DatesheetStatus  @default(DRAFT)
  startDate         DateTime         @db.Date  // First exam date
  endDate           DateTime         @db.Date  // Last exam date
  publishedAt       DateTime?        // When it was published
  publishedById     String?          // Who published it
  createdById       String
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])
  publishedBy     User?           @relation("DatesheetPublisher", fields: [publishedById], references: [id])
  createdBy       User            @relation("DatesheetCreator", fields: [createdById], references: [id])
  entries         DatesheetEntry[]

  @@index([academicSessionId])
  @@index([status])
  @@index([examType])
  @@index([startDate, endDate])
}
```

**Design Decisions:**
- `examType` reuses existing `ExamType` enum — no new enum needed for exam category
- `startDate`/`endDate` define the datesheet period (not individual paper times)
- `publishedAt` + `publishedById` track the exact publish event for audit
- No soft-delete (`deletedAt`) — DRAFT can be hard-deleted, PUBLISHED gets ARCHIVED

### 2. DatesheetEntry (The Schedule Cell)

```prisma
model DatesheetEntry {
  id            String    @id @default(uuid())
  datesheetId   String
  classId       String
  sectionId     String?   // null = all sections of the class
  subjectId     String
  examDate      DateTime  @db.Date  // The specific date of this paper
  startTime     String    // HH:mm format — "09:00"
  endTime       String    // HH:mm format — "12:00"
  room          String?   // Optional venue/room
  instructions  String?   // Paper-specific instructions ("Bring calculator")
  totalMarks    Decimal?  // Optional — marks for this paper
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  datesheet Datesheet @relation(fields: [datesheetId], references: [id], onDelete: Cascade)
  class     Class     @relation(fields: [classId], references: [id])
  section   Section?  @relation(fields: [sectionId], references: [id])
  subject   Subject   @relation(fields: [subjectId], references: [id])
  duties    DatesheetDuty[]

  @@unique([datesheetId, classId, sectionId, subjectId])  // One paper per subject per class per datesheet
  @@index([datesheetId])
  @@index([classId, sectionId])
  @@index([examDate])
  @@index([subjectId])
}
```

**Design Decisions:**
- `sectionId` is nullable — `null` means "ALL sections of this class" (common case: Class 10 A, B, C all have same paper at same time)
- `startTime`/`endTime` as strings (HH:mm) — same pattern as `PeriodSlot`, proven to work
- `totalMarks` optional — not all schools put marks on datesheet
- `instructions` per entry — "Bring calculator for Math paper"
- **Unique constraint** prevents scheduling same subject twice for same class in same datesheet
- `onDelete: Cascade` — deleting a datesheet removes all entries (DRAFT cleanup)

### 3. DatesheetDuty (Teacher Invigilation)

```prisma
model DatesheetDuty {
  id                String    @id @default(uuid())
  datesheetEntryId  String
  teacherProfileId  String
  role              String    @default("INVIGILATOR")  // "INVIGILATOR", "HEAD_INVIGILATOR", "SUPERVISOR"
  room              String?   // Override room — teacher might be in a different room than the entry
  notes             String?   // "Handle question paper distribution"
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  datesheetEntry DatesheetEntry @relation(fields: [datesheetEntryId], references: [id], onDelete: Cascade)
  teacherProfile TeacherProfile @relation(fields: [teacherProfileId], references: [id])

  @@unique([datesheetEntryId, teacherProfileId])  // One duty per teacher per entry
  @@index([teacherProfileId])
  @@index([datesheetEntryId])
}
```

**Design Decisions:**
- `role` as String (not enum) — schools have different duty titles, keeping flexible
- `room` overrides the entry's room — a teacher might invigitate in Room 101 while the paper is for a class that spans Room 101 + 102
- **Unique constraint**: Same teacher can't be assigned twice to the same paper entry
- `onDelete: Cascade` from entry — clean cascade chain: Datesheet → Entry → Duty

---

## Relationship to Existing Tables

### Existing Tables — Zero Modifications Needed

| Table | Relationship | Direction |
|-------|-------------|-----------|
| `AcademicSession` | Datesheet belongs to a session | Datesheet → Session |
| `Class` | Entry references a class | Entry → Class |
| `Section` | Entry optionally references a section | Entry → Section |
| `Subject` | Entry references a subject | Entry → Subject |
| `TeacherProfile` | Duty references a teacher | Duty → Teacher |
| `User` | Datesheet tracks creator & publisher | Datesheet → User |

### New Relations to Add on Existing Models

```prisma
// Add to AcademicSession model:
datesheets Datesheet[]

// Add to Class model:
datesheetEntries DatesheetEntry[]

// Add to Section model:
datesheetEntries DatesheetEntry[]

// Add to Subject model:
datesheetEntries DatesheetEntry[]

// Add to TeacherProfile model:
datesheetDuties DatesheetDuty[]

// Add to User model:
publishedDatesheets Datesheet[] @relation("DatesheetPublisher")
createdDatesheets   Datesheet[] @relation("DatesheetCreator")
```

---

## Indexes Strategy

| Index | Purpose | Query Pattern |
|-------|---------|---------------|
| `Datesheet(academicSessionId)` | Filter by session | Dashboard loads |
| `Datesheet(status)` | Filter PUBLISHED only | Student/Family/Teacher views |
| `Datesheet(examType)` | Filter by exam type | Category filtering |
| `Datesheet(startDate, endDate)` | Date range queries | "Upcoming datesheets" |
| `DatesheetEntry(datesheetId)` | Load all entries for a datesheet | Grid rendering |
| `DatesheetEntry(classId, sectionId)` | Load entries for a class | Student/Family view |
| `DatesheetEntry(examDate)` | Sort by date | Calendar view |
| `DatesheetEntry(subjectId)` | Filter by subject | Subject-wise schedule |
| `DatesheetDuty(teacherProfileId)` | Teacher's duty roster | Teacher dashboard |
| `DatesheetDuty(datesheetEntryId)` | Duties for an entry | Admin duty management |

---

## Constraints & Validations

### Database-Level (Hard Constraints)
1. **`DatesheetEntry` unique**: `[datesheetId, classId, sectionId, subjectId]` — no duplicate papers
2. **`DatesheetDuty` unique**: `[datesheetEntryId, teacherProfileId]` — no duplicate teacher duty
3. **Cascade deletes**: Datesheet → Entries → Duties

### Application-Level (Validated in Server Actions)
1. `examDate` must be within `datesheet.startDate` and `datesheet.endDate`
2. `startTime` < `endTime` — validated using existing `isEndAfterStart()` util
3. No two entries for the same class on the same date with overlapping times
4. No teacher duty conflict — same teacher, same date, overlapping times in different entries
5. Cannot edit PUBLISHED datesheet (must unpublish first or archive)
6. Cannot publish datesheet with zero entries
7. Subject must be linked to the class via `SubjectClassLink` (optional but recommended validation)

---

## Migration Plan

### Migration File: `add_datesheet_system`

```sql
-- Step 1: Create enum
CREATE TYPE "DatesheetStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Step 2: Create Datesheet table
CREATE TABLE "Datesheet" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "examType" "ExamType" NOT NULL,
  "academicSessionId" TEXT NOT NULL,
  "status" "DatesheetStatus" NOT NULL DEFAULT 'DRAFT',
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "publishedById" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Datesheet_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create DatesheetEntry table
CREATE TABLE "DatesheetEntry" (
  "id" TEXT NOT NULL,
  "datesheetId" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "sectionId" TEXT,
  "subjectId" TEXT NOT NULL,
  "examDate" DATE NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "room" TEXT,
  "instructions" TEXT,
  "totalMarks" DECIMAL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DatesheetEntry_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create DatesheetDuty table
CREATE TABLE "DatesheetDuty" (
  "id" TEXT NOT NULL,
  "datesheetEntryId" TEXT NOT NULL,
  "teacherProfileId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'INVIGILATOR',
  "room" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DatesheetDuty_pkey" PRIMARY KEY ("id")
);

-- Step 5: Indexes (see Indexes Strategy above)
-- Step 6: Foreign keys
-- Step 7: Unique constraints
```

**Zero downtime** — all additive operations. No existing table modifications except adding relation arrays on models (which are Prisma-only, no DB change).

---

## Data Volume Estimates

| Entity | Per Datesheet | Per Year (4 datesheets) | Scale Factor |
|--------|--------------|-------------------------|--------------|
| Datesheet | 1 | 4 | Fixed |
| DatesheetEntry | ~60 (10 classes × 6 subjects) | ~240 | Linear with classes × subjects |
| DatesheetDuty | ~120 (60 entries × 2 teachers avg) | ~480 | Linear with entries × duty slots |

**Performance implication:** Negligible. Even at 50 classes × 10 subjects × 4 datesheets/year = 2000 entries/year. Standard indexed queries handle this trivially.
