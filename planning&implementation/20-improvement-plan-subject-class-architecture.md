# ExamCore — Improvement Plan: Subject-Class Architecture, Data Model Gaps & Production Hardening

> **Date:** February 12, 2026  
> **Scope:** Architectural improvements discovered during brutal use-case analysis for 9-12 class school  
> **Status:** PLANNING ONLY — no code changes yet  
> **Dependencies:** Should be executed AFTER Phase A (Foundation Fixes) from `17-revised-implementation-roadmap.md`

---

## Executive Summary

A deep use-case walkthrough for a real 9th–12th grade school exposed **5 critical architectural gaps** that the existing planning docs (`01`–`19`) either missed or only touched on superficially. These gaps will cause real data integrity and usability problems in production:

1. **No Subject-Class differentiation** — 9th Physics and 10th Physics are the SAME subject
2. **No academic year/session lifecycle** — When the year changes, everything breaks
3. **No chapter/topic hierarchy** — Question bank has flat tags, no structured syllabus
4. **TeacherSubject not enforced** — Any teacher can create content for any subject
5. **Seed data is minimal** — Does not represent a realistic school scenario for testing

---

## Gap 1: Subject-Class Differentiation (CRITICAL)

### The Problem

Current schema:
```
Subject { name: "Physics", code: "PHY-101" }
```

This is ONE Physics for the entire school. In reality:

| Class | Physics Syllabus | Completely Different Content |
|---|---|---|
| 9th | Kinematics, Forces, Work & Energy, Simple Machines | Punjab Board / Federal Board 9th |
| 10th | Current Electricity, Magnetism, Nuclear Physics, Sound | Punjab Board / Federal Board 10th |
| 11th (FSc) | Measurements, Vectors, Motion, Force, Torque | FSc Part 1 |
| 12th (FSc) | Electrostatics, Current, Magnetism, EM Induction | FSc Part 2 |

**Impact without fix:**
- Teacher creates questions for 9th Physics and 10th Physics — ALL mixed in one pool
- When creating a 9th Physics exam, teacher sees 10th Physics questions too
- Question bank becomes unusable at scale (200+ questions, no class filter)
- Reports show "Physics department performance" but can't differentiate which class
- Admin can't see "How is Class 9 doing in Physics specifically?"

### Available Solutions (Analyzed)

#### Option A: Separate Subjects per Class (No Schema Change)

**Approach:** Admin creates class-specific subjects with codes:
```
PHY-09  →  "Physics (Class 9)"
PHY-10  →  "Physics (Class 10)"
PHY-11  →  "Physics (FSc-I)"
PHY-12  →  "Physics (FSc-II)"
```

**Pros:**
- Zero schema changes, zero code changes
- Works immediately with existing exam assignment logic
- Question bank automatically separated by class level
- Reports naturally break down by class-level subject

**Cons:**
- Data duplication in department → 4 "Physics" subjects under Science department
- Admin discipline required (naming convention must be followed)
- If admin creates just "Physics" without class suffix, problem returns
- No system-level enforcement of the convention

**Verdict:** Quick win, works for MVP. Fragile at scale.

#### Option B: Subject-Class Link Table (Schema Change — RECOMMENDED)

**Approach:** Add a `SubjectClassLink` model that formally connects subjects to classes:

```prisma
model SubjectClassLink {
  id        String   @id @default(uuid())
  subjectId String
  classId   String
  syllabus  String?  // Optional: "Punjab Board 9th Physics"
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  subject Subject @relation(fields: [subjectId], references: [id])
  class   Class   @relation(fields: [classId], references: [id])

  @@unique([subjectId, classId])
  @@index([classId])
  @@index([subjectId])
}
```

**What changes?**

1. **Question creation:** Teacher selects Subject + Class → question is tagged to that class-level subject
   - Add optional `classId` field to `Question` model OR
   - Filter questions through `SubjectClassLink` when creating exams

2. **Exam creation:** When teacher picks a subject, system shows "For which class?" dropdown filtered by `SubjectClassLink`. Questions shown are filtered to that class.

3. **Reports:** Analytics can now show "Physics performance for Class 9 specifically"

4. **Admin UI:** New management page to assign subjects to classes (e.g., "Physics is taught in Class 9, 10, 11, 12")

**Pros:**
- Clean separation at data level
- System-enforced, not convention-dependent
- One "Physics" subject, linked to multiple classes
- Reports can drill down by class + subject
- Question bank filterable by class level
- Future-proof for more complex setups

**Cons:**
- Schema migration needed
- UI changes in question creation, exam creation, admin subjects page
- Existing questions need backfill (assign classId)
- ~3-4 days of work

**Verdict:** Production-grade solution. Recommended for implementation.

#### Option C: Use Tags for Class-Level Filtering (No Schema Change)

**Approach:** Use existing `Tag` model with `TOPIC` or `CUSTOM` category:
```
Tag: { name: "Class-9", category: "CUSTOM" }
Tag: { name: "Class-10", category: "CUSTOM" }
```
Teacher tags each question with its class level.

**Pros:**
- Zero schema change
- Tag system already exists

**Cons:**
- Relies on teacher discipline (no system enforcement)
- Tags are flat, not hierarchical
- Can't enforce "a question MUST have a class tag"
- Reports can't easily aggregate by class-subject combination
- Feels hacky, not production-grade

**Verdict:** Band-aid. Not recommended for production.

### DECISION: Implement Option B (Subject-Class Link)

### Implementation Plan for Option B

#### Phase B-SC.1 — Schema Changes (Day 1)

**New model:**
```prisma
model SubjectClassLink {
  id        String   @id @default(uuid())
  subjectId String
  classId   String
  syllabus  String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  subject Subject @relation(fields: [subjectId], references: [id])
  class   Class   @relation(fields: [classId], references: [id])

  @@unique([subjectId, classId])
  @@index([classId])
  @@index([subjectId])
}
```

**Modify `Question` model — Add optional `classId`:**
```prisma
model Question {
  // ... existing fields
  classId String?   // NEW — which class level this question is for
  class   Class?    @relation(fields: [classId], references: [id])
}
```

**Why `classId` on Question?**
- When teacher creates a 9th Physics question, it's tagged to Class 9
- When building a 9th exam, filter questions by `subjectId + classId`
- Existing questions with `classId: null` still work (backward compatible)
- Explicit is better than implicit (don't rely on exam assignment to infer class)

**Modify `Subject` model — Add relation:**
```prisma
model Subject {
  // ... existing fields
  subjectClassLinks SubjectClassLink[]
}
```

**Modify `Class` model — Add relations:**
```prisma
model Class {
  // ... existing fields
  subjectClassLinks SubjectClassLink[]
  questions         Question[]
}
```

#### Phase B-SC.2 — Migration & Backfill (Day 1)

- [ ] Create Prisma migration for new model + question classId field
- [ ] Write backfill script: For each existing question, infer classId from its exams' ExamClassAssignment
- [ ] If a question is only used in Class 9 exams → set classId to class9.id
- [ ] If a question has no exams → leave classId as null (teacher can assign later)

#### Phase B-SC.3 — Admin UI: Subject-Class Management (Day 2)

- [ ] Add "Assigned Classes" section to Subject management page
- [ ] Show checkboxes or multi-select: "Which classes is this subject taught in?"
- [ ] Create `assignSubjectToClassAction` server action
- [ ] Create `removeSubjectFromClassAction` server action
- [ ] Show assigned classes as badges on subject list cards
- [ ] Validation: Can't remove a class link if questions exist for that subject+class

#### Phase B-SC.4 — Teacher UI: Question Creation with Class (Day 2)

- [ ] Add "Class" dropdown to question creation form
- [ ] Dropdown values: filtered by SubjectClassLink (show only classes where that subject is taught)
- [ ] Make classId required for new questions (enforce going forward)
- [ ] Update question list page: add class filter dropdown
- [ ] Update question list backend query: filter by classId if provided

#### Phase B-SC.5 — Teacher UI: Exam Creation with Class-Filtered Questions (Day 3)

- [ ] When teacher selects a subject for exam, show class filter
- [ ] Auto-infer class from ExamClassAssignment (if exam is assigned to Class 9, show Class 9 questions)
- [ ] Filter question selection dialog by subject + class
- [ ] Add class badge to question cards in the selection dialog

#### Phase B-SC.6 — Reports: Class-Level Subject Analytics (Day 3)

- [ ] Admin reports: "Physics performance — Class 9 vs Class 10"
- [ ] Teacher reports: "My Class 9 Physics exam avg vs Class 10"
- [ ] Update department performance query to break down by class
- [ ] Update subject performance query to break down by class

---

## Gap 2: Academic Year / Session Lifecycle (HIGH)

### The Problem

Current state:
```prisma
model SchoolSettings {
  academicYear String   // Just "2025" — a text field
}
```

**What happens when the school year changes?**

- It's now 2026. Class 9 students are now in Class 10.
- Admin changes `academicYear` to "2026" in settings.
- But students are STILL linked to Class 9 in `StudentProfile.classId`.
- Old exam results from 2025 are still linked to those students.
- If admin moves students to Class 10, the old Class 9 data looks wrong.
- If admin creates NEW Class 9 for 2026 batch, old class data is orphaned.
- **No way to view "2025 academic year results" vs "2026 academic year results".**

### Impact Without Fix

- Historical data is lost or corrupted on year change
- "Class 9 Physics performance" shows mixed data from multiple years
- Students can't be promoted without manual DB operations
- No year-over-year trend analysis possible

### Solution: Academic Session Model

#### New Schema

```prisma
model AcademicSession {
  id        String   @id @default(uuid())
  name      String   // "2025-2026"
  startDate DateTime
  endDate   DateTime
  isCurrent Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  exams      Exam[]          // All exams belong to a session
  // Optionally: studentEnrollments StudentEnrollment[]
}
```

#### What Changes?

1. **Exam model gets `academicSessionId`:**
   ```prisma
   model Exam {
     // ... existing fields
     academicSessionId String?
     academicSession   AcademicSession? @relation(...)
   }
   ```

2. **Admin creates academic sessions** (2025-2026, 2026-2027) and marks one as current.

3. **All new exams** are auto-linked to the current academic session.

4. **Reports filter by session** — "Show 2025-2026 results" vs "Show 2026-2027 results."

5. **Student promotion** — When year changes, admin can bulk-move students from Class 9 → Class 10 for the new session. Historical data preserved.

6. **SchoolSettings.academicYear** → replaced by the active `AcademicSession`.

### Implementation Plan

#### Phase B-AY.1 — Schema & Migration (0.5 day)

- [ ] Create `AcademicSession` model
- [ ] Add `academicSessionId` to `Exam` model (optional, nullable for backcompat)
- [ ] Create migration
- [ ] Backfill: Create "2025-2026" session, link all existing exams to it

#### Phase B-AY.2 — Admin UI (1 day)

- [ ] Add "Academic Sessions" section in Settings page (or new page `/admin/sessions`)
- [ ] CRUD for sessions: create, view, set active
- [ ] Only ONE session can be `isCurrent = true` at a time (enforce in code)
- [ ] Show session selector in admin reports for filtering

#### Phase B-AY.3 — Exam Integration (0.5 day)

- [ ] Auto-set `academicSessionId` on exam creation to current session
- [ ] Filter exam lists by current session (with option to view all/past sessions)
- [ ] Results filtered by session

#### Phase B-AY.4 — Student Promotion (1 day) — FUTURE

- [ ] Bulk student promotion action: "Move all Class 9 students to Class 10"
- [ ] Historical data remains linked to old class through session context
- [ ] This is a V2 feature — can be deferred

**Total effort: ~2-3 days (Phase B-AY.1 to B-AY.3), Phase B-AY.4 deferred**

---

## Gap 3: Chapter / Topic Hierarchy (MEDIUM)

### The Problem

Current state: Questions have flat `Tag` system with categories (TOPIC, DIFFICULTY, BLOOM_LEVEL, CUSTOM). But there's NO structured syllabus hierarchy.

Real school structure:
```
Class 9 Physics
├── Chapter 1: Physical Quantities and Measurement
│   ├── 1.1 Introduction to Physics
│   ├── 1.2 Physical Quantities
│   └── 1.3 Measurement
├── Chapter 2: Kinematics
│   ├── 2.1 Rest and Motion
│   ├── 2.2 Types of Motion
│   └── 2.3 Speed and Velocity
└── Chapter 3: Dynamics
    ├── 3.1 Force
    ├── 3.2 Newton's Laws
    └── 3.3 Friction
```

Without this, teacher can't:
- Filter questions by chapter
- Auto-generate an exam covering "Chapter 1-3"
- See analytics like "Students are weak in Chapter 2 Kinematics"
- Organize question bank meaningfully

### Solution Options

#### Option A: Use Tag System (Quick, Already Exists)

Create tags like:
```
{ name: "Ch-1: Physical Quantities", category: "TOPIC" }
{ name: "Ch-2: Kinematics", category: "TOPIC" }
```

**Pros:** No schema change. Works now.  
**Cons:** Flat, no parent-child. Can't represent "Chapter → Topic" hierarchy. No class association.

#### Option B: Chapter Model (Proper Hierarchy — RECOMMENDED)

```prisma
model Chapter {
  id        String   @id @default(uuid())
  subjectId String
  classId   String   // Links to specific class level
  name      String   // "Kinematics"
  number    Int      // 2
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  subject   Subject    @relation(fields: [subjectId], references: [id])
  class     Class      @relation(fields: [classId], references: [id])
  questions Question[] // Questions can be linked to a chapter

  @@unique([subjectId, classId, number])
  @@index([subjectId, classId])
}
```

And add `chapterId` to `Question`:
```prisma
model Question {
  // ... existing fields
  chapterId String?
  chapter   Chapter? @relation(fields: [chapterId], references: [id])
}
```

**Pros:**
- Clean hierarchy: Subject → Class → Chapter → Questions
- Teacher can filter questions by chapter when building exams
- Auto-generate exams: "3 MCQs from Chapter 1, 2 from Chapter 2"
- Analytics: "Class 9 Physics Chapter 2 avg score = 45% — weak area identified"
- Admin can manage chapters per subject per class

**Cons:**
- Schema change + migration
- Admin needs to set up chapters (one-time data entry)
- ~2 days of work

### DECISION: Implement Option B — But DEFER to Phase D

Chapter management is valuable but NOT blocking. Current tags can serve the purpose until chapters are built. Recommended to implement in Phase D (New Features) of the roadmap.

### Implementation Plan (When Executed)

#### Phase D-CH.1 — Schema & Migration (0.5 day)

- [ ] Create `Chapter` model
- [ ] Add `chapterId` to `Question` (optional, nullable)
- [ ] Create migration
- [ ] Seed sample chapters for Physics Class 9

#### Phase D-CH.2 — Admin UI: Chapter Management (1 day)

- [ ] Chapter management page nested under subject detail or as a tab
- [ ] CRUD: create, edit, delete, reorder chapters
- [ ] Show chapter count per subject on subject list page

#### Phase D-CH.3 — Teacher Integration (0.5 day)

- [ ] Add chapter dropdown to question creation form (filtered by subject + class)
- [ ] Add chapter filter to question list page
- [ ] Add chapter filter when selecting questions for exam
- [ ] Show chapter badge on question cards

---

## Gap 4: TeacherSubject Enforcement (MEDIUM)

### The Problem

Current state: `TeacherSubject` junction table exists in schema. A teacher can be "assigned" to subjects. But:

1. **No UI to manage assignments** — TeacherSubject table is always empty (only seedable)
2. **No enforcement** — Teacher can create questions/exams for ANY subject, regardless of assignment
3. **No filtering** — Teacher's question/exam lists show ALL subjects, not just their assigned ones

### Impact

- In a real school, Ahmed Khan teaches Physics only. He should NOT see Chemistry questions.
- Without enforcement, the system is a free-for-all — any teacher can create content for any subject.
- Admin has no control over "who teaches what."

### Solution

#### Phase B-TS.1 — Admin UI: Assign Teachers to Subjects (0.5 day)

- [ ] In admin Subjects page, add "Assigned Teachers" section per subject
- [ ] Multi-select dialog to assign/unassign teachers
- [ ] Create `assignTeacherToSubjectAction`
- [ ] Create `removeTeacherFromSubjectAction`
- [ ] Alternative: In admin Users page (teacher detail), show "Assigned Subjects" with checkboxes

#### Phase B-TS.2 — Teacher UI: Filter by Assigned Subjects (0.5 day)

- [ ] Teacher's question creation: Subject dropdown shows ONLY subjects they're assigned to
- [ ] Teacher's exam creation: Same filter
- [ ] Teacher's question list: Default filter to assigned subjects (with option to see all)
- [ ] If teacher has NO subject assignments, show all (backward compatible / grace period)

#### Phase B-TS.3 — Enforcement in Server Actions (0.5 day)

- [ ] `createQuestionAction` — Validate teacher is assigned to the subject (WARN, not block — soft enforcement)
- [ ] `createExamAction` — Same validation
- [ ] Log audit entry if teacher creates content for unassigned subject
- [ ] Admin override: Admin can always create for any subject

**Total effort: ~1.5 days**

---

## Gap 5: Seed Data Realism (LOW but IMPORTANT for Testing)

### The Problem

Current seed creates:
- 1 admin, 2 teachers, 4 students
- 3 departments, 4 subjects (all with generic codes like PHY-101)
- 2 classes (9, 10) with 3 sections
- 4 physics questions only
- 1 exam only
- Zero exam sessions, zero results, zero notifications, zero audit logs

**Why this matters:**
- Developer/reviewer can't see the system "in action" after seeding
- No completed exams → results pages are empty
- No notifications → notification icon always shows 0
- No audit logs → audit page is empty
- Dashboard stats are all zeros except for 1 exam
- Only physics has questions — chemistry, math, english pages are empty
- Can't test grading flow without manually taking an exam first

### Solution: Comprehensive Seed Script

#### Phase A-SEED.1 — Realistic Data Volume

**Target seed data:**

| Entity | Current Count | Target Count |
|---|---|---|
| Admins | 1 | 1 |
| Teachers | 2 | 4 (one per department, Physics teacher teaches Classes 9 & 10) |
| Students | 4 | 12 (3 per section × 4 sections) |
| Departments | 3 | 4 (Science, Mathematics, English, Social Studies) |
| Subjects | 4 | 8 (2 per department, ideally class-linked) |
| Classes | 2 | 4 (Class 9, 10, 11, 12) |
| Sections | 3 | 8 (2 sections per class: A, B) |
| Questions | 4 | 40+ (10 per subject, mix of MCQ/SHORT/LONG) |
| Exams | 1 | 6 (at least 1 per subject, different types: QUIZ, MIDTERM) |
| TeacherSubjects | 0 | 4+ (assign teachers to their subjects) |
| SubjectClassLinks | 0 (new model) | 8+ (each subject linked to its class) |
| ExamSessions | 0 | 8+ (some NOT_STARTED, some IN_PROGRESS, some SUBMITTED, some GRADED) |
| StudentAnswers | 0 | 30+ (answers for completed sessions) |
| AnswerGrades | 0 | 20+ (MCQ auto-graded, some teacher-graded) |
| ExamResults | 0 | 4+ (completed exam results with grades, percentages, ranks) |
| Notifications | 0 | 10+ (exam assigned, result published, etc.) |
| AuditLogs | 0 | 15+ (user created, exam published, etc.) |

#### Phase A-SEED.2 — Seed Script Structure

```
seed.ts structure:
1. School Settings (existing)
2. Academic Session (NEW — if Gap 2 implemented)
3. Admin User (existing)
4. Teachers (expand to 4)
5. Departments (expand to 4)
6. Subjects (expand to 8, with class context in names)
7. SubjectClassLinks (NEW — if Gap 1 implemented)
8. TeacherProfiles + TeacherSubject assignments (NEW)
9. Classes & Sections (expand to 4 classes × 2 sections)
10. Students (expand to 12)
11. Chapters (NEW — if Gap 3 implemented, or use tags)
12. Questions (expand to 40+, across multiple subjects)
13. Tags + QuestionTags (NEW — tag questions with topics)
14. Exams (expand to 6, different types, statuses)
15. ExamClassAssignments (proper class+section assignments)
16. ExamSessions (simulate student exam-taking)
17. StudentAnswers (simulate answers for submitted sessions)
18. AnswerGrades (auto-grade MCQs, simulate teacher grades)
19. ExamResults (calculate and store results)
20. Notifications (create realistic notifications)
21. AuditLogs (create historical audit entries)
```

#### Phase A-SEED.3 — Idempotency

- [ ] Current seed uses `create` for classes/sections — fails on re-run
- [ ] Switch ALL entities to `upsert` pattern
- [ ] Use deterministic IDs where possible (e.g., `class-9`, `dept-science`) for stable references
- [ ] Add `prisma.examSession.deleteMany()` etc. at top for clean re-seeds
- [ ] OR add a `--clean` flag that truncates all tables before seeding

**Total effort: ~1.5-2 days**

---

## Implementation Priority Matrix

```
                    HIGH IMPACT
                        ↑
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    │  Gap 1: Subject   │  Gap 2: Academic  │
    │  Class Link       │  Year Lifecycle   │
    │  ~3-4 days        │  ~2-3 days        │
    │  DO FIRST ★       │  DO SECOND        │
    │                   │                   │
LOW ├───────────────────┼───────────────────┤ HIGH
EFFORT│                 │                   │ EFFORT
    │  Gap 5: Seed Data │  Gap 3: Chapter   │
    │  ~1.5-2 days      │  Hierarchy         │
    │  DO WITH GAP 1    │  ~2 days          │
    │                   │  DEFER TO PHASE D │
    │  Gap 4: Teacher   │                   │
    │  Subject Enforce  │                   │
    │  ~1.5 days        │                   │
    │  DO WITH GAP 1    │                   │
    └───────────────────┼───────────────────┘
                        ↓
                    LOW IMPACT
```

---

## Execution Order (Integrated with Existing Roadmap)

These gaps should be slotted into the existing `17-revised-implementation-roadmap.md` as follows:

### Insert into Phase A (Foundation Fixes) — Week 1-2

| New Task | Insert After | Days |
|---|---|---|
| **A.7 — Seed Data Overhaul** (Gap 5, Phase A-SEED) | A.6 Quick Fixes | 1.5d |

### Insert into Phase B (Complete Features) — Week 3-5

| New Task | Insert After | Days |
|---|---|---|
| **B.0 — Subject-Class Architecture** (Gap 1, all B-SC phases) | Before B.1 | 3-4d |
| **B.0.5 — TeacherSubject Enforcement** (Gap 4, all B-TS phases) | After B.0 | 1.5d |
| **B.6 — Academic Session Lifecycle** (Gap 2, B-AY.1 to B-AY.3) | After B.5 | 2d |

### Insert into Phase D (New Features) — Week 7-9

| New Task | Insert After | Days |
|---|---|---|
| **D.6 — Chapter/Topic Hierarchy** (Gap 3, all D-CH phases) | After D.5 | 2d |

### Updated Phase B Timeline

```
Week 3:
  B.0  — Subject-Class Architecture       (3-4 days)  ← NEW
  B.0.5 — TeacherSubject Enforcement       (1.5 days) ← NEW

Week 4:
  B.1  — Student/Teacher Profile Mgmt     (2 days)    ← existing
  B.2  — Question Bank Completion          (2 days)    ← existing (now includes classId filter)

Week 5:
  B.3  — Exam Builder Completion           (2 days)    ← existing (now includes class-aware question selection)
  B.4  — Exam Session Completion           (2 days)    ← existing
  B.5  — Results Completion                (1-2 days)  ← existing
  B.6  — Academic Session Lifecycle        (2 days)    ← NEW
```

**Net impact on total timeline: +7-8 days (~1.5 additional weeks)**

**Updated total: ~56-60 working days (~12-14 weeks)**

---

## Files That Will Be Modified

### Schema Changes
| File | Changes |
|---|---|
| `prisma/schema.prisma` | New `SubjectClassLink`, `Chapter` (deferred), `AcademicSession` models. Add `classId` to `Question`. Add `academicSessionId` to `Exam`. |
| `prisma/seed.ts` | Complete rewrite for realistic data |

### Backend Changes
| File | Changes |
|---|---|
| `src/modules/subjects/subject-actions.ts` | Add subject-class link actions |
| `src/modules/subjects/subject-queries.ts` | Add subject-class queries, filter by class |
| `src/modules/questions/question-actions.ts` | Accept classId on create, validate SubjectClassLink |
| `src/modules/questions/question-queries.ts` | Filter questions by classId |
| `src/modules/exams/exam-actions.ts` | Auto-set academicSessionId, validate class-subject match |
| `src/modules/exams/exam-queries.ts` | `getExamsForStudent` — filter by session. Question selection filter by class. |
| `src/modules/results/report-queries.ts` | Break down by class + subject, filter by session |
| `src/validations/question-schemas.ts` | Add classId (optional → required for new questions) |
| `src/validations/exam-schemas.ts` | Add academicSessionId |
| `src/validations/organization-schemas.ts` | Add SubjectClassLink, AcademicSession schemas |

### Frontend Changes
| File | Changes |
|---|---|
| `src/app/(dashboard)/admin/subjects/` | Add subject-class management UI |
| `src/app/(dashboard)/admin/settings/` | Add academic session management |
| `src/app/(dashboard)/admin/reports/` | Reports: class-level subject analytics |
| `src/app/(dashboard)/teacher/questions/` | Question create: class dropdown, list: class filter |
| `src/app/(dashboard)/teacher/exams/` | Exam create: class-aware question picker |
| `src/modules/exams/components/create-exam-dialog.tsx` | Class filter in question selection |
| `src/modules/questions/components/` | Class badge on question cards |

### New Files
| File | Purpose |
|---|---|
| `src/modules/subjects/components/subject-class-manager.tsx` | UI for managing subject-class links |
| `src/modules/sessions/components/academic-session-manager.tsx` | UI for managing academic sessions (admin) |
| `src/modules/chapters/chapter-queries.ts` | Chapter CRUD queries (Phase D) |
| `src/modules/chapters/chapter-actions.ts` | Chapter CRUD actions (Phase D) |
| `src/modules/chapters/components/chapter-manager.tsx` | Chapter management UI (Phase D) |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Schema migration on production DB with existing data | Data loss if migration fails | Backfill script tested locally first. Use `prisma migrate deploy` with backup. |
| Existing questions have no classId | Questions appear in all classes until tagged | Backfill script infers class from exam assignments. Null classId = "unassigned" badge in UI. |
| SubjectClassLink not populated | Teacher sees empty subject-class dropdowns | Seed script creates all links. Admin onboarding guide includes "assign subjects to classes." |
| Breaking change for existing users | Teachers might be confused by new class dropdown | Make classId optional initially (soft enforcement). Hard enforce after 1 month. |
| Academic session migration | Old exams have null sessionId | Backfill creates "Legacy" session for pre-migration exams. |

---

## Success Criteria

- [ ] A teacher filtering "Physics, Class 9" questions sees ONLY Class 9 Physics questions
- [ ] Admin can assign subjects to specific classes via UI
- [ ] Exam creation shows class-filtered question selection
- [ ] Report shows "Physics performance — Class 9 vs Class 10" separately
- [ ] Academic sessions exist and exams are linked to them
- [ ] Seed script creates realistic multi-class, multi-subject, multi-exam data with completed sessions
- [ ] Dashboard stats are non-zero after seeding
- [ ] Teacher-Subject assignments work and filter content
- [ ] All changes are backward-compatible (no breaking existing data)

---

## Definition of Done (Per Gap)

- [ ] Schema migration passes cleanly
- [ ] Backfill script handles all existing data
- [ ] Admin UI for management exists and works
- [ ] Teacher UI properly filters by class
- [ ] At least basic report differentiation by class
- [ ] Seed script updated with new entities
- [ ] Build passes (`pnpm run build` → no errors)
- [ ] Manual testing of all affected flows
- [ ] Planning docs updated to reflect new architecture
