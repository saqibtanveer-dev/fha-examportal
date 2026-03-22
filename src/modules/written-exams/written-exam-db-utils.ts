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

  // Build VALUES clause with parameterized inputs
  const values: unknown[] = [];
  const placeholders: string[] = [];

  for (const entry of entries) {
    const offset = values.length;
    placeholders.push(
      `($${offset + 1}, $${offset + 2}, 'TEACHER'::"GradedBy", $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`,
    );
    values.push(
      randomUUID(),                  // id
      entry.studentAnswerId,         // studentAnswerId
      entry.graderId,                // graderId
      entry.marksAwarded,            // marksAwarded
      entry.maxMarks,                // maxMarks
      entry.feedback ?? null,        // feedback
      now,                           // createdAt
      now,                           // updatedAt
    );
  }

  const sql = `
    INSERT INTO "AnswerGrade" ("id", "studentAnswerId", "gradedBy", "graderId", "marksAwarded", "maxMarks", "feedback", "createdAt", "updatedAt")
    VALUES ${placeholders.join(',\n           ')}
    ON CONFLICT ("studentAnswerId")
    DO UPDATE SET
      "marksAwarded" = EXCLUDED."marksAwarded",
      "maxMarks" = EXCLUDED."maxMarks",
      "feedback" = EXCLUDED."feedback",
      "graderId" = EXCLUDED."graderId",
      "updatedAt" = EXCLUDED."updatedAt"
  `;

  const result = await tx.$executeRawUnsafe(sql, ...values);
  return result;
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
