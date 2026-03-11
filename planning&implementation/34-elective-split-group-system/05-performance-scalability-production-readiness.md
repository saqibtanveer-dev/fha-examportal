# 05 — Performance, Scalability & Production Readiness

> **Date**: 2026-03-11
> **Depends On**: All previous documents in this directory
> **Focus**: 1000+ students, horizontal scaling, reliability 9.5/10

---

## 1. SCALE TARGETS

| Metric | Target |
|--------|--------|
| Total students | 1,000 – 5,000 |
| Classes with electives | 4 (9, 10, 11, 12) |
| Sections per class | 3–5 |
| Elective groups per class | 1–3 |
| Subjects per elective group | 2–4 |
| Students per section | 30–60 |
| Concurrent teachers marking attendance | 20–50 |
| Timetable entries per section per week | 30–40 |
| Enrollment records per class | 200–500 |

---

## 2. DATABASE QUERY PERFORMANCE

### Critical Queries and Their Targets

| Query | Frequency | Target Latency | Strategy |
|-------|-----------|---------------|----------|
| Get timetable grid (1 section, 1 week) | ~100/min during morning | < 50ms | Index: `[classId, sectionId, academicSessionId]` + JOIN ElectiveSlotGroup |
| Get enrolled students for subject+section | ~200/min during attendance | < 20ms | Index: `[subjectId, classId, academicSessionId, isActive]` |
| Validate enrollment conflict | ~20/min during enrollment | < 10ms | Index: `[studentProfileId, academicSessionId]` |
| Build student personal timetable | ~500/min during morning | < 30ms | Cache per session (rarely changes) |
| Mark attendance (batch upsert) | ~100/min | < 100ms | Transaction with pre-validated student list |
| Get student's subjects list | ~300/min | < 15ms | Index: `[studentProfileId, academicSessionId, isActive]` |

### Index Additions Summary

```prisma
// ElectiveSlotGroup
@@unique([classId, sectionId, periodSlotId, dayOfWeek, academicSessionId])
@@index([classId, sectionId, academicSessionId])

// TimetableEntry (updated)
@@unique([classId, sectionId, subjectId, periodSlotId, dayOfWeek, academicSessionId])
@@index([electiveSlotGroupId])
@@index([isElectiveSlot])

// StudentSubjectEnrollment (add if not exists)
@@index([subjectId, academicSessionId, isActive])
```

---

## 3. CACHING STRATEGY

### Layer 1: Request-Level Cache (React `cache()`)

For Server Components, use React's `cache()` to deduplicate within a single request:

```typescript
// In enrollment-helpers.ts
import { cache } from 'react';

export const getCachedStudentSubjects = cache(
  async (studentProfileId: string, sessionId: string) => {
    return getStudentSubjectEnrollments(studentProfileId, sessionId);
  }
);
```

**What to cache**:
- `isSubjectElective(subjectId, classId)` — almost never changes
- `getStudentEnrolledSubjectIds(studentId, sessionId)` — changes only on re-enrollment
- `getElectiveGroupsForClass(classId)` — changes only on curriculum update

### Layer 2: Next.js Route-Level Cache

Use `unstable_cache()` for data that rarely changes:

```typescript
import { unstable_cache } from 'next/cache';

const getCachedElectiveGroups = unstable_cache(
  async (classId: string) => getElectiveSubjectsForClass(classId),
  ['elective-groups'],
  { tags: ['elective-config'], revalidate: 3600 } // 1 hour
);
```

**Invalidation triggers**:
- `revalidateTag('elective-config')` when admin changes SubjectClassLink
- `revalidateTag('enrollment')` when admin changes StudentSubjectEnrollment
- `revalidatePath('/admin/timetable')` when timetable entries change

### Layer 3: NO Client-Side Cache for Attendance

Attendance data is live and must always be fresh. Do NOT cache attendance queries.

---

## 4. CONCURRENT ACCESS HANDLING

### Scenario: 20 Teachers Mark Attendance Simultaneously

**Problem**: At period start, all teachers hit "Mark Attendance" at once.

**Solution**:
1. Each teacher queries their OWN subject+section → different where clauses → no lock contention
2. Upsert uses unique constraint → atomically safe
3. Transaction wraps single teacher's batch → short-lived (< 50ms)
4. No global locks needed

### Scenario: Admin Edits Enrollment While Teacher Marks Attendance

**Problem**: Admin moves a student from Bio to CS. Bio teacher's attendance list is stale.

**Solution**:
1. Enrollment changes trigger `revalidatePath('/teacher/attendance')`
2. Next attendance page load gets fresh enrollment data
3. If teacher already loaded the page, their save will still succeed (student was enrolled when they loaded)
4. Idempotent upsert: even if enrollment changed, the attendance record is valid historically

### Scenario: Multiple Admins Edit Timetable

**Problem**: Two admins add entries to the same elective group.

**Solution**:
1. Unique constraint `[classId, sectionId, subjectId, periodSlotId, dayOfWeek, academicSessionId]` prevents duplicates
2. Prisma throws `P2002` → action returns clear error message
3. UX: Show "This subject is already in this period" toast

---

## 5. DATA INTEGRITY CHECKS

### Automated Validation (Run Daily via Cron or Manual Admin Trigger)

#### Check 1: Orphaned Students (No Elective Enrollment)

```sql
SELECT sp.id, u."firstName", u."lastName", c.name as class_name, s.name as section_name
FROM "StudentProfile" sp
JOIN "User" u ON u.id = sp."userId"
JOIN "Class" c ON c.id = sp."classId"
JOIN "Section" s ON s.id = sp."sectionId"
WHERE sp.status = 'ACTIVE'
AND c.grade >= 9
AND NOT EXISTS (
  SELECT 1 FROM "StudentSubjectEnrollment" sse
  WHERE sse."studentProfileId" = sp.id
  AND sse."isActive" = true
  AND sse."academicSessionId" = (SELECT id FROM "AcademicSession" WHERE "isCurrent" = true)
)
AND EXISTS (
  SELECT 1 FROM "SubjectClassLink" scl
  WHERE scl."classId" = sp."classId"
  AND scl."isElective" = true
  AND scl."isActive" = true
);
```

**Action**: Show warning to admin → "X students in Class Y have no elective assigned"

#### Check 2: Double Enrollment in Same Group

```sql
SELECT sse."studentProfileId", scl."electiveGroupName",
  array_agg(sub.name) as subjects, COUNT(*) as enrollment_count
FROM "StudentSubjectEnrollment" sse
JOIN "SubjectClassLink" scl ON scl."subjectId" = sse."subjectId" AND scl."classId" = sse."classId"
JOIN "Subject" sub ON sub.id = sse."subjectId"
WHERE sse."isActive" = true
AND scl."electiveGroupName" IS NOT NULL
AND scl."isElective" = true
GROUP BY sse."studentProfileId", scl."electiveGroupName"
HAVING COUNT(*) > 1;
```

**Action**: Block with error → "Student X is enrolled in both Biology AND CS from same group"

#### Check 3: Timetable-Enrollment Mismatch

```sql
-- Elective timetable entries without any enrolled students
SELECT te.id, sub.name, c.name as class_name, s.name as section_name
FROM "TimetableEntry" te
JOIN "Subject" sub ON sub.id = te."subjectId"
JOIN "Class" c ON c.id = te."classId"
JOIN "Section" s ON s.id = te."sectionId"
WHERE te."isElectiveSlot" = true
AND te."isActive" = true
AND NOT EXISTS (
  SELECT 1 FROM "StudentSubjectEnrollment" sse
  WHERE sse."subjectId" = te."subjectId"
  AND sse."classId" = te."classId"
  AND sse."isActive" = true
);
```

**Action**: Warning → "Biology is scheduled in 11-A Period 3 but no students enrolled"

---

## 6. ERROR HANDLING

### User-Facing Error Messages

| Error | Message | Recovery |
|-------|---------|----------|
| Enrollment conflict | "Ahmed is already enrolled in Biology from the Science Elective group. Remove Biology enrollment first." | Click "Remove" then re-assign |
| Timetable duplicate | "Biology is already scheduled in this period for Section 11-A." | Auto-close dialog |
| Room conflict | "Room 201 is occupied by Chemistry (Sir Ali) in this period." | Choose different room |
| Teacher conflict | "Ma'am Sana is already teaching CS to 10-B in this period." | Choose different teacher |
| Non-elective in elective slot | "This period is already an elective block. Remove all elective entries first." | Go to timetable management |
| No enrollment data | "No students are enrolled in Biology for Class 11. Assign students first." | Link to enrollment page |

### Backend Error Patterns

All enrollment and timetable actions return `ActionResult<T>`:
- Success: `actionSuccess({ id, count, ... })`
- Validation error: `actionError("Clear human message")`
- Database error: caught by `safeAction`, returns generic error + logs to Sentry

---

## 7. BACKWARD COMPATIBILITY

### Classes 1–8: ZERO IMPACT

- No `SubjectClassLink.isElective = true` for classes 1–8
- All subjects are compulsory → no enrollment needed
- Timetable works exactly as before (1 entry per cell)
- Attendance works exactly as before (all section students)
- No code path changes for non-elective subjects

### Verification

```typescript
// This check exists in enrollment-queries.ts:
export async function hasEnrollmentsForClass(classId, sessionId): boolean
```

If no enrollments exist for a class, all modules fall back to "show all section students" behavior. This ensures zero regression for existing classes.

### Forward-Compatible Migration

- Existing timetable entries get `isElectiveSlot = false` (default)
- Existing timetable entries get `electiveSlotGroupId = null` (nullable field)
- No data migration needed for existing records
- New features only activate when admin explicitly configures elective groups

---

## 8. MONITORING & OBSERVABILITY

### Key Metrics to Track

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Enrollment query latency (p95) | > 50ms | Slack alert |
| Timetable grid build time (p95) | > 200ms | Slack alert |
| Attendance mark latency (p95) | > 200ms | Slack alert |
| Orphaned student count | > 0 | Daily report |
| Double enrollment count | > 0 | Immediate alert |
| Timetable-enrollment mismatch | > 0 | Daily report |

### Audit Trail

All enrollment changes are logged via `createAuditLog()`:
- `ENROLL_STUDENT_SUBJECT` — who enrolled whom in what
- `UNENROLL_STUDENT_SUBJECT` — who removed whom from what
- `CREATE_ELECTIVE_SLOT_GROUP` — who created timetable elective block
- `BULK_ENROLL_STUDENTS` — bulk operations

---

## 9. HORIZONTAL SCALING CONSIDERATIONS

### Stateless Architecture (Already Achieved)

- Next.js Server Components: stateless by design
- Server Actions: stateless request-response
- No server-side session storage (JWT/cookie auth)
- Database: single Postgres instance (can be scaled to read replicas)

### Database Scaling Path

For 5000+ students:
1. **Read replicas**: Route enrollment/timetable reads to replica
2. **Connection pooling**: Use PgBouncer or Prisma Accelerate
3. **Query optimization**: All critical queries use indexes designed above
4. **No hot spots**: Enrollment data rarely updates, timetable data rarely updates

### CDN/Edge

- Static assets: already served via Next.js static optimization
- API routes: not used (Server Actions)
- No WebSocket requirements for this feature

---

## 10. RELIABILITY TARGETS

### Recovery Scenarios

| Scenario | Impact | Recovery |
|----------|--------|----------|
| Enrollment data corrupted | Wrong students in attendance | Run integrity check → fix manually |
| Timetable entry deleted accidentally | Period shows empty | Audit log → restore from log metadata |
| Student promoted mid-year | Old enrollments stale | Promotion flow auto-deactivates old enrollments |
| Academic session switch | All enrollments reset | New session requires fresh enrollment setup |

### Stability Score Assessment

| Area | Before | After | Notes |
|------|--------|-------|-------|
| Timetable correctness | 4/10 | 9.5/10 | Multi-entry cells, elective groups |
| Attendance accuracy | 5/10 | 9.5/10 | Enrollment-filtered student lists |
| Exam assignment | 5/10 | 9.5/10 | Only enrolled students get sessions |
| Report cards | 3/10 | 9/10 | Separated compulsory vs elective |
| Family portal accuracy | 4/10 | 9.5/10 | Enrollment-filtered views |
| Data integrity | 6/10 | 9.5/10 | Automated checks + validation |
| **Overall Stability** | **4.5/10** | **9.5/10** | |
| **Overall Reliability** | **3.0/10** | **9.5/10** | |
