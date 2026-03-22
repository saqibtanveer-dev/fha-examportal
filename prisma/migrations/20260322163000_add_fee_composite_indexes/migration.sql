-- Add composite indexes for fee and family ledger performance at scale.
-- Idempotent to avoid failures in partially updated environments.

CREATE INDEX IF NOT EXISTS "FeeAssignment_status_dueDate_idx"
ON "FeeAssignment"("status", "dueDate");

CREATE INDEX IF NOT EXISTS "FeeAssignment_studentProfileId_status_idx"
ON "FeeAssignment"("studentProfileId", "status");

CREATE INDEX IF NOT EXISTS "FeePayment_familyPaymentId_status_idx"
ON "FeePayment"("familyPaymentId", "status");

CREATE INDEX IF NOT EXISTS "FeePayment_status_paidAt_idx"
ON "FeePayment"("status", "paidAt");

CREATE INDEX IF NOT EXISTS "FamilyPayment_familyProfileId_paidAt_idx"
ON "FamilyPayment"("familyProfileId", "paidAt");

CREATE INDEX IF NOT EXISTS "FamilyPayment_status_paidAt_idx"
ON "FamilyPayment"("status", "paidAt");
