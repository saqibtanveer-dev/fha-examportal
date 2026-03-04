-- CreateEnum
CREATE TYPE "DiaryStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "DiaryEntry" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "status" "DiaryStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryReadReceipt" (
    "id" TEXT NOT NULL,
    "diaryEntryId" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiaryReadReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryPrincipalNote" (
    "id" TEXT NOT NULL,
    "diaryEntryId" TEXT NOT NULL,
    "principalId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiaryPrincipalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiaryEntry_classId_sectionId_date_idx" ON "DiaryEntry"("classId", "sectionId", "date");

-- CreateIndex
CREATE INDEX "DiaryEntry_teacherProfileId_date_idx" ON "DiaryEntry"("teacherProfileId", "date");

-- CreateIndex
CREATE INDEX "DiaryEntry_subjectId_date_idx" ON "DiaryEntry"("subjectId", "date");

-- CreateIndex
CREATE INDEX "DiaryEntry_academicSessionId_idx" ON "DiaryEntry"("academicSessionId");

-- CreateIndex
CREATE INDEX "DiaryEntry_date_status_idx" ON "DiaryEntry"("date", "status");

-- CreateIndex
CREATE INDEX "DiaryEntry_deletedAt_idx" ON "DiaryEntry"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DiaryEntry_teacherProfileId_classId_sectionId_subjectId_dat_key" ON "DiaryEntry"("teacherProfileId", "classId", "sectionId", "subjectId", "date", "academicSessionId");

-- CreateIndex
CREATE INDEX "DiaryReadReceipt_diaryEntryId_idx" ON "DiaryReadReceipt"("diaryEntryId");

-- CreateIndex
CREATE INDEX "DiaryReadReceipt_studentProfileId_idx" ON "DiaryReadReceipt"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "DiaryReadReceipt_diaryEntryId_studentProfileId_key" ON "DiaryReadReceipt"("diaryEntryId", "studentProfileId");

-- CreateIndex
CREATE INDEX "DiaryPrincipalNote_diaryEntryId_idx" ON "DiaryPrincipalNote"("diaryEntryId");

-- CreateIndex
CREATE INDEX "DiaryPrincipalNote_principalId_idx" ON "DiaryPrincipalNote"("principalId");

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryReadReceipt" ADD CONSTRAINT "DiaryReadReceipt_diaryEntryId_fkey" FOREIGN KEY ("diaryEntryId") REFERENCES "DiaryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryReadReceipt" ADD CONSTRAINT "DiaryReadReceipt_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryPrincipalNote" ADD CONSTRAINT "DiaryPrincipalNote_diaryEntryId_fkey" FOREIGN KEY ("diaryEntryId") REFERENCES "DiaryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryPrincipalNote" ADD CONSTRAINT "DiaryPrincipalNote_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
