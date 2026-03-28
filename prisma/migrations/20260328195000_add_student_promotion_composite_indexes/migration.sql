-- Speed up processed lookup during year transition execution.
CREATE INDEX IF NOT EXISTS "StudentPromotion_academicSessionId_studentProfileId_idx"
ON "StudentPromotion" ("academicSessionId", "studentProfileId");

-- Speed up session history listing ordered by promotion time.
CREATE INDEX IF NOT EXISTS "StudentPromotion_academicSessionId_promotedAt_idx"
ON "StudentPromotion" ("academicSessionId", "promotedAt");
