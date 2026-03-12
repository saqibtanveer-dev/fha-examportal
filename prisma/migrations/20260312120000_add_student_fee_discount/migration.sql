-- CreateEnum
CREATE TYPE "StudentDiscountType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateTable
CREATE TABLE "StudentFeeDiscount" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "discountType" "StudentDiscountType" NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "feeCategoryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "approvedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentFeeDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentFeeDiscount_studentProfileId_academicSessionId_isActi_idx" ON "StudentFeeDiscount"("studentProfileId", "academicSessionId", "isActive");

-- CreateIndex
CREATE INDEX "StudentFeeDiscount_academicSessionId_idx" ON "StudentFeeDiscount"("academicSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFeeDiscount_studentProfileId_academicSessionId_fee_key" ON "StudentFeeDiscount"("studentProfileId", "academicSessionId", "feeCategoryId");

-- AddForeignKey
ALTER TABLE "StudentFeeDiscount" ADD CONSTRAINT "StudentFeeDiscount_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeeDiscount" ADD CONSTRAINT "StudentFeeDiscount_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeeDiscount" ADD CONSTRAINT "StudentFeeDiscount_feeCategoryId_fkey" FOREIGN KEY ("feeCategoryId") REFERENCES "FeeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeeDiscount" ADD CONSTRAINT "StudentFeeDiscount_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
