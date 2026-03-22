-- Add fee discount source classification for transparency in ledgers and receipts.
-- This migration is idempotent for safer deploys.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'FeeDiscountSource'
  ) THEN
    CREATE TYPE "FeeDiscountSource" AS ENUM ('RECURRING_STUDENT', 'ON_SPOT_ADMIN', 'FAMILY_ADJUSTMENT');
  END IF;
END $$;

ALTER TABLE "FeeDiscount"
ADD COLUMN IF NOT EXISTS "source" "FeeDiscountSource" NOT NULL DEFAULT 'ON_SPOT_ADMIN';

-- Backfill known recurring auto-applied entries.
UPDATE "FeeDiscount"
SET "source" = 'RECURRING_STUDENT'
WHERE "source" = 'ON_SPOT_ADMIN'
  AND "reason" ILIKE 'Permanent student discount%';
