# Financial Continuity Runbook (Balance Split)

## Objective
Migrate old family pending balances from `Balance` column into student-wise pending records in the new fee system.

Policy implemented:
- Family `Balance` is split equally among linked children.
- Split is done in paisa/cents to avoid rounding drift.
- Any remainder goes to the last child (deterministic rule).

## Script
`pnpm import:financial-continuity`

Source file:
- `scripts/import-financial-continuity.ts`

## Required Inputs
- `--students <students.xlsx>`
- `--families <families.xlsx>`
- `--admin-email <admin@school.com>`
- `--generated-for-month <YYYY-MM>`
- `--due-date <YYYY-MM-DD>`

Optional:
- `--academic-session-id <id>` (if not passed, current session is used)
- `--students-sheet <name>`
- `--families-sheet <name>`
- `--on-existing skip|merge|fail` (default: `skip`)
- `--dry-run`

## Execution Order (critical)
1. First run student/family importer in apply mode (not dry-run).
2. Then run financial continuity script.

Reason:
- Financial continuity requires `StudentProfile` IDs in DB.
- If students are not yet inserted, balances cannot be mapped to assignments.

Dry-run exception:
- Dry-run can still show family balance split preview using registration-based virtual targets.
- Apply mode still requires real `StudentProfile` records.

## Dry-Run Example
`pnpm import:financial-continuity --students ./students_normalized.xlsx --families ./student_record_mar_2026.xlsx --admin-email admin@faithhorizon.school --generated-for-month 2026-03 --due-date 2026-03-10 --dry-run`

## Apply Example
`pnpm import:financial-continuity --students ./students_normalized.xlsx --families ./student_record_mar_2026.xlsx --admin-email admin@faithhorizon.school --generated-for-month 2026-03 --due-date 2026-03-10 --on-existing skip`

## What Gets Created
- Student-level `FeeAssignment` rows with:
  - `totalAmount = child share`
  - `paidAmount = 0`
  - `balanceAmount = child share`
  - `status = PENDING`

## Safety Notes
- `dry-run` validates mapping and planned allocation without DB writes.
- `on-existing` behavior:
  - `skip`: keep old assignment untouched
  - `merge`: increment existing assignment totals/balance
  - `fail`: stop run on first existing assignment

## Known Limitation
- This script migrates pending balance continuity only.
- It does not migrate detailed historical payment ledger lines.