# 02 — Timetable & Enrollment Architecture for Electives

> **Date**: 2026-03-11
> **Depends On**: `01-database-schema-design.md`
> **Scope**: Timetable module rewrite, enrollment management, elective conflict resolution

---

## 1. TIMETABLE ARCHITECTURE — THE NEW MENTAL MODEL

### Before (Current): One-to-One Cell Model

```
┌─────────┬──────────┬──────────┬──────────┐
│ Period   │ Monday   │ Tuesday  │ Wednesday│
├─────────┼──────────┼──────────┼──────────┤
│ Period 1 │ English  │ Urdu     │ Math     │
│ Period 2 │ Physics  │ Chem     │ English  │
│ Period 3 │ Biology  │ Math     │ Physics  │  ← PROBLEM: Bio OR CS?
│ Period 4 │ Urdu     │ English  │ Chem     │
└─────────┴──────────┴──────────┴──────────┘

Cell = 1 TimetableEntry (always)
```

### After (New): Multi-Entry Cell Model

```
┌─────────┬──────────┬──────────┬────────────────────┐
│ Period   │ Monday   │ Tuesday  │ Wednesday          │
├─────────┼──────────┼──────────┼────────────────────┤
│ Period 1 │ English  │ Urdu     │ Math               │
│ Period 2 │ Physics  │ Chem     │ English            │
│ Period 3 │ ┌──────┐ │ Math     │ Physics            │
│          │ │Bio   │ │          │                    │
│          │ │CS    │ │          │                    │
│          │ │Stats │ │          │                    │
│          │ └──────┘ │          │                    │
│ Period 4 │ Urdu     │ English  │ Chem               │
└─────────┴──────────┴──────────┴────────────────────┘

Regular Cell = 1 TimetableEntry
Elective Cell = ElectiveSlotGroup with N TimetableEntries
```

---

## 2. TIMETABLE ENTRY CREATION FLOW

### Flow A: Regular (Non-Elective) Entry

```
Admin selects: Section 11-A, Period 1, Monday, Subject: English
→ Check: Is "English" an elective for Class 11? → NO
→ Check: Does any entry exist for 11-A, Period 1, Monday? → NO
→ Create TimetableEntry(isElectiveSlot=false, electiveSlotGroupId=null)
→ Done
```

### Flow B: First Elective Entry for a Period

```
Admin selects: Section 11-A, Period 3, Monday, Subject: Biology
→ Check: Is "Biology" an elective for Class 11? → YES
→ Check: Does any entry exist for 11-A, Period 3, Monday?
  → NO (first entry)
→ Create ElectiveSlotGroup(classId, sectionId, periodSlotId, day, session)
→ Create TimetableEntry(isElectiveSlot=true, electiveSlotGroupId=group.id)
→ Done (but UI shows "1 of N elective subjects assigned")
```

### Flow C: Additional Elective Entry for Same Period

```
Admin selects: Section 11-A, Period 3, Monday, Subject: Computer Science
→ Check: Is "CS" an elective for Class 11? → YES
→ Check: Does any entry exist for 11-A, Period 3, Monday?
  → YES — and it's an elective slot group already exists
→ Find existing ElectiveSlotGroup for this slot
→ Check: Is CS already in this group? → NO
→ Check: Is CS in the same electiveGroupName as existing Bio? → YES → valid
→ Create TimetableEntry(isElectiveSlot=true, electiveSlotGroupId=existingGroup.id)
→ Done
```

### Flow D: Conflict — Non-Elective After Elective (or vice versa)

```
Admin selects: Section 11-A, Period 3, Monday, Subject: English (non-elective)
→ Check: Is "English" an elective? → NO
→ Check: Does any entry exist for 11-A, Period 3, Monday?
  → YES — and it's an elective block
→ REJECT: "This period is already an elective block. Cannot add a non-elective subject."
```

```
Admin selects: Section 11-A, Period 1, Monday, Subject: Biology (elective)
→ Check: Is "Biology" an elective? → YES
→ Check: Does any entry exist for 11-A, Period 1, Monday?
  → YES — and it's a non-elective entry (English)
→ REJECT: "This period already has a regular subject. Remove it first to create an elective block."
```

---

## 3. ELECTIVE ENROLLMENT MANAGEMENT

### 3.1 Enrollment Lifecycle

```
Step 1: Admin configures SubjectClassLink
  → Math, English, Urdu = compulsory (isElective=false)
  → Biology, CS, Stats = elective (isElective=true, electiveGroupName="Science Group")

Step 2: Admin enrolls students in electives
  → Student Ahmed → Biology (from "Science Group")
  → Student Sara → Computer Science (from "Science Group")
  → Student Ali → Statistics (from "Science Group")

Step 3: System validates
  → Ahmed can't ALSO enroll in CS (same elective group)
  → Sara CAN enroll in Fine Arts (different elective group, if exists)
```

### 3.2 Enrollment Conflict Validation (CRITICAL)

```
Function: validateElectiveEnrollment(studentId, subjectId, classId, sessionId)

1. Get SubjectClassLink(subjectId, classId) → electiveGroupName
2. If electiveGroupName is null → allow (not grouped)
3. Get ALL SubjectClassLinks WHERE classId = C AND electiveGroupName = same
4. Get student's enrollments in ANY of those subjects for this session
5. If any active enrollment exists → REJECT
6. Otherwise → ALLOW
```

### 3.3 Enrollment Management UI Requirements

**Page**: `/admin/subjects/enrollments` or modal from subject management

**UI Components Needed**:

1. **Elective Group Overview Card** — shows all elective groups for a class
   - Group name: "Science Elective"
   - Subjects: Biology (15), CS (20), Stats (10)
   - Unassigned: 0 students

2. **Student Enrollment Table** — per-section view
   - Columns: Roll No, Student Name, Current Elective, [Change] button
   - Filter: By section, by group
   - Bulk operations: "Assign remaining unassigned students"

3. **Enrollment Validator** — real-time check
   - Shows conflicts before saving
   - Shows unassigned students (students in section without any elective enrollment)
   - Shows group capacity (if applicable)

---

## 4. TIMETABLE GRID DISPLAY — NEW CELL TYPES

### Type System

```typescript
// Current (single entry per cell)
type TimetableGridCell = TimetableEntry | null;

// New (supports multi-entry elective cells)
type TimetableGridCell =
  | { type: 'empty' }
  | { type: 'break'; periodSlot: PeriodSlot }
  | { type: 'regular'; entry: TimetableEntry }
  | { type: 'elective'; group: ElectiveSlotGroup; entries: TimetableEntry[] };
```

### Grid Rendering Rules

| Cell Type | Visual | Behavior |
|-----------|--------|----------|
| `empty` | Gray dashed border | Click to add entry |
| `break` | Light background, "Break" text | Not clickable |
| `regular` | Subject name + Teacher + Room | Click to edit/delete |
| `elective` | Stacked colored cards (1 per subject) | Click to manage group |

### Mobile Rendering

On mobile, elective cells show as expandable accordion:
```
┌──────────────────────┐
│ Period 3 - Elective   │
│ ▼ Biology (3 entries) │
│   Teacher: Sir Ahsan  │
│   Room: 201           │
│   Students: 20        │
│ ▶ Computer Sci        │
│ ▶ Statistics           │
└──────────────────────┘
```

---

## 5. TIMETABLE QUERY CHANGES

### Current Query: `getWeeklyTimetable(classId, sectionId, sessionId)`

Returns flat list of entries. Grid builder puts them in cells by `periodSlotId × dayOfWeek`.

### New Query Logic

```
1. Fetch ALL TimetableEntries for section + session
2. Fetch ALL ElectiveSlotGroups for section + session
3. Group entries:
   a. Entries where isElectiveSlot = false → regular cells
   b. Entries where isElectiveSlot = true → group by electiveSlotGroupId
4. Build grid:
   For each periodSlot × dayOfWeek:
     - If no entries → empty cell
     - If 1 non-elective entry → regular cell
     - If ElectiveSlotGroup exists → elective cell with all grouped entries
```

### Teacher's Personal Timetable (No Change Needed)

Teacher timetable already filters by `teacherProfileId` → shows only THEIR entries.
For elective periods, teacher sees only their own subject (Bio teacher sees Bio, not CS).

### Student's Personal Timetable (NEEDS CHANGE)

```
Current: Show all section entries → Student sees Bio AND CS
New:
1. Fetch student's enrollments
2. For elective cells, show ONLY the subject student is enrolled in
3. Result: Bio student sees "Biology" in Period 3, not "Biology/CS/Stats"
```

---

## 6. ATTENDANCE INTEGRATION

### Subject Attendance — Enrollment-Aware Student List

**Current Flow** (BROKEN):
```
Teacher opens: Mark Attendance → Period 3 → Biology → 11-A
→ System fetches ALL students in Section 11-A
→ Shows 45 students (including 25 CS/Stats students who are in different rooms!)
```

**New Flow** (CORRECT):
```
Teacher opens: Mark Attendance → Period 3 → Biology → 11-A
→ System checks: Is Biology an elective for Class 11? → YES
→ System queries: StudentSubjectEnrollment WHERE subjectId=Bio AND classId=11
→ Filter by sectionId=11-A (from enrollment studentProfile)
→ Shows ONLY 20 enrolled Bio students
→ Teacher marks attendance for exactly their students
```

### Implementation: Enrollment-Aware Student Fetch

```typescript
// New helper function
async function getStudentsForSubjectAttendance(
  subjectId: string,
  classId: string,
  sectionId: string,
  academicSessionId: string,
): Promise<StudentProfile[]> {
  const isElective = await isSubjectElective(subjectId, classId);

  if (!isElective) {
    // Return ALL section students (existing behavior)
    return getStudentsInSection(classId, sectionId);
  }

  // Return ONLY enrolled students from this section
  const enrollments = await getStudentsEnrolledInSubject(subjectId, classId, academicSessionId);
  return enrollments
    .filter(e => e.studentProfile.sectionId === sectionId)
    .map(e => e.studentProfile);
}
```

---

## 7. EXAM & WRITTEN EXAM INTEGRATION

### Exam Assignment — Enrollment-Aware

**Current**: `ExamClassAssignment` assigns exam to section → ALL students get exam session.

**New**: When creating exam sessions for an elective subject:
```
1. Find ExamClassAssignment (classId + sectionId)
2. Check: Is exam's subject an elective? → YES
3. Get enrolled students for this subject + section
4. Create ExamSession ONLY for enrolled students
5. Non-enrolled students don't see the exam at all
```

### Written Exam — Same Pattern

Mark entry page should only show enrolled students, not full section.

---

## 8. DIARY INTEGRATION

### Diary Target Audience

**Current**: Diary for Bio, Class 11-A → goes to all 11-A students.

**New**:
```
When creating DiaryEntry:
  → Check if subjectId is elective for classId
  → If elective:
    - DiaryEntry is created for section (existing)
    - Read receipts expected ONLY from enrolled students
    - Family portal ONLY shows diary to enrolled student's parents
    - Student portal ONLY shows diary if student is enrolled
```

### Query Filter

```typescript
// When fetching diaries for a student:
const enrolledSubjectIds = await getStudentEnrolledSubjectIds(studentProfileId, sessionId);
const electiveSubjectIds = await getElectiveSubjectIdsForClass(classId);

diaries.filter(diary => {
  // Show diary if:
  // 1. Subject is not elective (everyone takes it), OR
  // 2. Subject is elective AND student is enrolled in it
  const isElective = electiveSubjectIds.has(diary.subjectId);
  return !isElective || enrolledSubjectIds.has(diary.subjectId);
});
```

---

## 9. RESULTS & ANALYTICS INTEGRATION

### Per-Subject Results

- Only compute averages for students ENROLLED in that subject
- Section average for Biology = average of 20 Bio students, not 45

### Report Card Generation

```
Student Ahmed's Report Card:
  Compulsory Subjects:
    English: 85%
    Urdu: 78%
    Islamiat: 90%
    Pak Studies: 88%

  Elective Subjects (Science Group: Pre-Medical):
    Biology: 75%
    Chemistry: 82%
    Physics: 70%

  Overall: 81.1%
```

The report card MUST:
1. Separate compulsory vs elective subjects
2. Show ONLY subjects student is enrolled in
3. Label the elective group name
4. Calculate overall from actual subjects taken

### Analytics Dashboard

- When showing "Section 11-A Biology Average", ONLY include enrolled students
- When showing "Section 11-A Overall Average", include ALL subjects each student actually takes
- Section comparison charts should be enrollment-aware

---

## 10. FAMILY PORTAL INTEGRATION

### Child's Subject List

```
Current: Shows ALL subjects for child's class
New: Shows compulsory + enrolled elective subjects only
```

### Attendance Summary

```
Current: Shows attendance for all subjects
New: Shows attendance only for enrolled subjects
```

### Diary Feed

```
Current: Shows all section diaries
New: Filters out diaries for subjects child isn't enrolled in
```

---

## 11. SAFETY CHECKS — PREVENTING DATA CORRUPTION

### Check 1: No Orphaned Students

Periodically verify: Every student in classes with elective subjects has an enrollment.

```sql
-- Find students in Class 11 without any elective enrollment
SELECT sp.id, u."firstName", u."lastName"
FROM "StudentProfile" sp
JOIN "User" u ON u.id = sp."userId"
WHERE sp."classId" = (SELECT id FROM "Class" WHERE grade = 11)
AND sp.status = 'ACTIVE'
AND NOT EXISTS (
  SELECT 1 FROM "StudentSubjectEnrollment" sse
  WHERE sse."studentProfileId" = sp.id
  AND sse."isActive" = true
);
```

### Check 2: No Double Enrollment

```sql
-- Find students enrolled in >1 subject from same group
SELECT sse."studentProfileId", scl."electiveGroupName", COUNT(*)
FROM "StudentSubjectEnrollment" sse
JOIN "SubjectClassLink" scl ON scl."subjectId" = sse."subjectId"
  AND scl."classId" = sse."classId"
WHERE sse."isActive" = true
AND scl."electiveGroupName" IS NOT NULL
GROUP BY sse."studentProfileId", scl."electiveGroupName"
HAVING COUNT(*) > 1;
```

### Check 3: Timetable Consistency

```sql
-- Find elective timetable entries without corresponding enrollment data
SELECT te.*
FROM "TimetableEntry" te
WHERE te."isElectiveSlot" = true
AND NOT EXISTS (
  SELECT 1 FROM "StudentSubjectEnrollment" sse
  WHERE sse."subjectId" = te."subjectId"
  AND sse."classId" = te."classId"
  AND sse."isActive" = true
);
```
