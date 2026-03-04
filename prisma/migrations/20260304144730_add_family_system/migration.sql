-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'ATTENDANCE_ALERT';
ALTER TYPE "NotificationType" ADD VALUE 'DIARY_PUBLISHED';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'FAMILY';

-- CreateTable
CREATE TABLE "FamilyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relationship" VARCHAR(100) NOT NULL,
    "occupation" VARCHAR(200),
    "address" TEXT,
    "emergencyPhone" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyStudentLink" (
    "id" TEXT NOT NULL,
    "familyProfileId" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "relationship" VARCHAR(100) NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linkedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyStudentLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FamilyProfile_userId_key" ON "FamilyProfile"("userId");

-- CreateIndex
CREATE INDEX "FamilyStudentLink_familyProfileId_idx" ON "FamilyStudentLink"("familyProfileId");

-- CreateIndex
CREATE INDEX "FamilyStudentLink_studentProfileId_idx" ON "FamilyStudentLink"("studentProfileId");

-- CreateIndex
CREATE INDEX "FamilyStudentLink_isActive_idx" ON "FamilyStudentLink"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyStudentLink_familyProfileId_studentProfileId_key" ON "FamilyStudentLink"("familyProfileId", "studentProfileId");

-- AddForeignKey
ALTER TABLE "FamilyProfile" ADD CONSTRAINT "FamilyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyStudentLink" ADD CONSTRAINT "FamilyStudentLink_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyStudentLink" ADD CONSTRAINT "FamilyStudentLink_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyStudentLink" ADD CONSTRAINT "FamilyStudentLink_linkedById_fkey" FOREIGN KEY ("linkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
