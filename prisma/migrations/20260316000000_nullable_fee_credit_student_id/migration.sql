-- AlterTable: make FeeCredit.studentProfileId nullable
-- Allows family-pool credits (studentProfileId = NULL, familyProfileId = X)
-- which are shared across all children in a family.
-- Existing records with studentProfileId set are unaffected.
ALTER TABLE "FeeCredit" ALTER COLUMN "studentProfileId" DROP NOT NULL;
