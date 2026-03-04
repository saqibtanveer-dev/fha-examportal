# 25 — Diary System Design (Brutal Deep Plan) — v2

> **Date:** 2026-03-04  
> **Status:** PLANNING  
> **Depends on:** Attendance Module (done), Timetable Module (done), Subject-Class Links (done), TeacherSubject (done)  
> **Complexity:** MEDIUM-HIGH — touches 3 roles, new DB models, text-only (no file uploads), real-time monitoring  

---

## Table of Contents

1. [Brutal Analysis — What Exists, What's Missing](#1-brutal-analysis)
2. [System Requirements — No Bullshit](#2-system-requirements)
3. [Database Schema Design](#3-database-schema-design)
4. [Data Flow Architecture](#4-data-flow-architecture)
5. [Module Structure — File-Level Breakdown](#5-module-structure)
6. [Server Actions Design](#6-server-actions-design)
7. [Query Layer Design](#7-query-layer-design)
8. [Validation Schemas](#8-validation-schemas)
9. [React Hooks Design](#9-react-hooks-design)
10. [Teacher UI — Diary Upload/Management](#10-teacher-ui)
11. [Student UI — Daily Diary View](#11-student-ui)
12. [Principal UI — Monitoring Dashboard](#12-principal-ui)
13. [Reusable Component Library](#13-reusable-components)
14. [RBAC & Authorization Matrix](#14-rbac-authorization)
15. [Business Rules & Edge Cases](#15-business-rules)
16. [Performance & Scalability Strategy](#16-performance-scalability)
17. [Design Patterns Applied](#17-design-patterns)
18. [Migration Strategy](#18-migration-strategy)
19. [Implementation Roadmap](#19-implementation-roadmap)

---

## 1. Brutal Analysis — What Exists, What's Missing {#1-brutal-analysis}

### What We HAVE (Foundation Already Built)

| Asset | Status | Relevance to Diary |
|-------|--------|-------------------|
| `TeacherSubject` model | ✅ Done | Maps teacher → subject → class. Core for authorization ("which classes does this teacher teach?") |
| `SubjectClassLink` model | ✅ Done | Maps which subjects are taught in which classes. Needed for diary scoping |
| `TimetableEntry` model | ✅ Done | Maps teacher → subject → class → section → period → day. Can be used to auto-suggest diary entries |
| `TeacherProfile` model | ✅ Done | Links User → TeacherProfile → TeacherSubject[]. Teacher identity |
| `StudentProfile` model | ✅ Done | Links User → StudentProfile with classId + sectionId. Students auto-scoped to their class |
| `AcademicSession` model | ✅ Done | All diary entries scoped to academic session. Prevents cross-year pollution |
| `Class` / `Section` models | ✅ Done | Organizational hierarchy |
| Attendance module patterns | ✅ Done | Perfect blueprint — same action/query/hook/component layering pattern |
| `safeAction` wrapper | ✅ Done | Error handling + Prisma error mapping |
| `actionSuccess` / `actionError` | ✅ Done | Standardized return types |
| `requireRole()` auth | ✅ Done | Role-based access control |
| `serialize()` utility | ✅ Done | Decimal/Date serialization for server→client boundary |
| `queryKeys` factory | ✅ Done | Centralized cache keys for React Query |
| `useReferenceStore` | ✅ Done | Cached classes, subjects, sessions |
| `useAuthStore` | ✅ Done | Current user's teacherProfileId |
| `ClassSectionSelector` component | ✅ Done | Reusable class/section picker |
| `PageHeader`, `EmptyState`, `Spinner` | ✅ Done | Shared UI primitives |
| `AuditLog` model | ✅ Done | Fire-and-forget audit trail |
| `Notification` model | ✅ Done | In-app notification system |
| Zod v4 validation patterns | ✅ Done | Schema-first validation |

### What's MISSING (Must Build)

| Gap | Severity | Notes |
|-----|----------|-------|
| **No `Diary` / `DiaryEntry` model** | 🔴 CRITICAL | Core data structure doesn't exist |
| **No file/image upload infrastructure** | 🔴 CRITICAL | Diary needs image/PDF/doc uploads. No upload utility, no storage adapter, no signed URL generation |
| **No rich text content field** | 🟡 MEDIUM | Diary entries need formatted text — not just plain strings. Options: Markdown, HTML, or JSON (Tiptap/Plate) |
| **No diary query keys** | 🟡 MEDIUM | Need to extend `queryKeys` factory |
| **No diary validation schemas** | 🟡 MEDIUM | New Zod schemas needed |
| **No teacher-subject-class resolution utility** | 🟡 MEDIUM | Repeated logic: "which classes does this teacher teach this subject in?" — needs a shared resolver |
| **No date-grouped list component** | 🟢 LOW | Student diary view needs entries grouped by date, like a timeline |
| **No "read receipt" / "seen" tracking** | 🟢 LOW | Optional: track if student viewed the diary |

### Brutal Truths

1. **The attendance module is the PERFECT blueprint.** Same layered architecture: `queries.ts` → `fetch-actions.ts` → `mutation-actions.ts` → `hooks/` → `components/` → `pages/`. We follow this EXACTLY.

2. **TeacherSubject already solves the "which classes does this teacher teach?" problem.** No need to reinvent authorization — join `TeacherSubject` with `SubjectClassLink` to get the full matrix.

3. **File uploads are the BIGGEST unknown.** The project has ZERO upload infrastructure. We need to decide: local filesystem? S3/R2? Vercel Blob? This decision affects scalability. We plan for a **Storage Adapter Pattern** so the implementation is swappable.

4. **Rich text is a trap.** Keep it simple — use **Markdown** for diary content. It's portable, searchable, renderable, and doesn't need a heavy editor dependency. If needed later, swap for Tiptap.

5. **The diary is NOT just a CRUD.** It's a **communication channel** from teacher to student, monitored by principal. Think of it as a structured daily bulletin, not a blog.

---

## 2. System Requirements — No Bullshit {#2-system-requirements}

### Teacher Requirements

| # | Requirement | Priority |
|---|------------|----------|
| T1 | Teacher sees ONLY classes + subjects they're assigned to (via `TeacherSubject`) | P0 |
| T2 | Teacher creates a diary entry for a specific subject + class + date | P0 |
| T3 | Diary entry has: title, content (markdown), optional file attachments (images/PDFs) | P0 |
| T4 | Teacher can edit their own diary entries (same-day only, admin can edit any) | P0 |
| T5 | Teacher can delete their own diary entries (soft delete, same-day only) | P1 |
| T6 | Teacher sees a list of all their diary entries with filters (class, subject, date range) | P0 |
| T7 | Teacher sees which dates they've already submitted diary for (calendar dot indicators) | P1 |
| T8 | Teacher can duplicate a diary entry from one section to another (same subject/class) | P2 |
| T9 | Quick "copy to other sections" when a subject is taught in multiple sections | P2 |

### Student Requirements

| # | Requirement | Priority |
|---|------------|----------|
| S1 | Student sees diary entries ONLY for their own class + section | P0 |
| S2 | Student sees entries grouped by date (newest first) — timeline/feed style | P0 |
| S3 | Student can filter by subject | P0 |
| S4 | Student can see attachments (images inline, PDFs as download links) | P0 |
| S5 | Student sees a "today's diary" summary card on their dashboard | P1 |
| S6 | Student can mark a diary entry as "read" (optional, for principal reporting) | P2 |
| S7 | Student sees diary coverage: which subjects have today's diary vs which don't | P2 |

### Principal Requirements

| # | Requirement | Priority |
|---|------------|----------|
| P1 | Principal sees ALL diary entries across ALL classes + teachers | P0 |
| P2 | Principal can filter by: teacher, class, subject, date range | P0 |
| P3 | Principal sees a "diary coverage" dashboard: which teachers submitted for which classes on which dates | P0 |
| P4 | Principal sees a heatmap/matrix: teachers × dates, colored by submission status | P1 |
| P5 | Principal can drill down into any teacher's diary entries | P0 |
| P6 | Principal sees student read rates per diary entry (if read tracking is implemented) | P2 |
| P7 | Principal gets a daily/weekly report: % teachers who submitted diary | P1 |
| P8 | Principal can add comments/notes on a diary entry (feedback to teacher) | P2 |

---

## 3. Database Schema Design {#3-database-schema-design}

### New Models

```prisma
// ============================================
// DIARY SYSTEM ENUMS
// ============================================

enum DiaryStatus {
  DRAFT
  PUBLISHED
}

// ============================================
// DIARY ENTRY
// ============================================

model DiaryEntry {
  id                String      @id @default(uuid())
  teacherProfileId  String
  classId           String
  sectionId         String
  subjectId         String
  academicSessionId String
  date              DateTime    @db.Date
  title             String      @db.VarChar(255)
  content           String      @db.Text           // Markdown content
  status            DiaryStatus @default(PUBLISHED)
  
  // Edit tracking (mirrors attendance pattern)
  isEdited          Boolean     @default(false)
  editedAt          DateTime?
  
  // Soft delete
  deletedAt         DateTime?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  teacherProfile    TeacherProfile  @relation(fields: [teacherProfileId], references: [id])
  class             Class           @relation(fields: [classId], references: [id])
  section           Section         @relation(fields: [sectionId], references: [id])
  subject           Subject         @relation(fields: [subjectId], references: [id])
  academicSession   AcademicSession @relation(fields: [academicSessionId], references: [id])
  attachments       DiaryAttachment[]
  readReceipts      DiaryReadReceipt[]
  principalNotes    DiaryPrincipalNote[]

  // Constraints
  @@unique([teacherProfileId, classId, sectionId, subjectId, date, academicSessionId])
  @@index([classId, sectionId, date])
  @@index([teacherProfileId, date])
  @@index([subjectId, date])
  @@index([academicSessionId])
  @@index([date, status])
  @@index([deletedAt])
}
```

**Why this design:**
- **Unique constraint on `[teacherProfileId, classId, sectionId, subjectId, date, academicSessionId]`**: One diary entry per teacher per subject per class per section per day. Enforced at DB level. Prevents duplicates. Teacher can upsert.
- **`date` as `@db.Date`**: Date-only field (no time component) — mirrors `DailyAttendance.date`. Prevents timezone issues.
- **`content` as `@db.Text`**: No length limit for markdown content. Supports long diary entries.
- **`status` (DRAFT/PUBLISHED)**: Teacher can save drafts, publish when ready. Students only see PUBLISHED.
- **Soft delete**: `deletedAt` — diary entries are never physically removed. Audit trail preserved.
- **Edit tracking**: `isEdited` + `editedAt` — mirrors attendance pattern for transparency.

```prisma
// ============================================
// DIARY ATTACHMENTS
// ============================================

model DiaryAttachment {
  id           String   @id @default(uuid())
  diaryEntryId String
  fileName     String   @db.VarChar(255)
  fileUrl      String   @db.VarChar(1024)  // Storage URL (S3/R2/Vercel Blob)
  fileType     String   @db.VarChar(50)    // MIME type: image/png, application/pdf, etc.
  fileSize     Int                          // Bytes
  sortOrder    Int      @default(0)
  createdAt    DateTime @default(now())

  diaryEntry   DiaryEntry @relation(fields: [diaryEntryId], references: [id], onDelete: Cascade)

  @@index([diaryEntryId])
}
```

**Why separate attachments table:**
- **One-to-many**: A diary entry can have multiple attachments. Not stored as JSON — proper relational design.
- **Cascade delete**: When diary entry is deleted, attachments are cleaned up automatically.
- **`fileType`**: Enables rendering logic — images shown inline, PDFs as download links.
- **`fileSize`**: Enables size validation and quotas.
- **`sortOrder`**: Enables ordered display.

```prisma
// ============================================
// DIARY READ RECEIPTS (Optional — P2 feature)
// ============================================

model DiaryReadReceipt {
  id               String   @id @default(uuid())
  diaryEntryId     String
  studentProfileId String
  readAt           DateTime @default(now())

  diaryEntry       DiaryEntry     @relation(fields: [diaryEntryId], references: [id], onDelete: Cascade)
  studentProfile   StudentProfile @relation(fields: [studentProfileId], references: [id])

  @@unique([diaryEntryId, studentProfileId])
  @@index([diaryEntryId])
  @@index([studentProfileId])
}
```

**Why:**
- **Unique on `[diaryEntryId, studentProfileId]`**: One read receipt per student per diary entry. Idempotent.
- **Minimal footprint**: Only stores the fact + timestamp. No extra data.
- **Principal can aggregate**: COUNT read receipts vs total students = read rate.

```prisma
// ============================================
// DIARY PRINCIPAL NOTES (Optional — P2 feature)
// ============================================

model DiaryPrincipalNote {
  id           String   @id @default(uuid())
  diaryEntryId String
  principalId  String   // User.id of the principal
  note         String   @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  diaryEntry   DiaryEntry @relation(fields: [diaryEntryId], references: [id], onDelete: Cascade)
  principal    User       @relation(fields: [principalId], references: [id])

  @@index([diaryEntryId])
  @@index([principalId])
}
```

### Schema Changes to Existing Models

```prisma
// Add to TeacherProfile
model TeacherProfile {
  // ... existing fields ...
  diaryEntries     DiaryEntry[]
}

// Add to Class
model Class {
  // ... existing fields ...
  diaryEntries     DiaryEntry[]
}

// Add to Section
model Section {
  // ... existing fields ...
  diaryEntries     DiaryEntry[]
}

// Add to Subject
model Subject {
  // ... existing fields ...
  diaryEntries     DiaryEntry[]
}

// Add to AcademicSession
model AcademicSession {
  // ... existing fields ...
  diaryEntries     DiaryEntry[]
}

// Add to StudentProfile (for read receipts)
model StudentProfile {
  // ... existing fields ...
  diaryReadReceipts DiaryReadReceipt[]
}

// Add to User (for principal notes)
model User {
  // ... existing fields ...
  diaryPrincipalNotes DiaryPrincipalNote[]
}
```

### Index Strategy Rationale

| Index | Query It Serves | Access Pattern |
|-------|----------------|----------------|
| `[classId, sectionId, date]` | Student fetching diary for their class on a date | **HOT** — every student login |
| `[teacherProfileId, date]` | Teacher viewing their own diary entries | **HOT** — teacher daily use |
| `[subjectId, date]` | Filter by subject | **WARM** — student filtering |
| `[academicSessionId]` | Scoping all queries to current session | **HOT** — every query |
| `[date, status]` | Principal coverage dashboard (published entries per date) | **HOT** — principal daily use |
| `[deletedAt]` | Filtering out soft-deleted entries | **HOT** — every query |

---

## 4. Data Flow Architecture {#4-data-flow-architecture}

### Teacher Creates Diary Entry

```
[Teacher UI] 
    → select class/section/subject/date
    → write title + markdown content
    → attach files (upload to storage first)
    → submit
        ↓
[createDiaryEntryAction] (server action)
    → requireRole('TEACHER', 'ADMIN')
    → Zod validate input
    → resolve teacherProfileId from auth
    → verify teacher teaches this subject in this class (TeacherSubject check)
    → resolve current academic session
    → check: not future date
    → check: no duplicate entry (or upsert if draft)
    → prisma.diaryEntry.create({ ..., attachments: { create: [...] } })
    → createAuditLog (fire-and-forget)
    → revalidatePath('/teacher/diary', '/student/diary', '/principal/diary')
    → return actionSuccess({ id })
```

### Student Views Diary

```
[Student UI] 
    → loads on dashboard or diary page
        ↓
[fetchStudentDiaryAction] (server action)
    → requireRole('STUDENT')
    → resolve student's classId + sectionId from StudentProfile
    → resolve current academic session
    → query: DiaryEntry where { classId, sectionId, academicSessionId, status: PUBLISHED, deletedAt: null }
    → include attachments
    → serialize() and return
        ↓
[useStudentDiary hook]
    → useQuery with queryKey: ['diary', 'student', classId, sectionId, date-range]
    → data flows to StudentDiaryView component
    → entries grouped by date, rendered as timeline
```

### Principal Monitors

```
[Principal UI]
    → diary monitoring dashboard
        ↓
[fetchDiaryCoverageAction] (server action)
    → requireRole('PRINCIPAL')
    → query: all DiaryEntries for a date range, grouped by teacher + date
    → cross-reference with TeacherSubject to find MISSING entries
    → return { coverage: { teacherId, date, subjectId, classId, hasEntry }[] }
        ↓
[useDiaryCoverage hook]
    → feeds into coverage matrix/heatmap
    → rows = teachers, columns = dates, cells = ✅/❌
```

### File Upload Flow

```
[Teacher UI]
    → user selects file(s)
    → client-side validation (type, size)
        ↓
[uploadDiaryAttachmentAction] (server action) OR [/api/diary/upload] (API route)
    → requireRole('TEACHER', 'ADMIN')
    → validate file type (images: jpg/png/webp, documents: pdf)
    → validate file size (max 5MB per file, max 20MB total per entry)
    → upload to storage adapter (S3/R2/Vercel Blob)
    → return { fileUrl, fileName, fileType, fileSize }
        ↓
[Teacher UI]
    → stores returned file metadata in form state
    → on diary create/update, sends file metadata along with entry data
    → attachments saved as DiaryAttachment records
```

---

## 5. Module Structure — File-Level Breakdown {#5-module-structure}

```
src/modules/diary/
├── components/
│   ├── index.ts                        # Barrel exports
│   ├── diary-entry-form.tsx            # Create/Edit diary form (teacher) ~200 lines
│   ├── diary-entry-card.tsx            # Single diary entry display card ~120 lines
│   ├── diary-timeline.tsx              # Date-grouped diary feed (student) ~150 lines
│   ├── diary-filters.tsx               # Subject/date range filter bar ~80 lines
│   ├── diary-calendar-dots.tsx         # Calendar with dots for diary submission days ~100 lines
│   ├── diary-coverage-matrix.tsx       # Teacher × Date coverage grid (principal) ~180 lines
│   ├── diary-teacher-summary.tsx       # Per-teacher diary stats card (principal) ~100 lines
│   ├── diary-attachment-list.tsx       # Render attachments (images inline, PDFs as links) ~80 lines
│   ├── diary-attachment-uploader.tsx   # Drag-drop file upload zone ~120 lines
│   ├── diary-subject-tabs.tsx          # Tabs for subject-wise diary view ~60 lines
│   └── diary-status-badge.tsx          # DRAFT/PUBLISHED badge ~30 lines
│
├── hooks/
│   ├── use-diary-entries.ts            # useQuery hooks for diary data ~90 lines
│   └── use-diary-mutations.ts          # useMutation hooks for create/update/delete ~80 lines
│
├── diary-queries.ts                    # Pure Prisma query functions ~200 lines
├── diary-fetch-actions.ts             # 'use server' read actions (fetch + serialize) ~180 lines
├── diary-mutation-actions.ts          # 'use server' write actions (create/update/delete) ~200 lines
├── diary.types.ts                      # TypeScript types ~80 lines
├── diary.constants.ts                  # Status configs, file constraints ~40 lines
└── diary.utils.ts                      # Date helpers, markdown utils ~60 lines
```

**Total: ~2,058 lines across 18 files. Average ~114 lines/file. Max ~200 lines. UNDER 300-line rule.**

### Why This Structure

- **Mirrors attendance module exactly**: Same layering, same naming conventions, same patterns. A developer who knows attendance will be immediately productive in diary.
- **components/ barrel export**: Clean imports from `@/modules/diary/components`.
- **Separate mutation vs fetch actions**: Mutations need write validation + audit logging. Reads are simpler. Separation keeps files small.
- **Pure query layer**: No auth, no serialization — testable, reusable, composable.
- **Hooks for client state**: TanStack Query integration isolated in hooks layer.

---

## 6. Server Actions Design {#6-server-actions-design}

### Mutation Actions (`diary-mutation-actions.ts`)

```typescript
// Action 1: Create Diary Entry
createDiaryEntryAction(input: CreateDiaryEntryInput): Promise<ActionResult<{ id: string }>>
  // Auth: TEACHER, ADMIN
  // Validation: Zod schema
  // Authorization: verify teacher teaches this subject in this class
  // Business rules: no future dates, no duplicate entries (upsert if DRAFT)
  // Creates DiaryEntry + DiaryAttachments in transaction
  // Audit: CREATE_DIARY_ENTRY
  // Revalidate: /teacher/diary, /student/*, /principal/diary

// Action 2: Update Diary Entry
updateDiaryEntryAction(entryId: string, input: UpdateDiaryEntryInput): Promise<ActionResult>
  // Auth: TEACHER, ADMIN
  // Authorization: only entry owner (or admin)
  // For teachers: same-day edit only
  // Updates DiaryEntry, manages attachments (add/remove)
  // Sets isEdited = true, editedAt = now()
  // Audit: UPDATE_DIARY_ENTRY

// Action 3: Delete Diary Entry (Soft)
deleteDiaryEntryAction(entryId: string): Promise<ActionResult>
  // Auth: TEACHER, ADMIN
  // Authorization: only entry owner (or admin)
  // For teachers: same-day only
  // Sets deletedAt = now()
  // Audit: DELETE_DIARY_ENTRY

// Action 4: Publish Draft
publishDiaryEntryAction(entryId: string): Promise<ActionResult>
  // Auth: TEACHER, ADMIN
  // Changes status DRAFT → PUBLISHED
  // Triggers notification to students (optional)

// Action 5: Copy Diary to Other Sections
copyDiaryToSectionsAction(entryId: string, targetSectionIds: string[]): Promise<ActionResult<{ count: number }>>
  // Auth: TEACHER, ADMIN
  // Duplicates entry content + attachments for other sections of same class/subject
  // Audit: COPY_DIARY_ENTRY

// Action 6: Mark Diary as Read (Student)
markDiaryReadAction(diaryEntryId: string): Promise<ActionResult>
  // Auth: STUDENT
  // Upsert DiaryReadReceipt (idempotent)
  // No audit (too noisy)

// Action 7: Add Principal Note
addPrincipalNoteAction(diaryEntryId: string, note: string): Promise<ActionResult<{ id: string }>>
  // Auth: PRINCIPAL, ADMIN
  // Creates DiaryPrincipalNote
  // Audit: ADD_PRINCIPAL_DIARY_NOTE
```

### Fetch Actions (`diary-fetch-actions.ts`)

```typescript
// ── Teacher Fetches ──
fetchTeacherDiaryEntriesAction(filters: DiaryFilterInput): Promise<DiaryEntryWithAttachments[]>
  // Auth: TEACHER, ADMIN
  // Scoped to teacher's own entries (unless admin)
  
fetchTeacherSubjectClassesAction(): Promise<TeacherSubjectClass[]>
  // Auth: TEACHER
  // Returns teacher's subject-class-section matrix for dropdowns

fetchTeacherDiaryCalendarAction(month: number, year: number): Promise<DiaryCalendarDay[]>
  // Auth: TEACHER
  // Returns dates with/without diary entries for calendar dots

// ── Student Fetches ──
fetchStudentDiaryAction(startDate: string, endDate: string, subjectId?: string): Promise<DiaryEntryForStudent[]>
  // Auth: STUDENT
  // Auto-scoped to student's class + section
  // Only PUBLISHED + not deleted

fetchStudentTodayDiaryAction(): Promise<DiaryEntryForStudent[]>
  // Auth: STUDENT
  // Shortcut for today's entries — used in dashboard widget

// ── Principal Fetches ──  
fetchDiaryCoverageAction(startDate: string, endDate: string, classId?: string): Promise<DiaryCoverageData>
  // Auth: PRINCIPAL, ADMIN
  // Computes: which teachers submitted for which classes on which dates
  // Cross-references TeacherSubject to find expected vs actual

fetchDiaryByTeacherAction(teacherProfileId: string, startDate: string, endDate: string): Promise<DiaryEntryWithAttachments[]>
  // Auth: PRINCIPAL, ADMIN
  // View specific teacher's diary entries

fetchDiaryStatsAction(startDate: string, endDate: string): Promise<DiaryStats>
  // Auth: PRINCIPAL, ADMIN
  // Aggregate stats: total entries, coverage %, read rates, per-teacher counts

fetchDiaryEntryDetailAction(entryId: string): Promise<DiaryEntryFullDetail>
  // Auth: TEACHER (own), PRINCIPAL, ADMIN
  // Full entry with attachments + read receipt count + principal notes
```

---

## 7. Query Layer Design {#7-query-layer-design}

### `diary-queries.ts` — Pure Data Access

```typescript
// Shared includes (as const pattern — mirrors attendance-queries.ts)
const diaryEntryInclude = {
  teacherProfile: { select: { id, employeeId, user: { select: { id, firstName, lastName } } } },
  subject: { select: { id, name, code } },
  class: { select: { id, name } },
  section: { select: { id, name } },
  attachments: { orderBy: { sortOrder: 'asc' } },
  _count: { select: { readReceipts: true } },
} as const;

const diaryEntryStudentInclude = {
  subject: { select: { id, name, code } },
  attachments: { orderBy: { sortOrder: 'asc' } },
  teacherProfile: { select: { user: { select: { firstName, lastName } } } },
} as const;

// ── Teacher Queries ──
getDiaryEntriesByTeacher(teacherProfileId, academicSessionId, filters?)
getDiaryEntryById(id)
getTeacherDiaryDates(teacherProfileId, academicSessionId, year, month)
hasDiaryEntry(teacherProfileId, classId, sectionId, subjectId, date, academicSessionId)

// ── Student Queries ──
getDiaryEntriesByClassSection(classId, sectionId, academicSessionId, startDate, endDate, subjectId?)
getDiaryEntriesToday(classId, sectionId, academicSessionId, today)

// ── Principal Queries ──
getAllDiaryEntries(academicSessionId, filters?)
getDiaryCoverageByDate(academicSessionId, startDate, endDate)
getDiaryCountsByTeacher(academicSessionId, startDate, endDate)
getExpectedDiaryEntries(academicSessionId, startDate, endDate)  // from TeacherSubject
getReadReceiptStats(diaryEntryId)
getDiaryStatsSummary(academicSessionId, startDate, endDate)
```

### Coverage Computation Logic (Principal)

The "coverage" query is the most complex. It must answer: **"For each teacher-subject-class combination, did the teacher submit a diary entry on each working day?"**

```
Step 1: Get all TeacherSubject records (expected entries)
Step 2: Get all DiaryEntry records for date range (actual entries)  
Step 3: Generate working days list (exclude weekends)
Step 4: Cross-reference: for each (teacher, subject, class, date) → has diary? yes/no
Step 5: Aggregate: teacher-level coverage % = (actual / expected) × 100
```

This should be computed in the fetch action (post-processing), NOT in raw SQL — keeps queries simple, logic testable.

---

## 8. Validation Schemas {#8-validation-schemas}

### New File: `src/validations/diary-schemas.ts`

```typescript
// ── Create Diary Entry ──
createDiaryEntrySchema = z.object({
  classId:    z.string().uuid(),
  sectionId:  z.string().uuid(),
  subjectId:  z.string().uuid(),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title:      z.string().min(3).max(255),
  content:    z.string().min(1).max(10_000),  // Markdown, max ~10k chars
  status:     z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  attachments: z.array(z.object({
    fileName: z.string().max(255),
    fileUrl:  z.string().url().max(1024),
    fileType: z.string().max(50),
    fileSize: z.number().int().positive().max(5_242_880), // 5MB max per file
    sortOrder: z.number().int().min(0).default(0),
  })).max(10).optional(),  // Max 10 attachments
});

// ── Update Diary Entry ──
updateDiaryEntrySchema = z.object({
  title:       z.string().min(3).max(255).optional(),
  content:     z.string().min(1).max(10_000).optional(),
  status:      z.enum(['DRAFT', 'PUBLISHED']).optional(),
  addAttachments: z.array(attachmentSchema).max(10).optional(),
  removeAttachmentIds: z.array(z.string().uuid()).optional(),
});

// ── Copy to Sections ──
copyDiaryToSectionsSchema = z.object({
  targetSectionIds: z.array(z.string().uuid()).min(1).max(20),
});

// ── Filter Schema ──
diaryFilterSchema = z.object({
  classId:    z.string().uuid().optional(),
  sectionId:  z.string().uuid().optional(),
  subjectId:  z.string().uuid().optional(),
  startDate:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status:     z.enum(['DRAFT', 'PUBLISHED']).optional(),
  teacherProfileId: z.string().uuid().optional(),
});

// ── Principal Note ──
principalNoteSchema = z.object({
  note: z.string().min(1).max(2000),
});
```

---

## 9. React Hooks Design {#9-react-hooks-design}

### Query Keys Extension (add to `src/lib/query-keys.ts`)

```typescript
diary: {
  all: ['diary'] as const,
  
  // Teacher
  teacherEntries: (teacherProfileId: string) =>
    [...queryKeys.diary.all, 'teacher', teacherProfileId] as const,
  teacherCalendar: (teacherProfileId: string, year: number, month: number) =>
    [...queryKeys.diary.all, 'teacher-calendar', teacherProfileId, year, month] as const,
  teacherSubjectClasses: () =>
    [...queryKeys.diary.all, 'teacher-subject-classes'] as const,
  
  // Student
  studentEntries: (classId: string, sectionId: string) =>
    [...queryKeys.diary.all, 'student', classId, sectionId] as const,
  studentToday: (classId: string, sectionId: string) =>
    [...queryKeys.diary.all, 'student-today', classId, sectionId] as const,
  
  // Principal
  coverage: (startDate: string, endDate: string) =>
    [...queryKeys.diary.all, 'coverage', startDate, endDate] as const,
  byTeacher: (teacherProfileId: string) =>
    [...queryKeys.diary.all, 'by-teacher', teacherProfileId] as const,
  stats: (startDate: string, endDate: string) =>
    [...queryKeys.diary.all, 'stats', startDate, endDate] as const,
  
  // Shared
  detail: (entryId: string) =>
    [...queryKeys.diary.all, 'detail', entryId] as const,
},
```

### `hooks/use-diary-entries.ts`

```typescript
// Each hook wraps useQuery, same pattern as attendance hooks

useTeacherDiaryEntries(filters, enabled?)
useTeacherDiaryCalendar(year, month, enabled?)
useTeacherSubjectClasses(enabled?)
useStudentDiary(startDate, endDate, subjectId?, enabled?)
useStudentTodayDiary(enabled?)
useDiaryCoverage(startDate, endDate, classId?, enabled?)
useDiaryByTeacher(teacherProfileId, startDate, endDate, enabled?)
useDiaryStats(startDate, endDate, enabled?)
useDiaryEntryDetail(entryId, enabled?)
```

### `hooks/use-diary-mutations.ts`

```typescript
// Each hook wraps useMutation with optimistic updates + invalidation

useCreateDiaryEntry()
  // onSuccess: invalidate teacherEntries, studentEntries, coverage
  // toast.success('Diary entry created')

useUpdateDiaryEntry()
  // onSuccess: invalidate detail + lists
  // toast.success('Diary entry updated')

useDeleteDiaryEntry()
  // onSuccess: invalidate lists
  // toast.success('Diary entry deleted')

usePublishDiaryEntry()
  // onSuccess: invalidate detail + lists
  // toast.success('Diary entry published')

useCopyDiaryToSections()
  // onSuccess: invalidate coverage + lists
  // toast.success('Diary copied to N sections')

useMarkDiaryRead()
  // onSuccess: silently invalidate detail (no toast — background action)

useAddPrincipalNote()
  // onSuccess: invalidate detail
  // toast.success('Note added')
```

---

## 10. Teacher UI — Diary Upload/Management {#10-teacher-ui}

### Page Structure

```
src/app/(dashboard)/teacher/diary/
├── page.tsx                        # Suspense wrapper
├── diary-page-client.tsx           # Auth + data resolution (teacher profile, assigned classes)
├── diary-view.tsx                  # Main view with tabs
└── [entryId]/
    ├── page.tsx                    # Diary entry detail/edit page
    └── diary-detail-client.tsx     # Edit form pre-filled with existing data
```

### Teacher Diary View (`diary-view.tsx`)

**Layout: Tabs-based (mirrors attendance-view.tsx exactly)**

```
┌─────────────────────────────────────────────────────┐
│ PageHeader: "Diary" / "Manage your class diary entries" │
├─────────────────────────────────────────────────────┤
│ [Create Entry] [My Entries] [Calendar]              │ ← TabsList
├─────────────────────────────────────────────────────┤
│                                                     │
│ TAB: Create Entry                                   │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Subject/Class/Section Selector (dropdowns)      │ │
│ │ ↓ shows ONLY teacher's assigned combinations    │ │
│ │                                                 │ │
│ │ Date: [____] (default: today)                   │ │
│ │                                                 │ │
│ │ Title: [________________________]               │ │
│ │                                                 │ │
│ │ Content: (Markdown text area)                   │ │
│ │ ┌──────────────────────────────────────────┐    │ │
│ │ │ Write your diary entry here...           │    │ │
│ │ │                                          │    │ │
│ │ └──────────────────────────────────────────┘    │ │
│ │                                                 │ │
│ │ Attachments: [Drop files here or click]         │ │
│ │ ┌──────┐ ┌──────┐                              │ │
│ │ │ img1 │ │ pdf1 │  ← thumbnail previews        │ │
│ │ └──────┘ └──────┘                              │ │
│ │                                                 │ │
│ │ [Save as Draft] [Publish]    [Copy to Sections] │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ TAB: My Entries                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Filters: [Class ▼] [Subject ▼] [Date Range]    │ │
│ │                                                 │ │
│ │ ┌─ Mar 4, 2026 ──────────────────────────────┐ │ │
│ │ │ 📘 Mathematics - Class 10A                  │ │ │
│ │ │ "Chapter 5: Quadratic Equations"            │ │ │
│ │ │ 📎 2 attachments  •  Published              │ │ │
│ │ │ [Edit] [Delete]                             │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ ┌─ Mar 4, 2026 ──────────────────────────────┐ │ │
│ │ │ 📗 Physics - Class 10A                      │ │ │
│ │ │ "Newton's Third Law - Lab Report Due"       │ │ │
│ │ │ 📎 1 attachment   •  Draft                  │ │ │
│ │ │ [Edit] [Publish] [Delete]                   │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ TAB: Calendar                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Month/Year picker                               │ │
│ │ Calendar grid with colored dots:                │ │
│ │  🟢 = all subjects covered                     │ │
│ │  🟡 = partial coverage                         │ │
│ │  ⬜ = no entries                                │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Key UI Interactions

1. **Subject-Class-Section selector**: Shows ONLY teacher's assigned combinations. Built from `fetchTeacherSubjectClassesAction()` which returns `TeacherSubject` joined with `SubjectClassLink` data.

2. **Markdown editor**: Simple `<Textarea>` with markdown preview toggle. No heavy editor dependency. The `content` field accepts raw markdown.

3. **File upload**: Drag-and-drop zone. Files uploaded via server action, URL returned, stored in form state. On submit, URLs sent along with diary entry.

4. **"Copy to Sections" flow**: After creating an entry for Class 10A, teacher clicks "Copy to Sections". A dialog shows other sections of same class (10B, 10C). Teacher selects targets. Bulk copy action creates duplicate entries.

---

## 11. Student UI — Daily Diary View {#11-student-ui}

### Page Structure

```
src/app/(dashboard)/student/diary/
├── page.tsx
├── diary-page-client.tsx
└── diary-view.tsx
```

### Student Diary View (`diary-view.tsx`)

**Layout: Feed/Timeline (NOT tabs — diary is consumed linearly)**

```
┌─────────────────────────────────────────────────────┐
│ PageHeader: "My Diary" / "View daily class diary"    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─ Today's Summary ──────────────────────────────┐  │
│ │ 📚 5 diary entries today                       │  │
│ │ Math ✅ | Physics ✅ | English ✅ | Urdu ✅ | CS ❌ │  │
│ │ (subject coverage indicators)                  │  │
│ └────────────────────────────────────────────────┘  │
│                                                     │
│ Filters: [All Subjects ▼] [This Week ▼]            │
│                                                     │
│ ═══ Tuesday, March 4, 2026 ═══                      │
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ 📘 Mathematics — Mr. Ahmed Khan               │   │
│ │ "Chapter 5: Quadratic Equations"              │   │
│ │                                               │   │
│ │ Today we covered the discriminant formula...  │   │
│ │ (rendered markdown content)                   │   │
│ │                                               │   │
│ │ 📎 Attachments:                               │   │
│ │ ┌──────────────┐ ┌──────────────┐            │   │
│ │ │ 📷 diagram.png│ │ 📄 notes.pdf │            │   │
│ │ └──────────────┘ └──────────────┘            │   │
│ │                                               │   │
│ │ Posted at 10:30 AM                            │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ 📗 Physics — Ms. Sara Ali                     │   │
│ │ "Newton's Third Law"                          │   │
│ │ ...                                           │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ ═══ Monday, March 3, 2026 ═══                       │
│                                                     │
│ ┌───────────────────────────────────────────────┐   │
│ │ ...older entries...                           │   │
│ └───────────────────────────────────────────────┘   │
│                                                     │
│ [Load More] or infinite scroll                      │
└─────────────────────────────────────────────────────┘
```

### Design Decisions

1. **Feed style, NOT table**: Students consume diary linearly. A table is wrong UX. A timeline/feed is natural — similar to how they'd read a physical diary/planner.

2. **Date separators**: Entries grouped by date with prominent date headers. Today first, then yesterday, etc.

3. **Subject badges**: Each entry has a colored subject badge so students can quickly scan which subject it's for.

4. **Inline images**: Image attachments rendered inline (max-width, rounded). PDFs shown as download cards.

5. **"Today's Summary" card**: Quick glance at which subjects have diary entries today. Green check for covered, red X for missing. This appears on the student dashboard too as a widget.

6. **Auto-read tracking**: When a diary entry scrolls into viewport (Intersection Observer), silently call `markDiaryReadAction`. No user action needed. Principal sees read rates.

---

## 12. Principal UI — Monitoring Dashboard {#12-principal-ui}

### Page Structure

```
src/app/(dashboard)/principal/diary/
├── page.tsx
├── diary-page-client.tsx
├── diary-view.tsx
└── teacher/
    └── [teacherId]/
        ├── page.tsx
        └── teacher-diary-detail.tsx
```

### Principal Diary View (`diary-view.tsx`)

**Layout: Tabs — Overview | Coverage Matrix | Teacher Drill-Down**

```
┌─────────────────────────────────────────────────────────┐
│ PageHeader: "Diary Monitoring" / "Track teacher diary    │
│ submissions across all classes"                          │
├─────────────────────────────────────────────────────────┤
│ [Overview] [Coverage Matrix] [Browse Entries]            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ TAB: Overview                                           │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Date: [Today ▼]                                  │    │
│ │                                                  │    │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│    │
│ │ │ Total   │ │ Submittd│ │ Missing │ │Coverage │ │    │
│ │ │ Teachers│ │ Today   │ │ Today   │ │   %     │ │    │
│ │ │   15    │ │   12    │ │    3    │ │  80%    │ │    │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘│    │
│ │                                                  │    │
│ │ ── Teachers with Missing Diary Today ──          │    │
│ │ ┌──────────────────────────────────────────────┐ │    │
│ │ │ Mr. Khan   │ Math - Class 10A  │ ❌ Missing │ │    │
│ │ │ Ms. Ali    │ English - 9B      │ ❌ Missing │ │    │
│ │ │ Mr. Raza   │ Physics - 10B     │ ❌ Missing │ │    │
│ │ └──────────────────────────────────────────────┘ │    │
│ └──────────────────────────────────────────────────┘    │
│                                                         │
│ TAB: Coverage Matrix                                    │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Date Range: [This Week ▼]   Class: [All ▼]      │    │
│ │                                                  │    │
│ │              │ Mon │ Tue │ Wed │ Thu │ Fri │      │    │
│ │ ─────────────┼─────┼─────┼─────┼─────┼─────│      │    │
│ │ Mr. Khan     │ ✅  │ ✅  │ ❌  │ ✅  │ --  │      │    │
│ │ Ms. Ali      │ ✅  │ ✅  │ ✅  │ ✅  │ --  │      │    │
│ │ Mr. Raza     │ ❌  │ ✅  │ ✅  │ ❌  │ --  │      │    │
│ │ Ms. Fatima   │ ✅  │ ✅  │ ✅  │ ✅  │ --  │      │    │
│ │ ─────────────┼─────┼─────┼─────┼─────┼─────│      │    │
│ │ Coverage %   │ 75% │100% │ 75% │ 75% │ --  │      │    │
│ └──────────────────────────────────────────────────┘    │
│ (Clicking a cell drills into that teacher's entries)    │
│                                                         │
│ TAB: Browse Entries                                     │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Filters: [Teacher ▼] [Class ▼] [Subject ▼]      │    │
│ │          [Date Range]                            │    │
│ │                                                  │    │
│ │ Table view of all diary entries:                 │    │
│ │ Date | Teacher | Class | Subject | Title | Attachments │
│ │ Click row → detail view with principal note form │    │
│ └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Coverage Matrix Algorithm

```
Input: teacherSubjects[], diaryEntries[], dateRange

1. Build expected matrix:
   For each teacher in teacherSubjects:
     For each working day in dateRange:
       expected[teacherId][date] = [subjectId-classId pairs]

2. Build actual matrix:
   For each entry in diaryEntries:
     actual[teacherId][date].push(subjectId-classId)

3. Compute coverage:
   For each (teacherId, date):
     coverage = actual[teacherId][date].length / expected[teacherId][date].length
     cell: ✅ if coverage === 1, 🟡 if 0 < coverage < 1, ❌ if coverage === 0

4. Aggregate:
   columnCoverage[date] = sum(cells with coverage > 0) / totalTeachers
   rowCoverage[teacherId] = sum(teacher's covered days) / totalDays
```

---

## 13. Reusable Component Library {#13-reusable-components}

### Components Reused From Existing Codebase

| Component | Source | Used In |
|-----------|--------|---------|
| `PageHeader` | `@/components/shared` | All diary pages |
| `EmptyState` | `@/components/shared` | No entries state |
| `Spinner` | `@/components/shared` | Loading states |
| `SkeletonPage` | `@/components/shared` | Suspense fallback |
| `ClassSectionSelector` | `@/modules/timetable/components` | Principal diary filters |
| `Card`, `Tabs`, `Input`, `Label`, `Badge` | `@/components/ui` | All diary views |
| `ConfirmDialog` | `@/components/shared` | Delete confirmation |
| `StatusBadge` | `@/components/shared` | DRAFT/PUBLISHED status |

### New Diary-Specific Components

| Component | Responsibility | Max Lines |
|-----------|---------------|-----------|
| `DiaryEntryForm` | Create/edit form with title, content, attachments, subject/class selector | ~200 |
| `DiaryEntryCard` | Single entry display: subject badge, title, content preview, attachment count, timestamp | ~120 |
| `DiaryTimeline` | Date-grouped feed of `DiaryEntryCard`s with date separator headers | ~150 |
| `DiaryFilters` | Filter bar: subject dropdown, date range picker | ~80 |
| `DiaryCalendarDots` | Monthly calendar with colored dots indicating diary submission status | ~100 |
| `DiaryCoverageMatrix` | Teacher × Date grid with ✅/❌/🟡 cells, row/column summaries | ~180 |
| `DiaryTeacherSummary` | Stat card: teacher name, entries count, coverage %, last submission | ~100 |
| `DiaryAttachmentList` | Renders attachments: images inline, PDFs as download links | ~80 |
| `DiaryAttachmentUploader` | Drag-and-drop file upload zone with previews and remove buttons | ~120 |
| `DiarySubjectTabs` | Horizontal tabs for subject-wise filtering (student view) | ~60 |
| `DiaryStatusBadge` | Tiny badge: "Draft" (yellow) / "Published" (green) | ~30 |

### Subject-Class Selector (New — Teacher Diary Specific)

The teacher needs a selector that shows ONLY their assigned subject-class-section combinations. This is different from `ClassSectionSelector` which shows all classes.

```
DiarySubjectClassSelector
  Props: { 
    assignments: TeacherSubjectClass[],  // from fetchTeacherSubjectClassesAction
    selectedSubjectId, selectedClassId, selectedSectionId,
    onSubjectChange, onClassChange, onSectionChange 
  }
  
  UI: 
    [Subject ▼]  →  filters available classes
    [Class ▼]    →  filters available sections  
    [Section ▼]
    
  Cascading: Selecting subject filters classes to only those where teacher teaches that subject.
             Selecting class filters sections.
```

---

## 14. RBAC & Authorization Matrix {#14-rbac-authorization}

### Action-Level Authorization

| Action | ADMIN | PRINCIPAL | TEACHER | STUDENT |
|--------|-------|-----------|---------|---------|
| `createDiaryEntry` | ✅ (any) | ❌ | ✅ (own subjects only) | ❌ |
| `updateDiaryEntry` | ✅ (any) | ❌ | ✅ (own entries, same-day) | ❌ |
| `deleteDiaryEntry` | ✅ (any) | ❌ | ✅ (own entries, same-day) | ❌ |
| `publishDiaryEntry` | ✅ (any) | ❌ | ✅ (own entries) | ❌ |
| `copyDiaryToSections` | ✅ (any) | ❌ | ✅ (own entries) | ❌ |
| `fetchTeacherDiaryEntries` | ✅ (all) | ❌ | ✅ (own only) | ❌ |
| `fetchStudentDiary` | ❌ | ❌ | ❌ | ✅ (own class) |
| `fetchDiaryCoverage` | ✅ | ✅ | ❌ | ❌ |
| `fetchDiaryByTeacher` | ✅ | ✅ | ❌ | ❌ |
| `fetchDiaryStats` | ✅ | ✅ | ❌ | ❌ |
| `markDiaryRead` | ❌ | ❌ | ❌ | ✅ (own class) |
| `addPrincipalNote` | ✅ | ✅ | ❌ | ❌ |

### Data-Level Authorization

| Operation | Scope Rule |
|-----------|-----------|
| Teacher create | Must have `TeacherSubject` record linking them to this subject + class |
| Teacher update/delete | Record `teacherProfileId` must match + same-day only |
| Student read | `classId` + `sectionId` must match student's `StudentProfile` |
| Student read | Only `status = PUBLISHED` + `deletedAt IS NULL` |
| Principal read | No scope restriction — can see all entries |
| All queries | Must be scoped to current `academicSessionId` |

### Authorization Helper Functions

```typescript
// In diary-mutation-actions.ts

async function isTeacherForSubjectClass(
  userId: string,
  subjectId: string,
  classId: string,
): Promise<boolean> {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!teacherProfile) return false;
  
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId: teacherProfile.id, subjectId, classId },
  });
  return assignment !== null;
}

async function isDiaryEntryOwner(
  userId: string, 
  entryId: string,
): Promise<{ isOwner: boolean; entry: DiaryEntry | null }> {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!teacherProfile) return { isOwner: false, entry: null };
  
  const entry = await prisma.diaryEntry.findUnique({ where: { id: entryId } });
  if (!entry) return { isOwner: false, entry: null };
  
  return { isOwner: entry.teacherProfileId === teacherProfile.id, entry };
}
```

---

## 15. Business Rules & Edge Cases {#15-business-rules}

### Core Business Rules

| Rule | Enforcement | Where |
|------|-------------|-------|
| One diary entry per teacher per subject per class per section per date | DB unique constraint + application check | `@@unique` in schema + upsert logic in action |
| No future dates for diary entries | Application validation | `isFutureDate()` check in action |
| Teachers can only create for their assigned subjects/classes | DB join check | `isTeacherForSubjectClass()` in action |
| Teachers can only edit/delete same-day entries | Application validation | `isToday()` check in action |
| Admin can bypass same-day restriction | Role check in action | `isAdmin` flag |
| Students see only PUBLISHED entries | Query filter | `where: { status: 'PUBLISHED', deletedAt: null }` |
| All entries scoped to current academic session | Query filter | `academicSessionId` in every query |
| Max 10 attachments per entry, 5MB each | Zod validation + server check | Schema + action |
| Allowed file types: jpg, png, webp, gif, pdf | Zod validation + server check | Schema + action |
| Soft delete only — never hard delete | Application logic | Set `deletedAt` instead of `.delete()` |

### Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Teacher creates diary, then gets unassigned from subject | Existing entries remain visible. Teacher can't create NEW entries. Can still edit same-day entries. |
| Teacher teaches same subject in multiple sections | Each section gets its own diary entry. "Copy to Sections" feature helps. |
| Academic session changes mid-year | New entries go to new session. Old entries remain in old session. Student view always shows current session. |
| Student transfers to different class | Student sees diary for their CURRENT class only. Historical data from old class is NOT visible. |
| No academic session is active | EmptyState shown. No diary operations possible. |
| Two teachers teach same subject to same class (co-teaching) | Each teacher creates their own entry. Both entries shown to students. |
| Diary entry with attachments is soft-deleted | Attachments remain in storage (not deleted). Could be cleaned up by a background job later. |
| Large number of classes/sections (school with 50+ sections) | Pagination in teacher selector. Coverage matrix scrollable. Lazy load in principal view. |

---

## 16. Performance & Scalability Strategy {#16-performance-scalability}

### Query Performance

| Query | Expected Volume | Optimization |
|-------|----------------|-------------|
| Student diary feed (daily) | ~5-10 entries/day × 500 students = ~5K reads/day | Index on `[classId, sectionId, date]`. Query returns max ~10 rows. Fast. |
| Teacher diary list (own entries) | ~5-8 entries/day × 50 teachers = ~400 reads/day | Index on `[teacherProfileId, date]`. Small result set. |
| Principal coverage matrix | Complex aggregation over date range | **Cache with React Query (staleTime: 5min)**. Compute in JS, not SQL (simpler). |
| Principal daily overview | 1 read/day from principal | School-wide aggregation cached at React Query level. |

### Scaling Strategy

| Concern | Strategy |
|---------|---------|
| **Database reads** | All queries use indexed columns. No N+1 — all includes are explicit. React Query caching reduces repeat fetches. |
| **Database writes** | One write per diary entry creation. Upsert pattern prevents duplicate errors. Transactions for entry + attachments. |
| **File storage** | **Storage Adapter Pattern**: interface `StorageAdapter { upload, delete, getSignedUrl }`. Implementations: `LocalStorageAdapter`, `S3StorageAdapter`, `VercelBlobAdapter`. Swap implementation via env config. |
| **File serving** | Images served via CDN (Vercel's edge network or CloudFront). Signed URLs for private files. |
| **Coverage computation** | Computed in application layer, NOT stored. If slow, add materialized view or cache in Redis. |
| **Horizontal scaling** | Stateless server actions — no in-memory state. Database is single source of truth. Works on Vercel serverless. |
| **Pagination** | Student diary feed: cursor-based pagination (date DESC, id DESC). Teacher list: offset pagination (simpler, smaller dataset). |

### Storage Adapter Pattern (Swappable Upload Backend)

```typescript
// src/lib/storage/storage-adapter.ts
interface StorageAdapter {
  upload(file: Buffer, key: string, contentType: string): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
}

// src/lib/storage/vercel-blob-adapter.ts
class VercelBlobAdapter implements StorageAdapter { ... }

// src/lib/storage/s3-adapter.ts
class S3Adapter implements StorageAdapter { ... }

// src/lib/storage/local-adapter.ts (dev only)
class LocalStorageAdapter implements StorageAdapter { ... }

// src/lib/storage/index.ts
export function getStorageAdapter(): StorageAdapter {
  switch (process.env.STORAGE_PROVIDER) {
    case 's3': return new S3Adapter();
    case 'vercel-blob': return new VercelBlobAdapter();
    default: return new LocalStorageAdapter();
  }
}
```

**Why this matters for horizontal scaling**: When the app runs on multiple serverless instances (Vercel), local filesystem storage doesn't work. S3/R2/Vercel Blob works from any instance. The adapter pattern lets us start with local storage in dev and deploy with S3 in production WITHOUT changing any diary code.

---

## 17. Design Patterns Applied {#17-design-patterns}

| Pattern | Where | Why |
|---------|-------|-----|
| **Repository Pattern** | `diary-queries.ts` | Pure data access, no business logic. Testable. Reusable. |
| **Service Layer** | `diary-mutation-actions.ts` | Business logic, authorization, validation. Orchestrates repository calls. |
| **Adapter Pattern** | `StorageAdapter` | Swappable file storage backend. Dev vs production. |
| **Factory Pattern** | `getStorageAdapter()` | Creates correct adapter based on env config. |
| **Strategy Pattern** | Coverage computation | Different calculation strategies possible (daily, weekly, monthly). |
| **Observer Pattern** | Read receipts via Intersection Observer | Background tracking without user interaction. |
| **Barrel Exports** | `components/index.ts` | Clean import paths. Encapsulation. |
| **Query Key Factory** | `queryKeys.diary.*` | Consistent cache key structure. Granular invalidation. |
| **Upsert Pattern** | Diary entry creation | Idempotent — create if new, update if exists (DRAFT). Prevents duplicates. |
| **Optimistic Updates** | `useCreateDiaryEntry` mutation | UI updates immediately, server catches up. Better UX. |
| **Cascade Delete** | `DiaryAttachment`, `DiaryReadReceipt`, `DiaryPrincipalNote` | Child records auto-cleaned when parent is deleted. |
| **Soft Delete** | `DiaryEntry.deletedAt` | Data never lost. Audit trail preserved. Can be restored. |
| **Compound Unique Constraint** | `DiaryEntry.@@unique` | DB-level duplicate prevention. Application can upsert. |
| **Serialize Boundary** | `serialize()` in fetch actions | Clean Decimal/Date handling across server→client boundary. |
| **Safe Action Wrapper** | `safeAction(fn)` | Centralized error handling. Prisma error mapping. Logging. |
| **Fine-Grained Authorization** | `isTeacherForSubjectClass()` | Data-level access control, not just role-level. |

---

## 18. Migration Strategy {#18-migration-strategy}

### Prisma Migration Plan

```
Migration Name: add_diary_system

Changes:
1. Add DiaryStatus enum
2. Create DiaryEntry model
3. Create DiaryAttachment model
4. Create DiaryReadReceipt model  
5. Create DiaryPrincipalNote model
6. Add relations to TeacherProfile, Class, Section, Subject, AcademicSession, StudentProfile, User

Zero-downtime: YES — all changes are additive (new tables, new relations). No existing table modifications.
Rollback: DROP TABLE diary_principal_notes, diary_read_receipts, diary_attachments, diary_entries; DROP TYPE DiaryStatus;
```

### Storage Infrastructure Setup

```
1. Choose storage provider (recommend Vercel Blob for simplicity with Vercel deployment)
2. Create storage adapter implementations
3. Add env vars: STORAGE_PROVIDER, STORAGE_BUCKET, STORAGE_REGION, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY
4. Add file upload API route or server action
5. Test with local adapter in dev, Vercel Blob in preview, S3/R2 in production
```

---

## 19. Implementation Roadmap {#19-implementation-roadmap}

### Phase 1: Foundation (Day 1-2)

| Task | Files | Est. Lines |
|------|-------|-----------|
| Add `DiaryStatus` enum to schema | `schema.prisma` | +5 |
| Add `DiaryEntry` model to schema | `schema.prisma` | +35 |
| Add `DiaryAttachment` model to schema | `schema.prisma` | +15 |
| Add `DiaryReadReceipt` model to schema | `schema.prisma` | +15 |
| Add `DiaryPrincipalNote` model to schema | `schema.prisma` | +15 |
| Add relations to existing models | `schema.prisma` | +10 |
| Run migration | migration file | auto |
| Create `diary-schemas.ts` validation | `src/validations/` | ~80 |
| Create `diary.types.ts` | `src/modules/diary/` | ~80 |
| Create `diary.constants.ts` | `src/modules/diary/` | ~40 |
| Create `diary.utils.ts` | `src/modules/diary/` | ~60 |
| Add diary query keys to `query-keys.ts` | `src/lib/` | +30 |

### Phase 2: Storage & Data Layer (Day 2-3)

| Task | Files | Est. Lines |
|------|-------|-----------|
| Create `StorageAdapter` interface | `src/lib/storage/` | ~30 |
| Create `LocalStorageAdapter` (dev) | `src/lib/storage/` | ~50 |
| Create `VercelBlobAdapter` or `S3Adapter` | `src/lib/storage/` | ~60 |
| Create storage factory | `src/lib/storage/index.ts` | ~20 |
| Create `diary-queries.ts` | `src/modules/diary/` | ~200 |
| Create `diary-fetch-actions.ts` | `src/modules/diary/` | ~180 |
| Create `diary-mutation-actions.ts` | `src/modules/diary/` | ~200 |

### Phase 3: Teacher UI (Day 3-5)

| Task | Files | Est. Lines |
|------|-------|-----------|
| Create `DiaryEntryForm` component | `src/modules/diary/components/` | ~200 |
| Create `DiaryEntryCard` component | `src/modules/diary/components/` | ~120 |
| Create `DiaryAttachmentUploader` component | `src/modules/diary/components/` | ~120 |
| Create `DiaryAttachmentList` component | `src/modules/diary/components/` | ~80 |
| Create `DiaryStatusBadge` component | `src/modules/diary/components/` | ~30 |
| Create `DiaryFilters` component | `src/modules/diary/components/` | ~80 |
| Create `DiaryCalendarDots` component | `src/modules/diary/components/` | ~100 |
| Create `DiarySubjectClassSelector` component | `src/modules/diary/components/` | ~100 |
| Create barrel exports `components/index.ts` | `src/modules/diary/components/` | ~15 |
| Create hooks `use-diary-entries.ts` | `src/modules/diary/hooks/` | ~90 |
| Create hooks `use-diary-mutations.ts` | `src/modules/diary/hooks/` | ~80 |
| Create teacher diary page + client + view | `src/app/(dashboard)/teacher/diary/` | ~300 |
| Create teacher diary detail page | `src/app/(dashboard)/teacher/diary/[entryId]/` | ~150 |

### Phase 4: Student UI (Day 5-6)

| Task | Files | Est. Lines |
|------|-------|-----------|
| Create `DiaryTimeline` component | `src/modules/diary/components/` | ~150 |
| Create `DiarySubjectTabs` component | `src/modules/diary/components/` | ~60 |
| Create student diary page + client + view | `src/app/(dashboard)/student/diary/` | ~250 |
| Add "Today's Diary" widget to student dashboard | `src/app/(dashboard)/student/` | ~50 |

### Phase 5: Principal UI (Day 6-8)

| Task | Files | Est. Lines |
|------|-------|-----------|
| Create `DiaryCoverageMatrix` component | `src/modules/diary/components/` | ~180 |
| Create `DiaryTeacherSummary` component | `src/modules/diary/components/` | ~100 |
| Create principal diary page + client + view | `src/app/(dashboard)/principal/diary/` | ~350 |
| Create principal teacher drill-down page | `src/app/(dashboard)/principal/diary/teacher/[teacherId]/` | ~200 |

### Phase 6: Polish & P2 Features (Day 8-10)

| Task | Files | Est. Lines |
|------|-------|-----------|
| Read receipt tracking (Intersection Observer) | Student diary view | ~40 |
| Principal notes feature | Principal detail view | ~100 |
| "Copy to sections" feature | Teacher diary form | ~80 |
| Navigation config updates (sidebar links) | `nav-config.ts` | ~10 |
| Loading skeletons for diary pages | Various | ~60 |
| Error boundaries for diary pages | Various | ~30 |

### Total Estimate

| Metric | Value |
|--------|-------|
| **New files** | ~25 |
| **Total new lines** | ~3,500-4,000 |
| **Average file size** | ~140 lines |
| **Max file size** | ~200 lines (DiaryEntryForm, diary-queries, diary-mutation-actions) |
| **New DB models** | 4 (DiaryEntry, DiaryAttachment, DiaryReadReceipt, DiaryPrincipalNote) |
| **New enum** | 1 (DiaryStatus) |
| **Estimated days** | 8-10 days for full implementation |

---

## Summary

This diary system is NOT a simple CRUD app. It's a **structured communication channel** between teachers and students, monitored by the principal. The design:

1. **Follows existing patterns EXACTLY** — same layering as attendance module (queries → fetch-actions → mutation-actions → hooks → components → pages). Zero learning curve for anyone who knows the codebase.

2. **DB schema is tight** — compound unique constraints prevent duplicates, indexed for every access pattern, soft deletes for audit trail, separate attachment table for proper normalization.

3. **Authorization is fine-grained** — not just role checks. Data-level: teacher can only create for their assigned subjects, students only see their class, principal sees everything.

4. **Storage is adapter-based** — works with local filesystem in dev, S3/R2/Vercel Blob in production. Swappable without touching business logic.

5. **Principal monitoring is first-class** — coverage matrix, teacher summaries, drill-down into entries. Not an afterthought.

6. **Student UX is feed-based** — timeline layout, not tables. Subject badges, inline images, date separators. Natural consumption pattern.

7. **Scalable** — stateless actions, indexed queries, CDN for files, cursor pagination, React Query caching. Works on serverless.

8. **Every file under 300 lines** — smallest is 15 (barrel export), largest is 200 (form/queries). Average 140.
