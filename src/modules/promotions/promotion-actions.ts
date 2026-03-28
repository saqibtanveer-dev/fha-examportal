'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { Prisma } from '@prisma/client';
import {
  undoYearTransitionSchema,
  yearTransitionSchema,
  type UndoYearTransitionInput,
  type YearTransitionInput,
} from '@/validations/organization-schemas';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { safeAction } from '@/lib/safe-action';
import type { ActionResult } from '@/types/action-result';
import { lockTransactionKeys, runSerializableTransaction } from '@/lib/transaction-locks';
import { z } from 'zod';

import { logger } from '@/lib/logger';

const PROCESS_CHUNK_SIZE = 500;
const PROFILE_UPDATE_CHUNK_SIZE = 500;
const PREFETCH_CHUNK_SIZE = 3000;
const TX_TIMEOUT = 60_000;
const TX_MAX_WAIT = 20_000;

type TransitionStatus = 'PROMOTED' | 'GRADUATED' | 'HELD_BACK';

type PlannedTransition = {
  fromClassId: string;
  defaultToClassId?: string;
  defaultSectionId?: string;
  studentProfileId: string;
  action: 'PROMOTE' | 'HOLD_BACK' | 'GRADUATE';
  entryToClassId?: string;
  entryToSectionId?: string;
};

type ExecuteSummary = {
  promoted: number;
  graduated: number;
  heldBack: number;
  skipped: number;
  processed: number;
};

type ProfileTransitionUpdate = {
  studentProfileId: string;
  classId: string;
  sectionId: string;
  status: 'ACTIVE' | 'GRADUATED';
};

type TransitionProfileRow = {
  id: string;
  classId: string;
  sectionId: string;
  userId: string;
};

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function getNotificationCopy(status: TransitionStatus, sessionName: string): { title: string; message: string } {
  if (status === 'GRADUATED') {
    return {
      title: 'Year transition updated: graduated',
      message: `You have been marked as graduated for academic session ${sessionName}.`,
    };
  }
  if (status === 'PROMOTED') {
    return {
      title: 'Year transition updated: promoted',
      message: `You have been promoted for academic session ${sessionName}.`,
    };
  }
  return {
    title: 'Year transition updated: held back',
    message: `You will repeat the current class for academic session ${sessionName}.`,
  };
}

async function batchUpdateStudentProfiles(
  tx: Prisma.TransactionClient,
  updates: ProfileTransitionUpdate[],
): Promise<void> {
  if (updates.length === 0) return;

  const chunked = chunkArray(updates, PROFILE_UPDATE_CHUNK_SIZE);
  for (const chunk of chunked) {
    const rows = chunk.map((entry) => Prisma.sql`
      (
        ${entry.studentProfileId}::uuid,
        ${entry.classId}::uuid,
        ${entry.sectionId}::uuid,
        ${entry.status}::"StudentStatus"
      )
    `);

    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudentProfile" AS sp
      SET
        "classId" = v."classId",
        "sectionId" = v."sectionId",
        "status" = v."status",
        "updatedAt" = NOW()
      FROM (
        VALUES ${Prisma.join(rows)}
      ) AS v("id", "classId", "sectionId", "status")
      WHERE sp."id" = v."id"
    `);
  }
}

async function fetchProfilesByIds(profileIds: string[]): Promise<TransitionProfileRow[]> {
  if (profileIds.length === 0) return [];

  const rows: TransitionProfileRow[] = [];
  const chunked = chunkArray(profileIds, PREFETCH_CHUNK_SIZE);

  for (const chunk of chunked) {
    const part = await prisma.studentProfile.findMany({
      where: { id: { in: chunk } },
      select: { id: true, classId: true, sectionId: true, userId: true },
    });
    rows.push(...part);
  }

  return rows;
}

async function fetchProcessedStudentIds(
  academicSessionId: string,
  profileIds: string[],
): Promise<Set<string>> {
  if (profileIds.length === 0) return new Set();

  const processed = new Set<string>();
  const chunked = chunkArray(profileIds, PREFETCH_CHUNK_SIZE);

  for (const chunk of chunked) {
    const rows = await prisma.studentPromotion.findMany({
      where: {
        academicSessionId,
        studentProfileId: { in: chunk },
      },
      select: { studentProfileId: true },
    });

    for (const row of rows) {
      processed.add(row.studentProfileId);
    }
  }

  return processed;
}

export const executeYearTransitionAction = safeAction(async function executeYearTransitionAction(
  input: YearTransitionInput,
): Promise<ActionResult<ExecuteSummary>> {
  const session = await requireRole('ADMIN');
  const parsed = yearTransitionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { academicSessionId, promotions } = parsed.data;

  const planned: PlannedTransition[] = promotions.flatMap((classPromotion) =>
    classPromotion.entries.map((entry) => ({
      fromClassId: classPromotion.fromClassId,
      defaultToClassId: classPromotion.toClassId,
      defaultSectionId: classPromotion.defaultSectionId,
      studentProfileId: entry.studentProfileId,
      action: entry.action,
      entryToClassId: entry.toClassId,
      entryToSectionId: entry.toSectionId,
    })),
  );

  if (planned.length === 0) {
    return { success: false, error: 'No students selected for transition' };
  }

  // Validate academic session exists
  const academicSession = await prisma.academicSession.findUnique({
    where: { id: academicSessionId },
  });
  if (!academicSession) {
    return { success: false, error: 'Academic session not found' };
  }

  const chunked = chunkArray(planned, PROCESS_CHUNK_SIZE);
  const totals: ExecuteSummary = { promoted: 0, graduated: 0, heldBack: 0, skipped: 0, processed: 0 };

  const allProfileIds = [...new Set(planned.map((item) => item.studentProfileId))];
  const [allProfiles, processedSet, targetClasses, targetSections] = await Promise.all([
    fetchProfilesByIds(allProfileIds),
    fetchProcessedStudentIds(academicSessionId, allProfileIds),
    prisma.class.findMany({
      where: {
        id: {
          in: [
            ...new Set(
              planned
                .flatMap((item) => [item.entryToClassId, item.defaultToClassId])
                .filter((id): id is string => Boolean(id)),
            ),
          ],
        },
        isActive: true,
      },
      select: { id: true },
    }),
    prisma.section.findMany({
      where: {
        id: {
          in: [
            ...new Set(
              planned
                .flatMap((item) => [item.entryToSectionId, item.defaultSectionId])
                .filter((id): id is string => Boolean(id)),
            ),
          ],
        },
      },
      select: { id: true, classId: true, isActive: true },
    }),
  ]);

  const profileMap = new Map(allProfiles.map((profile) => [profile.id, profile]));
  const targetClassSet = new Set(targetClasses.map((row) => row.id));
  const targetSectionMap = new Map(targetSections.map((row) => [row.id, row]));

  for (const chunk of chunked) {
    const partial = await runSerializableTransaction(
      async (tx) => {
        await lockTransactionKeys(tx, [`year-transition:${academicSessionId}`]);

        const createRecords: Prisma.StudentPromotionCreateManyInput[] = [];
        const profileUpdates: ProfileTransitionUpdate[] = [];
        const deactivateUserIds = new Set<string>();
        const notifications: Prisma.NotificationCreateManyInput[] = [];

        const counters: ExecuteSummary = { promoted: 0, graduated: 0, heldBack: 0, skipped: 0, processed: 0 };

        for (const item of chunk) {
          const profile = profileMap.get(item.studentProfileId);
          if (!profile) {
            counters.skipped += 1;
            continue;
          }
          if (processedSet.has(item.studentProfileId)) {
            counters.skipped += 1;
            continue;
          }
          if (profile.classId !== item.fromClassId) {
            counters.skipped += 1;
            continue;
          }

          if (item.action === 'GRADUATE') {
            createRecords.push({
              studentProfileId: item.studentProfileId,
              academicSessionId,
              fromClassId: item.fromClassId,
              fromSectionId: profile.sectionId,
              toClassId: null,
              toSectionId: null,
              status: 'GRADUATED',
              remarks: `Graduated (${academicSession.name})`,
              promotedById: session.user.id,
            });

            profileUpdates.push({
              studentProfileId: item.studentProfileId,
              classId: profile.classId,
              sectionId: profile.sectionId,
              status: 'GRADUATED',
            });

            deactivateUserIds.add(profile.userId);
            processedSet.add(item.studentProfileId);
            counters.graduated += 1;
            counters.processed += 1;

            const copy = getNotificationCopy('GRADUATED', academicSession.name);
            notifications.push({ userId: profile.userId, title: copy.title, message: copy.message, type: 'SYSTEM' });
            continue;
          }

          if (item.action === 'HOLD_BACK') {
            const holdSectionId = item.entryToSectionId ?? profile.sectionId;
            const holdSection = targetSectionMap.get(holdSectionId);
            if (holdSection && holdSection.classId !== item.fromClassId) {
              counters.skipped += 1;
              continue;
            }

            createRecords.push({
              studentProfileId: item.studentProfileId,
              academicSessionId,
              fromClassId: item.fromClassId,
              fromSectionId: profile.sectionId,
              toClassId: item.fromClassId,
              toSectionId: holdSectionId,
              status: 'HELD_BACK',
              remarks: 'Held back to repeat the same class',
              promotedById: session.user.id,
            });

            profileUpdates.push({
              studentProfileId: item.studentProfileId,
              classId: item.fromClassId,
              sectionId: holdSectionId,
              status: 'ACTIVE',
            });

            processedSet.add(item.studentProfileId);
            counters.heldBack += 1;
            counters.processed += 1;
            const copy = getNotificationCopy('HELD_BACK', academicSession.name);
            notifications.push({ userId: profile.userId, title: copy.title, message: copy.message, type: 'SYSTEM' });
            continue;
          }

          const targetClassId = item.entryToClassId ?? item.defaultToClassId;
          if (!targetClassId || !targetClassSet.has(targetClassId)) {
            counters.skipped += 1;
            continue;
          }

          const targetSectionId = item.entryToSectionId ?? item.defaultSectionId;
          if (!targetSectionId) {
            counters.skipped += 1;
            continue;
          }

          const section = targetSectionMap.get(targetSectionId);
          if (!section || !section.isActive || section.classId !== targetClassId) {
            counters.skipped += 1;
            continue;
          }

          createRecords.push({
            studentProfileId: item.studentProfileId,
            academicSessionId,
            fromClassId: item.fromClassId,
            fromSectionId: profile.sectionId,
            toClassId: targetClassId,
            toSectionId: targetSectionId,
            status: 'PROMOTED',
            promotedById: session.user.id,
          });

          profileUpdates.push({
            studentProfileId: item.studentProfileId,
            classId: targetClassId,
            sectionId: targetSectionId,
            status: 'ACTIVE',
          });

          processedSet.add(item.studentProfileId);
          counters.promoted += 1;
          counters.processed += 1;
          const copy = getNotificationCopy('PROMOTED', academicSession.name);
          notifications.push({ userId: profile.userId, title: copy.title, message: copy.message, type: 'SYSTEM' });
        }

        if (createRecords.length > 0) {
          await tx.studentPromotion.createMany({ data: createRecords });
        }

        await batchUpdateStudentProfiles(tx, profileUpdates);

        if (deactivateUserIds.size > 0) {
          await tx.user.updateMany({
            where: { id: { in: [...deactivateUserIds] } },
            data: { isActive: false },
          });
        }

        if (notifications.length > 0) {
          await tx.notification.createMany({ data: notifications });
        }

        return counters;
      },
      2,
      { timeout: TX_TIMEOUT, maxWait: TX_MAX_WAIT },
    );

    totals.promoted += partial.promoted;
    totals.graduated += partial.graduated;
    totals.heldBack += partial.heldBack;
    totals.skipped += partial.skipped;
    totals.processed += partial.processed;
  }

  // Audit log
  createAuditLog(
    session.user.id,
    'YEAR_TRANSITION',
    'ACADEMIC_SESSION',
    academicSessionId,
    {
      promoted: totals.promoted,
      graduated: totals.graduated,
      heldBack: totals.heldBack,
      skipped: totals.skipped,
      processed: totals.processed,
    },
  ).catch((err) => logger.error({ err }, 'Audit log failed'));

  revalidatePath('/admin');
  revalidatePath('/admin/year-transition');
  revalidatePath('/admin/users');
  revalidatePath('/admin/classes');

  return {
    success: true,
    data: totals,
  };
});

export const undoYearTransitionAction = safeAction(async function undoYearTransitionAction(
  academicSessionId: string,
): Promise<ActionResult> {
  const session = await requireRole('ADMIN');

  const promotions = await prisma.studentPromotion.findMany({
    where: { academicSessionId },
    include: { studentProfile: { select: { userId: true } } },
  });

  if (promotions.length === 0) {
    return { success: false, error: 'No promotions found for this session to undo' };
  }

  await runSerializableTransaction(
    async (tx) => {
      await lockTransactionKeys(tx, [`year-transition:${academicSessionId}`]);

      await tx.$executeRaw(Prisma.sql`
        UPDATE "StudentProfile" AS sp
        SET
          "classId" = promo."fromClassId",
          "sectionId" = promo."fromSectionId",
          "status" = 'ACTIVE'::"StudentStatus",
          "updatedAt" = NOW()
        FROM "StudentPromotion" AS promo
        WHERE
          promo."academicSessionId" = ${academicSessionId}
          AND sp."id" = promo."studentProfileId"
      `);

      const graduatedUserIds = promotions
        .filter((promo) => promo.status === 'GRADUATED')
        .map((promo) => promo.studentProfile.userId);

      if (graduatedUserIds.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: graduatedUserIds } },
          data: { isActive: true },
        });
      }

      await tx.studentPromotion.deleteMany({ where: { academicSessionId } });
    },
    2,
    { timeout: TX_TIMEOUT, maxWait: TX_MAX_WAIT },
  );

  createAuditLog(
    session.user.id,
    'UNDO_YEAR_TRANSITION',
    'ACADEMIC_SESSION',
    academicSessionId,
    { undone: promotions.length },
  ).catch((err) => logger.error({ err }, 'Audit log failed'));

  revalidatePath('/admin');
  revalidatePath('/admin/year-transition');
  revalidatePath('/admin/users');

  return { success: true };
});

export const undoSelectedYearTransitionAction = safeAction(async function undoSelectedYearTransitionAction(
  input: UndoYearTransitionInput,
): Promise<ActionResult<{ undone: number }>> {
  const session = await requireRole('ADMIN');
  const parsed = undoYearTransitionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { academicSessionId, promotionIds } = parsed.data;

  const promotions = await prisma.studentPromotion.findMany({
    where: { id: { in: promotionIds }, academicSessionId },
    include: { studentProfile: { select: { userId: true } } },
  });

  if (promotions.length === 0) {
    return { success: false, error: 'No matching transitions found to undo' };
  }

  await runSerializableTransaction(
    async (tx) => {
      await lockTransactionKeys(tx, [`year-transition:${academicSessionId}`]);

      await tx.$executeRaw(Prisma.sql`
        UPDATE "StudentProfile" AS sp
        SET
          "classId" = promo."fromClassId",
          "sectionId" = promo."fromSectionId",
          "status" = 'ACTIVE'::"StudentStatus",
          "updatedAt" = NOW()
        FROM "StudentPromotion" AS promo
        WHERE
          promo."id" IN (${Prisma.join(promotions.map((promo) => Prisma.sql`${promo.id}::uuid`))})
          AND sp."id" = promo."studentProfileId"
      `);

      const graduatedUserIds = promotions
        .filter((promo) => promo.status === 'GRADUATED')
        .map((promo) => promo.studentProfile.userId);

      if (graduatedUserIds.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: graduatedUserIds } },
          data: { isActive: true },
        });
      }

      await tx.studentPromotion.deleteMany({ where: { id: { in: promotions.map((promo) => promo.id) } } });
    },
    2,
    { timeout: TX_TIMEOUT, maxWait: TX_MAX_WAIT },
  );

  createAuditLog(
    session.user.id,
    'UNDO_YEAR_TRANSITION_PARTIAL',
    'ACADEMIC_SESSION',
    academicSessionId,
    { undone: promotions.length, promotionIds },
  ).catch((err) => logger.error({ err }, 'Audit log failed'));

  revalidatePath('/admin');
  revalidatePath('/admin/year-transition');
  revalidatePath('/admin/users');
  revalidatePath('/admin/classes');

  return { success: true, data: { undone: promotions.length } };
});

const listSessionTransitionsSchema = z.object({
  academicSessionId: z.string().uuid('Invalid session'),
});

export const listSessionTransitionsAction = safeAction(async function listSessionTransitionsAction(
  input: { academicSessionId: string },
): Promise<ActionResult<Array<{
  id: string;
  studentProfileId: string;
  studentName: string;
  rollNumber: string;
  fromClassName: string;
  fromSectionName: string;
  toClassName: string | null;
  toSectionName: string | null;
  status: string;
  promotedAt: Date;
}>>> {
  await requireRole('ADMIN');
  const parsed = listSessionTransitionsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const rows = await prisma.studentPromotion.findMany({
    where: { academicSessionId: parsed.data.academicSessionId },
    orderBy: { promotedAt: 'desc' },
    include: {
      studentProfile: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      fromClass: { select: { name: true } },
      fromSection: { select: { name: true } },
      toClass: { select: { name: true } },
      toSection: { select: { name: true } },
    },
    take: 5000,
  });

  return {
    success: true,
    data: rows.map((row) => ({
      id: row.id,
      studentProfileId: row.studentProfileId,
      studentName: `${row.studentProfile.user.firstName} ${row.studentProfile.user.lastName}`,
      rollNumber: row.studentProfile.rollNumber,
      fromClassName: row.fromClass.name,
      fromSectionName: row.fromSection.name,
      toClassName: row.toClass?.name ?? null,
      toSectionName: row.toSection?.name ?? null,
      status: row.status,
      promotedAt: row.promotedAt,
    })),
  };
});
