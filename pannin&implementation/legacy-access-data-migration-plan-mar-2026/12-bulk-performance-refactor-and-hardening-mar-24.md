# Bulk Performance Refactor and Hardening (Mar 24, 2026)

## Objective
Implement deep performance and reliability upgrades for both migration scripts:
- Bulk write paths for faster execution.
- Prefetch map strategy to reduce repeated DB lookups.
- Cancelled-assignment edge fix in financial continuity logic.
- End-of-run reconciliation block for production confidence.

## Scope of Code Changes
### Students/Families Importer
File:
- `scripts/import-students-families.ts`

Implemented:
1. New performance flags:
   - `--batch-size` (default 500)
   - `--concurrency` (default 20)
2. Bulk create paths:
   - `User` create via `createMany + skipDuplicates`
   - `StudentProfile` create via `createMany + skipDuplicates`
   - `FamilyProfile` create via `createMany + skipDuplicates`
   - `FamilyStudentLink` create via `createMany + skipDuplicates`
3. Chunked parallel update paths:
   - user/profile/link updates via controlled concurrency worker.
4. Prefetch maps to avoid N+1 per-row checks:
   - existing users by email
   - existing student profiles by registration
   - existing family profiles by userId
   - existing family links by composite key
5. Existing safety trim retained:
   - relationship max 100 chars
   - phone max 20 chars
6. Automated reconciliation output added:
   - studentProfilesForInput
   - familyUsersForInput
   - familyProfilesForInput
   - activeLinksForInput

### Financial Continuity Importer
File:
- `scripts/import-financial-continuity.ts`

Implemented:
1. New performance flags:
   - `--batch-size` (default 500)
   - `--concurrency` (default 20)
2. Prefetch existing assignment map once per run:
   - all target students fetched in one query for (session, month).
3. Bulk planning and write split:
   - create bucket -> `createMany` in chunks
   - merge bucket -> chunked concurrent updates
4. Cancelled-edge bug fix:
   - existing assignment lookup is now status-independent for unique-key safety.
5. Automated reconciliation output added:
   - targeted assignment aggregate (count/sums)
   - global month aggregate (count/sums)

## Runtime Validation Executed
### Students/Families Refactor Apply
Command executed:
- `cmd /c "set NODE_ENV=production && pnpm import:students-families --students .\\students_normalized.xlsx --families .\\student_record_mar_2026.xlsx --admin-email admin@admin.fhsc.edu.pk --auto-create-class-section --class-map .\\scripts\\importers\\class-map.template.json --batch-size 400 --concurrency 16 > .tmp-students-families-refactor-apply.log 2>&1"`

Result:
- Exit code: 0
- Log: `.tmp-students-families-refactor-apply.log`

Summary:
- studentsImported: 801
- studentsFailed: 0
- familiesImported: 459
- familiesFailed: 0
- linksCreated: 801
- reconciliation:
  - studentProfilesForInput: 801
  - familyUsersForInput: 459
  - familyProfilesForInput: 459
  - activeLinksForInput: 801

### Financial Continuity Refactor Apply
Command executed:
- `cmd /c "set NODE_ENV=production && pnpm import:financial-continuity --students .\\students_normalized.xlsx --families .\\student_record_mar_2026.xlsx --admin-email admin@admin.fhsc.edu.pk --generated-for-month 2026-03 --due-date 2026-03-10 --on-existing skip --batch-size 400 --concurrency 16 > .tmp-financial-continuity-refactor-apply.log 2>&1"`

Result:
- Exit code: 0
- Log: `.tmp-financial-continuity-refactor-apply.log`

Summary:
- assignmentsPlanned: 323
- assignmentsCreated: 0
- assignmentsMerged: 0
- assignmentsSkippedExisting: 323
- assignmentsFailed: 0
- reconciliation:
  - targetedStudents: 323
  - targetedAssignmentsCount: 323
  - targetedTotalAmount: 1628075
  - targetedBalanceAmount: 1628075
  - globalAssignmentsCountForMonth: 324
  - globalTotalAmountForMonth: 1635375
  - globalBalanceAmountForMonth: 1635375

## Key Production Impact
1. DB round-trips reduced significantly through createMany + prefetch maps.
2. Update load controlled via bounded concurrency.
3. Unique-constraint safety improved for cancelled-assignment edge case.
4. Reconciliation now first-class output, improving auditability and rollout confidence.

## Remaining Data Issue (Business Data)
- Family `F421` still has no linked student and therefore balance 2500 remains intentionally skipped.
- This is a source-data linkage issue, not importer logic failure.
