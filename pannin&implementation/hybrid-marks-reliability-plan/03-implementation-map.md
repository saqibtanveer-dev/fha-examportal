# Implementation Map (File-level)

## Existing files likely to update

### Written exams backend
- src/modules/written-exams/written-exam-finalize-actions.ts
- src/modules/written-exams/written-exam-batch-actions.ts
- src/modules/written-exams/written-exam-result-actions.ts
- src/validations/written-exam-schemas.ts

### Written exams frontend
- src/modules/written-exams/components/spreadsheet-view.tsx
- src/modules/written-exams/components/excel-import-dialog.tsx
- src/modules/written-exams/hooks/use-excel-import.ts
- src/modules/written-exams/hooks/use-written-exam-query.ts

### Trigger workflow
- src/modules/reports/workflows/consolidation-workflow.ts (pattern reference)
- src/trigger/** (new marks workflow files)

### Shared infra
- src/lib/safe-action.ts (if response contract helpers are extended)
- src/modules/audit/** (add job and reconciliation audit events)

## New components/entities to add
1. Marks processing job model (Prisma)
2. Marks job status fetch action
3. Trigger task/workflow for async marks processing
4. Job progress UI panel component
5. Reconciliation helper for post-run validation

## Data model sketch
1. MarksProcessingJob
- id
- examId
- createdBy
- mode (SYNC/ASYNC)
- status
- totalEntries
- processedEntries
- failedEntries
- currentChunk
- totalChunks
- idempotencyKey
- lastError
- metadata
- timestamps

2. MarksProcessingJobError
- jobId
- chunkIndex
- entryRef
- reason
- timestamps

## API contract sketch
1. Submit response
- executionMode
- jobId (if async)
- acceptedEntries
- immediatePersistedEntries

2. Status response
- status
- progressPercent
- processedEntries
- failedEntries
- retryable
- latestMessage

## Acceptance criteria
1. Save All no longer times out on expected production payloads.
2. Import cannot report success when persistedEntries is zero.
3. Duplicate submissions do not duplicate grades.
4. Progress is visible and accurate.
5. Finalization blocks if exam has active marks job.
