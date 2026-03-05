# Exam Datesheet System — Conflict Detection & Validation Engine

> **Date:** March 5, 2026  
> **Principle:** Zero tolerance for scheduling conflicts. Server-side validation is the source of truth.

---

## Conflict Categories

### Category 1: Class Schedule Conflicts (HARD BLOCK)

**Rule:** A class cannot have two different papers at the same time on the same date.

```
CONFLICT: Class 10-A has Math at 09:00-11:00 AND English at 10:00-12:00 on March 15
NO CONFLICT: Class 10-A has Math at 09:00-11:00 AND English at 11:30-13:30 on March 15
NO CONFLICT: Class 10-A has Math at 09:00-11:00 on March 15 AND English at 09:00-11:00 on March 16
```

**Detection:**
```typescript
export async function hasEntryConflict(
  datesheetId: string,
  classId: string,
  sectionId: string | null,
  examDate: Date,
  startTime: string,
  endTime: string,
  excludeId?: string,
): Promise<boolean> {
  // With section-null semantics:
  // - Entry with sectionId=null conflicts with ALL sections
  // - Entry with specific sectionId conflicts with null and same sectionId
  const conflict = await prisma.datesheetEntry.findFirst({
    where: {
      datesheetId,
      classId,
      examDate,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [
        { sectionId: null },                    // null = all sections
        { sectionId: sectionId ?? undefined },   // same section
        ...(sectionId === null ? [{}] : []),     // new entry is null = all sections
      ],
      // Time overlap check
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });
  return conflict !== null;
}
```

**Note on string comparison for time:** Since times are stored as "HH:mm" strings, lexicographic comparison works perfectly for our case (e.g., "09:00" < "11:00" is true). This is a deliberate design choice inherited from the timetable system.

### Category 2: Teacher Duty Conflicts (HARD BLOCK)

**Rule:** A teacher cannot be assigned to two different papers at overlapping times on the same date.

```
CONFLICT: Teacher Ali invigilating Class 10-A Math at 09:00-11:00 AND Class 8-B at 10:00-12:00 on March 15
NO CONFLICT: Teacher Ali invigilating Class 10-A at 09:00-11:00 AND Class 8-B at 11:30-13:30 on March 15
```

**Detection:**
```typescript
export async function hasTeacherDutyConflict(
  teacherProfileId: string,
  examDate: Date,
  startTime: string,
  endTime: string,
  excludeEntryId?: string,
): Promise<boolean> {
  const conflict = await prisma.datesheetDuty.findFirst({
    where: {
      teacherProfileId,
      datesheetEntry: {
        examDate,
        ...(excludeEntryId ? { id: { not: excludeEntryId } } : {}),
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    },
  });
  return conflict !== null;
}
```

### Category 3: Duplicate Subject (HARD BLOCK)

**Rule:** Same subject cannot appear twice for the same class in the same datesheet.

**Enforcement:** Database unique constraint `@@unique([datesheetId, classId, sectionId, subjectId])` handles this at the DB level. No application code needed.

### Category 4: Date Range Violation (HARD BLOCK)

**Rule:** Entry's examDate must fall within the datesheet's startDate-endDate range.

```typescript
function isDateInRange(examDate: Date, startDate: Date, endDate: Date): boolean {
  const d = examDate.getTime();
  return d >= startDate.getTime() && d <= endDate.getTime();
}
```

### Category 5: Time Logic (HARD BLOCK)

**Rule:** `endTime` must be after `startTime`.

**Enforcement:** Reuse existing `isEndAfterStart()` from `timetable.utils.ts`.

---

## Validation Layers

### Layer 1: Frontend (Immediate Feedback)

**Purpose:** UX convenience. NOT a security boundary.

```
- Date picker restricted to datesheet date range
- Time input enforces HH:mm format
- Subject dropdown filtered by class (via SubjectClassLink)
- Visual indicators on grid for existing entries (prevent accidental duplicates)
- "Save" button disabled when form is incomplete
```

### Layer 2: Zod Schema (Request Validation)

**Purpose:** Input sanitization and format enforcement.

```
- String lengths, formats, uuid validity
- Date coercion and validation
- Time format regex (reuse TIME_FORMAT_REGEX)
- Required field enforcement
```

### Layer 3: Server Action Logic (Business Rules)

**Purpose:** The source of truth for all conflict detection.

Every mutation action runs these checks before DB write:
1. Auth check: `requireRole('ADMIN')`
2. Datesheet exists and is DRAFT
3. Zod parse input
4. Business rule validation (conflicts, date ranges, etc.)
5. DB operation
6. Audit log + revalidation

### Layer 4: Database Constraints (Last Resort)

**Purpose:** Catch any edge case that slipped through.

```
- Unique constraints (prevent duplicates even under race conditions)
- Foreign key constraints (referential integrity)
- NOT NULL constraints
```

---

## Pre-Publish Validation Checklist

Before a datesheet can be published, the system runs a comprehensive check:

```typescript
export async function validateDatesheetForPublish(datesheetId: string): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Must have at least one entry
  const entryCount = await prisma.datesheetEntry.count({ where: { datesheetId } });
  if (entryCount === 0) errors.push('Datesheet has no entries');

  // 2. All entries must have valid times
  const badTimeEntries = await prisma.datesheetEntry.findMany({
    where: { datesheetId, startTime: { gte: prisma.raw('endTime') } },
  });
  // Note: This is pseudo-code; actual implementation uses application-level check
  
  // 3. No class schedule conflicts
  // Run conflict detection for all entry pairs

  // 4. No teacher duty conflicts
  // Run duty conflict check for all teachers

  // 5. WARNINGS (not blocking):
  // - Some entries have no teacher assigned → warning
  // - Some classes have fewer entries than others → warning
  // - Datesheet starts in the past → warning

  return { valid: errors.length === 0, errors, warnings };
}
```

**The publish action shows errors (blocking) and warnings (non-blocking) to the admin before confirming.**

---

## Error Messages

### Conflict Errors (User-Facing)

| Code | Message |
|------|---------|
| `ENTRY_TIME_CONFLICT` | "Class {className} already has a paper scheduled at this time on {date}" |
| `ENTRY_SUBJECT_DUPLICATE` | "Subject {subjectName} is already scheduled for Class {className}" |
| `DUTY_TIME_CONFLICT` | "Teacher {teacherName} already has a duty at this time on {date}" |
| `DUTY_DUPLICATE` | "Teacher {teacherName} is already assigned to this paper" |
| `DATE_OUT_OF_RANGE` | "Exam date must be between {startDate} and {endDate}" |
| `TIME_INVALID` | "End time must be after start time" |
| `DATESHEET_NOT_DRAFT` | "Can only edit datesheets in Draft status" |
| `DATESHEET_EMPTY` | "Cannot publish a datesheet with no entries" |
| `DATESHEET_NOT_FOUND` | "Datesheet not found" |

---

## Race Condition Handling

### Scenario: Two admins editing the same datesheet simultaneously

**Protection:** 
1. **Database unique constraints** prevent duplicate entries
2. **`safeAction` wrapper** catches Prisma P2002 (unique violation) gracefully
3. **Optimistic locking** not needed — datesheets are rarely edited concurrently + admin is typically one person

### Scenario: Admin publishes while another admin is adding entries

**Protection:**
1. Publish action re-validates the full datesheet at publish time
2. The status check (`datesheet.status === 'DRAFT'`) prevents double-publish
3. Race condition on status: Prisma's atomicity handles this — the second publish attempt will see PUBLISHED status and fail gracefully
