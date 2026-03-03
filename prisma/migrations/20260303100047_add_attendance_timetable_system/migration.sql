/*
  Warnings:

  - A unique constraint covering the columns `[campaignId,paperVersion,sortOrder]` on the table `CampaignQuestion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- DropIndex
DROP INDEX "CampaignQuestion_campaignId_sortOrder_key";

-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "paperVersion" TEXT NOT NULL DEFAULT 'A';

-- AlterTable
ALTER TABLE "CampaignQuestion" ADD COLUMN     "paperVersion" TEXT NOT NULL DEFAULT 'A';

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "classTeacherId" TEXT;

-- CreateTable
CREATE TABLE "PeriodSlot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isBreak" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableEntry" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "periodSlotId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "room" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAttendance" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "remarks" TEXT,
    "markedById" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedById" TEXT,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectAttendance" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "timetableEntryId" TEXT,
    "periodSlotId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "remarks" TEXT,
    "markedById" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedById" TEXT,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeriodSlot_sortOrder_key" ON "PeriodSlot"("sortOrder");

-- CreateIndex
CREATE INDEX "PeriodSlot_isActive_idx" ON "PeriodSlot"("isActive");

-- CreateIndex
CREATE INDEX "PeriodSlot_sortOrder_idx" ON "PeriodSlot"("sortOrder");

-- CreateIndex
CREATE INDEX "TimetableEntry_teacherProfileId_dayOfWeek_academicSessionId_idx" ON "TimetableEntry"("teacherProfileId", "dayOfWeek", "academicSessionId");

-- CreateIndex
CREATE INDEX "TimetableEntry_classId_sectionId_academicSessionId_idx" ON "TimetableEntry"("classId", "sectionId", "academicSessionId");

-- CreateIndex
CREATE INDEX "TimetableEntry_periodSlotId_idx" ON "TimetableEntry"("periodSlotId");

-- CreateIndex
CREATE INDEX "TimetableEntry_isActive_idx" ON "TimetableEntry"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableEntry_classId_sectionId_periodSlotId_dayOfWeek_aca_key" ON "TimetableEntry"("classId", "sectionId", "periodSlotId", "dayOfWeek", "academicSessionId");

-- CreateIndex
CREATE INDEX "DailyAttendance_classId_sectionId_date_idx" ON "DailyAttendance"("classId", "sectionId", "date");

-- CreateIndex
CREATE INDEX "DailyAttendance_date_academicSessionId_idx" ON "DailyAttendance"("date", "academicSessionId");

-- CreateIndex
CREATE INDEX "DailyAttendance_markedById_idx" ON "DailyAttendance"("markedById");

-- CreateIndex
CREATE INDEX "DailyAttendance_status_idx" ON "DailyAttendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAttendance_studentProfileId_date_academicSessionId_key" ON "DailyAttendance"("studentProfileId", "date", "academicSessionId");

-- CreateIndex
CREATE INDEX "SubjectAttendance_classId_sectionId_date_periodSlotId_idx" ON "SubjectAttendance"("classId", "sectionId", "date", "periodSlotId");

-- CreateIndex
CREATE INDEX "SubjectAttendance_subjectId_date_idx" ON "SubjectAttendance"("subjectId", "date");

-- CreateIndex
CREATE INDEX "SubjectAttendance_markedById_idx" ON "SubjectAttendance"("markedById");

-- CreateIndex
CREATE INDEX "SubjectAttendance_status_idx" ON "SubjectAttendance"("status");

-- CreateIndex
CREATE INDEX "SubjectAttendance_timetableEntryId_idx" ON "SubjectAttendance"("timetableEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectAttendance_studentProfileId_subjectId_periodSlotId_d_key" ON "SubjectAttendance"("studentProfileId", "subjectId", "periodSlotId", "date", "academicSessionId");

-- CreateIndex
CREATE INDEX "CampaignQuestion_campaignId_paperVersion_idx" ON "CampaignQuestion"("campaignId", "paperVersion");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignQuestion_campaignId_paperVersion_sortOrder_key" ON "CampaignQuestion"("campaignId", "paperVersion", "sortOrder");

-- CreateIndex
CREATE INDEX "Section_classTeacherId_idx" ON "Section"("classTeacherId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_periodSlotId_fkey" FOREIGN KEY ("periodSlotId") REFERENCES "PeriodSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttendance" ADD CONSTRAINT "DailyAttendance_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttendance" ADD CONSTRAINT "DailyAttendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttendance" ADD CONSTRAINT "DailyAttendance_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttendance" ADD CONSTRAINT "DailyAttendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttendance" ADD CONSTRAINT "DailyAttendance_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttendance" ADD CONSTRAINT "DailyAttendance_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAttendance" ADD CONSTRAINT "SubjectAttendance_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAttendance" ADD CONSTRAINT "SubjectAttendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAttendance" ADD CONSTRAINT "SubjectAttendance_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAttendance" ADD CONSTRAINT "SubjectAttendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAttendance" ADD CONSTRAINT "SubjectAttendance_timetableEntryId_fkey" FOREIGN KEY ("timetableEntryId") REFERENCES "TimetableEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAttendance" ADD CONSTRAINT "SubjectAttendance_periodSlotId_fkey" FOREIGN KEY ("periodSlotId") REFERENCES "PeriodSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAttendance" ADD CONSTRAINT "SubjectAttendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAttendance" ADD CONSTRAINT "SubjectAttendance_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectAttendance" ADD CONSTRAINT "SubjectAttendance_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
