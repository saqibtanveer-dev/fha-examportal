-- CreateTable: ElectiveSlotGroup
CREATE TABLE "ElectiveSlotGroup" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "periodSlotId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectiveSlotGroup_pkey" PRIMARY KEY ("id")
);

-- Add columns to TimetableEntry
ALTER TABLE "TimetableEntry" ADD COLUMN "isElectiveSlot" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TimetableEntry" ADD COLUMN "electiveSlotGroupId" TEXT;

-- Drop old unique constraint on TimetableEntry (was: classId, sectionId, periodSlotId, dayOfWeek, academicSessionId)
DROP INDEX "TimetableEntry_classId_sectionId_periodSlotId_dayOfWeek_aca_key";

-- Create new unique constraint including subjectId (allows multiple subjects per slot for electives)
CREATE UNIQUE INDEX "TimetableEntry_classId_sectionId_subjectId_periodSlotId_d_key" ON "TimetableEntry"("classId", "sectionId", "subjectId", "periodSlotId", "dayOfWeek", "academicSessionId");

-- ElectiveSlotGroup unique constraint
CREATE UNIQUE INDEX "ElectiveSlotGroup_classId_sectionId_periodSlotId_dayOfWee_key" ON "ElectiveSlotGroup"("classId", "sectionId", "periodSlotId", "dayOfWeek", "academicSessionId");

-- ElectiveSlotGroup indexes
CREATE INDEX "ElectiveSlotGroup_classId_sectionId_academicSessionId_idx" ON "ElectiveSlotGroup"("classId", "sectionId", "academicSessionId");
CREATE INDEX "ElectiveSlotGroup_periodSlotId_dayOfWeek_idx" ON "ElectiveSlotGroup"("periodSlotId", "dayOfWeek");

-- TimetableEntry new indexes
CREATE INDEX "TimetableEntry_electiveSlotGroupId_idx" ON "TimetableEntry"("electiveSlotGroupId");
CREATE INDEX "TimetableEntry_isElectiveSlot_idx" ON "TimetableEntry"("isElectiveSlot");

-- DatesheetEntry: update unique constraint (add examDate) and add sectionId index
DROP INDEX "DatesheetEntry_datesheetId_classId_sectionId_subjectId_key";
CREATE UNIQUE INDEX "DatesheetEntry_datesheetId_classId_sectionId_subjectId_ex_key" ON "DatesheetEntry"("datesheetId", "classId", "sectionId", "subjectId", "examDate");
CREATE INDEX "DatesheetEntry_sectionId_idx" ON "DatesheetEntry"("sectionId");

-- Foreign keys for ElectiveSlotGroup
ALTER TABLE "ElectiveSlotGroup" ADD CONSTRAINT "ElectiveSlotGroup_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ElectiveSlotGroup" ADD CONSTRAINT "ElectiveSlotGroup_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ElectiveSlotGroup" ADD CONSTRAINT "ElectiveSlotGroup_periodSlotId_fkey" FOREIGN KEY ("periodSlotId") REFERENCES "PeriodSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ElectiveSlotGroup" ADD CONSTRAINT "ElectiveSlotGroup_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign key for TimetableEntry.electiveSlotGroupId
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_electiveSlotGroupId_fkey" FOREIGN KEY ("electiveSlotGroupId") REFERENCES "ElectiveSlotGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
