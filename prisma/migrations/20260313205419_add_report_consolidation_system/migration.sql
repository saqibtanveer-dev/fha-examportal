-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AggregateMode') THEN
        CREATE TYPE "AggregateMode" AS ENUM ('SINGLE', 'AVERAGE', 'BEST_OF', 'SUM');
    END IF;
END
$$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ResultTerm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isComputing" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "computedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResultTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ResultExamGroup" (
    "id" TEXT NOT NULL,
    "resultTermId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "aggregateMode" "AggregateMode" NOT NULL DEFAULT 'SINGLE',
    "bestOfCount" INTEGER,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResultExamGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ResultExamLink" (
    "id" TEXT NOT NULL,
    "examGroupId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultExamLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ConsolidatedResult" (
    "id" TEXT NOT NULL,
    "resultTermId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "groupScores" JSONB NOT NULL,
    "totalMarks" DECIMAL(10,2) NOT NULL,
    "obtainedMarks" DECIMAL(10,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "grade" TEXT,
    "isPassed" BOOLEAN NOT NULL,
    "isStale" BOOLEAN NOT NULL DEFAULT false,
    "rankInClass" INTEGER,
    "rankInSection" INTEGER,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsolidatedResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ConsolidatedStudentSummary" (
    "id" TEXT NOT NULL,
    "resultTermId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "totalSubjects" INTEGER NOT NULL,
    "passedSubjects" INTEGER NOT NULL,
    "failedSubjects" INTEGER NOT NULL,
    "grandTotalMarks" DECIMAL(10,2) NOT NULL,
    "grandObtainedMarks" DECIMAL(10,2) NOT NULL,
    "overallPercentage" DECIMAL(5,2) NOT NULL,
    "overallGrade" TEXT,
    "isOverallPassed" BOOLEAN NOT NULL,
    "rankInClass" INTEGER,
    "rankInSection" INTEGER,
    "attendancePercentage" DECIMAL(5,2),
    "totalDays" INTEGER,
    "presentDays" INTEGER,
    "classTeacherRemarks" TEXT,
    "principalRemarks" TEXT,
    "isStale" BOOLEAN NOT NULL DEFAULT false,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsolidatedStudentSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ResultTerm_academicSessionId_idx" ON "ResultTerm"("academicSessionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ResultTerm_classId_idx" ON "ResultTerm"("classId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ResultTerm_isPublished_idx" ON "ResultTerm"("isPublished");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ResultTerm_isActive_idx" ON "ResultTerm"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ResultTerm_name_academicSessionId_classId_key" ON "ResultTerm"("name", "academicSessionId", "classId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ResultExamGroup_resultTermId_idx" ON "ResultExamGroup"("resultTermId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ResultExamGroup_resultTermId_sortOrder_key" ON "ResultExamGroup"("resultTermId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ResultExamGroup_resultTermId_name_key" ON "ResultExamGroup"("resultTermId", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ResultExamLink_examGroupId_idx" ON "ResultExamLink"("examGroupId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ResultExamLink_examId_idx" ON "ResultExamLink"("examId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ResultExamLink_examGroupId_examId_key" ON "ResultExamLink"("examGroupId", "examId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsolidatedResult_resultTermId_studentId_idx" ON "ConsolidatedResult"("resultTermId", "studentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsolidatedResult_resultTermId_subjectId_idx" ON "ConsolidatedResult"("resultTermId", "subjectId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsolidatedResult_resultTermId_rankInClass_idx" ON "ConsolidatedResult"("resultTermId", "rankInClass");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsolidatedResult_resultTermId_rankInSection_idx" ON "ConsolidatedResult"("resultTermId", "rankInSection");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsolidatedResult_isStale_idx" ON "ConsolidatedResult"("isStale");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ConsolidatedResult_resultTermId_studentId_subjectId_key" ON "ConsolidatedResult"("resultTermId", "studentId", "subjectId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsolidatedStudentSummary_resultTermId_rankInClass_idx" ON "ConsolidatedStudentSummary"("resultTermId", "rankInClass");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsolidatedStudentSummary_resultTermId_rankInSection_idx" ON "ConsolidatedStudentSummary"("resultTermId", "rankInSection");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsolidatedStudentSummary_resultTermId_overallPercentage_idx" ON "ConsolidatedStudentSummary"("resultTermId", "overallPercentage");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsolidatedStudentSummary_resultTermId_sectionId_idx" ON "ConsolidatedStudentSummary"("resultTermId", "sectionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsolidatedStudentSummary_isStale_idx" ON "ConsolidatedStudentSummary"("isStale");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ConsolidatedStudentSummary_resultTermId_studentId_key" ON "ConsolidatedStudentSummary"("resultTermId", "studentId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ResultTerm_academicSessionId_fkey') THEN
        ALTER TABLE "ResultTerm" ADD CONSTRAINT "ResultTerm_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ResultTerm_classId_fkey') THEN
        ALTER TABLE "ResultTerm" ADD CONSTRAINT "ResultTerm_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ResultExamGroup_resultTermId_fkey') THEN
        ALTER TABLE "ResultExamGroup" ADD CONSTRAINT "ResultExamGroup_resultTermId_fkey" FOREIGN KEY ("resultTermId") REFERENCES "ResultTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ResultExamLink_examGroupId_fkey') THEN
        ALTER TABLE "ResultExamLink" ADD CONSTRAINT "ResultExamLink_examGroupId_fkey" FOREIGN KEY ("examGroupId") REFERENCES "ResultExamGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ResultExamLink_examId_fkey') THEN
        ALTER TABLE "ResultExamLink" ADD CONSTRAINT "ResultExamLink_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ConsolidatedResult_resultTermId_fkey') THEN
        ALTER TABLE "ConsolidatedResult" ADD CONSTRAINT "ConsolidatedResult_resultTermId_fkey" FOREIGN KEY ("resultTermId") REFERENCES "ResultTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ConsolidatedResult_studentId_fkey') THEN
        ALTER TABLE "ConsolidatedResult" ADD CONSTRAINT "ConsolidatedResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ConsolidatedResult_subjectId_fkey') THEN
        ALTER TABLE "ConsolidatedResult" ADD CONSTRAINT "ConsolidatedResult_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ConsolidatedStudentSummary_resultTermId_fkey') THEN
        ALTER TABLE "ConsolidatedStudentSummary" ADD CONSTRAINT "ConsolidatedStudentSummary_resultTermId_fkey" FOREIGN KEY ("resultTermId") REFERENCES "ResultTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ConsolidatedStudentSummary_studentId_fkey') THEN
        ALTER TABLE "ConsolidatedStudentSummary" ADD CONSTRAINT "ConsolidatedStudentSummary_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;
