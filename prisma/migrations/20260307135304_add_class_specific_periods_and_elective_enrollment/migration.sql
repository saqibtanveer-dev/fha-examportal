-- DropIndex
DROP INDEX "PeriodSlot_sortOrder_key";

-- AlterTable
ALTER TABLE "PeriodSlot" ADD COLUMN     "classId" TEXT;

-- AlterTable
ALTER TABLE "SubjectClassLink" ADD COLUMN     "electiveGroupName" TEXT,
ADD COLUMN     "isElective" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StudentSubjectEnrollment" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSubjectEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentSubjectEnrollment_studentProfileId_academicSessionId_idx" ON "StudentSubjectEnrollment"("studentProfileId", "academicSessionId");

-- CreateIndex
CREATE INDEX "StudentSubjectEnrollment_classId_subjectId_academicSessionI_idx" ON "StudentSubjectEnrollment"("classId", "subjectId", "academicSessionId");

-- CreateIndex
CREATE INDEX "StudentSubjectEnrollment_subjectId_idx" ON "StudentSubjectEnrollment"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSubjectEnrollment_studentProfileId_subjectId_academi_key" ON "StudentSubjectEnrollment"("studentProfileId", "subjectId", "academicSessionId");

-- CreateIndex
CREATE INDEX "PeriodSlot_classId_idx" ON "PeriodSlot"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodSlot_sortOrder_classId_key" ON "PeriodSlot"("sortOrder", "classId");

-- CreateIndex
CREATE INDEX "SubjectClassLink_classId_isElective_idx" ON "SubjectClassLink"("classId", "isElective");

-- AddForeignKey
ALTER TABLE "PeriodSlot" ADD CONSTRAINT "PeriodSlot_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectEnrollment" ADD CONSTRAINT "StudentSubjectEnrollment_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectEnrollment" ADD CONSTRAINT "StudentSubjectEnrollment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectEnrollment" ADD CONSTRAINT "StudentSubjectEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectEnrollment" ADD CONSTRAINT "StudentSubjectEnrollment_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
