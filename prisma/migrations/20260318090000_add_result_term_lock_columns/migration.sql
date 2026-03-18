-- Add missing consolidation lock columns for ResultTerm.
-- These fields exist in schema.prisma and are used in report workflows,
-- but were never added to migration history.

ALTER TABLE "ResultTerm"
ADD COLUMN IF NOT EXISTS "lockOwner" TEXT,
ADD COLUMN IF NOT EXISTS "lockAcquiredAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "lockExpiresAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "ResultTerm_isComputing_lockExpiresAt_idx"
ON "ResultTerm"("isComputing", "lockExpiresAt");
