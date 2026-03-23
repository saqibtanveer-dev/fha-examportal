# Runbook, Validation, and Rollout

## Pre-Run Checklist
- Workbook placed in project root or configured input directory
- Environment verified (DATABASE_URL, DIRECT_URL, runtime mode)
- Backup snapshot available
- Migration operator and approver assigned
- Dry-run completed and approved

## Step-by-Step Runbook

### Step 1: Profile workbook
- Generate workbook profile report
- Confirm sheet/column assumptions
- Freeze mapping version

### Step 2: Dry-run
- Run full transform without writes
- Produce:
  - mapping coverage report
  - validation errors report
  - quarantine preview report
- Get sign-off

### Step 3: Stage ingest
- Load raw rows with source hashes
- Validate row counts per sheet

### Step 4: Apply migration in phases
Order:
1. master references
2. user/profile entities
3. relations
4. transactional history (fees/payments/etc.)

### Step 5: Reconcile
- Entity counts compare
- Financial totals compare
- random sampled record verification by admin

### Step 6: Delta + cutover
- Import latest changed rows since initial extract
- Reconcile again
- Open system for regular operations

## Validation Matrix

### Structural
- required fields non-null
- enum values valid
- foreign keys resolvable

### Business
- one student belongs to valid class/section
- family links valid and non-duplicate
- fee balances do not violate arithmetic rules

### Financial
- assignment totals = line-item sums
- payment sums align with balances
- credits/discounts auditable

## Reliability Controls
- Retry policy only for transient db/network failures
- Max retry count bounded
- Failed rows quarantined, not dropped silently
- Resume support using run checkpoint

## Production Rollout Strategy
- Pilot with one class or one session subset
- Observe metrics 24 to 48 hours
- Expand to all classes in controlled batches
- Keep rollback decision window open until final sign-off

## What to monitor during migration
- DB latency and error rate
- transaction timeout/error codes
- quarantine growth trend
- duplicate conflict frequency

## Post-Migration Hardening
- Lock mapping version used in production
- Archive raw source and reports with runId
- Write final migration closure report
- Document known exceptions and manual corrections

## Deliverables expected from implementation
- workbook-profile.json or .md
- mapping-matrix.md
- dry-run-report.md
- apply-run-report.md
- reconciliation-report.md
- quarantine-report.csv

## Immediate Next Action for you
Workbook profile complete ho chuka hai. Ab approval required hai for row-splitting strategy:
1. Family row ko child rows me auto-split karna hai ya manual approval queue rakhni hai
2. Financial allocation policy choose karein: equal split, fixed per child, ya manual allocation
3. Class/section token dictionary approve karein (example G-07, Boys/Girls)
