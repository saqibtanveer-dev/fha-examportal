-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "academicSessionId" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "classId" TEXT;

-- AlterTable
ALTER TABLE "TeacherSubject" ADD COLUMN     "classId" TEXT;

-- CreateTable
CREATE TABLE "SubjectClassLink" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "syllabus" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectClassLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubjectClassLink_classId_idx" ON "SubjectClassLink"("classId");

-- CreateIndex
CREATE INDEX "SubjectClassLink_subjectId_idx" ON "SubjectClassLink"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectClassLink_subjectId_classId_key" ON "SubjectClassLink"("subjectId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_name_key" ON "AcademicSession"("name");

-- CreateIndex
CREATE INDEX "AcademicSession_isCurrent_idx" ON "AcademicSession"("isCurrent");

-- CreateIndex
CREATE INDEX "Exam_academicSessionId_idx" ON "Exam"("academicSessionId");

-- CreateIndex
CREATE INDEX "Question_classId_idx" ON "Question"("classId");

-- AddForeignKey
ALTER TABLE "SubjectClassLink" ADD CONSTRAINT "SubjectClassLink_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectClassLink" ADD CONSTRAINT "SubjectClassLink_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
