'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import type { Prisma } from '@prisma/client';
import {
  yearTransitionSchema,
  type YearTransitionInput,
} from '@/validations/organization-schemas';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { safeAction } from '@/lib/safe-action';
import type { ActionResult } from '@/types/action-result';

// ============================================
// Execute Full Year Transition
// ============================================

export const executeYearTransitionAction = safeAction(async function executeYearTransitionAction(
  input: YearTransitionInput,
): Promise<ActionResult<{ promoted: number; graduated: number; heldBack: number }>> {
  const session = await requireRole('ADMIN');
  const parsed = yearTransitionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { academicSessionId, promotions } = parsed.data;

  // Validate academic session exists
  const academicSession = await prisma.academicSession.findUnique({
    where: { id: academicSessionId },
  });
  if (!academicSession) {
    return { success: false, error: 'Academic session not found' };
  }

  // Check if transition already done for this session
  const existingCount = await prisma.studentPromotion.count({
    where: { academicSessionId },
  });
  if (existingCount > 0) {
    return {
      success: false,
      error: 'Year transition already executed for this session. Cannot run again.',
    };
  }

  let totalPromoted = 0;
  let totalGraduated = 0;
  let totalHeldBack = 0;

  // Execute all promotions in a single transaction
  await prisma.$transaction(async (tx) => {
    // ── PRE-FETCH PHASE: batch-load all entities (eliminates N+1) ──
    const allStudentIds = promotions.flatMap((cp) => cp.entries.map((e) => e.studentProfileId));
    const allStudentProfiles = await tx.studentProfile.findMany({
      where: { id: { in: allStudentIds } },
      select: { id: true, classId: true, sectionId: true, userId: true },
    });
    const profileMap = new Map(allStudentProfiles.map((p) => [p.id, p]));

    const allSectionIds = [
      ...new Set(
        promotions.flatMap((cp) =>
          [cp.defaultSectionId, ...cp.entries.map((e) => e.toSectionId)].filter(Boolean),
        ),
      ),
    ] as string[];
    const allSections = await tx.section.findMany({
      where: { id: { in: allSectionIds } },
      select: { id: true, classId: true },
    });
    const sectionMap = new Map(allSections.map((s) => [s.id, s]));

    const allClassIds = promotions.map((cp) => cp.fromClassId);
    const allClasses = await tx.class.findMany({
      where: { id: { in: allClassIds } },
      select: { id: true, grade: true, name: true },
    });
    const classMap = new Map(allClasses.map((c) => [c.id, c]));

    // ── PROCESSING PHASE: collect all write operations ──
    const promotionRecords: Prisma.StudentPromotionCreateManyInput[] = [];
    const profileUpdates: { id: string; data: Record<string, unknown> }[] = [];
    const graduatedUserIds: string[] = [];

    for (const classPromotion of promotions) {
      const { fromClassId, toClassId, defaultSectionId, entries } = classPromotion;
      const fromClass = classMap.get(fromClassId);

      for (const entry of entries) {
        const { studentProfileId, action, toSectionId } = entry;
        const studentProfile = profileMap.get(studentProfileId);
        if (!studentProfile || studentProfile.classId !== fromClassId) continue;

        if (action === 'PROMOTE' && toClassId) {
          const targetSectionId = toSectionId || defaultSectionId;
          if (!targetSectionId) continue;

          const targetSection = sectionMap.get(targetSectionId);
          if (!targetSection || targetSection.classId !== toClassId) continue;

          promotionRecords.push({
            studentProfileId,
            academicSessionId,
            fromClassId,
            fromSectionId: studentProfile.sectionId,
            toClassId,
            toSectionId: targetSectionId,
            status: 'PROMOTED',
            promotedById: session.user.id,
          });

          profileUpdates.push({
            id: studentProfileId,
            data: { classId: toClassId, sectionId: targetSectionId, status: 'ACTIVE' },
          });

          totalPromoted++;
        } else if (action === 'GRADUATE') {
          promotionRecords.push({
            studentProfileId,
            academicSessionId,
            fromClassId,
            fromSectionId: studentProfile.sectionId,
            toClassId: null,
            toSectionId: null,
            status: 'GRADUATED',
            remarks: `Graduated from ${fromClass?.name ?? 'Unknown'} (${academicSession.name})`,
            promotedById: session.user.id,
          });

          profileUpdates.push({
            id: studentProfileId,
            data: { status: 'GRADUATED' },
          });

          graduatedUserIds.push(studentProfile.userId);
          totalGraduated++;
        } else if (action === 'HOLD_BACK') {
          promotionRecords.push({
            studentProfileId,
            academicSessionId,
            fromClassId,
            fromSectionId: studentProfile.sectionId,
            toClassId: fromClassId,
            toSectionId: toSectionId || studentProfile.sectionId,
            status: 'HELD_BACK',
            remarks: 'Held back to repeat the same class',
            promotedById: session.user.id,
          });

          profileUpdates.push({
            id: studentProfileId,
            data: {
              sectionId: toSectionId && toSectionId !== studentProfile.sectionId
                ? toSectionId
                : studentProfile.sectionId,
              status: 'ACTIVE',
            },
          });

          totalHeldBack++;
        }
      }
    }

    // ── WRITE PHASE: batch creates, targeted updates ──
    if (promotionRecords.length > 0) {
      await tx.studentPromotion.createMany({ data: promotionRecords });
    }

    // Profile updates must be individual (different values per student)
    await Promise.all(
      profileUpdates.map((u) =>
        tx.studentProfile.update({ where: { id: u.id }, data: u.data }),
      ),
    );

    // Batch deactivate graduated users
    if (graduatedUserIds.length > 0) {
      await tx.user.updateMany({
        where: { id: { in: graduatedUserIds } },
        data: { isActive: false },
      });
    }

    // Send notifications to all promoted/graduated students
    const allPromos = await tx.studentPromotion.findMany({
      where: { academicSessionId },
      include: { studentProfile: { select: { userId: true } } },
    });

    const notifications = allPromos.map((p) => ({
      userId: p.studentProfile.userId,
      title:
        p.status === 'GRADUATED'
          ? '🎓 Congratulations! You have graduated!'
          : p.status === 'PROMOTED'
            ? '📚 You have been promoted to the next class!'
            : '📋 You have been assigned to repeat the current class.',
      message:
        p.status === 'GRADUATED'
          ? `You have graduated in academic session ${academicSession.name}. We wish you all the best!`
          : p.status === 'PROMOTED'
            ? `You have been promoted for academic session ${academicSession.name}.`
            : `You will repeat the current class for academic session ${academicSession.name}.`,
      type: 'SYSTEM' as const,
    }));

    if (notifications.length > 0) {
      await tx.notification.createMany({ data: notifications });
    }
  });

  // Audit log
  createAuditLog(
    session.user.id,
    'YEAR_TRANSITION',
    'ACADEMIC_SESSION',
    academicSessionId,
    { promoted: totalPromoted, graduated: totalGraduated, heldBack: totalHeldBack },
  ).catch(() => {});

  revalidatePath('/admin');
  revalidatePath('/admin/year-transition');
  revalidatePath('/admin/users');
  revalidatePath('/admin/classes');

  return {
    success: true,
    data: { promoted: totalPromoted, graduated: totalGraduated, heldBack: totalHeldBack },
  };
});

// ============================================
// Undo Year Transition (Emergency Rollback)
// ============================================

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

  await prisma.$transaction(async (tx) => {
    // Batch revert all student profiles (individual updates — different values per student)
    await Promise.all(
      promotions.map((promo) =>
        tx.studentProfile.update({
          where: { id: promo.studentProfileId },
          data: {
            classId: promo.fromClassId,
            sectionId: promo.fromSectionId,
            status: 'ACTIVE',
          },
        }),
      ),
    );

    // Batch re-activate graduated users
    const graduatedUserIds = promotions
      .filter((p) => p.status === 'GRADUATED')
      .map((p) => p.studentProfile.userId);

    if (graduatedUserIds.length > 0) {
      await tx.user.updateMany({
        where: { id: { in: graduatedUserIds } },
        data: { isActive: true },
      });
    }

    // Delete all promotion records for this session
    await tx.studentPromotion.deleteMany({
      where: { academicSessionId },
    });
  });

  createAuditLog(
    session.user.id,
    'UNDO_YEAR_TRANSITION',
    'ACADEMIC_SESSION',
    academicSessionId,
    { undone: promotions.length },
  ).catch(() => {});

  revalidatePath('/admin');
  revalidatePath('/admin/year-transition');
  revalidatePath('/admin/users');

  return { success: true };
});
