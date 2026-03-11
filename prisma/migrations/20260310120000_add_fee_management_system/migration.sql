-- CreateEnum
CREATE TYPE "FeeFrequency" AS ENUM ('MONTHLY', 'TERM', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "FeeAssignmentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED', 'WAIVED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'ONLINE', 'CHEQUE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('COMPLETED', 'REVERSED');

-- CreateEnum
CREATE TYPE "AllocationStrategy" AS ENUM ('OLDEST_FIRST', 'CHILD_PRIORITY', 'EQUAL_SPLIT', 'MANUAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('ACTIVE', 'EXHAUSTED', 'REFUNDED');

-- CreateTable
CREATE TABLE "FeeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "FeeFrequency" NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "isRefundable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeAssignment" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "generatedForMonth" VARCHAR(7) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balanceAmount" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lateFeesApplied" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "FeeAssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "generatedById" TEXT NOT NULL,
    "cancelledById" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeLineItem" (
    "id" TEXT NOT NULL,
    "feeAssignmentId" TEXT NOT NULL,
    "feeStructureId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "FeeLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeDiscount" (
    "id" TEXT NOT NULL,
    "feeAssignmentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "appliedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeePayment" (
    "id" TEXT NOT NULL,
    "feeAssignmentId" TEXT NOT NULL,
    "familyPaymentId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "referenceNumber" TEXT,
    "receiptNumber" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "reversedById" TEXT,
    "reversalReason" TEXT,
    "reversedAt" TIMESTAMP(3),
    "recordedById" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyPayment" (
    "id" TEXT NOT NULL,
    "familyProfileId" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "referenceNumber" TEXT,
    "masterReceiptNumber" TEXT NOT NULL,
    "allocationStrategy" "AllocationStrategy" NOT NULL,
    "allocationDetails" JSONB,
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "reversedById" TEXT,
    "reversalReason" TEXT,
    "reversedAt" TIMESTAMP(3),
    "recordedById" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeSettings" (
    "id" TEXT NOT NULL,
    "dueDayOfMonth" INTEGER NOT NULL DEFAULT 10,
    "lateFeePerDay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maxLateFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "receiptPrefix" TEXT NOT NULL DEFAULT 'FRCP',
    "familyReceiptPrefix" TEXT NOT NULL DEFAULT 'FMRC',
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 0,
    "academicSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeCredit" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "familyProfileId" TEXT,
    "academicSessionId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "remainingAmount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "status" "CreditStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeCredit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeeCategory_name_key" ON "FeeCategory"("name");

-- CreateIndex
CREATE INDEX "FeeCategory_isActive_idx" ON "FeeCategory"("isActive");

-- CreateIndex
CREATE INDEX "FeeCategory_frequency_idx" ON "FeeCategory"("frequency");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_categoryId_classId_academicSessionId_key" ON "FeeStructure"("categoryId", "classId", "academicSessionId");

-- CreateIndex
CREATE INDEX "FeeStructure_classId_academicSessionId_idx" ON "FeeStructure"("classId", "academicSessionId");

-- CreateIndex
CREATE INDEX "FeeStructure_categoryId_idx" ON "FeeStructure"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeAssignment_studentProfileId_academicSessionId_generatedF_key" ON "FeeAssignment"("studentProfileId", "academicSessionId", "generatedForMonth");

-- CreateIndex
CREATE INDEX "FeeAssignment_studentProfileId_academicSessionId_idx" ON "FeeAssignment"("studentProfileId", "academicSessionId");

-- CreateIndex
CREATE INDEX "FeeAssignment_academicSessionId_generatedForMonth_idx" ON "FeeAssignment"("academicSessionId", "generatedForMonth");

-- CreateIndex
CREATE INDEX "FeeAssignment_academicSessionId_status_dueDate_idx" ON "FeeAssignment"("academicSessionId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "FeeAssignment_status_idx" ON "FeeAssignment"("status");

-- CreateIndex
CREATE INDEX "FeeAssignment_dueDate_idx" ON "FeeAssignment"("dueDate");

-- CreateIndex
CREATE INDEX "FeeAssignment_generatedForMonth_status_idx" ON "FeeAssignment"("generatedForMonth", "status");

-- CreateIndex
CREATE INDEX "FeeLineItem_feeAssignmentId_idx" ON "FeeLineItem"("feeAssignmentId");

-- CreateIndex
CREATE INDEX "FeeDiscount_feeAssignmentId_idx" ON "FeeDiscount"("feeAssignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "FeePayment_receiptNumber_key" ON "FeePayment"("receiptNumber");

-- CreateIndex
CREATE INDEX "FeePayment_feeAssignmentId_status_idx" ON "FeePayment"("feeAssignmentId", "status");

-- CreateIndex
CREATE INDEX "FeePayment_familyPaymentId_idx" ON "FeePayment"("familyPaymentId");

-- CreateIndex
CREATE INDEX "FeePayment_receiptNumber_idx" ON "FeePayment"("receiptNumber");

-- CreateIndex
CREATE INDEX "FeePayment_status_idx" ON "FeePayment"("status");

-- CreateIndex
CREATE INDEX "FeePayment_paidAt_idx" ON "FeePayment"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyPayment_masterReceiptNumber_key" ON "FamilyPayment"("masterReceiptNumber");

-- CreateIndex
CREATE INDEX "FamilyPayment_familyProfileId_idx" ON "FamilyPayment"("familyProfileId");

-- CreateIndex
CREATE INDEX "FamilyPayment_masterReceiptNumber_idx" ON "FamilyPayment"("masterReceiptNumber");

-- CreateIndex
CREATE INDEX "FamilyPayment_status_idx" ON "FamilyPayment"("status");

-- CreateIndex
CREATE INDEX "FamilyPayment_paidAt_idx" ON "FamilyPayment"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeeSettings_academicSessionId_key" ON "FeeSettings"("academicSessionId");

-- CreateIndex
CREATE INDEX "FeeCredit_studentProfileId_status_idx" ON "FeeCredit"("studentProfileId", "status");

-- CreateIndex
CREATE INDEX "FeeCredit_familyProfileId_status_idx" ON "FeeCredit"("familyProfileId", "status");

-- CreateIndex
CREATE INDEX "FeeCredit_academicSessionId_idx" ON "FeeCredit"("academicSessionId");

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeAssignment" ADD CONSTRAINT "FeeAssignment_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeAssignment" ADD CONSTRAINT "FeeAssignment_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeAssignment" ADD CONSTRAINT "FeeAssignment_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeLineItem" ADD CONSTRAINT "FeeLineItem_feeAssignmentId_fkey" FOREIGN KEY ("feeAssignmentId") REFERENCES "FeeAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeLineItem" ADD CONSTRAINT "FeeLineItem_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "FeeStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeDiscount" ADD CONSTRAINT "FeeDiscount_feeAssignmentId_fkey" FOREIGN KEY ("feeAssignmentId") REFERENCES "FeeAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeDiscount" ADD CONSTRAINT "FeeDiscount_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_feeAssignmentId_fkey" FOREIGN KEY ("feeAssignmentId") REFERENCES "FeeAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_familyPaymentId_fkey" FOREIGN KEY ("familyPaymentId") REFERENCES "FamilyPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyPayment" ADD CONSTRAINT "FamilyPayment_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyPayment" ADD CONSTRAINT "FamilyPayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeSettings" ADD CONSTRAINT "FeeSettings_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeCredit" ADD CONSTRAINT "FeeCredit_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeCredit" ADD CONSTRAINT "FeeCredit_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeCredit" ADD CONSTRAINT "FeeCredit_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeCredit" ADD CONSTRAINT "FeeCredit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
