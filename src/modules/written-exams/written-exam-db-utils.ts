import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

type Tx = Prisma.TransactionClient;

type GradeEntry = {
  studentAnswerId: string;
  graderId: string;
  marksAwarded: number;
  maxMarks: number;
  feedback?: string | null;
};

type ExamResultEntry = {
  sessionId: string;
  examId: string;
  studentId: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade?: string | null;
  isPassed: boolean;
  publishedAt?: Date | null;
};

/**
 * Batch upsert answer grades using raw SQL INSERT ... ON CONFLICT.
 * Replaces N sequential Prisma upserts with a single SQL statement.
 *
 * For 84 entries: 1 query instead of 84.
 * For 10,000 entries: chunks into batches of 500 to avoid query size limits.
 */
export async function batchUpsertAnswerGrades(
  tx: Tx,
  entries: GradeEntry[],
): Promise<number> {
  if (entries.length === 0) return 0;

  const CHUNK_SIZE = 500;
  let totalUpserted = 0;

  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const chunk = entries.slice(i, i + CHUNK_SIZE);
    totalUpserted += await upsertChunk(tx, chunk);
  }

  return totalUpserted;
}

async function upsertChunk(tx: Tx, entries: GradeEntry[]): Promise<number> {
  const now = new Date();

  const rows = entries.map((entry) => Prisma.sql`
    (
      ${randomUUID()},
      ${entry.studentAnswerId},
      'TEACHER'::"GradedBy",
      ${entry.graderId},
      ${entry.marksAwarded},
      ${entry.maxMarks},
      ${entry.feedback ?? null},
      ${now},
      ${now}
    )
  `);

  return tx.$executeRaw(Prisma.sql`
    INSERT INTO "AnswerGrade" (
      "id",
      "studentAnswerId",
      "gradedBy",
      "graderId",
      "marksAwarded",
      "maxMarks",
      "feedback",
      "createdAt",
      "updatedAt"
    )
    VALUES ${Prisma.join(rows)}
    ON CONFLICT ("studentAnswerId")
    DO UPDATE SET
      "marksAwarded" = EXCLUDED."marksAwarded",
      "maxMarks" = EXCLUDED."maxMarks",
      "feedback" = EXCLUDED."feedback",
      "graderId" = EXCLUDED."graderId",
      "updatedAt" = EXCLUDED."updatedAt"
  `);
}

/**
 * Batch update session statuses based on graded answer counts.
 * Single query to fetch counts, then batch updateMany calls.
 */
export async function updateSessionStatuses(
  tx: Tx,
  sessionIds: string[],
  totalQuestionCount: number,
): Promise<void> {
  if (sessionIds.length === 0) return;

  const sessions = await tx.examSession.findMany({
    where: { id: { in: sessionIds }, status: { notIn: ['GRADED', 'ABSENT'] } },
    select: {
      id: true,
      _count: { select: { studentAnswers: { where: { answerGrade: { isNot: null } } } } },
    },
  });

  const completedIds = sessions
    .filter((s) => s._count.studentAnswers >= totalQuestionCount)
    .map((s) => s.id);
  const inProgressIds = sessions
    .filter((s) => s._count.studentAnswers < totalQuestionCount)
    .map((s) => s.id);

  const updates: Promise<unknown>[] = [];
  if (completedIds.length > 0) {
    updates.push(
      tx.examSession.updateMany({
        where: { id: { in: completedIds } },
        data: { status: 'SUBMITTED' },
      }),
    );
  }
  if (inProgressIds.length > 0) {
    updates.push(
      tx.examSession.updateMany({
        where: { id: { in: inProgressIds } },
        data: { status: 'IN_PROGRESS' },
      }),
    );
  }
  await Promise.all(updates);
}

/**
 * Batch upsert exam results by unique sessionId.
 * Uses raw SQL to avoid N sequential upserts on serverless databases.
 */
export async function batchUpsertExamResults(
  tx: Tx,
  entries: ExamResultEntry[],
): Promise<number> {
  if (entries.length === 0) return 0;

  const CHUNK_SIZE = 500;
  let totalTouched = 0;

  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const chunk = entries.slice(i, i + CHUNK_SIZE);
    totalTouched += await upsertExamResultChunk(tx, chunk);
  }

  return totalTouched;
}

async function upsertExamResultChunk(tx: Tx, entries: ExamResultEntry[]): Promise<number> {
  const now = new Date();

  const rows = entries.map((entry) => Prisma.sql`
    (
      ${randomUUID()},
      ${entry.sessionId},
      ${entry.examId},
      ${entry.studentId},
      ${entry.totalMarks},
      ${entry.obtainedMarks},
      ${entry.percentage},
      ${entry.grade ?? null},
      ${entry.isPassed},
      ${entry.publishedAt ?? null},
      ${now}
    )
  `);

  return tx.$executeRaw(Prisma.sql`
    INSERT INTO "ExamResult" (
      "id",
      "sessionId",
      "examId",
      "studentId",
      "totalMarks",
      "obtainedMarks",
      "percentage",
      "grade",
      "isPassed",
      "publishedAt",
      "updatedAt"
    )
    VALUES ${Prisma.join(rows)}
    ON CONFLICT ("sessionId")
    DO UPDATE SET
      "examId" = EXCLUDED."examId",
      "studentId" = EXCLUDED."studentId",
      "totalMarks" = EXCLUDED."totalMarks",
      "obtainedMarks" = EXCLUDED."obtainedMarks",
      "percentage" = EXCLUDED."percentage",
      "grade" = EXCLUDED."grade",
      "isPassed" = EXCLUDED."isPassed",
      "publishedAt" = EXCLUDED."publishedAt",
      "updatedAt" = EXCLUDED."updatedAt"
  `);
}

/**
 * Recompute rank for all results in the same exam using dense rank by obtained marks.
 */
export async function recomputeExamRanks(tx: Tx, examId: string): Promise<void> {
  await tx.$executeRaw(
    Prisma.sql`
      WITH ranked AS (
        SELECT "id", DENSE_RANK() OVER (ORDER BY "obtainedMarks" DESC) AS computed_rank
        FROM "ExamResult"
        WHERE "examId" = ${examId}
      )
      UPDATE "ExamResult" er
      SET "rank" = ranked.computed_rank,
          "updatedAt" = NOW()
      FROM ranked
      WHERE er."id" = ranked."id"
    `,
  );
}
