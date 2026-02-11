# ExamCore - Database Schema Design

## Design Principles

1. **Normalized** — 3NF minimum, denormalize only for proven performance needs
2. **Referential Integrity** — Foreign keys everywhere, no orphan records
3. **Soft Deletes** — `deletedAt` on critical entities (users, exams, questions)
4. **Audit Trail** — `createdAt`, `updatedAt` on every table
5. **UUID Primary Keys** — No sequential IDs exposed in URLs
6. **Indexing Strategy** — Index all foreign keys + frequent query columns

---

## Entity Relationship Overview

```
School Settings (1)
    │
    ├── Users (Admin/Teacher/Student)
    │       │
    │       ├── Teacher → Subjects (M:M via TeacherSubject)
    │       └── Student → Classes (M:1)
    │
    ├── Departments
    │       └── Subjects
    │
    ├── Classes
    │       └── Sections
    │
    ├── Question Bank
    │       ├── Questions
    │       │     ├── MCQ Options
    │       │     └── Question Tags
    │       └── Tags
    │
    ├── Exams
    │       ├── Exam Questions (ordered)
    │       ├── Exam Assignments (to classes)
    │       └── Exam Sessions
    │             ├── Student Answers
    │             └── Answer Grades
    │
    └── Results
          └── Result Details
```

---

## Complete Schema Definition

### Core User Tables

#### `User`
```
id              UUID        PK, default uuid_generate_v4()
email           String      UNIQUE, NOT NULL
passwordHash    String      NOT NULL
firstName       String      NOT NULL
lastName        String      NOT NULL
role            Enum        ADMIN | TEACHER | STUDENT
phone           String?     nullable
avatarUrl       String?     nullable
isActive        Boolean     default true
lastLoginAt     DateTime?   nullable
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
deletedAt       DateTime?   nullable (soft delete)
```
**Indexes**: `email` (unique), `role`, `isActive`, `deletedAt`

#### `StudentProfile`
```
id              UUID        PK
userId          UUID        FK → User.id (UNIQUE, 1:1)
rollNumber      String      NOT NULL
registrationNo  String      UNIQUE, NOT NULL
classId         UUID        FK → Class.id
sectionId       UUID        FK → Section.id
guardianName    String?     nullable
guardianPhone   String?     nullable
dateOfBirth     DateTime?   nullable
gender          Enum?       MALE | FEMALE | OTHER
enrollmentDate  DateTime    default now()
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```
**Indexes**: `userId` (unique), `classId`, `sectionId`, `rollNumber`, `registrationNo` (unique)

#### `TeacherProfile`
```
id              UUID        PK
userId          UUID        FK → User.id (UNIQUE, 1:1)
employeeId      String      UNIQUE, NOT NULL
qualification   String?     nullable
specialization  String?     nullable
joiningDate     DateTime    default now()
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```
**Indexes**: `userId` (unique), `employeeId` (unique)

---

### Organization Tables

#### `Department`
```
id              UUID        PK
name            String      UNIQUE, NOT NULL
description     String?     nullable
isActive        Boolean     default true
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```

#### `Subject`
```
id              UUID        PK
name            String      NOT NULL
code            String      UNIQUE, NOT NULL
departmentId    UUID        FK → Department.id
description     String?     nullable
isActive        Boolean     default true
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```
**Indexes**: `code` (unique), `departmentId`

#### `TeacherSubject`
```
id              UUID        PK
teacherId       UUID        FK → TeacherProfile.id
subjectId       UUID        FK → Subject.id
createdAt       DateTime    default now()
```
**Indexes**: `(teacherId, subjectId)` unique composite

#### `Class`
```
id              UUID        PK
name            String      NOT NULL (e.g., "Grade 10", "Class 9")
grade           Int         NOT NULL (numeric grade level)
isActive        Boolean     default true
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```
**Indexes**: `grade`

#### `Section`
```
id              UUID        PK
name            String      NOT NULL (e.g., "A", "B", "C")
classId         UUID        FK → Class.id
isActive        Boolean     default true
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```
**Indexes**: `classId`, `(classId, name)` unique composite

---

### Question Bank Tables

#### `Tag`
```
id              UUID        PK
name            String      UNIQUE, NOT NULL
category        Enum        TOPIC | DIFFICULTY | BLOOM_LEVEL | CUSTOM
createdAt       DateTime    default now()
```
**Indexes**: `name` (unique), `category`

#### `Question`
```
id              UUID        PK
subjectId       UUID        FK → Subject.id
createdById     UUID        FK → User.id (teacher who created)
type            Enum        MCQ | SHORT_ANSWER | LONG_ANSWER
title           String      NOT NULL (question text)
description     String?     nullable (additional context/instructions)
imageUrl        String?     nullable (question image)
difficulty      Enum        EASY | MEDIUM | HARD
marks           Decimal     NOT NULL (max marks for this question)
expectedTime    Int?        nullable (expected time in seconds)
modelAnswer     String?     nullable (ideal answer for AI grading)
gradingRubric   Json?       nullable (structured rubric for AI)
explanation     String?     nullable (shown after exam)
isActive        Boolean     default true
usageCount      Int         default 0 (times used in exams)
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
deletedAt       DateTime?   nullable
```
**Indexes**: `subjectId`, `createdById`, `type`, `difficulty`, `isActive`, `deletedAt`
**Full-text search**: `title`, `description`

#### `McqOption`
```
id              UUID        PK
questionId      UUID        FK → Question.id (CASCADE delete)
label           String      NOT NULL (e.g., "A", "B", "C", "D")
text            String      NOT NULL (option text)
imageUrl        String?     nullable
isCorrect       Boolean     default false
sortOrder       Int         NOT NULL
createdAt       DateTime    default now()
```
**Indexes**: `questionId`, `(questionId, label)` unique composite

#### `QuestionTag`
```
id              UUID        PK
questionId      UUID        FK → Question.id (CASCADE delete)
tagId           UUID        FK → Tag.id
createdAt       DateTime    default now()
```
**Indexes**: `(questionId, tagId)` unique composite

---

### Exam Tables

#### `Exam`
```
id              UUID        PK
title           String      NOT NULL
description     String?     nullable
subjectId       UUID        FK → Subject.id
createdById     UUID        FK → User.id (teacher)
type            Enum        QUIZ | MIDTERM | FINAL | PRACTICE | CUSTOM
status          Enum        DRAFT | PUBLISHED | ACTIVE | COMPLETED | ARCHIVED
totalMarks      Decimal     NOT NULL (calculated from questions)
passingMarks    Decimal     NOT NULL
duration        Int         NOT NULL (in minutes)
scheduledStartAt DateTime?  nullable (when exam opens)
scheduledEndAt  DateTime?   nullable (when exam closes)
instructions    String?     nullable (shown before exam)
shuffleQuestions Boolean    default false
showResultAfter Enum        IMMEDIATELY | AFTER_DEADLINE | MANUAL
allowReview     Boolean     default true (students can review after)
maxAttempts     Int         default 1
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
deletedAt       DateTime?   nullable
```
**Indexes**: `subjectId`, `createdById`, `status`, `scheduledStartAt`, `scheduledEndAt`

#### `ExamQuestion`
```
id              UUID        PK
examId          UUID        FK → Exam.id (CASCADE delete)
questionId      UUID        FK → Question.id
sortOrder       Int         NOT NULL
marks           Decimal     NOT NULL (can override question's default marks)
isRequired      Boolean     default true
createdAt       DateTime    default now()
```
**Indexes**: `examId`, `questionId`, `(examId, sortOrder)` unique composite

#### `ExamClassAssignment`
```
id              UUID        PK
examId          UUID        FK → Exam.id (CASCADE delete)
classId         UUID        FK → Class.id
sectionId       UUID?       FK → Section.id (nullable = all sections)
createdAt       DateTime    default now()
```
**Indexes**: `examId`, `classId`, `(examId, classId, sectionId)` unique composite

---

### Exam Session Tables

#### `ExamSession`
```
id              UUID        PK
examId          UUID        FK → Exam.id
studentId       UUID        FK → User.id
attemptNumber   Int         default 1
status          Enum        NOT_STARTED | IN_PROGRESS | SUBMITTED | TIMED_OUT | GRADING | GRADED
startedAt       DateTime?   nullable (when student starts)
submittedAt     DateTime?   nullable (when submitted)
timeSpent       Int?        nullable (total seconds spent)
ipAddress       String?     nullable
userAgent       String?     nullable
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```
**Indexes**: `(examId, studentId, attemptNumber)` unique composite, `status`

#### `StudentAnswer`
```
id              UUID        PK
sessionId       UUID        FK → ExamSession.id (CASCADE delete)
examQuestionId  UUID        FK → ExamQuestion.id
answerText      String?     nullable (for short/long answer)
selectedOptionId UUID?      FK → McqOption.id (for MCQ)
isMarkedForReview Boolean   default false
answeredAt      DateTime?   nullable
timeSpent       Int?        nullable (seconds on this question)
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```
**Indexes**: `sessionId`, `examQuestionId`, `(sessionId, examQuestionId)` unique composite

---

### Grading Tables

#### `AnswerGrade`
```
id              UUID        PK
studentAnswerId UUID        FK → StudentAnswer.id (UNIQUE, 1:1)
gradedBy        Enum        SYSTEM | AI | TEACHER
graderId        UUID?       FK → User.id (if teacher graded)
marksAwarded    Decimal     NOT NULL
maxMarks        Decimal     NOT NULL
feedback        String?     nullable (AI or teacher feedback)
aiConfidence    Decimal?    nullable (0.0 - 1.0, AI confidence)
aiModelUsed     String?     nullable (e.g., "gpt-4o-mini")
aiPromptTokens  Int?        nullable
aiResponseTokens Int?       nullable
isReviewed      Boolean     default false (teacher reviewed AI grade)
reviewedAt      DateTime?   nullable
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```
**Indexes**: `studentAnswerId` (unique), `gradedBy`, `isReviewed`

---

### Result Tables

#### `ExamResult`
```
id              UUID        PK
sessionId       UUID        FK → ExamSession.id (UNIQUE, 1:1)
examId          UUID        FK → Exam.id
studentId       UUID        FK → User.id
totalMarks      Decimal     NOT NULL (max possible)
obtainedMarks   Decimal     NOT NULL
percentage      Decimal     NOT NULL
grade           String?     nullable (A+, A, B+, etc.)
isPassed        Boolean     NOT NULL
rank            Int?        nullable (within class)
publishedAt     DateTime?   nullable
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```
**Indexes**: `sessionId` (unique), `examId`, `studentId`, `(examId, studentId)`

---

### System Tables

#### `SchoolSettings`
```
id              UUID        PK (singleton — only one row)
schoolName      String      NOT NULL
schoolLogo      String?     nullable
address         String?     nullable
phone           String?     nullable
email           String?     nullable
website         String?     nullable
gradingScale    Json        NOT NULL (grade boundaries config)
timezone        String      default "Asia/Karachi"
academicYear    String      NOT NULL (e.g., "2025-2026")
createdAt       DateTime    default now()
updatedAt       DateTime    @updatedAt
```

#### `AuditLog`
```
id              UUID        PK
userId          UUID        FK → User.id
action          String      NOT NULL (e.g., "EXAM_CREATED", "GRADE_OVERRIDDEN")
entityType      String      NOT NULL (e.g., "Exam", "Question")
entityId        UUID        NOT NULL
metadata        Json?       nullable (additional context)
ipAddress       String?     nullable
createdAt       DateTime    default now()
```
**Indexes**: `userId`, `entityType`, `entityId`, `createdAt`, `action`

#### `Notification`
```
id              UUID        PK
userId          UUID        FK → User.id
title           String      NOT NULL
message         String      NOT NULL
type            Enum        EXAM_ASSIGNED | EXAM_REMINDER | RESULT_PUBLISHED | GRADE_REVIEWED | SYSTEM
isRead          Boolean     default false
actionUrl       String?     nullable
createdAt       DateTime    default now()
```
**Indexes**: `userId`, `isRead`, `createdAt`

---

## Enum Definitions

```
UserRole:         ADMIN | TEACHER | STUDENT
Gender:           MALE | FEMALE | OTHER
QuestionType:     MCQ | SHORT_ANSWER | LONG_ANSWER
Difficulty:       EASY | MEDIUM | HARD
TagCategory:      TOPIC | DIFFICULTY | BLOOM_LEVEL | CUSTOM
ExamType:         QUIZ | MIDTERM | FINAL | PRACTICE | CUSTOM
ExamStatus:       DRAFT | PUBLISHED | ACTIVE | COMPLETED | ARCHIVED
SessionStatus:    NOT_STARTED | IN_PROGRESS | SUBMITTED | TIMED_OUT | GRADING | GRADED
ShowResultAfter:  IMMEDIATELY | AFTER_DEADLINE | MANUAL
GradedBy:         SYSTEM | AI | TEACHER
NotificationType: EXAM_ASSIGNED | EXAM_REMINDER | RESULT_PUBLISHED | GRADE_REVIEWED | SYSTEM
```

---

## Key Relationships Summary

| Relationship                    | Type   | Notes                                    |
| ------------------------------- | ------ | ---------------------------------------- |
| User → StudentProfile           | 1:1    | Only for STUDENT role                    |
| User → TeacherProfile           | 1:1    | Only for TEACHER role                    |
| Teacher → Subjects              | M:M    | Via TeacherSubject junction              |
| Student → Class                 | M:1    | Student belongs to one class             |
| Student → Section               | M:1    | Student belongs to one section           |
| Class → Sections                | 1:M    | Class has many sections                  |
| Department → Subjects           | 1:M    | Subject belongs to one department        |
| Subject → Questions             | 1:M    | Questions categorized by subject         |
| Question → McqOptions           | 1:M    | Only for MCQ type                        |
| Question → Tags                 | M:M    | Via QuestionTag junction                 |
| Exam → ExamQuestions            | 1:M    | Ordered questions in exam                |
| Exam → Classes                  | M:M    | Via ExamClassAssignment                  |
| Exam → ExamSessions             | 1:M    | One session per student attempt          |
| ExamSession → StudentAnswers    | 1:M    | Student's answers in a session           |
| StudentAnswer → AnswerGrade     | 1:1    | One grade per answer                     |
| ExamSession → ExamResult        | 1:1    | Aggregated result per session            |

---

## Migration Strategy

1. **Prisma Migrate** for schema versioning
2. Each migration is atomic and reversible
3. Seed scripts for development data
4. Separate seed for production (admin user only)
5. Migration naming: `YYYYMMDDHHMMSS_descriptive_name`
