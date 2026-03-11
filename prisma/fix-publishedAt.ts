/**
 * One-time data migration: Backfill `publishedAt` for ALL ExamResult records
 * that are missing it. Since no explicit publish workflow exists, all graded
 * results should be immediately visible.
 * 
 * Run with: npx tsx prisma/fix-publishedAt.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const fixed = await prisma.$executeRaw`
    UPDATE "ExamResult"
    SET "publishedAt" = "createdAt"
    WHERE "publishedAt" IS NULL
  `;
  console.log(`Fixed ${fixed} exam results with missing publishedAt`);
  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
