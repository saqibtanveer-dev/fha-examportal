# Current State and Gap Analysis

## Current Project Baseline (target system)
- Platform: Next.js + Prisma + PostgreSQL (Neon adapter)
- Error strategy: safe action wrappers + sanitized Prisma error handling
- Data model maturity: high (students, teachers, family, fees, attendance, exams, promotions)
- Existing performance pattern: chunked batch upserts and transactions in critical workflows

## What is already mature enough for migration
- User identity base: User + role based profiles
- Student master data shape: StudentProfile linked to Class and Section
- Family relation model: FamilyProfile + FamilyStudentLink
- Academic continuity: AcademicSession + StudentPromotion
- Financial continuity: Fee structures, assignments, discounts, payments, credits

## Key Migration Risks
- Legacy identifiers may be inconsistent (registration, roll, names, phone format)
- Class and section naming mismatch (old labels vs current normalized entities)
- Date and numeric format drift from MS Access/Excel export
- Duplicate person records due to spelling variants
- Partial history imports creating financial/reporting integrity issues
- Large import request timeouts if done as single transaction

## Workbook Discovery Status
- Workbook now accessible at workspace root: Student Record Mar-2026.xlsx
- Initial structure profiling complete.
- Major finding: source is family-aggregated fee style sheet, not clean 1-row-per-student registry.
- Detailed profile report: 05-workbook-profile-student-record-mar-2026.md

## Workbook Profiling Checklist (must run before mapping freeze)
- Sheet inventory and row counts
- Per sheet header list + detected data type
- Required vs optional columns
- Null percentage per column
- Candidate primary keys
- Duplicate scans:
  - email
  - registrationNo
  - rollNumber per class/section
  - employeeId
  - fee receipt references
- Referential dependency clues (foreign-key like columns)

## Deep Non-Disturbance Guardrails
- Existing app actions ko touch na karein jab tak migration path validated na ho
- New migration code isolated namespace me ho:
  - src/modules/migration/
- No schema-breaking change in first phase
- Any schema additions should be additive and backward compatible only
- Feature flags or CLI-only execution to avoid accidental production trigger

## Security Baseline for Migration
- PII columns classification before import
- Passwords legacy se direct import na hon; fresh credential policy apply ho
- Secrets only env vars me
- Migration logs me sensitive values redact hon
- Audit events emit hon for every batch stage

## Performance Baseline for 1000+ Students
- Batches of deterministic size (example 200 to 500 rows)
- Per batch independent transaction
- Retry policy with idempotency key
- Resume cursor checkpointing
- Slow-path (network/db transient) retries with bounded backoff

## Go/No-Go Entry Criteria
- Workbook profile complete
- Mapping matrix approved
- Dry-run mismatch report reviewed
- Rollback strategy tested
- Cutover window and owner assigned
