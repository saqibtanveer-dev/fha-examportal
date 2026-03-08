-- Add sectionId to PeriodSlot (nullable = global/class-level)
ALTER TABLE "PeriodSlot" ADD COLUMN "sectionId" TEXT;

-- Foreign key to Section
ALTER TABLE "PeriodSlot" ADD CONSTRAINT "PeriodSlot_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old unique constraint (sortOrder, classId)
ALTER TABLE "PeriodSlot" DROP CONSTRAINT IF EXISTS "PeriodSlot_sortOrder_classId_key";

-- New 3-tier unique constraint: (sortOrder, classId, sectionId)
CREATE UNIQUE INDEX "PeriodSlot_sortOrder_classId_sectionId_key"
  ON "PeriodSlot"("sortOrder", "classId", "sectionId");

-- Index for section-level queries
CREATE INDEX "PeriodSlot_sectionId_idx" ON "PeriodSlot"("sectionId");
