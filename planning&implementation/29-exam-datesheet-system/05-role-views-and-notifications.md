# Exam Datesheet System — Role-Based Views & Notification Integration

> **Date:** March 5, 2026  
> **Principle:** Each role sees exactly what they need. No more, no less.

---

## Role-Specific Data Access

### Admin
```
READ:  All datesheets (any status), all entries, all duties
WRITE: Full CRUD on datesheets, entries, duties
SCOPE: School-wide, unrestricted
```

### Principal
```
READ:  Published datesheets only, all entries, all duties
WRITE: None
SCOPE: School-wide, read-only
```

### Teacher
```
READ:  Published datesheets, entries for classes they teach, their own duties
WRITE: None
SCOPE: Own duties + related class schedules
```

### Student
```
READ:  Published datesheets, entries for their own class/section only
WRITE: None
SCOPE: Own class only
```

### Family
```
READ:  Published datesheets, entries for linked child's class/section
WRITE: None
SCOPE: Linked child's class only (enforced via FamilyStudentLink)
```

---

## Query Scoping per Role

### Admin Fetch — `fetchDatesheetListAction`
```typescript
// No filtering — gets everything
await requireRole('ADMIN');
return listDatesheets(academicSessionId, status);
```

### Principal Fetch — `fetchPublishedDatesheetListAction`
```typescript
await requireRole('PRINCIPAL', 'ADMIN');
return listDatesheets(academicSessionId, 'PUBLISHED');
```

### Teacher Fetch — `fetchMyDutyRosterAction`
```typescript
const session = await requireRole('TEACHER');
const teacherProfile = await prisma.teacherProfile.findUnique({
  where: { userId: session.user.id },
});
return listDutiesByTeacher(teacherProfile.id, datesheetId);
```

### Student Fetch — `fetchMyDatesheetAction`
```typescript
const session = await requireRole('STUDENT');
const profile = await prisma.studentProfile.findUnique({
  where: { userId: session.user.id },
  select: { classId: true, sectionId: true },
});
return listEntriesByClass(datesheetId, profile.classId, profile.sectionId);
```

### Family Fetch — `fetchChildDatesheetAction`
```typescript
const session = await requireRole('FAMILY');
// Verify family-student link (reuse existing assertFamilyStudentAccess)
await assertFamilyStudentAccess(session.user.id, studentProfileId);
const profile = await prisma.studentProfile.findUnique({
  where: { id: studentProfileId },
  select: { classId: true, sectionId: true },
});
return listEntriesByClass(datesheetId, profile.classId, profile.sectionId);
```

---

## Notification Integration

### Trigger: Datesheet Published

When admin publishes a datesheet, the system creates notifications for all affected stakeholders.

#### Notification Targets & Messages

| Target | How to Find | Message |
|--------|-------------|---------|
| Principal | All users with PRINCIPAL role | "Exam datesheet '{title}' has been published for {examType}" |
| Teachers with duties | Distinct teacherProfileId from DatesheetDuty JOIN User | "You have been assigned invigilation duties in '{title}'. Check your duty roster." |
| Students in assigned classes | StudentProfile WHERE classId IN (entry classIds) | "Exam datesheet '{title}' has been published. Check your exam schedule." |
| Family members | FamilyStudentLink JOIN StudentProfile WHERE classId IN (entry classIds) | "Exam datesheet '{title}' has been published for your child's class." |

#### Notification Type
```typescript
// Use existing NotificationType.SYSTEM for datesheet notifications
// The message body differentiates the context
```

#### Implementation Pattern
```typescript
async function sendDatesheetPublishedNotifications(
  datesheetId: string,
  datesheetTitle: string,
) {
  // Step 1: Get all affected class IDs
  const entries = await prisma.datesheetEntry.findMany({
    where: { datesheetId },
    select: { classId: true },
    distinct: ['classId'],
  });
  const classIds = entries.map(e => e.classId);

  // Step 2: Get teacher user IDs
  const duties = await prisma.datesheetDuty.findMany({
    where: { datesheetEntry: { datesheetId } },
    select: { teacherProfile: { select: { userId: true } } },
    distinct: ['teacherProfileId'],
  });
  const teacherUserIds = duties.map(d => d.teacherProfile.userId);

  // Step 3: Get student user IDs
  const students = await prisma.studentProfile.findMany({
    where: { classId: { in: classIds }, user: { isActive: true } },
    select: { userId: true },
  });
  const studentUserIds = students.map(s => s.userId);

  // Step 4: Get family user IDs
  const families = await prisma.familyStudentLink.findMany({
    where: {
      studentProfile: { classId: { in: classIds } },
      family: { user: { isActive: true } },
    },
    select: { family: { select: { userId: true } } },
  });
  const familyUserIds = families.map(f => f.family.userId);

  // Step 5: Get principal user IDs
  const principals = await prisma.user.findMany({
    where: { role: 'PRINCIPAL', isActive: true },
    select: { id: true },
  });
  const principalUserIds = principals.map(p => p.id);

  // Step 6: Deduplicate and bulk create
  const allUserIds = new Set([
    ...teacherUserIds,
    ...studentUserIds,
    ...familyUserIds,
    ...principalUserIds,
  ]);

  const notifications = [...allUserIds].map(userId => ({
    userId,
    type: 'SYSTEM' as const,
    title: 'Exam Datesheet Published',
    message: `Exam datesheet "${datesheetTitle}" has been published. Check your dashboard for the exam schedule.`,
    link: null, // Role-specific routing handled by client
  }));

  await prisma.notification.createMany({ data: notifications });
}
```

**Fire-and-forget pattern:** Notification sending should not block the publish action.
```typescript
sendDatesheetPublishedNotifications(id, datesheet.title).catch(err => {
  logger.error({ err, datesheetId: id }, 'Failed to send datesheet notifications');
});
```

---

## Dashboard Integration

### Admin Dashboard — Quick Stats Widget

Add to admin dashboard page:
```
📋 Upcoming Exams
├── Final Term (Published) — 15-25 Mar 2026 — 58 entries
└── [View Datesheet →]
```

Data source: Latest published datesheet with `startDate >= now()`.

### Teacher Dashboard — Upcoming Duties Widget

Add to teacher dashboard page:
```
👨‍🏫 My Upcoming Duties
├── 15 Mar — English (Class 10-A) — 09:00-11:00 — Head Invigilator
├── 16 Mar — Math (Class 8-B) — 09:00-12:00 — Invigilator
└── [View All Duties →]
```

Data source: Next 7 days of duties for the logged-in teacher.

### Student Dashboard — Upcoming Exams Widget

Add to student dashboard page:
```
📝 My Upcoming Exams
├── 15 Mar — English — 09:00-11:00 — Room 101
├── 16 Mar — Mathematics — 09:00-12:00 — Room 201
└── [View Full Datesheet →]
```

Data source: Next 7 days of entries for the student's class.

### Principal Dashboard — Exam Overview Widget

Add to principal dashboard page:
```
📊 Exam Schedule
├── Final Term (Published) — 58 entries, 10 classes, 12 teachers assigned
└── [View Datesheet →]
```

### Family Dashboard — Child's Exam Widget

Add to family dashboard page:
```
📝 Upcoming Exams — Ahmed (Class 10-A)
├── 15 Mar — English — 09:00-11:00
├── 16 Mar — Mathematics — 09:00-12:00
└── [View Full Datesheet →]
```

---

## Middleware & Route Protection

### Route Access Matrix

| Route Pattern | Allowed Roles |
|---------------|---------------|
| `/admin/datesheet/*` | ADMIN |
| `/principal/datesheet` | ADMIN, PRINCIPAL |
| `/teacher/datesheet` | ADMIN, TEACHER |
| `/student/datesheet` | STUDENT |
| `/family/datesheet` | FAMILY |

**No middleware changes needed** — the existing pattern-based middleware already handles `/admin/*` → ADMIN, `/principal/*` → ADMIN/PRINCIPAL, etc.

---

## Audit Trail Integration

### Events to Log

| Action | Audit Event | Target Entity |
|--------|------------|---------------|
| Create datesheet | `CREATE_DATESHEET` | `DATESHEET` |
| Update datesheet | `UPDATE_DATESHEET` | `DATESHEET` |
| Publish datesheet | `PUBLISH_DATESHEET` | `DATESHEET` |
| Unpublish datesheet | `UNPUBLISH_DATESHEET` | `DATESHEET` |
| Archive datesheet | `ARCHIVE_DATESHEET` | `DATESHEET` |
| Delete datesheet | `DELETE_DATESHEET` | `DATESHEET` |
| Create entry | `CREATE_DATESHEET_ENTRY` | `DATESHEET_ENTRY` |
| Update entry | `UPDATE_DATESHEET_ENTRY` | `DATESHEET_ENTRY` |
| Delete entry | `DELETE_DATESHEET_ENTRY` | `DATESHEET_ENTRY` |
| Assign duty | `ASSIGN_DATESHEET_DUTY` | `DATESHEET_DUTY` |
| Remove duty | `REMOVE_DATESHEET_DUTY` | `DATESHEET_DUTY` |

**Pattern:** Same as existing `createAuditLog(userId, event, entityType, entityId, metadata).catch(() => {})` — fire-and-forget.
