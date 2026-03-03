# ExamCore - Attendance System Design Document

## Overview

A production-grade hybrid attendance system that supports both **Daily attendance** (marked by class teacher) and **Subject/Period-wise attendance** (marked by subject teacher), backed by a full **Timetable System** with fixed period slots.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Granularity | Hybrid (Daily + Subject/Period) | Maximum flexibility — class teacher tracks homeroom, subject teachers track per-period |
| Who marks | Class Teacher (daily) + Subject Teacher (per-period) | Aligns with real school workflow |
| Statuses | PRESENT, ABSENT, LATE, EXCUSED | Standard 4-state — covers 99% of use cases without complexity |
| Period System | Fixed admin-defined slots | Consistent school-wide schedule |
| Timetable | Full timetable system | Auto-detects teacher's current class/subject for marking |
| Leave Management | Simple excused marking | No formal leave workflow — teacher marks excused directly |
| Edit Rules | Same day editable, then locked (Admin override) | Prevents fraud while allowing corrections |
| Analytics | Full dashboard + reports + export | Complete visibility at student/class/school level |
| Academic Session | All attendance scoped to current session | Clean separation between years |

---

## Database Schema

### New Enums

```
AttendanceStatus: PRESENT | ABSENT | LATE | EXCUSED
DayOfWeek: MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY
```

### New Models

#### 1. PeriodSlot (School-wide period structure)
```
id             UUID PK
name           String       "Period 1", "Lunch Break"
shortName      String       "P1", "BRK"
startTime      String       "08:00" (HH:mm format)
endTime        String       "08:45"
sortOrder      Int          1, 2, 3...
isBreak        Boolean      false (break periods skip attendance)
isActive       Boolean      true
createdAt      DateTime
updatedAt      DateTime

Unique: [sortOrder]
```

#### 2. TimetableEntry (Which subject/teacher in which period)
```
id                UUID PK
classId           FK → Class
sectionId         FK → Section
subjectId         FK → Subject
teacherProfileId  FK → TeacherProfile
periodSlotId      FK → PeriodSlot
dayOfWeek         DayOfWeek
academicSessionId FK → AcademicSession
room              String?    (optional room number)
isActive          Boolean    true
createdAt         DateTime
updatedAt         DateTime

Unique: [classId, sectionId, periodSlotId, dayOfWeek, academicSessionId]
Index: [teacherProfileId, dayOfWeek, academicSessionId]
Index: [classId, sectionId, academicSessionId]
```

#### 3. DailyAttendance (One record per student per day)
```
id                UUID PK
studentProfileId  FK → StudentProfile
classId           FK → Class
sectionId         FK → Section
date              DateTime   (date only, normalized to midnight)
status            AttendanceStatus
remarks           String?
markedById        FK → User
academicSessionId FK → AcademicSession
isEdited          Boolean    false
editedById        FK → User? (nullable)
editedAt          DateTime?
createdAt         DateTime
updatedAt         DateTime

Unique: [studentProfileId, date, academicSessionId]
Index: [classId, sectionId, date]
Index: [date, academicSessionId]
Index: [markedById]
Index: [status]
```

#### 4. SubjectAttendance (One record per student per subject per period per day)
```
id                 UUID PK
studentProfileId   FK → StudentProfile
classId            FK → Class
sectionId          FK → Section
subjectId          FK → Subject
timetableEntryId   FK → TimetableEntry? (nullable for manual marking)
periodSlotId       FK → PeriodSlot
date               DateTime
status             AttendanceStatus
remarks            String?
markedById         FK → User
academicSessionId  FK → AcademicSession
isEdited           Boolean    false
editedById         FK → User? (nullable)
editedAt           DateTime?
createdAt          DateTime
updatedAt          DateTime

Unique: [studentProfileId, subjectId, periodSlotId, date, academicSessionId]
Index: [classId, sectionId, date, periodSlotId]
Index: [subjectId, date]
Index: [markedById]
Index: [status]
Index: [timetableEntryId]
```

### Modified Models

#### Section — Add classTeacherId
```
+ classTeacherId  FK → User? (nullable)
```

---

## Module Structure

### Timetable Module
```
src/modules/timetable/
├── components/
│   ├── index.ts
│   ├── period-slot-manager.tsx        # Admin: CRUD period slots
│   ├── period-slot-form.tsx           # Create/edit period slot dialog
│   ├── timetable-grid.tsx             # Weekly grid view (class schedule)
│   ├── timetable-entry-form.tsx       # Assign subject/teacher to slot
│   ├── teacher-schedule-view.tsx      # Teacher's weekly schedule
│   └── class-timetable-view.tsx       # Read-only class timetable
├── hooks/
│   ├── use-period-slots.ts
│   └── use-timetable.ts
├── timetable-queries.ts               # Prisma queries
├── timetable-fetch-actions.ts         # Read server actions
├── timetable-actions.ts               # Mutation server actions
├── timetable.types.ts
├── timetable.constants.ts
└── timetable.utils.ts
```

### Attendance Module
```
src/modules/attendance/
├── components/
│   ├── index.ts
│   ├── daily-attendance-marker.tsx     # Bulk mark daily attendance
│   ├── subject-attendance-marker.tsx   # Bulk mark subject attendance
│   ├── attendance-table.tsx            # Editable attendance table
│   ├── attendance-calendar.tsx         # Monthly calendar view
│   ├── attendance-summary-card.tsx     # Stats card (P/A/L/E counts)
│   ├── student-attendance-detail.tsx   # Individual student view
│   ├── class-attendance-report.tsx     # Class-level report
│   ├── attendance-status-badge.tsx     # Reusable status badge
│   ├── attendance-filters.tsx          # Date/class/section filters
│   └── attendance-export-dialog.tsx    # Export to CSV/PDF
├── hooks/
│   ├── use-daily-attendance.ts
│   ├── use-subject-attendance.ts
│   └── use-attendance-stats.ts
├── attendance-queries.ts               # Prisma queries
├── attendance-fetch-actions.ts         # Read server actions
├── attendance-actions.ts               # Mutation server actions
├── attendance-stats.ts                 # Stats/analytics calculation
├── attendance.types.ts
├── attendance.constants.ts
└── attendance.utils.ts
```

---

## Page Structure

```
src/app/(dashboard)/
├── admin/
│   ├── timetable/
│   │   ├── page.tsx                    # Period slots + timetable management
│   │   └── loading.tsx
│   └── attendance/
│       ├── page.tsx                    # Analytics dashboard
│       ├── loading.tsx
│       └── reports/
│           └── page.tsx                # Detailed reports + export
├── teacher/
│   ├── timetable/
│   │   └── page.tsx                    # View own schedule
│   ├── attendance/
│   │   ├── page.tsx                    # Attendance hub (daily + subject tabs)
│   │   └── loading.tsx
└── student/
    └── attendance/
        └── page.tsx                    # View own attendance + calendar
```

---

## RBAC Matrix

| Resource | Action | Admin | Principal | Teacher | Student |
|----------|--------|-------|-----------|---------|---------|
| Period Slots | CRUD | YES | NO | NO | NO |
| Timetable | CRUD | YES | NO | NO | NO |
| Timetable | View (all) | YES | YES | NO | NO |
| Timetable | View (own) | NO | NO | YES | YES |
| Daily Attendance | Mark (own class) | NO | NO | YES* | NO |
| Daily Attendance | Mark (any) | YES | NO | NO | NO |
| Subject Attendance | Mark (own) | NO | NO | YES | NO |
| Subject Attendance | Mark (any) | YES | NO | NO | NO |
| Attendance | Edit (same day) | YES | NO | YES** | NO |
| Attendance | Edit (past) | YES | NO | NO | NO |
| Attendance | View (all) | YES | YES | NO | NO |
| Attendance | View (class) | NO | NO | YES | NO |
| Attendance | View (own) | NO | NO | NO | YES |
| Analytics | Full Dashboard | YES | YES | NO | NO |
| Analytics | Class Report | YES | YES | YES | NO |
| Reports | Export CSV/PDF | YES | YES | YES | NO |

*Only if assigned as class teacher for that section
**Only for records they created

---

## Business Rules

### Marking Rules
1. **Bulk Marking**: Teacher marks entire class/section at once (not individual students)
2. **Default**: When marking form loads, all students default to PRESENT — teacher only changes exceptions
3. **Required**: Every student must have a status — no null/empty states
4. **Academic Session**: All records scoped to current academic session automatically

### Locking Rules
1. **Same Day**: Teachers can mark and edit attendance on the SAME calendar day only
2. **Lock at Midnight**: After midnight, attendance is locked for teachers
3. **Admin Override**: Admin can edit any date's attendance anytime
4. **Edit Tracking**: Every edit is tracked with `isEdited`, `editedById`, `editedAt`

### Validation Rules
1. **Class Teacher**: Only the section's assigned class teacher can mark daily attendance
2. **Subject Teacher**: Only the timetable-assigned teacher can mark subject attendance for that slot
3. **Date Validation**: Cannot mark attendance for future dates
4. **Duplicate Prevention**: Unique constraints prevent double-marking
5. **Active Students Only**: Only ACTIVE students in the class/section appear for marking

### Analytics Calculations
1. **Attendance %** = (Present + Late) / Total Days × 100
2. **Late** counts as present for percentage but tracked separately
3. **Excused** does NOT count against absence (excluded from total)
4. **Monthly Report**: Calendar grid with color-coded status per day
5. **Trends**: Rolling 30-day attendance trend line

---

## Implementation Phases

### Phase 1: Database (Schema + Migration)
- Add enums, models, relations to schema.prisma
- Add classTeacherId to Section
- Run migration

### Phase 2: Timetable Module
- Period slot CRUD (admin)
- Timetable entry CRUD (admin)
- Timetable views (teacher/class)

### Phase 3: Attendance Core
- Queries, types, constants, utils
- Server actions for mark/edit/fetch
- Business rule enforcement

### Phase 4: UI — Teacher Attendance
- Daily attendance marker page
- Subject attendance marker page
- Attendance hub with tabs

### Phase 5: UI — Admin & Student
- Admin analytics dashboard
- Admin reports + export
- Student own attendance view

### Phase 6: Analytics Engine
- Stats calculation functions
- Chart data preparation
- CSV/PDF export
