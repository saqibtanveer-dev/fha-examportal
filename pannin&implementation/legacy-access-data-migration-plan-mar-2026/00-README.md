# Legacy Access Data Migration Plan (Mar 2026)

## Purpose
Ye plan old MS Access based system se data ko current portal me production-grade tareeqay se migrate karne ke liye hai, bina existing modules disturb kiye.

## Strategic Goals
- Maintainability high rakhna (modular pipeline, reusable validators, clear ownership)
- Scalability ensure karna (1,000+ students, repeatable imports, chunked jobs)
- Reliability and stability 9/10+ target
- Security and auditability production level par maintain karna
- Zero silent data loss, zero blind overwrite

## Important Reality Check
Legacy workbook file "Student Record Mar-2026.xlsx" detect ho chuki hai aur initial profiling complete hai.
Detailed report dekhein: 05-workbook-profile-student-record-mar-2026.md

## Existing System Strengths (already done on your side)
- Rich Prisma schema with strong domains:
  - Student, class/section, family linking, attendance, fee, promotion, result terms
- Multiple migrations already present for major school workflows
- Safe server action wrappers for error sanitization and Prisma error handling
- Transaction usage and batch upsert patterns (including raw SQL upserts for performance)
- Audit log pattern already used in modules
- Build pipeline me migration deploy included (good production discipline)

## Plan Documents
- 01-current-state-and-gap-analysis.md
- 02-source-to-target-mapping-and-rules.md
- 03-implementation-architecture-and-phases.md
- 04-runbook-validation-and-rollout.md
- 05-workbook-profile-student-record-mar-2026.md
- 06-execution-task-board.md
- 07-two-file-import-format-and-command.md
- 08-import-script-compatibility-audit-mar-24.md
- 09-importer-v2-dry-run-result-mar-24.md

## Scope Boundaries
- Is migration se existing runtime user flows break nahi hone chahiye
- Existing module contracts ko change nahi karna
- Migration ko isolated scripts/actions + staging tables + dry-run reports me rakhna
- Har new file under 300 LOC rule follow kare

## Success Criteria
- Referential integrity errors: 0
- Duplicate identity collision (after final rules): 0 unresolved
- Migration run resumable ho
- Re-run idempotent ho
- Cutover ke baad reconciliation mismatch = 0 critical, <= agreed non-critical threshold
