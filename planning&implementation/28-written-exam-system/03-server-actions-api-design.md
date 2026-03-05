# Written Exam System — Server Actions & API Design

> **Date:** March 5, 2026  
> **Principle:** New actions for written-specific flows. Modified existing actions where delivery mode matters.

---

## Actions Overview

### New Actions (Written-Exam Specific)

| Action | File | Purpose |
|--------|------|---------|
| `initializeWrittenExamSessionsAction` | `written-exam-actions.ts` | Bulk-create sessions + empty answers for all students in assigned classes |
| `enterWrittenMarksAction` | `written-exam-actions.ts` | Enter/update marks for a single question for a single student |
| `batchEnterWrittenMarksAction` | `written-exam-actions.ts` | Enter all marks for a student at once (per-student view) |
| `bulkEnterWrittenMarksAction` | `written-exam-actions.ts` | Enter marks for multiple students & questions at once (spreadsheet view) |
| `markStudentAbsentAction` | `written-exam-actions.ts` | Mark a student as absent for a written exam |
| `unmarkStudentAbsentAction` | `written-exam-actions.ts` | Revert absent status for a student |
| `finalizeWrittenExamAction` | `written-exam-actions.ts` | Validate completeness + calculate all results + rank |
| `refinalizeWrittenExamAction` | `written-exam-actions.ts` | Recalculate after marks correction |

### Modified Existing Actions

| Action | File | Change |
|--------|------|--------|
| `createExamAction` | `exam-actions.ts` | Accept `deliveryMode` field, auto-set defaults for WRITTEN |
| `publishExamAction` | `exam-actions.ts` | Skip student notifications for WRITTEN exams |
| `getExamsForStudent` | `exam-queries.ts` | Filter out `deliveryMode: WRITTEN` from student exam list |

### Existing Actions — No Change Needed

| Action | Reason |
|--------|--------|
| `updateExamAction` | Already handles partial updates, deliveryMode is just a new field |
| `deleteExamAction` | Same soft-delete logic regardless of delivery mode |
| `calculateResult()` | Already works — reads AnswerGrades and sums marks |
| `deriveGrade()` | Pure function, delivery-mode agnostic |
| `getResultsByExam()` | Reads ExamResult, doesn't care about delivery mode |
| `getResultsByStudent()` | Includes all exam types in results |
| `getExamDetailedAnalytics()` | Returns all data — frontend filters what to show |

---

## New Action: `initializeWrittenExamSessionsAction`

### Purpose
Create ExamSessions and empty StudentAnswers for all students in the exam's assigned classes. This scaffolds the data structure that the marks entry UI needs.

### Signature
```typescript
async function initializeWrittenExamSessionsAction(input: {
  examId: string;
}): Promise<{ 
  success: boolean;
  sessionsCreated: number;
  studentsNotFound: string[];  // class has students without profiles
}>
```

### Logic
```
1. AUTH: Verify teacher owns this exam
2. VALIDATE: Exam.deliveryMode must be WRITTEN
3. VALIDATE: Exam.status must be PUBLISHED or ACTIVE
4. QUERY: Get all students in assigned classes (via ExamClassAssignment → Class → StudentProfile)
5. CHECK: Skip students who already have sessions (idempotent)
6. TRANSACTION:
   for each student:
     a. Create ExamSession {
          examId, studentId, attemptNumber: 1,
          status: NOT_STARTED,
          enteredById: currentTeacherId
        }
     b. For each ExamQuestion in exam:
        Create StudentAnswer {
          sessionId, examQuestionId,
          answerText: null, selectedOptionId: null
        }
7. RETURN: count of sessions created
```

### Critical Details
- **Idempotent:** If called again (e.g., new student added to class), only creates sessions for students who don't have one yet.
- **Batch insert:** Use `createMany` for performance with large classes.
- **Auto-trigger:** Can be auto-called when teacher first opens marks entry page (lazy initialization).

---

## New Action: `enterWrittenMarksAction`

### Purpose
Enter or update marks for a single question for a single student.

### Signature
```typescript
async function enterWrittenMarksAction(input: {
  sessionId: string;
  examQuestionId: string;
  marksAwarded: number;
  feedback?: string;
}): Promise<{
  success: boolean;
  studentAnswerId: string;
  answerGradeId: string;
  sessionComplete: boolean;  // true if all questions have marks
}>
```

### Logic
```
1. AUTH: Verify teacher owns the exam (via session → exam)
2. VALIDATE: Exam.deliveryMode must be WRITTEN
3. VALIDATE: 0 ≤ marksAwarded ≤ ExamQuestion.marks
4. VALIDATE: Session.status NOT in [GRADED, ABSENT]
5. FIND: StudentAnswer for this session + examQuestion
6. UPSERT: AnswerGrade {
     studentAnswerId,
     gradedBy: TEACHER,
     graderId: currentTeacherId,
     marksAwarded: input.marksAwarded,
     maxMarks: ExamQuestion.marks,
     feedback: input.feedback ?? null,
     aiConfidence: null, aiModelUsed: null
   }
7. UPDATE: StudentAnswer.answeredAt = now()
8. CHECK: Are all StudentAnswers for this session graded?
   - If yes → update ExamSession.status = SUBMITTED
   - If was NOT_STARTED → update to IN_PROGRESS
9. REVALIDATE: marks entry page
10. RETURN: success + sessionComplete flag
```

### Key Design Decisions
- **Upsert, not create:** Teacher can correct marks by re-entering. Overwrites previous AnswerGrade.
- **`gradedBy: TEACHER`:** Same enum value as manual online grading. The `enteredById` on ExamSession distinguishes the context.
- **Session status auto-update:** No manual status management for teacher. System infers based on completion percentage.

---

## New Action: `batchEnterWrittenMarksAction`

### Purpose
Enter all marks for a single student at once (per-student view "Save All" button).

### Signature
```typescript
async function batchEnterWrittenMarksAction(input: {
  sessionId: string;
  marks: Array<{
    examQuestionId: string;
    marksAwarded: number;
    feedback?: string;
  }>;
}): Promise<{
  success: boolean;
  totalMarksEntered: number;
  totalObtained: number;
  sessionComplete: boolean;
}>
```

### Logic
```
1. AUTH: Verify teacher owns the exam
2. VALIDATE: Exam.deliveryMode must be WRITTEN
3. VALIDATE: Session.status NOT in [GRADED, ABSENT]
4. VALIDATE: Each marks entry:
   - examQuestionId belongs to this exam
   - 0 ≤ marksAwarded ≤ ExamQuestion.marks
5. TRANSACTION:
   for each marks entry:
     a. Find StudentAnswer (sessionId + examQuestionId)
     b. Upsert AnswerGrade { marksAwarded, feedback, gradedBy: TEACHER, graderId }
     c. Update StudentAnswer.answeredAt = now()
6. CHECK: All questions graded?
   - If yes → ExamSession.status = SUBMITTED
   - If partial → ExamSession.status = IN_PROGRESS
7. CALCULATE: totalObtained = sum of all marksAwarded
8. REVALIDATE: marks entry page
9. RETURN: success + totals + sessionComplete
```

### Performance
- Single transaction for consistency
- Batch upsert where possible (Prisma `createMany` with `skipDuplicates` for StudentAnswer, individual upserts for AnswerGrade due to unique constraint)

---

## New Action: `bulkEnterWrittenMarksAction`

### Purpose
Enter marks from the spreadsheet view — multiple students, multiple questions, in one call.

### Signature
```typescript
async function bulkEnterWrittenMarksAction(input: {
  examId: string;
  entries: Array<{
    sessionId: string;
    examQuestionId: string;
    marksAwarded: number;
  }>;
}): Promise<{
  success: boolean;
  totalEntriesSaved: number;
  failedEntries: Array<{
    sessionId: string;
    examQuestionId: string;
    reason: string;
  }>;
  sessionStatuses: Array<{
    sessionId: string;
    status: SessionStatus;
    totalObtained: number;
    isComplete: boolean;
  }>;
}>
```

### Logic
```
1. AUTH: Verify teacher owns this exam
2. VALIDATE: Exam.deliveryMode must be WRITTEN
3. GROUP: entries by sessionId
4. TRANSACTION:
   for each entry:
     a. Validate: 0 ≤ marksAwarded ≤ ExamQuestion.marks
     b. Find StudentAnswer
     c. Upsert AnswerGrade
     d. Update StudentAnswer.answeredAt = now()
     e. Track failures
5. POST-TRANSACTION:
   for each affected session:
     a. Check completion status
     b. Update ExamSession.status
     c. Calculate running total
6. REVALIDATE: marks entry page
7. RETURN: success summary with per-session status
```

### Performance Considerations
- Max batch size: 500 entries per call (40 students × 12 questions = 480, fits comfortably)
- Partial failure handling: Individual entry failures don't roll back the whole batch
- Consider using raw SQL for large batches if Prisma performance is insufficient

---

## New Action: `markStudentAbsentAction`

### Signature
```typescript
async function markStudentAbsentAction(input: {
  sessionId: string;
}): Promise<{ success: boolean }>
```

### Logic
```
1. AUTH: Verify teacher owns the exam
2. VALIDATE: Exam.deliveryMode must be WRITTEN
3. VALIDATE: Session.status NOT in [GRADED] (can't mark absent after finalization — must re-finalize)
4. TRANSACTION:
   a. Delete all AnswerGrade records for this session's StudentAnswers
   b. Reset all StudentAnswer fields (answeredAt: null)
   c. Delete ExamResult if exists
   d. Update ExamSession.status = ABSENT
5. REVALIDATE: marks entry page
```

### Revert Action: `unmarkStudentAbsentAction`

```typescript
async function unmarkStudentAbsentAction(input: {
  sessionId: string;
}): Promise<{ success: boolean }>
```

```
1. AUTH + VALIDATE (same checks)
2. Update ExamSession.status = NOT_STARTED
3. REVALIDATE: marks entry page
```

---

## New Action: `finalizeWrittenExamAction`

### Purpose
Calculate results for all completed sessions and rank students.

### Signature
```typescript
async function finalizeWrittenExamAction(input: {
  examId: string;
}): Promise<{
  success: boolean;
  resultsCreated: number;
  absentCount: number;
  incompleteCount: number;
  incompleteStudents: Array<{
    studentId: string;
    studentName: string;
    questionsRemaining: number;
  }>;
}>
```

### Logic
```
1. AUTH: Verify teacher owns this exam
2. VALIDATE: Exam.deliveryMode must be WRITTEN
3. VALIDATE: Exam.status must be PUBLISHED or ACTIVE
4. QUERY: All ExamSessions for this exam
5. CATEGORIZE:
   - ABSENT sessions → skip (no result)
   - Sessions with ALL AnswerGrades → ready to finalize
   - Sessions with MISSING AnswerGrades → incomplete (reported back)
6. IF incompleteCount > 0:
   - RETURN with incompleteStudents list (teacher must complete or mark absent)
   - DO NOT finalize any results
7. TRANSACTION (only if all non-absent are complete):
   for each complete session:
     a. ExamSession.status → GRADED
     b. ExamSession.submittedAt → now()
     c. calculateResult(sessionId) → creates/updates ExamResult
8. POST-TRANSACTION:
   a. Calculate ranks (order by obtainedMarks DESC)
   b. Update ExamResult.rank for each result
   c. Exam.status → COMPLETED
9. REVALIDATE: results page, exam list
10. RETURN: success summary
```

### Critical Design Decision: All-or-Nothing Finalization

Why not finalize completed students and leave incomplete ones?

**Because ranking requires all results.** If you finalize 30 out of 40 students, ranks are wrong. When the remaining 10 finalize, you'd need to recalculate all 30 previous ranks. This creates complexity and confusion.

**Instead:** Teacher must either:
- Complete all marks, OR
- Mark remaining students as ABSENT

Then finalize produces correct ranks for all students at once.

---

## New Action: `refinalizeWrittenExamAction`

### Purpose
After correcting marks, recalculate results and ranks.

### Signature
```typescript
async function refinalizeWrittenExamAction(input: {
  examId: string;
}): Promise<{
  success: boolean;
  resultsUpdated: number;
}>
```

### Logic
```
1. AUTH: Verify teacher owns this exam
2. VALIDATE: Exam.deliveryMode must be WRITTEN
3. VALIDATE: Exam has been finalized before (status = COMPLETED or has ExamResults)
4. TRANSACTION:
   for each GRADED session:
     a. Recalculate: obtainedMarks = sum of AnswerGrade.marksAwarded
     b. Recalculate: percentage, grade, isPassed
     c. Update ExamResult
5. POST-TRANSACTION:
   a. Recalculate ranks
   b. Update ExamResult.rank for each result
6. REVALIDATE: results page
7. RETURN: count of updated results
```

---

## New Queries: `written-exam-queries.ts`

### `getWrittenExamMarkEntryData`

Fetches all data needed for the marks entry page.

```typescript
async function getWrittenExamMarkEntryData(examId: string): Promise<{
  exam: {
    id: string;
    title: string;
    deliveryMode: ExamDeliveryMode;
    totalMarks: number;
    passingMarks: number;
    status: ExamStatus;
  };
  questions: Array<{
    examQuestionId: string;
    sortOrder: number;
    marks: number;
    question: {
      id: string;
      title: string;
      type: QuestionType;
      difficulty: Difficulty;
    };
  }>;
  sessions: Array<{
    id: string;
    status: SessionStatus;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      rollNumber: string;
      registrationNo: string;
      className: string;
      sectionName: string;
    };
    answers: Array<{
      id: string;
      examQuestionId: string;
      answeredAt: Date | null;
      grade: {
        id: string;
        marksAwarded: number;
        maxMarks: number;
        feedback: string | null;
      } | null;
    }>;
    totalObtained: number | null;  // calculated: sum of grades
    isComplete: boolean;           // all questions have grades
  }>;
  stats: {
    totalStudents: number;
    completedCount: number;
    inProgressCount: number;
    absentCount: number;
    pendingCount: number;
  };
}>
```

### `getWrittenExamStudentDetail`

Fetches one student's marks for the per-student entry view.

```typescript
async function getWrittenExamStudentDetail(
  sessionId: string
): Promise<{
  session: {
    id: string;
    status: SessionStatus;
    student: { id: string; firstName: string; lastName: string; rollNumber: string };
  };
  questionMarks: Array<{
    examQuestionId: string;
    sortOrder: number;
    questionTitle: string;
    questionType: QuestionType;
    maxMarks: number;
    marksAwarded: number | null;
    feedback: string | null;
    isGraded: boolean;
  }>;
  totalObtained: number;
  totalMarks: number;
  percentage: number;
  isComplete: boolean;
}>
```

---

## Modified Action: `createExamAction`

### Changes
```typescript
// BEFORE:
const parsed = createExamSchema.parse(input);
// Creates exam with parsed fields

// AFTER:
const parsed = createExamSchema.parse(input);

// If WRITTEN mode, override certain fields:
if (parsed.deliveryMode === 'WRITTEN') {
  parsed.shuffleQuestions = false;          // no shuffling for paper exam
  parsed.maxAttempts = 1;                   // one attempt only
  // Duration, scheduledStartAt, scheduledEndAt remain as teacher sets
  // (for documentation purposes, not enforcement)
}

// Create exam with all fields including deliveryMode
```

### Updated Validation Schema
```typescript
// In exam-schemas.ts:
const createExamSchema = z.object({
  // ... existing fields
  deliveryMode: z.enum(['ONLINE', 'WRITTEN']).default('ONLINE'),  // ← NEW
  // ... rest unchanged
}).refine((data) => {
  // Written exams must have maxAttempts = 1
  if (data.deliveryMode === 'WRITTEN' && data.maxAttempts !== 1) {
    return false;
  }
  return true;
}, {
  message: "Written exams can only have 1 attempt",
  path: ['maxAttempts'],
});
```

---

## Modified Action: `publishExamAction`

### Changes
```typescript
// BEFORE:
await createNotification(/* notify students */);

// AFTER:
if (exam.deliveryMode === 'ONLINE') {
  await createNotification(/* notify students */);
}
// WRITTEN exams: no notification (students already took the physical exam)
```

---

## Modified Query: `getExamsForStudent`

### Changes
```typescript
// BEFORE:
where: {
  examClassAssignments: { some: { classId: studentClassId } },
  status: { in: ['PUBLISHED', 'ACTIVE'] },
  deletedAt: null,
}

// AFTER:
where: {
  examClassAssignments: { some: { classId: studentClassId } },
  status: { in: ['PUBLISHED', 'ACTIVE'] },
  deliveryMode: 'ONLINE',  // ← FILTER: only online exams for student
  deletedAt: null,
}
```

---

## Validation Schemas: `written-exam-schemas.ts`

```typescript
// Single marks entry
const enterWrittenMarksSchema = z.object({
  sessionId: z.string().uuid(),
  examQuestionId: z.string().uuid(),
  marksAwarded: z.number().min(0),
  feedback: z.string().max(2000).optional(),
});

// Batch marks entry (per student)
const batchEnterWrittenMarksSchema = z.object({
  sessionId: z.string().uuid(),
  marks: z.array(z.object({
    examQuestionId: z.string().uuid(),
    marksAwarded: z.number().min(0),
    feedback: z.string().max(2000).optional(),
  })).min(1),
});

// Bulk marks entry (spreadsheet)
const bulkEnterWrittenMarksSchema = z.object({
  examId: z.string().uuid(),
  entries: z.array(z.object({
    sessionId: z.string().uuid(),
    examQuestionId: z.string().uuid(),
    marksAwarded: z.number().min(0),
  })).min(1).max(500),  // Max 500 entries per batch
});

// Student absent
const markStudentAbsentSchema = z.object({
  sessionId: z.string().uuid(),
});

// Finalize
const finalizeWrittenExamSchema = z.object({
  examId: z.string().uuid(),
});
```

---

## Error Handling

| Error | Condition | Response |
|-------|-----------|----------|
| `EXAM_NOT_WRITTEN` | Action called on ONLINE exam | 400: "This action is only for written exams" |
| `EXAM_NOT_PUBLISHED` | Marks entry before publish | 400: "Exam must be published before entering marks" |
| `MARKS_EXCEED_MAX` | marksAwarded > question max | 400: "Marks (X) exceed maximum (Y) for this question" |
| `MARKS_NEGATIVE` | marksAwarded < 0 | 400: "Marks cannot be negative" |
| `SESSION_FINALIZED` | Entering marks on GRADED session | 400: "Session already finalized. Use re-finalize to correct marks" |
| `SESSION_ABSENT` | Entering marks on ABSENT session | 400: "Student is marked absent. Unmark absent first" |
| `INCOMPLETE_STUDENTS` | Finalizing with incomplete entries | 400: "X students have incomplete marks. Complete all entries or mark absent" |
| `NOT_EXAM_OWNER` | Teacher doesn't own the exam | 403: "You don't have permission for this exam" |

---

## Revalidation Paths

| Action | Revalidate |
|--------|-----------|
| initializeWrittenExamSessions | `/teacher/exams/[examId]/marks` |
| enterWrittenMarks | `/teacher/exams/[examId]/marks` |
| batchEnterWrittenMarks | `/teacher/exams/[examId]/marks` |
| bulkEnterWrittenMarks | `/teacher/exams/[examId]/marks` |
| markStudentAbsent | `/teacher/exams/[examId]/marks` |
| finalizeWrittenExam | `/teacher/exams/[examId]/marks`, `/teacher/results` |
| refinalizeWrittenExam | `/teacher/results`, `/teacher/results/[examId]` |
