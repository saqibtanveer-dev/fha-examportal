-- CreateEnum
CREATE TYPE "DatesheetStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Datesheet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "examType" "ExamType" NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "status" "DatesheetStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "publishedById" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Datesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatesheetEntry" (
    "id" TEXT NOT NULL,
    "datesheetId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT,
    "subjectId" TEXT NOT NULL,
    "examDate" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,
    "instructions" TEXT,
    "totalMarks" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatesheetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatesheetDuty" (
    "id" TEXT NOT NULL,
    "datesheetEntryId" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'INVIGILATOR',
    "room" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatesheetDuty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Datesheet_academicSessionId_idx" ON "Datesheet"("academicSessionId");

-- CreateIndex
CREATE INDEX "Datesheet_status_idx" ON "Datesheet"("status");

-- CreateIndex
CREATE INDEX "Datesheet_examType_idx" ON "Datesheet"("examType");

-- CreateIndex
CREATE INDEX "Datesheet_startDate_endDate_idx" ON "Datesheet"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "DatesheetEntry_datesheetId_idx" ON "DatesheetEntry"("datesheetId");

-- CreateIndex
CREATE INDEX "DatesheetEntry_classId_sectionId_idx" ON "DatesheetEntry"("classId", "sectionId");

-- CreateIndex
CREATE INDEX "DatesheetEntry_examDate_idx" ON "DatesheetEntry"("examDate");

-- CreateIndex
CREATE INDEX "DatesheetEntry_subjectId_idx" ON "DatesheetEntry"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "DatesheetEntry_datesheetId_classId_sectionId_subjectId_key" ON "DatesheetEntry"("datesheetId", "classId", "sectionId", "subjectId");

-- CreateIndex
CREATE INDEX "DatesheetDuty_teacherProfileId_idx" ON "DatesheetDuty"("teacherProfileId");

-- CreateIndex
CREATE INDEX "DatesheetDuty_datesheetEntryId_idx" ON "DatesheetDuty"("datesheetEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "DatesheetDuty_datesheetEntryId_teacherProfileId_key" ON "DatesheetDuty"("datesheetEntryId", "teacherProfileId");

-- AddForeignKey
ALTER TABLE "Datesheet" ADD CONSTRAINT "Datesheet_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Datesheet" ADD CONSTRAINT "Datesheet_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Datesheet" ADD CONSTRAINT "Datesheet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatesheetEntry" ADD CONSTRAINT "DatesheetEntry_datesheetId_fkey" FOREIGN KEY ("datesheetId") REFERENCES "Datesheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatesheetEntry" ADD CONSTRAINT "DatesheetEntry_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatesheetEntry" ADD CONSTRAINT "DatesheetEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatesheetEntry" ADD CONSTRAINT "DatesheetEntry_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatesheetDuty" ADD CONSTRAINT "DatesheetDuty_datesheetEntryId_fkey" FOREIGN KEY ("datesheetEntryId") REFERENCES "DatesheetEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatesheetDuty" ADD CONSTRAINT "DatesheetDuty_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
