# Implementation Architecture and Phases

## Architecture Pattern
Use layered migration design:
- extract layer: workbook readers
- profile layer: schema/data profiler
- transform layer: mappers + normalizers + validators
- load layer: chunked transactional writers
- verify layer: reconciliation and audit reports

## Suggested Folder Layout
- src/modules/migration/core/
- src/modules/migration/profiling/
- src/modules/migration/mappers/
- src/modules/migration/validators/
- src/modules/migration/loaders/
- src/modules/migration/reports/
- src/modules/migration/cli/

Rule: each file <= 300 LOC, high cohesion, low coupling.

## Reuse from Existing Patterns
- safe action style error sanitization concepts
- prisma transaction patterns
- chunked batch upsert style from existing exam utilities
- audit log event emission style

## Execution Modes
- Mode A: dry-run (no writes, full report)
- Mode B: stage-only (populate staging)
- Mode C: apply (write to production entities)
- Mode D: reconcile-only (post-load verification)

## Phase Plan

### Phase 0 - Discovery and controls
- Put workbook in workspace and run profiler
- Approve mapping dictionary
- Freeze import window and owner responsibilities

### Phase 1 - Staging pipeline
- Build parser and staging schema/table or JSON repository
- Persist raw rows with source hash
- Emit per-sheet quality report

### Phase 2 - Master data load
- Load AcademicSession, Class, Section, Department, Subject anchors first
- Load User and profile entities next
- Load relations (TeacherSubject, Family links, enrollments)

### Phase 3 - Transactional/history load
- Fees and payments with strict month/session linking
- Attendance/history data (if available in workbook)
- Promotions and prior-year state

### Phase 4 - Validation and reconciliation
- Count validation (source vs target)
- Financial sum validation (source amount totals vs target totals)
- Referential integrity validation
- Duplicate and quarantine closure

### Phase 5 - Controlled cutover
- Delta import for latest changed rows
- Final reconcile
- Sign-off and rollback window closure

## Transaction and Batching Design
- Chunk size default 200 (configurable)
- One transaction per chunk
- Retry only transient failures
- Permanent validation failure -> quarantine, continue pipeline

## Observability
Per run capture:
- runId
- start/end time
- sheet-level counts
- inserted/updated/skipped/quarantined counts
- failure taxonomy
- latency per stage and per batch

## Performance Targets
- 1k students baseline import should complete in practical operational window
- No single transaction should exceed safe timeout budget
- p95 batch latency threshold defined before prod run

## Security Controls
- PII masking in logs/reports
- role-restricted execution command
- mandatory audit trail for run start/stop and approvals

## Rollback Strategy
- Prefer forward-fix with idempotent rerun
- If hard rollback needed, delete by runId markers for newly inserted staged entities only
- Never hard-delete historical production data without backup snapshot

## Disturbance Prevention
- Migration code path isolated from user-facing actions
- No forced schema breaking changes during initial migration
- Import features disabled by default in production UI
