# Apply Execution and Reconciliation Report (Mar 24, 2026)

## Scope
This report records the production-style apply execution for:
1. Student and family identity/link import.
2. Financial continuity import from legacy family balances.

Goal: complete migration without breaking existing modules and produce verifiable reconciliation metrics.

## Pre-Apply Stability Fix
Issue observed during apply:
- `FamilyProfile.upsert` failed with DB value-length overflow.

Fix applied in importer:
- Added defensive text clamp in `scripts/import-students-families.ts`.
- `relationship` trimmed to max 100 chars.
- family phone (used as `User.phone` and `FamilyProfile.emergencyPhone`) trimmed to max 20 chars.
- Warning emitted when trimming occurs.

Why this fix is safe:
- Prevents transaction failure on dirty legacy values.
- Keeps import deterministic.
- Preserves most of input while respecting schema constraints.

## Apply Commands Executed
### 1) Students/Families Apply
Command:

```bash
cmd /c "set NODE_ENV=production && pnpm import:students-families --students .\\students_normalized.xlsx --families .\\student_record_mar_2026.xlsx --admin-email admin@admin.fhsc.edu.pk --auto-create-class-section --class-map .\\scripts\\importers\\class-map.template.json > .tmp-students-families-apply-cmd.log 2>&1"
```

Result:
- Exit code: 0
- Source log: `.tmp-students-families-apply-cmd.log`

Final summary captured from log:

```json
{
  "dryRun": false,
  "studentsSheet": "Students_Normalized",
  "familiesSheet": "Sheet1",
  "autoCreateClassSection": true,
  "studentsTotal": 801,
  "studentsImported": 801,
  "studentsFailed": 0,
  "familiesTotal": 459,
  "familiesImported": 459,
  "familiesFailed": 0,
  "linksCreated": 801,
  "classesCreated": 0,
  "sectionsCreated": 0,
  "warnings": [
    "Family row 205: emergency phone trimmed to 20 chars"
  ]
}
```

### 2) Financial Continuity Apply
Command:

```bash
cmd /c "set NODE_ENV=production && pnpm import:financial-continuity --students .\\students_normalized.xlsx --families .\\student_record_mar_2026.xlsx --admin-email admin@admin.fhsc.edu.pk --generated-for-month 2026-03 --due-date 2026-03-10 --on-existing skip > .tmp-financial-continuity-apply.log 2>&1"
```

Result:
- Exit code: 0
- Source log: `.tmp-financial-continuity-apply.log`

Final summary captured from log:

```json
{
  "dryRun": false,
  "generatedForMonth": "2026-03",
  "dueDate": "2026-03-10",
  "academicSessionId": "cf32ee38-2ea7-49c1-93bc-df70b0402897",
  "studentsSheet": "Students_Normalized",
  "familiesSheet": "Sheet1",
  "familiesTotal": 459,
  "familiesWithBalance": 181,
  "familiesSkippedNoChildren": 1,
  "familiesUsingRegistrationTargets": 0,
  "assignmentsPlanned": 323,
  "assignmentsCreated": 323,
  "assignmentsMerged": 0,
  "assignmentsSkippedExisting": 0,
  "assignmentsFailed": 0,
  "totalBalanceRead": 1630575,
  "totalAllocated": 1628075,
  "warnings": [
    "Family F421: balance 2500 skipped (no linked students found)"
  ]
}
```

## Reconciliation Snapshot
### Student/Family identity layer
- 801/801 students imported.
- 459/459 families imported.
- 801 family-student links created.
- No failed rows.

### Financial continuity layer
- 181 families had legacy pending balances.
- 323 student-level fee assignments created for month `2026-03`.
- 0 assignment failures.
- 0 existing assignment collisions (on-existing=skip path did not need to skip).
- `totalBalanceRead - totalAllocated = 2,500`.
- Entire difference is explained by single skipped family `F421` with no linked students.

## Operational Notes
- Using `NODE_ENV=production` in command wrapper reduced noisy query logging and helped run stability.
- Admin identity used for apply runs: `admin@admin.fhsc.edu.pk`.
- Dry-run virtual target behavior remains useful for preview, but apply mode correctly requires real `StudentProfile` links.

## Residual Item (Known Gap)
- Family `F421` is not linked to any student profile.
- Pending amount `2,500` is intentionally not posted to avoid orphan fee assignments.

Recommended targeted closure:
1. Resolve/link `F421` to correct student registration(s).
2. Re-run financial continuity in targeted mode for only that family (or run full command once with idempotent safeguards if desired).
3. Verify added assignment amount equals 2,500 for the same month/session.

## Final Status
- Migration apply execution: completed.
- Financial continuity: completed.
- Data integrity: no failed writes in final apply runs.
- Remaining manual action: one family linkage correction (`F421`).
