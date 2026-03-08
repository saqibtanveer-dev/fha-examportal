/**
 * One-time data migration: Backfill `publishedAt` for ExamResult records
 * that are missing it but should have it.
 * 
 * Covers:
 * 1. Written exams with status COMPLETED (finalized) → set publishedAt to result's createdAt
 * 2. Online exams with showResultAfter = IMMEDIATELY → set publishedAt to result's createdAt
 * 
 * Run with: npx tsx prisma/fix-publishedAt.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Fix 1: Written exam results (finalized exams)
  const writtenFixed = await prisma.$executeRaw`
    UPDATE "ExamResult" er
    SET "publishedAt" = er."createdAt"
    FROM "Exam" e
    WHERE er."examId" = e.id
      AND er."publishedAt" IS NULL
      AND e."deliveryMode" = 'WRITTEN'
      AND e."status" = 'COMPLETED'
  `;
  console.log(`Fixed ${writtenFixed} written exam results`);

  // Fix 2: Online exam results with IMMEDIATELY policy
  const onlineFixed = await prisma.$executeRaw`
    UPDATE "ExamResult" er
    SET "publishedAt" = er."createdAt"
    FROM "Exam" e
    WHERE er."examId" = e.id
      AND er."publishedAt" IS NULL
      AND e."showResultAfter" = 'IMMEDIATELY'
  `;
  console.log(`Fixed ${onlineFixed} online exam results with IMMEDIATELY policy`);

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
