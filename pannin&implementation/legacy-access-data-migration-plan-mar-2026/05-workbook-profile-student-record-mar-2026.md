# Workbook Profile: Student Record Mar-2026.xlsx

## Profiling Status
- File detected in workspace root
- Parsed successfully through XLSX XML inspection
- Sheet count: 1

## Sheet Inventory

### Sheet1
- Estimated rows: 462
- Estimated columns: 30
- Header row:
  1. Family Code
  2. Name
  3. Father Name
  4. Class
  5. Elder Child Section
  6. Count
  7. Contact #
  8. FeeMar
  9. MarTot
  10. MarPaid
  11. Balance
  12. Months
  13. Remaining Months Total
  14. Total Due
  15. Per Month
  16. PER MONTH
  17. Word
  18. After Due Date
  19. AprPaid
  20. MayPaid
  21. JunPaid
  22. JulPaid
  23. AugPaid
  24. SepPaid
  25. OctPaid
  26. NovPaid
  27. DecPaid
  28. JanPaid
  29. FebPaid
  30. Mar

## Sample Data Signals (first rows)
- Family-level records present (example Family Code: F001, F002)
- Multi-student names combined in one cell (comma-separated)
- Multi-class values combined in one cell (example G-09,G-07,G-04,G-02)
- Contact numbers include spaces and mixed formatting
- Financial fields appear as pre-aggregated family totals
- Monthly payment columns available Apr..Mar

## Critical Migration Insight
This workbook student master table nahi lagti; yeh primarily family-level fee ledger snapshot jaisa lag raha hai.

Iska matlab:
- 1 row != 1 student
- 1 row may represent multiple students
- Class mapping may be many-to-many inside a single row
- Accurate StudentProfile creation direct sheet se deterministic nahi hoga jab tak child-level breakup rule define na ho

## Risk Classification
- High risk: Student identity reconstruction from combined Name cell
- High risk: Class/section exact mapping from aggregated text
- Medium risk: Monthly payment allocation per child
- Medium risk: Duplicate family phone across multiple families
- Low risk: Family-level fee balance snapshot import

## Recommended Import Scope for this workbook

### Phase A (safe, deterministic)
- FamilyProfile candidates create/update
- Family contact normalization
- Family-level financial snapshot staging (not direct final posting)

### Phase B (conditional, after rule approval)
- Split child names into candidate students with confidence score
- Map class tokens to existing Class entities via dictionary
- Put unresolved children into quarantine for manual review

### Phase C (only after manual reconciliation)
- Create StudentProfile records from approved split rows
- Create FamilyStudentLink with review provenance
- Post fee assignments/payments using approved allocation policy

## Proposed Allocation Policies (must choose one)
1. Equal split policy: family totals equally divide among children
2. Per-month per-child fixed policy: use Per Month and child count
3. Manual allocation policy: stage only, no automatic allocation

Recommendation: Start with policy 3 for first run to avoid financial mis-posting.

## Immediate Technical Actions
1. Add class token dictionary (example G-07 -> Class 7)
2. Add section dictionary (Boys/Girls/null handling)
3. Add child-name splitter with trim and dedupe rules
4. Add confidence scoring:
   - high: exact class token + unique child token
   - medium: class token only
   - low: ambiguous multi-name row
5. Keep low-confidence rows in quarantine CSV

## Governance Requirement
Financial data import should require dual sign-off:
- technical approver (data integrity)
- admin approver (school business correctness)

## Conclusion
Workbook valuable hai, lekin yeh direct normalized student import source nahi hai. Isko family-finance-first staging source treat karna production-safe aur future-proof approach hoga.
