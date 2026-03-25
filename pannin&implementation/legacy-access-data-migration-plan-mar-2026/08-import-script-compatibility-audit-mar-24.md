# Import Script Compatibility Audit (Mar 24)

## Scope
Audit of current importer script against provided legacy files:
- Students_Normalized_From_FamilyData.xlsx
- Student Record Mar-2026.xlsx

## Verdict
Current script is NOT production-ready for these files in current state.

## Critical Findings

1. Workbook parser compatibility failure
- Command dry-run fails before processing rows with error: Cannot read properties of undefined (reading 'sheets')
- Current reader path uses ExcelJS:
  - scripts/import-students-families.ts line 99
  - scripts/import-students-families.ts line 100
- Result: import cannot start for provided files.

2. Header contract mismatch (students)
- Script expects student headers like:
  - email, first_name, registration_no, roll_number, class, section
- Current normalized student sheet contains family-derived headers:
  - Family Code, Student Seq, Student Name, Class (raw), Section (raw), Father/Guardian Name, Contact #
- Current extractor keys are fixed at:
  - scripts/import-students-families.ts line 165
  - scripts/import-students-families.ts line 170
  - scripts/import-students-families.ts line 171
- Result: almost all rows would fail mandatory checks even if parser worked.

3. Header contract mismatch (families)
- Script expects family rows with email and linkage registration list:
  - scripts/import-students-families.ts line 249
  - scripts/import-students-families.ts line 253
- Provided family raw sheet does not provide this in expected format.
- Result: families cannot be imported and linked deterministically.

4. Class/section token mismatch risk
- Provided class tokens are raw legacy tokens like G-07, KG-02 and section values like Boys/Girls.
- Script maps class/section by exact normalized DB name keys:
  - scripts/import-students-families.ts line 157
  - scripts/import-students-families.ts line 160
- Result: high failure probability unless dictionary mapping is added.

5. Dry-run still requires admin user and DB lookup
- Script enforces admin user lookup before processing:
  - scripts/import-students-families.ts line 151
  - scripts/import-students-families.ts line 152
- Result: dry-run may fail in environments where admin record is absent, reducing preflight utility.

## Data Quality Signals from normalized workbook
- File includes quality warning sheet: Issues_To_Review
- Example warnings include:
  - Count mismatch
  - Names/classes length mismatch
- This confirms unresolved ambiguity in source data and supports a quarantine-first approach.

## Risk Level
- Production risk: HIGH
- Data correctness risk: HIGH
- Automated classwise/sectionwise linking confidence: LOW without mapping dictionary
- Family-student linkage confidence: MEDIUM/LOW without explicit registration-based joins

## Recommended Fix Sequence
1. Replace ExcelJS reader with robust fallback parser path for these workbook variants
2. Add configurable header alias map per sheet
3. Add class/section dictionary mapping table (raw token -> DB class/section)
4. Add preflight report mode that does not require admin lookup
5. Add strict quarantine output for ambiguous rows
6. Add pilot import gate (subset first, then full run)

## Go / No-Go
- NO-GO for full production import with current script and current files.
- GO for staged pilot only after above fixes and a dry-run reconciliation report.
