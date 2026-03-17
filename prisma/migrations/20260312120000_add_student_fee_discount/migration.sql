-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StudentDiscountType') THEN
        CREATE TYPE "StudentDiscountType" AS ENUM ('FLAT', 'PERCENTAGE');
    END IF;
END
$$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "StudentFeeDiscount" (
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
CREATE INDEX IF NOT EXISTS "StudentFeeDiscount_studentProfileId_academicSessionId_isActi_idx" ON "StudentFeeDiscount"("studentProfileId", "academicSessionId", "isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StudentFeeDiscount_academicSessionId_idx" ON "StudentFeeDiscount"("academicSessionId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "StudentFeeDiscount_studentProfileId_academicSessionId_fee_key" ON "StudentFeeDiscount"("studentProfileId", "academicSessionId", "feeCategoryId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StudentFeeDiscount_studentProfileId_fkey') THEN
        ALTER TABLE "StudentFeeDiscount" ADD CONSTRAINT "StudentFeeDiscount_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StudentFeeDiscount_academicSessionId_fkey') THEN
        ALTER TABLE "StudentFeeDiscount" ADD CONSTRAINT "StudentFeeDiscount_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StudentFeeDiscount_feeCategoryId_fkey') THEN
        ALTER TABLE "StudentFeeDiscount" ADD CONSTRAINT "StudentFeeDiscount_feeCategoryId_fkey" FOREIGN KEY ("feeCategoryId") REFERENCES "FeeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StudentFeeDiscount_approvedById_fkey') THEN
        ALTER TABLE "StudentFeeDiscount" ADD CONSTRAINT "StudentFeeDiscount_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;
