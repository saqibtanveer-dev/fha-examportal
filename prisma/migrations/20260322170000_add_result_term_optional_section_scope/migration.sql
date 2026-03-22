-- Add optional section scope to result terms.
ALTER TABLE "ResultTerm"
ADD COLUMN "sectionId" TEXT;

-- Replace class-level uniqueness with scope-aware uniqueness.
DROP INDEX IF EXISTS "ResultTerm_name_academicSessionId_classId_key";
CREATE UNIQUE INDEX "ResultTerm_name_academicSessionId_classId_sectionId_key"
ON "ResultTerm"("name", "academicSessionId", "classId", "sectionId");

-- Add supporting indexes for scoped lookups.
CREATE INDEX "ResultTerm_sectionId_idx" ON "ResultTerm"("sectionId");
CREATE INDEX "ResultTerm_classId_sectionId_idx" ON "ResultTerm"("classId", "sectionId");

-- Enforce section referential integrity.
ALTER TABLE "ResultTerm"
ADD CONSTRAINT "ResultTerm_sectionId_fkey"
FOREIGN KEY ("sectionId") REFERENCES "Section"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
