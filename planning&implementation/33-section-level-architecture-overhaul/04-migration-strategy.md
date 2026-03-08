# 04 — Migration Strategy

## Overview

Migrating from class-level to section-level teacher assignments requires a careful, phased approach to avoid data loss, downtime, or broken workflows. This document defines the exact migration steps, rollback strategy, and data validation.

---

## 1. MIGRATION PHASES

### Phase Overview

```
Phase 0: Preparation (no schema changes)
  └── Create migration scripts
  └── Test on staging data
  └── Backup production database

Phase 1: Add sectionId as NULLABLE
  └── Prisma migration: add column
  └── No code changes yet
  └── Old code continues to work

Phase 2: Data population
  └── Run data migration script
  └── Populate sectionId from timetable data
  └── Fill remaining gaps with "all sections" strategy
  └── Validate data integrity

Phase 3: Code deployment
  └── Deploy ALL code changes simultaneously
  └── New code handles both null and non-null sectionId
  └── Transition period

Phase 4: Make sectionId REQUIRED
  └── Prisma migration: set NOT NULL
  └── Update unique constraint
  └── Remove null-handling code

Phase 5: ExamClassAssignment migration
  └── Same pattern: nullable → populate → required

Phase 6: Cleanup
  └── Remove backward-compatibility code
  └── Run final validation
  └── Update indexes
```

---

## 2. PHASE 0: PREPARATION

### 2.1 Create Backup

```sql
-- Before any migration
pg_dump --format=custom --file=backup_before_section_migration.dump $DATABASE_URL
```

### 2.2 Analyze Existing Data

```sql
-- Count TeacherSubject records
SELECT COUNT(*) FROM "TeacherSubject";

-- Count records that can be resolved via TimetableEntry
SELECT COUNT(DISTINCT ts.id)
FROM "TeacherSubject" ts
JOIN "TimetableEntry" te ON 
  te."teacherProfileId" = ts."teacherId"
  AND te."subjectId" = ts."subjectId"
  AND te."classId" = ts."classId";

-- Count records without timetable (need "all sections" expansion)
SELECT COUNT(ts.id)
FROM "TeacherSubject" ts
LEFT JOIN "TimetableEntry" te ON 
  te."teacherProfileId" = ts."teacherId"
  AND te."subjectId" = ts."subjectId"
  AND te."classId" = ts."classId"
WHERE te.id IS NULL;

-- Count ExamClassAssignment records with null sectionId
SELECT COUNT(*) FROM "ExamClassAssignment" WHERE "sectionId" IS NULL;

-- Count sections per class (to know expansion factor)
SELECT c."name", COUNT(s.id) as section_count
FROM "Class" c
JOIN "Section" s ON s."classId" = c.id AND s."isActive" = true
GROUP BY c.id, c."name"
ORDER BY c."grade";
```

### 2.3 Estimate New Record Count

```
New TeacherSubject records = 
  (Records with timetable × 1) + (Records without timetable × avg_sections_per_class)

Example:
  50 TeacherSubject records total
  30 have matching timetable entries → 30 new records (1:1 mapping)
  20 don't have timetable → 20 × 3 avg sections = 60 new records  
  Total: ~90 records (from 50)
```

---

## 3. PHASE 1: ADD NULLABLE COLUMN

### Prisma Migration

```prisma
// In prisma/schema.prisma — TEMPORARY state
model TeacherSubject {
  // ... existing fields
  sectionId String?    // Nullable during migration
  section   Section?   @relation(fields: [sectionId], references: [id])

  @@unique([teacherId, subjectId, classId, sectionId])  // Include sectionId
  @@index([sectionId])
}
```

### Migration Command

```bash
npx prisma migrate dev --name add_teacher_subject_section_nullable
```

### Generated SQL (expected)

```sql
ALTER TABLE "TeacherSubject" ADD COLUMN "sectionId" TEXT;
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_sectionId_fkey" 
  FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL;
CREATE INDEX "TeacherSubject_sectionId_idx" ON "TeacherSubject"("sectionId");

-- Drop old unique, add new
ALTER TABLE "TeacherSubject" DROP CONSTRAINT "TeacherSubject_teacherId_subjectId_classId_key";
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_teacherId_subjectId_classId_sectionId_key" 
  UNIQUE ("teacherId", "subjectId", "classId", "sectionId");
```

---

## 4. PHASE 2: DATA POPULATION

### 4.1 Migration Script

**Location**: `prisma/migrations/populate-teacher-subject-sections.ts`

```typescript
// Pseudocode for the migration script

async function migrateTeacherSubjectSections() {
  // Step 1: Get all current TeacherSubject records
  const assignments = await prisma.teacherSubject.findMany({
    where: { sectionId: null }
  });

  for (const assignment of assignments) {
    // Step 2: Try to resolve from TimetableEntry
    const timetableEntries = await prisma.timetableEntry.findMany({
      where: {
        teacherProfileId: assignment.teacherId,
        subjectId: assignment.subjectId,
        classId: assignment.classId,
        isActive: true
      },
      select: { sectionId: true },
      distinct: ['sectionId']
    });

    if (timetableEntries.length > 0) {
      // Create section-specific assignments from timetable
      for (const entry of timetableEntries) {
        await prisma.teacherSubject.upsert({
          where: {
            teacherId_subjectId_classId_sectionId: {
              teacherId: assignment.teacherId,
              subjectId: assignment.subjectId,
              classId: assignment.classId,
              sectionId: entry.sectionId
            }
          },
          create: {
            teacherId: assignment.teacherId,
            subjectId: assignment.subjectId,
            classId: assignment.classId,
            sectionId: entry.sectionId
          },
          update: {} // No-op if exists
        });
      }
    } else {
      // Step 3: No timetable data — assign to ALL active sections
      const sections = await prisma.section.findMany({
        where: { classId: assignment.classId, isActive: true }
      });

      for (const section of sections) {
        await prisma.teacherSubject.upsert({
          where: {
            teacherId_subjectId_classId_sectionId: {
              teacherId: assignment.teacherId,
              subjectId: assignment.subjectId,
              classId: assignment.classId,
              sectionId: section.id
            }
          },
          create: {
            teacherId: assignment.teacherId,
            subjectId: assignment.subjectId,
            classId: assignment.classId,
            sectionId: section.id
          },
          update: {} // No-op if exists
        });
      }
    }

    // Step 4: Delete the old null-section record
    await prisma.teacherSubject.delete({ where: { id: assignment.id } });
  }
}
```

### 4.2 Validation After Population

```sql
-- All records should have sectionId
SELECT COUNT(*) FROM "TeacherSubject" WHERE "sectionId" IS NULL;
-- Expected: 0

-- Verify referential integrity
SELECT ts.id 
FROM "TeacherSubject" ts
LEFT JOIN "Section" s ON s.id = ts."sectionId"
WHERE s.id IS NULL;
-- Expected: 0 rows

-- Verify section belongs to correct class
SELECT ts.id
FROM "TeacherSubject" ts
JOIN "Section" s ON s.id = ts."sectionId"
WHERE s."classId" != ts."classId";
-- Expected: 0 rows

-- Check for duplicates
SELECT "teacherId", "subjectId", "classId", "sectionId", COUNT(*)
FROM "TeacherSubject"
GROUP BY "teacherId", "subjectId", "classId", "sectionId"
HAVING COUNT(*) > 1;
-- Expected: 0 rows
```

---

## 5. PHASE 3: CODE DEPLOYMENT

### Deployment Strategy

All code changes must be deployed TOGETHER (single deployment):

1. Authorization guards (`authorization-guards.ts`)
2. Updated subject actions (with sectionId support)
3. Updated diary, exam, grading, written-exam actions
4. Updated UI components (teacher-subject-assigner, create-exam-dialog)

### Backward Compatibility During Transition

During Phase 3, code should handle BOTH states:

```typescript
// Temporary: handle both null and non-null sectionId
const assignment = await prisma.teacherSubject.findFirst({
  where: { 
    teacherId, 
    subjectId, 
    classId,
    ...(sectionId ? { sectionId } : {}) // Graceful during transition
  }
});
```

This temporary pattern is removed in Phase 4.

---

## 6. PHASE 4: MAKE REQUIRED

### Prisma Migration

```prisma
model TeacherSubject {
  sectionId String     // ← Now REQUIRED (was String?)
  section   Section    @relation(fields: [sectionId], references: [id])
}
```

### Migration Command

```bash
npx prisma migrate dev --name make_teacher_subject_section_required
```

---

## 7. PHASE 5: ExamClassAssignment Migration

### Same Pattern

1. Add data population script
2. Expand `sectionId = null` records to all sections of the class
3. Validate
4. Make required

### Population Script

```typescript
async function migrateExamClassAssignmentSections() {
  const assignments = await prisma.examClassAssignment.findMany({
    where: { sectionId: null }
  });

  for (const assignment of assignments) {
    const sections = await prisma.section.findMany({
      where: { classId: assignment.classId, isActive: true }
    });

    for (const section of sections) {
      await prisma.examClassAssignment.upsert({
        where: {
          examId_classId_sectionId: {
            examId: assignment.examId,
            classId: assignment.classId,
            sectionId: section.id
          }
        },
        create: {
          examId: assignment.examId,
          classId: assignment.classId,
          sectionId: section.id
        },
        update: {}
      });
    }

    // Delete old null-section record
    await prisma.examClassAssignment.delete({ where: { id: assignment.id } });
  }
}
```

---

## 8. ROLLBACK STRATEGY

### If Phase 1 Fails (schema migration)

```bash
npx prisma migrate rollback
```

### If Phase 2 Fails (data population)

```sql
-- Delete all new records (with sectionId)
DELETE FROM "TeacherSubject" WHERE "sectionId" IS NOT NULL;

-- Re-add original records that were deleted
-- (Requires keeping backup of original records)
```

### If Phase 3 Fails (code deployment)

```bash
# Revert to previous code deployment
git revert HEAD
# Database still has sectionId (nullable) — old code ignores it safely
```

### Full Rollback

```bash
# Restore from backup
pg_restore --clean --if-exists backup_before_section_migration.dump
# Revert code
git revert HEAD~n  # n = number of commits
```

---

## 9. ZERO-DOWNTIME MIGRATION PLAN

### Order of Operations

```
1. Deploy Phase 1 (add column) → No downtime, backward compatible
2. Run Phase 2 (populate data) → Background script, no downtime
3. Validate Phase 2 results → Automated checks
4. Deploy Phase 3 (new code) → Standard deployment, brief restart
5. Monitor for errors → 24 hours
6. Deploy Phase 4 (make required) → Brief migration, ~5 seconds
7. Deploy Phase 5 (ExamClassAssignment) → Same pattern
8. Deploy Phase 6 (cleanup) → Standard deployment
```

### Estimated Timeline

| Phase | Duration | Risk |
|-------|----------|------|
| Phase 0: Preparation | 1 day | Low |
| Phase 1: Add nullable column | 5 minutes | Low |
| Phase 2: Data population | 30 minutes | Medium |
| Phase 3: Code deployment | 1 day coding + deploy | High |
| Phase 4: Make required | 5 minutes | Low |
| Phase 5: ExamClassAssignment | 30 minutes | Medium |
| Phase 6: Cleanup | 2 hours | Low |

---

## 10. POST-MIGRATION VALIDATION

### Automated Checks

```sql
-- 1. No null sectionIds
SELECT COUNT(*) FROM "TeacherSubject" WHERE "sectionId" IS NULL;  -- Must be 0
SELECT COUNT(*) FROM "ExamClassAssignment" WHERE "sectionId" IS NULL;  -- Must be 0

-- 2. All timetable entries have matching TeacherSubject
SELECT te.id
FROM "TimetableEntry" te
LEFT JOIN "TeacherSubject" ts ON 
  ts."teacherId" = te."teacherProfileId"
  AND ts."subjectId" = te."subjectId"
  AND ts."classId" = te."classId"
  AND ts."sectionId" = te."sectionId"
WHERE ts.id IS NULL AND te."isActive" = true;
-- Should be 0 (any non-zero indicates gaps)

-- 3. All diary entries have corresponding TeacherSubject
SELECT de.id
FROM "DiaryEntry" de
LEFT JOIN "TeacherSubject" ts ON 
  ts."teacherId" = de."teacherProfileId"
  AND ts."subjectId" = de."subjectId"
  AND ts."classId" = de."classId"
  AND ts."sectionId" = de."sectionId"
WHERE ts.id IS NULL AND de."deletedAt" IS NULL;
-- Shows orphaned diary entries (historical data OK, new entries should match)

-- 4. Record count sanity check
SELECT 
  'TeacherSubject' as model,
  COUNT(*) as count
FROM "TeacherSubject"
UNION ALL
SELECT 
  'ExamClassAssignment',
  COUNT(*)
FROM "ExamClassAssignment";
```

### Manual Verification

1. Admin logs in → TeacherSubject assigner shows sections
2. Teacher logs in → Can only create diary for assigned sections
3. Student logs in → Only sees exams for their specific section
4. Family logs in → Only sees their child's section data
5. Principal analytics → Still shows system-wide data correctly
