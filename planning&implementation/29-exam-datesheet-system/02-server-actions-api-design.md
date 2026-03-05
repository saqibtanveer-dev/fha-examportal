# Exam Datesheet System — Server Actions & API Design

> **Date:** March 5, 2026  
> **Pattern:** Server Actions with `safeAction` wrapper, `ActionResult<T>` return type  
> **Auth:** `requireRole()` on every action

---

## Module File Structure

```
src/modules/datesheet/
├── datesheet.types.ts              # TypeScript types (< 80 lines)
├── datesheet.constants.ts          # Constants, enums, labels (< 50 lines)
├── datesheet.utils.ts              # Pure utility functions (< 100 lines)
├── datesheet-queries.ts            # Prisma read queries (< 200 lines)
├── datesheet-fetch-actions.ts      # Server actions for reads (< 200 lines)
├── datesheet-entry-actions.ts      # Server actions for entry CRUD (< 250 lines)
├── datesheet-duty-actions.ts       # Server actions for duty CRUD (< 200 lines)
├── datesheet-lifecycle-actions.ts  # Create/publish/archive datesheet (< 200 lines)
├── hooks/
│   ├── use-datesheet.ts            # TanStack Query hooks (< 150 lines)
│   └── use-datesheet-mutations.ts  # Mutation hooks (< 150 lines)
├── components/
│   ├── index.ts                    # Barrel exports
│   ├── datesheet-grid.tsx          # The main grid (date × class) (< 250 lines)
│   ├── datesheet-entry-form.tsx    # Dialog for creating/editing entries (< 250 lines)
│   ├── datesheet-duty-form.tsx     # Dialog for assigning duties (< 200 lines)
│   ├── datesheet-form.tsx          # Create/edit datesheet metadata (< 200 lines)
│   ├── datesheet-list.tsx          # List of datesheets (< 150 lines)
│   ├── datesheet-status-badge.tsx  # Status badge component (< 30 lines)
│   ├── datesheet-class-view.tsx    # Class-specific datesheet view (< 200 lines)
│   ├── teacher-duty-view.tsx       # Teacher's duty roster (< 200 lines)
│   ├── datesheet-print-view.tsx    # Print-optimized layout (< 200 lines)
│   └── date-selector.tsx           # Date picker for grid columns (< 80 lines)
└── index.ts                        # Module barrel export
```

**Total estimated files:** 18  
**Max lines per file:** 250  
**Average lines per file:** ~140

---

## Types Definition (`datesheet.types.ts`)

```typescript
// Core types derived from Prisma models + relations

export type DatesheetWithMeta = {
  id: string;
  title: string;
  description: string | null;
  examType: ExamType;
  status: DatesheetStatus;
  startDate: Date;
  endDate: Date;
  publishedAt: Date | null;
  createdAt: Date;
  academicSession: { id: string; name: string };
  createdBy: { id: string; firstName: string; lastName: string };
  publishedBy: { id: string; firstName: string; lastName: string } | null;
  _count: { entries: number };
};

export type DatesheetEntryWithRelations = {
  id: string;
  datesheetId: string;
  classId: string;
  sectionId: string | null;
  subjectId: string;
  examDate: Date;
  startTime: string;
  endTime: string;
  room: string | null;
  instructions: string | null;
  totalMarks: number | null;
  class: { id: string; name: string; grade: number };
  section: { id: string; name: string } | null;
  subject: { id: string; name: string; code: string };
  duties: DatesheetDutyWithTeacher[];
};

export type DatesheetDutyWithTeacher = {
  id: string;
  datesheetEntryId: string;
  teacherProfileId: string;
  role: string;
  room: string | null;
  notes: string | null;
  teacherProfile: {
    id: string;
    employeeId: string;
    user: { id: string; firstName: string; lastName: string };
  };
};

/** Grid structure: date → class entries */
export type DatesheetGrid = {
  datesheetId: string;
  dates: string[];  // sorted exam dates as ISO strings
  classes: { id: string; name: string; grade: number }[];
  grid: Record<string, Record<string, DatesheetEntryWithRelations | null>>;
  // grid[dateISO][classId] = entry | null
};

/** Teacher's duty schedule grouped by date */
export type TeacherDutySchedule = {
  date: string;
  duties: (DatesheetDutyWithTeacher & {
    entry: DatesheetEntryWithRelations;
  })[];
};
```

---

## Constants (`datesheet.constants.ts`)

```typescript
export const DATESHEET_STATUS_LABELS: Record<DatesheetStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export const DATESHEET_STATUS_COLORS: Record<DatesheetStatus, string> = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  ARCHIVED: 'outline',
};

export const DUTY_ROLES = ['INVIGILATOR', 'HEAD_INVIGILATOR', 'SUPERVISOR'] as const;

export const DUTY_ROLE_LABELS: Record<string, string> = {
  INVIGILATOR: 'Invigilator',
  HEAD_INVIGILATOR: 'Head Invigilator',
  SUPERVISOR: 'Supervisor',
};

export const MAX_DUTIES_PER_ENTRY = 5;
export const MAX_ENTRIES_PER_DATESHEET = 500;
```

---

## Utility Functions (`datesheet.utils.ts`)

```typescript
// Pure functions — no side effects, no DB calls

/** Build grid[dateISO][classId] from flat entries */
export function buildDatesheetGrid(
  entries: DatesheetEntryWithRelations[],
  dates: string[],
  classes: { id: string }[],
): Record<string, Record<string, DatesheetEntryWithRelations | null>>

/** Get unique sorted exam dates from entries */
export function extractExamDates(entries: DatesheetEntryWithRelations[]): string[]

/** Check if two time ranges overlap */
export function doTimesOverlap(
  startA: string, endA: string, 
  startB: string, endB: string
): boolean

/** Format exam date for display: "Mon, 15 Mar 2026" */
export function formatExamDate(date: Date | string): string

/** Format date range: "15 Mar - 25 Mar 2026" */
export function formatDateRange(start: Date, end: Date): string

/** Get days count between start and end date */
export function getExamDayCount(start: Date, end: Date): number

/** Group entries by date for list/calendar view */
export function groupEntriesByDate(
  entries: DatesheetEntryWithRelations[]
): Map<string, DatesheetEntryWithRelations[]>

/** Group duties by date for teacher view */
export function groupDutiesByDate(
  duties: (DatesheetDutyWithTeacher & { entry: DatesheetEntryWithRelations })[]
): TeacherDutySchedule[]
```

---

## Database Queries (`datesheet-queries.ts`)

### Datesheet CRUD Queries

```typescript
// Prisma select/include objects
const datesheetListSelect = { ... };     // List view (no entries)
const datesheetDetailInclude = { ... };  // Full with entries + duties

// Queries
export async function listDatesheets(academicSessionId: string, status?: DatesheetStatus)
export async function getDatesheetById(id: string)
export async function getDatesheetWithEntries(id: string)
```

### Entry Queries

```typescript
export async function listEntriesByDatesheet(datesheetId: string)
export async function listEntriesByClass(datesheetId: string, classId: string, sectionId?: string)
export async function getEntryById(id: string)
export async function hasEntryConflict(datesheetId: string, classId: string, sectionId: string | null, examDate: Date, startTime: string, endTime: string, excludeId?: string): Promise<boolean>
```

### Duty Queries

```typescript
export async function listDutiesByEntry(datesheetEntryId: string)
export async function listDutiesByTeacher(teacherProfileId: string, datesheetId: string)
export async function hasTeacherDutyConflict(teacherProfileId: string, examDate: Date, startTime: string, endTime: string, excludeEntryId?: string): Promise<boolean>
```

### Dashboard/Summary Queries

```typescript
export async function getPublishedDatesheetForClass(classId: string, sectionId: string, academicSessionId: string)
export async function getTeacherDutyRoster(teacherProfileId: string, academicSessionId: string)
export async function getDatesheetStats(datesheetId: string): Promise<{ entryCount: number; dutyCount: number; classCount: number; dateCount: number }>
```

---

## Server Actions — Datesheet Lifecycle (`datesheet-lifecycle-actions.ts`)

### `createDatesheetAction`
```
Auth: ADMIN only
Input: { title, description?, examType, academicSessionId, startDate, endDate }
Validation: 
  - startDate <= endDate
  - No overlapping DRAFT/PUBLISHED datesheet with same examType in same session
  - Academic session exists and is current
Output: ActionResult<{ id: string }>
Side Effects: Audit log
```

### `updateDatesheetAction`
```
Auth: ADMIN only
Input: { id, title?, description?, examType?, startDate?, endDate? }
Validation:
  - Datesheet exists and is DRAFT (cannot edit PUBLISHED)
  - If dates change, all entries must still fall within range
Output: ActionResult
Side Effects: Audit log
```

### `publishDatesheetAction`
```
Auth: ADMIN only
Input: { id }
Validation:
  - Datesheet is DRAFT
  - Has at least 1 entry
  - All entries have valid dates/times
  - No unresolved teacher conflicts
Output: ActionResult
Side Effects: 
  - Set status = PUBLISHED, publishedAt = now(), publishedById = session user
  - Audit log
  - Create notifications for all affected users (teachers with duties, students in assigned classes, their families, principal)
```

### `unpublishDatesheetAction`
```
Auth: ADMIN only
Input: { id }
Validation: Datesheet is PUBLISHED
Output: ActionResult
Side Effects: Set status = DRAFT, clear publishedAt/publishedById, audit log
```

### `archiveDatesheetAction`
```
Auth: ADMIN only
Input: { id }
Validation: Datesheet is PUBLISHED or DRAFT
Output: ActionResult
Side Effects: Set status = ARCHIVED, audit log
```

### `deleteDatesheetAction`
```
Auth: ADMIN only
Input: { id }
Validation: Datesheet is DRAFT only (cannot delete PUBLISHED/ARCHIVED)
Output: ActionResult
Side Effects: Hard delete (cascade to entries → duties), audit log
```

---

## Server Actions — Entry CRUD (`datesheet-entry-actions.ts`)

### `createDatesheetEntryAction`
```
Auth: ADMIN only
Input: { datesheetId, classId, sectionId?, subjectId, examDate, startTime, endTime, room?, instructions?, totalMarks? }
Validation:
  - Datesheet is DRAFT
  - examDate within datesheet date range
  - endTime > startTime (reuse isEndAfterStart)
  - No time overlap for same class on same date
  - Subject is linked to class (via SubjectClassLink)
Output: ActionResult<{ id: string }>
```

### `updateDatesheetEntryAction`
```
Auth: ADMIN only
Input: { id, subjectId?, examDate?, startTime?, endTime?, room?, instructions?, totalMarks? }
Validation: Same as create + entry exists + datesheet is DRAFT
Output: ActionResult
```

### `deleteDatesheetEntryAction`
```
Auth: ADMIN only
Input: { id }
Validation: Entry exists, datesheet is DRAFT
Output: ActionResult (cascade deletes duties)
```

### `bulkCreateDatesheetEntriesAction`
```
Auth: ADMIN only
Input: { datesheetId, entries: Array<{ classId, sectionId?, subjectId, examDate, startTime, endTime, room? }> }
Validation: All entries pass individual validation + no conflicts within batch
Output: ActionResult<{ created: number }>
Purpose: Admin assigns same subject to multiple classes at once (common UX pattern)
```

---

## Server Actions — Duty Management (`datesheet-duty-actions.ts`)

### `assignDutyAction`
```
Auth: ADMIN only
Input: { datesheetEntryId, teacherProfileId, role?, room?, notes? }
Validation:
  - Entry exists, datesheet is DRAFT
  - Teacher not already assigned to this entry
  - No teacher time conflict (same date, overlapping time in another entry)
Output: ActionResult<{ id: string }>
```

### `updateDutyAction`
```
Auth: ADMIN only
Input: { id, role?, room?, notes? }
Validation: Duty exists, datesheet is DRAFT
Output: ActionResult
```

### `removeDutyAction`
```
Auth: ADMIN only
Input: { id }
Validation: Duty exists, datesheet is DRAFT
Output: ActionResult
```

### `bulkAssignDutiesAction`
```
Auth: ADMIN only
Input: { datesheetEntryId, duties: Array<{ teacherProfileId, role?, room? }> }
Validation: All duties pass individual validation
Output: ActionResult<{ assigned: number }>
Purpose: Assign multiple teachers to one paper at once
```

---

## Server Actions — Read Actions (`datesheet-fetch-actions.ts`)

### For Admin & Principal
```typescript
export async function fetchDatesheetListAction(academicSessionId: string, status?: DatesheetStatus)
export async function fetchDatesheetDetailAction(id: string)
export async function fetchDatesheetEntriesAction(datesheetId: string)
export async function fetchDatesheetEntryDutiesAction(entryId: string)
export async function fetchDatesheetStatsAction(datesheetId: string)
```

### For Teachers
```typescript
export async function fetchPublishedDatesheetListAction(academicSessionId: string)
export async function fetchMyDutyRosterAction(datesheetId: string)
  // Returns all duties for the logged-in teacher
export async function fetchMyUpcomingDutiesAction()
  // Returns next 7 days of duties
```

### For Students
```typescript
export async function fetchMyDatesheetAction(datesheetId: string)
  // Returns datesheet entries for student's class/section
```

### For Family
```typescript
export async function fetchChildDatesheetAction(studentProfileId: string, datesheetId: string)
  // Validates family-student link, returns entries for child's class
```

---

## Validation Schemas (`src/validations/datesheet-schemas.ts`)

```typescript
import { z } from 'zod/v4';
import { TIME_FORMAT_REGEX } from '@/modules/timetable/timetable.constants';  // REUSE

export const createDatesheetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  examType: z.enum(['QUIZ', 'MIDTERM', 'FINAL', 'PRACTICE', 'CUSTOM']),
  academicSessionId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(d => d.endDate >= d.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const updateDatesheetSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  examType: z.enum(['QUIZ', 'MIDTERM', 'FINAL', 'PRACTICE', 'CUSTOM']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const createDatesheetEntrySchema = z.object({
  datesheetId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid().optional(),
  subjectId: z.string().uuid(),
  examDate: z.coerce.date(),
  startTime: z.string().regex(TIME_FORMAT_REGEX, 'Invalid time format. Use HH:mm'),
  endTime: z.string().regex(TIME_FORMAT_REGEX, 'Invalid time format. Use HH:mm'),
  room: z.string().max(100).optional(),
  instructions: z.string().max(500).optional(),
  totalMarks: z.coerce.number().positive().optional(),
});

export const updateDatesheetEntrySchema = z.object({
  subjectId: z.string().uuid().optional(),
  examDate: z.coerce.date().optional(),
  startTime: z.string().regex(TIME_FORMAT_REGEX).optional(),
  endTime: z.string().regex(TIME_FORMAT_REGEX).optional(),
  room: z.string().max(100).optional(),
  instructions: z.string().max(500).optional(),
  totalMarks: z.coerce.number().positive().optional(),
});

export const bulkCreateDatesheetEntriesSchema = z.object({
  datesheetId: z.string().uuid(),
  entries: z.array(createDatesheetEntrySchema.omit({ datesheetId: true }))
    .min(1).max(100),
});

export const assignDutySchema = z.object({
  datesheetEntryId: z.string().uuid(),
  teacherProfileId: z.string().uuid(),
  role: z.string().max(50).default('INVIGILATOR'),
  room: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const bulkAssignDutiesSchema = z.object({
  datesheetEntryId: z.string().uuid(),
  duties: z.array(z.object({
    teacherProfileId: z.string().uuid(),
    role: z.string().max(50).default('INVIGILATOR'),
    room: z.string().max(100).optional(),
  })).min(1).max(10),
});
```

---

## Conflict Detection Logic

### Entry-Level Conflicts (Same Class, Same Date/Time)
```
Query: Is there another entry for the same class on the same date 
       whose [startTime, endTime] overlaps with the new entry?

SQL Logic:
  WHERE datesheetId = ? AND classId = ?
    AND (sectionId = ? OR sectionId IS NULL OR ? IS NULL)
    AND examDate = ?
    AND startTime < endTime_new AND endTime > startTime_new
    AND id != excludeId
```

### Teacher Duty Conflicts (Same Teacher, Same Date/Time)
```
Query: Does this teacher have a duty on the same date in a different entry 
       whose time slot overlaps?

SQL Logic:
  SELECT * FROM DatesheetDuty d
  JOIN DatesheetEntry e ON d.datesheetEntryId = e.id
  WHERE d.teacherProfileId = ?
    AND e.examDate = ?
    AND e.startTime < endTime_new AND e.endTime > startTime_new
    AND e.id != excludeEntryId
```

---

## Query Key Registry Updates (`src/lib/query-keys.ts`)

```typescript
// Add to existing queryKeys object:
datesheet: {
  all: ['datesheets'] as const,
  lists: () => [...queryKeys.datesheet.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...queryKeys.datesheet.lists(), filters] as const,
  details: () => [...queryKeys.datesheet.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.datesheet.details(), id] as const,
  entries: (datesheetId: string) => [...queryKeys.datesheet.all, 'entries', datesheetId] as const,
  duties: (datesheetId: string) => [...queryKeys.datesheet.all, 'duties', datesheetId] as const,
  myDuties: () => [...queryKeys.datesheet.all, 'my-duties'] as const,
  classSchedule: (datesheetId: string, classId: string) => [...queryKeys.datesheet.all, 'class', datesheetId, classId] as const,
},
```

---

## Cache Invalidation Updates (`src/lib/cache-utils.ts`)

```typescript
// Add to useInvalidateCache hook:
datesheets: () => queryClient.invalidateQueries({ queryKey: queryKeys.datesheet.all }),
datesheetDetail: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.datesheet.detail(id) }),
datesheetEntries: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.datesheet.entries(id) }),
datesheetDuties: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.datesheet.duties(id) }),

afterDatesheetMutation: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.datesheet.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
},
```

---

## Notification Integration

### On datesheet publish → Bulk create notifications:

```typescript
// 1. Teachers with duties
const teacherDuties = await prisma.datesheetDuty.findMany({
  where: { datesheetEntry: { datesheetId: id } },
  select: { teacherProfile: { select: { userId: true } } },
  distinct: ['teacherProfileId'],
});

// 2. Students in assigned classes
const classIds = await prisma.datesheetEntry.findMany({
  where: { datesheetId: id },
  select: { classId: true },
  distinct: ['classId'],
});
const students = await prisma.studentProfile.findMany({
  where: { classId: { in: classIds.map(c => c.classId) } },
  select: { userId: true },
});

// 3. Family members linked to those students
// 4. Principal (all)

// Bulk create notifications with type SYSTEM and relevant message
```

---

## Revalidation Paths

```typescript
function revalidateDatesheetPaths() {
  revalidatePath('/admin/datesheet');
  revalidatePath('/teacher/datesheet');
  revalidatePath('/student/datesheet');
  revalidatePath('/principal/datesheet');
  revalidatePath('/family/datesheet');
}
```
