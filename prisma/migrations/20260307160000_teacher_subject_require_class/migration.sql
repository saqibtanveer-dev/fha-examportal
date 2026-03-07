-- Step 1: Delete TeacherSubject rows where classId is NULL (orphaned assignments)
DELETE FROM "TeacherSubject" WHERE "classId" IS NULL;

-- Step 2: Drop the old unique constraint (teacherId, subjectId)
DROP INDEX "TeacherSubject_teacherId_subjectId_key";

-- Step 3: Make classId NOT NULL
ALTER TABLE "TeacherSubject" ALTER COLUMN "classId" SET NOT NULL;

-- Step 4: Create new unique constraint (teacherId, subjectId, classId)
CREATE UNIQUE INDEX "TeacherSubject_teacherId_subjectId_classId_key" ON "TeacherSubject"("teacherId", "subjectId", "classId");

-- Step 5: Add indexes for performance
CREATE INDEX "TeacherSubject_teacherId_idx" ON "TeacherSubject"("teacherId");
CREATE INDEX "TeacherSubject_classId_idx" ON "TeacherSubject"("classId");
