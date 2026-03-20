# Rollout and Validation Checklist

## Pre-deploy
1. Rotate secrets and verify deployment env values.
2. Run schema migration for new job tables.
3. Run type-check and tests.
4. Verify feature flags default behavior.

## Functional validation
1. Spreadsheet Save All with small payload follows sync path.
2. Spreadsheet Save All with large payload follows async path.
3. Excel import with large payload enqueues job.
4. Progress UI updates from QUEUED to COMPLETED.
5. Import failure shows precise error details.

## Reliability validation
1. Kill request during async run and verify resume works.
2. Submit duplicate requests and verify idempotency behavior.
3. Simulate temporary DB failure and verify retry/backoff.
4. Verify reconciliation summary after completion.

## Production guardrails
1. Alert if job failure ratio crosses threshold.
2. Alert if processing latency exceeds SLA.
3. Alert if reconciliation mismatch is non-zero.
4. Daily report for failed/partial jobs.

## Rollout sequence
1. Enable for one class.
2. Expand to selected teachers.
3. Expand to all written exams.
4. Keep rollback switch during initial week.

## Success KPIs
1. Timeout incidents reduced to near zero.
2. No silent import/save success without persisted records.
3. Teacher support tickets for marks-save failures reduced significantly.
