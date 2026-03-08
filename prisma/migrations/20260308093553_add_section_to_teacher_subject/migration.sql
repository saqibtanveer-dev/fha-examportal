/*
  Migration: Add sectionId to TeacherSubject (REQUIRED) + Make ExamClassAssignment.sectionId required
  
  Strategy:
  1. Add sectionId as NULLABLE to TeacherSubject
  2. Populate from TimetableEntry where teacher-subject-class-section data exists
  3. For orphaned records, expand to ALL active sections of the class
  4. Make sectionId NOT NULL
  5. Fix ExamClassAssignment: populate null sectionIds, then make required
  6. Add all new indexes and constraints
*/

-- ============================================
-- PHASE 1: TeacherSubject — Add nullable sectionId
-- ============================================

-- Drop old constraint first
DROP INDEX IF EXISTS "TeacherSubject_teacherId_subjectId_classId_key";

ALTER TABLE "TeacherSubject" ADD COLUMN "sectionId" TEXT;

-- ============================================
-- PHASE 2: Populate sectionId from TimetableEntry
-- ============================================

-- For each TeacherSubject, find matching TimetableEntry with section info
UPDATE "TeacherSubject" ts
SET "sectionId" = sub.section_id
FROM (
  SELECT DISTINCT ON (te."teacherProfileId", ts2."subjectId", te."classId", te."sectionId")
    ts2."id" AS ts_id,
    te."sectionId" AS section_id
  FROM "TeacherSubject" ts2
  INNER JOIN "TimetableEntry" te
    ON te."teacherProfileId" = ts2."teacherId"
    AND te."classId" = ts2."classId"
    AND te."isActive" = true
  INNER JOIN "Section" s ON s."id" = te."sectionId" AND s."isActive" = true
  WHERE ts2."sectionId" IS NULL
) sub
WHERE ts."id" = sub.ts_id
AND ts."sectionId" IS NULL;

-- ============================================
-- PHASE 3: Expand orphaned records to ALL sections of their class
-- ============================================

-- For records still without sectionId, create one record per active section
INSERT INTO "TeacherSubject" ("id", "teacherId", "subjectId", "classId", "sectionId", "createdAt")
SELECT 
  gen_random_uuid(),
  ts."teacherId",
  ts."subjectId",
  ts."classId",
  s."id",
  NOW()
FROM "TeacherSubject" ts
INNER JOIN "Section" s ON s."classId" = ts."classId" AND s."isActive" = true
WHERE ts."sectionId" IS NULL;

-- Remove the original orphaned records (they've been replaced)
DELETE FROM "TeacherSubject" WHERE "sectionId" IS NULL;

-- ============================================
-- PHASE 4: Make sectionId NOT NULL + new unique constraint
-- ============================================

ALTER TABLE "TeacherSubject" ALTER COLUMN "sectionId" SET NOT NULL;

-- Remove duplicates before adding unique constraint
DELETE FROM "TeacherSubject" a USING "TeacherSubject" b
WHERE a."id" > b."id"
  AND a."teacherId" = b."teacherId"
  AND a."subjectId" = b."subjectId"
  AND a."classId" = b."classId"
  AND a."sectionId" = b."sectionId";

-- ============================================
-- PHASE 5: ExamClassAssignment — Populate null sectionIds
-- ============================================

-- Expand null-section assignments to ALL active sections of the class
INSERT INTO "ExamClassAssignment" ("id", "examId", "classId", "sectionId", "createdAt")
SELECT 
  gen_random_uuid(),
  eca."examId",
  eca."classId",
  s."id",
  NOW()
FROM "ExamClassAssignment" eca
INNER JOIN "Section" s ON s."classId" = eca."classId" AND s."isActive" = true
WHERE eca."sectionId" IS NULL
ON CONFLICT ("examId", "classId", "sectionId") DO NOTHING;

-- Remove the original null-section records
DELETE FROM "ExamClassAssignment" WHERE "sectionId" IS NULL;

-- Make sectionId required
-- Drop old FK first
ALTER TABLE "ExamClassAssignment" DROP CONSTRAINT IF EXISTS "ExamClassAssignment_sectionId_fkey";
ALTER TABLE "ExamClassAssignment" ALTER COLUMN "sectionId" SET NOT NULL;

-- ============================================
-- PHASE 6: Drop old constraints, add new indexes and foreign keys
-- ============================================

-- Drop old indexes that will be recreated
DROP INDEX IF EXISTS "PasswordResetToken_token_idx";
DROP INDEX IF EXISTS "PeriodSlot_sortOrder_classId_key";

-- Drop and recreate TeacherSubject FK (was CASCADE on class, now RESTRICT)
ALTER TABLE "TeacherSubject" DROP CONSTRAINT IF EXISTS "TeacherSubject_classId_fkey";

-- CreateIndex
CREATE INDEX "AdmissionDecisionRecord_decidedById_idx" ON "AdmissionDecisionRecord"("decidedById");

-- CreateIndex
CREATE INDEX "AdmissionDecisionRecord_assignedClassId_idx" ON "AdmissionDecisionRecord"("assignedClassId");

-- CreateIndex
CREATE INDEX "AdmissionDecisionRecord_assignedSectionId_idx" ON "AdmissionDecisionRecord"("assignedSectionId");

-- CreateIndex
CREATE INDEX "AnswerGrade_graderId_idx" ON "AnswerGrade"("graderId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DailyAttendance_editedById_idx" ON "DailyAttendance"("editedById");

-- CreateIndex
CREATE INDEX "DailyAttendance_academicSessionId_idx" ON "DailyAttendance"("academicSessionId");

-- CreateIndex
CREATE INDEX "Datesheet_publishedById_idx" ON "Datesheet"("publishedById");

-- CreateIndex
CREATE INDEX "Datesheet_createdById_idx" ON "Datesheet"("createdById");

-- CreateIndex
CREATE INDEX "Exam_type_idx" ON "Exam"("type");

-- CreateIndex
CREATE INDEX "Exam_deletedAt_idx" ON "Exam"("deletedAt");

-- CreateIndex
CREATE INDEX "Exam_subjectId_status_idx" ON "Exam"("subjectId", "status");

-- CreateIndex
CREATE INDEX "Exam_status_deliveryMode_idx" ON "Exam"("status", "deliveryMode");

-- CreateIndex
CREATE INDEX "ExamClassAssignment_sectionId_idx" ON "ExamClassAssignment"("sectionId");

-- CreateIndex
CREATE INDEX "ExamResult_publishedAt_idx" ON "ExamResult"("publishedAt");

-- CreateIndex
CREATE INDEX "ExamResult_isPassed_idx" ON "ExamResult"("isPassed");

-- CreateIndex
CREATE INDEX "ExamResult_examId_studentId_idx" ON "ExamResult"("examId", "studentId");

-- CreateIndex
CREATE INDEX "ExamResult_examId_isPassed_idx" ON "ExamResult"("examId", "isPassed");

-- CreateIndex
CREATE INDEX "ExamSession_studentId_idx" ON "ExamSession"("studentId");

-- CreateIndex
CREATE INDEX "ExamSession_examId_status_idx" ON "ExamSession"("examId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StudentProfile_classId_sectionId_idx" ON "StudentProfile"("classId", "sectionId");

-- CreateIndex
CREATE INDEX "StudentProfile_classId_sectionId_status_idx" ON "StudentProfile"("classId", "sectionId", "status");

-- CreateIndex
CREATE INDEX "StudentPromotion_fromSectionId_idx" ON "StudentPromotion"("fromSectionId");

-- CreateIndex
CREATE INDEX "StudentPromotion_toClassId_idx" ON "StudentPromotion"("toClassId");

-- CreateIndex
CREATE INDEX "StudentPromotion_toSectionId_idx" ON "StudentPromotion"("toSectionId");

-- CreateIndex
CREATE INDEX "StudentPromotion_promotedById_idx" ON "StudentPromotion"("promotedById");

-- CreateIndex
CREATE INDEX "SubjectAttendance_editedById_idx" ON "SubjectAttendance"("editedById");

-- CreateIndex
CREATE INDEX "SubjectAttendance_academicSessionId_idx" ON "SubjectAttendance"("academicSessionId");

-- CreateIndex
CREATE INDEX "SubjectAttendance_studentProfileId_date_idx" ON "SubjectAttendance"("studentProfileId", "date");

-- CreateIndex
CREATE INDEX "TeacherSubject_subjectId_idx" ON "TeacherSubject"("subjectId");

-- CreateIndex
CREATE INDEX "TeacherSubject_sectionId_idx" ON "TeacherSubject"("sectionId");

-- CreateIndex
CREATE INDEX "TeacherSubject_teacherId_classId_sectionId_idx" ON "TeacherSubject"("teacherId", "classId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSubject_teacherId_subjectId_classId_sectionId_key" ON "TeacherSubject"("teacherId", "subjectId", "classId", "sectionId");

-- CreateIndex
CREATE INDEX "TimetableEntry_subjectId_idx" ON "TimetableEntry"("subjectId");

-- CreateIndex
CREATE INDEX "TimetableEntry_academicSessionId_idx" ON "TimetableEntry"("academicSessionId");

-- CreateIndex
CREATE INDEX "TimetableEntry_dayOfWeek_idx" ON "TimetableEntry"("dayOfWeek");

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamClassAssignment" ADD CONSTRAINT "ExamClassAssignment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
