-- Add SchoolSettings report branding and pass-threshold columns used by reports and consolidation.
-- This migration is idempotent for safer deploys across partially-updated environments.

ALTER TABLE "SchoolSettings"
ADD COLUMN IF NOT EXISTS "reportHeaderText" TEXT,
ADD COLUMN IF NOT EXISTS "principalName" TEXT,
ADD COLUMN IF NOT EXISTS "examControllerName" TEXT,
ADD COLUMN IF NOT EXISTS "reportFooterText" TEXT,
ADD COLUMN IF NOT EXISTS "signatureImageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "passingPercentage" DECIMAL(65,30) NOT NULL DEFAULT 33;
