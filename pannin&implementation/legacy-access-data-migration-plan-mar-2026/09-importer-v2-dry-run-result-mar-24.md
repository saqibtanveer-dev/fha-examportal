# Importer V2 Dry-Run Result (Mar 24)

## Command Used
pnpm import:students-families --students ./students_normalized.xlsx --families ./student_record_mar_2026.xlsx --admin-email admin@faithhorizon.school --dry-run

## Execution Status
- Script executed successfully (no parser crash)
- Selected sheets:
  - studentsSheet: Students_Normalized
  - familiesSheet: Sheet1

## Summary Counts
- studentsTotal: 804
- studentsImported: 136
- studentsFailed: 668
- familiesTotal: 459
- familiesImported: 459
- familiesFailed: 0
- linksCreated: 136

## What this means
- Parser and pipeline are now operational.
- Main blocker now is data/domain compatibility, not script crash.
- Most student failures are class unresolved warnings for tokens like:
  - G-07, G-03, KG-02, KG-03, etc.

## Root Cause
Current database class setup does not fully cover legacy class tokens present in old data.

## Production Readiness Verdict
- Parser stability: PASS
- Family ingest readiness: PASS (dry-run level)
- Student classwise/sectionwise accuracy: PARTIAL (needs class token mapping or missing classes setup)
- Full go-live: NO-GO until class mapping gap is resolved

## Mandatory Next Step
Choose one path:
1. Add missing class records (grade 1 to 8 and KG variants) in DB
2. Provide explicit class-token mapping dictionary (legacy token -> DB class)

Recommended: do both for long-term reliability.

## After Mapping Target
Re-run dry-run and expect:
- studentsFailed drastically reduced
- linksCreated close to expected family-student total

---

## Post-Hardening Re-Run (V3 + Class Map + Auto-Create Simulation)

### Command Used
pnpm import:students-families --students ./students_normalized.xlsx --families ./student_record_mar_2026.xlsx --admin-email admin@faithhorizon.school --dry-run --auto-create-class-section --class-map ./scripts/importers/class-map.template.json

### Execution Status
- Script executed successfully
- Selected sheets:
  - studentsSheet: Students_Normalized
  - familiesSheet: Sheet1
- Dedupe fix validated: class/section creation counters are now unique and realistic

### Summary Counts
- studentsTotal: 804
- studentsImported: 798
- studentsFailed: 6
- familiesTotal: 459
- familiesImported: 459
- familiesFailed: 0
- linksCreated: 798
- classesCreated: 11
- sectionsCreated: 11
- warnings: []

### What this means now
- Data ingestion pipeline is stable for provided files.
- Class/section mapping gap is effectively resolved under class-map + auto-create mode.
- Remaining 6 student failures are now a small, auditable exception set (not systemic).

### Updated Production Readiness Verdict
- Parser stability: PASS
- Family ingest readiness: PASS
- Student classwise/sectionwise readiness: PASS (with class-map and controlled class/section governance)
- Pilot go-live: GO (controlled rollout with dry-run + apply + reconciliation)

### Controlled Rollout Recommendation
1. Run one final dry-run without changing source files to confirm deterministic counts.
2. Execute apply in a controlled window (same inputs + same flags except --dry-run).
3. Reconcile:
   - Imported students count
   - Family profiles count
   - Family-student links count
   - New class/section creations
4. Export exception report for the 6 failed rows and resolve manually.
