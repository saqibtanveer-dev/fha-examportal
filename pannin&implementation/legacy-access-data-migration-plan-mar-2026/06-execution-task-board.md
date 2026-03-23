# Migration Execution Task Board (Day-wise, Owner-wise)

## Objective
Legacy family-aggregated workbook ko production-safe tareeqay se portal me migrate karna with high stability, high reliability, and zero hidden data loss.

## Team Roles
- Migration Lead (tech owner)
- Data Steward (school/admin owner)
- Backend Engineer (pipeline implementation)
- QA Engineer (validation/reconciliation)
- Approver Panel (tech + admin dual sign-off)

## Working Rules
- No direct write to live core tables from raw file
- Every phase has go/no-go gate
- Every run has runId + audit trail
- Ambiguous rows never auto-force; quarantine first
- File modularity rule: each implementation file <= 300 LOC

## 10-Day Execution Plan

### Day 1 - Kickoff and freeze
Owner: Migration Lead + Data Steward
- Confirm workbook version and checksum
- Freeze migration scope (what is in, what is out)
- Finalize dictionary owners for class/section/name normalization
- Approve financial allocation policy draft options
Deliverables:
- scope-freeze.md
- assumptions-register.md
Go/No-Go:
- No-Go if scope unresolved

### Day 2 - Mapping freeze workshop
Owner: Migration Lead + Backend Engineer + Data Steward
- Finalize source-to-target mapping matrix
- Define required fields and error codes
- Define confidence score formula for child splitting
Deliverables:
- mapping-matrix-v1.md
- confidence-rules-v1.md
Go/No-Go:
- No-Go if key identity rules not agreed

### Day 3 - Staging schema and raw ingest
Owner: Backend Engineer
- Implement staging model/store with source hash
- Build ingest command (read workbook, stage rows)
- Add run metadata and row-level provenance
Deliverables:
- staging-ingest implementation
- ingest-run-report.md
Acceptance:
- 100% rows staged
- no crash on malformed row

### Day 4 - Normalization and splitting
Owner: Backend Engineer + Data Steward
- Implement phone/name/class normalization
- Implement family row to child candidate splitting
- Mark confidence levels (high/medium/low)
Deliverables:
- normalized-preview-report.md
- split-candidate-report.csv
Acceptance:
- deterministic output on re-run

### Day 5 - Quarantine and review queue
Owner: Data Steward + QA Engineer
- Send low/medium confidence rows to quarantine
- Build manual correction template
- Approve corrected set for pilot
Deliverables:
- quarantine-report-v1.csv
- correction-template.csv
Acceptance:
- unresolved critical rows clearly separated

### Day 6 - Pilot apply (safe subset)
Owner: Backend Engineer + QA Engineer
- Apply approved subset to target entities:
  - FamilyProfile
  - StudentProfile (approved only)
  - FamilyStudentLink
- Keep financial posting in controlled mode
Deliverables:
- apply-run-pilot-report.md
Acceptance:
- no referential integrity failure
- no duplicate key violations beyond expected quarantines

### Day 7 - Financial migration pilot
Owner: Backend Engineer + Data Steward
- Run selected allocation policy on pilot
- Post fee snapshots/payments according to approved rules
- Validate arithmetic consistency
Deliverables:
- financial-pilot-reconciliation.md
Acceptance:
- opening balance math passes
- mismatch threshold within approved limit

### Day 8 - Full dry-run and load test
Owner: QA Engineer + Migration Lead
- Full dataset dry-run end-to-end
- Check retry/resume/idempotency behavior
- Simulate transient DB/network failures
Deliverables:
- full-dry-run-report.md
- reliability-test-report.md
Acceptance:
- idempotent re-run verified
- timeout/retry behavior acceptable

### Day 9 - Full apply and reconciliation
Owner: Migration Lead + Backend Engineer + QA Engineer
- Execute full apply in controlled batches
- Run count + financial + relation reconciliation
- Generate exception list
Deliverables:
- full-apply-run-report.md
- reconciliation-final-v1.md
Acceptance:
- critical mismatch = 0
- unresolved exceptions documented

### Day 10 - Cutover closure and hypercare
Owner: Migration Lead + Approver Panel
- Dual sign-off (tech + admin)
- Enable operational runbook
- Start hypercare monitoring window (48-72h)
Deliverables:
- migration-closure-report.md
- hypercare-checklist.md
Acceptance:
- system stable
- no severe incident in hypercare window

## Daily Standup Template
- Yesterday done
- Today target
- blockers
- risk level (low/medium/high)
- gate status (green/amber/red)

## Gate Checklist (must pass)

### Gate A - Before pilot apply
- mapping frozen
- quarantine process ready
- audit trail enabled

### Gate B - Before full apply
- pilot successful
- financial reconciliation acceptable
- rollback/forward-fix playbook ready

### Gate C - Before closure
- final reconciliation approved
- exceptions accepted by admin
- operational ownership transferred

## Owner-wise Responsibility Matrix (RACI lite)
- Migration Lead: decision, sequencing, gate sign-off
- Backend Engineer: implementation, run execution, fixes
- Data Steward: business validation, manual correction, policy approval
- QA Engineer: verification, testing, mismatch analysis
- Approver Panel: final go/no-go and closure approval

## KPI Dashboard
- staged rows count
- approved rows count
- quarantined rows count
- auto-matched ratio
- reconciliation mismatch count
- batch failure/retry count
- p95 batch runtime

## Immediate Decisions Required (to start Day 1)
1. Child split mode:
- Conservative (recommended): medium + low -> quarantine
- Aggressive: medium auto-approve with post-check
2. Financial allocation mode:
- Manual (recommended for first full run)
- Equal split
- Fixed per child
3. Acceptance threshold:
- critical mismatch must be 0
- non-critical mismatch threshold percentage
