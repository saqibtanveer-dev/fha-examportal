-- CreateEnum
CREATE TYPE "ExamDeliveryMode" AS ENUM ('ONLINE', 'WRITTEN');

-- AlterEnum
ALTER TYPE "SessionStatus" ADD VALUE 'ABSENT';

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "deliveryMode" "ExamDeliveryMode" NOT NULL DEFAULT 'ONLINE';

-- AlterTable
ALTER TABLE "ExamSession" ADD COLUMN     "enteredById" TEXT;

-- CreateIndex
CREATE INDEX "Exam_deliveryMode_idx" ON "Exam"("deliveryMode");

-- CreateIndex
CREATE INDEX "ExamSession_enteredById_idx" ON "ExamSession"("enteredById");

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
