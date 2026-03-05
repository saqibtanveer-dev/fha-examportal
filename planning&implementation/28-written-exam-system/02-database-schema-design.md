# Written Exam System — Database Schema Design

> **Date:** March 5, 2026  
> **Principle:** Minimal schema changes. Maximum compatibility with existing data.

---

## Schema Change Strategy

The goal is to extend the Exam model with ONE new field and ONE new enum, add ONE new session status value, and leave everything else untouched. No new tables. No structural rewrites.

---

## Changes Overview

| Change | Type | Impact |
|--------|------|--------|
| Add `ExamDeliveryMode` enum | NEW ENUM | Non-breaking |
| Add `deliveryMode` to `Exam` | NEW FIELD | Default `ONLINE`, non-breaking migration |
| Add `ABSENT` to `SessionStatus` | ENUM VALUE | Non-breaking, additive |
| Add `enteredById` to `ExamSession` | NEW FIELD | Nullable, tracks who created the session |

That's it. Four changes total. Everything else is behavioral.

---

## Detailed Schema Changes

### 1. New Enum: `ExamDeliveryMode`

```prisma
enum ExamDeliveryMode {
  ONLINE    // Student takes exam on portal (current behavior)
  WRITTEN   // Teacher enters marks after paper-based exam
}
```

**Why not `HYBRID`?** Because hybrid is ambiguous. Does it mean some questions are online and some are paper? Does it mean the student takes it on paper but submits online? Too many interpretations. Keep it clean: either the student takes it online, or the teacher enters marks. Period.

**Why not `OFFLINE`?** Because "offline" implies the app works without internet. "Written" clearly describes paper-based exams that every teacher understands.

### 2. Modified Model: `Exam`

```prisma
model Exam {
  id                String            @id @default(uuid())
  title             String
  description       String?
  subjectId         String
  createdById       String
  academicSessionId String?
  type              ExamType
  status            ExamStatus        @default(DRAFT)
  deliveryMode      ExamDeliveryMode  @default(ONLINE)    // ← NEW FIELD
  totalMarks        Decimal
  passingMarks      Decimal
  duration          Int
  scheduledStartAt  DateTime?
  scheduledEndAt    DateTime?
  instructions      String?
  shuffleQuestions   Boolean          @default(false)
  showResultAfter   ShowResultAfter   @default(IMMEDIATELY)
  allowReview       Boolean           @default(true)
  maxAttempts       Int               @default(1)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  deletedAt         DateTime?

  // ... existing relations unchanged
}
```

**Default `ONLINE`:** This ensures all existing exams remain online exams. Non-breaking migration.

**Index:** Add index on `deliveryMode` for filtering exam lists.

```prisma
@@index([deliveryMode])
```

### 3. Modified Enum: `SessionStatus`

```prisma
enum SessionStatus {
  NOT_STARTED
  IN_PROGRESS
  SUBMITTED
  TIMED_OUT
  GRADING
  GRADED
  ABSENT        // ← NEW VALUE — student was absent from written exam
}
```

**Why `ABSENT` at the session level?** Because it's the most natural place. An ExamSession represents "this student's involvement in this exam." If the student was absent, their session status is `ABSENT`. No result is created. Analytics queries exclude `ABSENT` sessions.

**Alternative considered and rejected:** A boolean `isAbsent` on ExamSession. Rejected because:
- It conflicts with `status` (what's the status of an absent session? NOT_STARTED? But that implies they haven't started yet)
- The enum approach is cleaner for querying: `WHERE status != 'ABSENT'`

### 4. Modified Model: `ExamSession`

```prisma
model ExamSession {
  id                String        @id @default(uuid())
  examId            String
  studentId         String
  attemptNumber     Int           @default(1)
  status            SessionStatus @default(NOT_STARTED)
  startedAt         DateTime?
  submittedAt       DateTime?
  timeSpent         Int?
  ipAddress         String?
  userAgent         String?
  tabSwitchCount    Int           @default(0)
  fullscreenExits   Int           @default(0)
  copyPasteAttempts Int           @default(0)
  isFlagged         Boolean       @default(false)
  enteredById       String?       // ← NEW FIELD — teacher who entered marks
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  // ... existing relations
  enteredBy         User?         @relation("MarksEnteredBy", fields: [enteredById], references: [id])
  
  @@unique([examId, studentId, attemptNumber])
  @@index([status])
  @@index([enteredById])    // ← NEW INDEX
}
```

**`enteredById`:** For online exams, this is null (student creates their own session). For written exams, this is the teacher who entered the marks. Useful for audit trail: "Who entered these marks?"

---

## What Does NOT Change in Schema

| Model | Reason for No Change |
|-------|---------------------|
| `ExamQuestion` | Questions don't care about delivery mode |
| `StudentAnswer` | `answerText` and `selectedOptionId` stay null for written — only `AnswerGrade` matters |
| `AnswerGrade` | Already supports `gradedBy: TEACHER` which is exactly what written exams use |
| `ExamResult` | Same calculation regardless of how marks were entered |
| `Question` | Delivery-mode agnostic |
| `McqOption` | Same question can be in online or written exam |
| `ExamClassAssignment` | Same class assignment logic |

---

## Migration Script

```sql
-- Migration: add_exam_delivery_mode

-- 1. Create enum
CREATE TYPE "ExamDeliveryMode" AS ENUM ('ONLINE', 'WRITTEN');

-- 2. Add column with default (non-breaking)
ALTER TABLE "Exam" ADD COLUMN "deliveryMode" "ExamDeliveryMode" NOT NULL DEFAULT 'ONLINE';

-- 3. Add ABSENT to SessionStatus
ALTER TYPE "SessionStatus" ADD VALUE 'ABSENT';

-- 4. Add enteredById to ExamSession
ALTER TABLE "ExamSession" ADD COLUMN "enteredById" TEXT;
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_enteredById_fkey" 
  FOREIGN KEY ("enteredById") REFERENCES "User"("id") ON DELETE SET NULL;

-- 5. Add indexes
CREATE INDEX "Exam_deliveryMode_idx" ON "Exam"("deliveryMode");
CREATE INDEX "ExamSession_enteredById_idx" ON "ExamSession"("enteredById");
```

**Impact on existing data:** Zero. All existing exams get `deliveryMode: ONLINE` which is their current behavior. All existing sessions are unaffected (enteredById stays null).

---

## Field Behavior by Delivery Mode

### `Exam` Fields

| Field | ONLINE | WRITTEN |
|-------|--------|---------|
| `title` | Required | Required |
| `description` | Optional | Optional |
| `subjectId` | Required | Required |
| `type` | Required | Required |
| `totalMarks` | Required | Required |
| `passingMarks` | Required | Required |
| `duration` | Enforced (timer) | Informational only (not enforced) |
| `scheduledStartAt` | Enforced (access window) | Optional (exam date for records) |
| `scheduledEndAt` | Enforced (access window) | Optional |
| `instructions` | Shown to student before exam | Not used (teacher sees them) |
| `shuffleQuestions` | Applied during exam | Ignored |
| `showResultAfter` | Controls student result visibility | Same — controls when student sees result |
| `allowReview` | Controls if student can review answers | Same — but "review" means seeing marks breakdown |
| `maxAttempts` | Enforced (limit attempts) | Always 1 (makes no sense for written) |

### `ExamSession` Fields

| Field | ONLINE | WRITTEN |
|-------|--------|---------|
| `studentId` | Student who started session | Student whose marks are being entered |
| `attemptNumber` | Incremented per attempt | Always 1 |
| `status` | Full lifecycle | NOT_STARTED → IN_PROGRESS → SUBMITTED → GRADED or ABSENT |
| `startedAt` | When student clicked "Start" | When teacher started entering marks |
| `submittedAt` | When student clicked "Submit" | When teacher finished entering all marks |
| `timeSpent` | Calculated from session duration | Null |
| `ipAddress` | Student's IP | Null |
| `userAgent` | Student's browser | Null |
| `tabSwitchCount` | Tracked | Always 0 |
| `fullscreenExits` | Tracked | Always 0 |
| `copyPasteAttempts` | Tracked | Always 0 |
| `isFlagged` | Based on violations | Always false |
| `enteredById` | Null | Teacher's userId |

### `StudentAnswer` Fields

| Field | ONLINE | WRITTEN |
|-------|--------|---------|
| `answerText` | Student's text answer | Null (answer is on paper) |
| `selectedOptionId` | Student's MCQ selection | Null (answer is on paper) |
| `isMarkedForReview` | Student's review flag | Not used |
| `answeredAt` | When student answered | When teacher entered marks |
| `timeSpent` | Per-question time | Null |

### `AnswerGrade` Fields

| Field | ONLINE | WRITTEN |
|-------|--------|---------|
| `gradedBy` | SYSTEM / AI / TEACHER | Always TEACHER |
| `graderId` | Null for SYSTEM, userId for AI/TEACHER | Always teacher's userId |
| `marksAwarded` | Calculated by system/AI, or manual | Teacher-entered marks |
| `maxMarks` | From ExamQuestion.marks | Same |
| `feedback` | Optional teacher/AI feedback | Optional teacher remarks |
| `aiConfidence` | AI confidence score | Null |
| `aiModelUsed` | "gpt-4o-mini" | Null |
| `aiPromptTokens` | Token count | Null |
| `aiResponseTokens` | Token count | Null |
| `isReviewed` | AI review flag | Not applicable (always TEACHER graded) |

---

## Query Implications

### Exam List Queries

```sql
-- Teacher: List all my exams (both types)
WHERE createdById = :teacherId AND deletedAt IS NULL
-- Now includes exam.deliveryMode for badge display

-- Student: List available exams to take
WHERE deliveryMode = 'ONLINE'  -- ← FILTER OUT WRITTEN
  AND status IN ('PUBLISHED', 'ACTIVE')
  AND classId IN (:studentClassIds)
  AND deletedAt IS NULL

-- Student: List my results (both types)
-- No change — includes written exam results
```

### Analytics Queries

```sql
-- Detailed analytics: 
-- No SQL change needed. Frontend conditionally hides:
--   • timeDistribution (when exam.deliveryMode = 'WRITTEN')
--   • avgCompletionTime, fastestTime, slowestTime
--   • flaggedCount, avgTabSwitches, totalCopyPasteAttempts

-- Should exclude ABSENT sessions from calculations:
WHERE es.status = 'GRADED'  -- already does this
```

### Grading Queries

```sql
-- Teacher grading queue:
-- Written exams DON'T appear in grading queue
-- They have their own "marks entry" flow
WHERE exam.deliveryMode = 'ONLINE'
  AND es.status IN ('SUBMITTED', 'GRADING')
```

---

## Data Integrity Rules (Application-Level)

| Rule | Enforcement |
|------|-------------|
| Written exam: maxAttempts always 1 | Validation in `createExamAction` |
| Written exam: shuffleQuestions always false | Validation in `createExamAction` |
| Written exam: marks ≥ 0 and ≤ maxMarks | Per-question validation in marks entry action |
| Written exam: total entered = sum of question marks | Validation in finalize action |
| Written exam: session.enteredById required | Set automatically in marks entry action |
| Written exam: no anti-cheat fields populated | Defaults are fine (all 0/false) |
| Written exam: absent student has no AnswerGrades | Enforced in absent marking action |
| ABSENT status only valid for written exams | Validation in session status transitions |

---

## Relationship to Existing Exam Types

The `ExamType` enum (QUIZ, MIDTERM, FINAL, PRACTICE, CUSTOM) is **orthogonal** to `ExamDeliveryMode`. A teacher can have:

| Combination | Valid? | Example |
|-------------|--------|---------|
| QUIZ + ONLINE | ✅ | Quick online MCQ quiz |
| QUIZ + WRITTEN | ✅ | Short paper quiz in class |
| MIDTERM + ONLINE | ✅ | Online midterm with timer |
| MIDTERM + WRITTEN | ✅ | Traditional paper midterm |
| FINAL + ONLINE | ✅ | Online final exam |
| FINAL + WRITTEN | ✅ | Traditional paper final exam |
| PRACTICE + ONLINE | ✅ | Practice test online |
| PRACTICE + WRITTEN | ❌ | Doesn't make sense — practice is self-serve |
| CUSTOM + ONLINE | ✅ | Any custom online assessment |
| CUSTOM + WRITTEN | ✅ | Any custom paper assessment |

**Note:** PRACTICE + WRITTEN is technically allowed but discouraged. No hard validation needed.
