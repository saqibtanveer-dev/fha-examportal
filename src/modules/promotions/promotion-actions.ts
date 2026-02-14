'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import {
  yearTransitionSchema,
  type YearTransitionInput,
} from '@/validations/organization-schemas';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';

// ============================================
// Execute Full Year Transition
// ============================================

export async function executeYearTransitionAction(
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
    for (const classPromotion of promotions) {
      const { fromClassId, toClassId, defaultSectionId, entries } = classPromotion;

      // Get "from" class info for audit
      const fromClass = await tx.class.findUnique({
        where: { id: fromClassId },
        select: { grade: true, name: true },
      });

      for (const entry of entries) {
        const { studentProfileId, action, toSectionId } = entry;

        // Get current student profile
        const studentProfile = await tx.studentProfile.findUnique({
          where: { id: studentProfileId },
          select: { classId: true, sectionId: true, userId: true },
        });
        if (!studentProfile || studentProfile.classId !== fromClassId) continue;

        if (action === 'PROMOTE' && toClassId) {
          // Determine target section
          const targetSectionId = toSectionId || defaultSectionId;
          if (!targetSectionId) continue;

          // Verify target section belongs to target class
          const targetSection = await tx.section.findFirst({
            where: { id: targetSectionId, classId: toClassId },
          });
          if (!targetSection) continue;

          // Create promotion record
          await tx.studentPromotion.create({
            data: {
              studentProfileId,
              academicSessionId,
              fromClassId,
              fromSectionId: studentProfile.sectionId,
              toClassId,
              toSectionId: targetSectionId,
              status: 'PROMOTED',
              promotedById: session.user.id,
            },
          });

          // Update student profile to new class/section
          await tx.studentProfile.update({
            where: { id: studentProfileId },
            data: {
              classId: toClassId,
              sectionId: targetSectionId,
              status: 'ACTIVE', // Reset to ACTIVE in new class
            },
          });

          totalPromoted++;
        } else if (action === 'GRADUATE') {
          // Create graduation record
          await tx.studentPromotion.create({
            data: {
              studentProfileId,
              academicSessionId,
              fromClassId,
              fromSectionId: studentProfile.sectionId,
              toClassId: null,
              toSectionId: null,
              status: 'GRADUATED',
              remarks: `Graduated from ${fromClass?.name ?? 'Unknown'} (${academicSession.name})`,
              promotedById: session.user.id,
            },
          });

          // Mark student as graduated & inactive
          await tx.studentProfile.update({
            where: { id: studentProfileId },
            data: { status: 'GRADUATED' },
          });

          await tx.user.update({
            where: { id: studentProfile.userId },
            data: { isActive: false },
          });

          totalGraduated++;
        } else if (action === 'HOLD_BACK') {
          // Create hold-back record — student stays in same class
          await tx.studentPromotion.create({
            data: {
              studentProfileId,
              academicSessionId,
              fromClassId,
              fromSectionId: studentProfile.sectionId,
              toClassId: fromClassId,
              toSectionId: toSectionId || studentProfile.sectionId,
              status: 'HELD_BACK',
              remarks: 'Held back to repeat the same class',
              promotedById: session.user.id,
            },
          });

          // Update section if changed, keep status ACTIVE
          if (toSectionId && toSectionId !== studentProfile.sectionId) {
            await tx.studentProfile.update({
              where: { id: studentProfileId },
              data: { sectionId: toSectionId, status: 'ACTIVE' },
            });
          } else {
            await tx.studentProfile.update({
              where: { id: studentProfileId },
              data: { status: 'ACTIVE' },
            });
          }

          totalHeldBack++;
        }
      }
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
}

// ============================================
// Undo Year Transition (Emergency Rollback)
// ============================================

export async function undoYearTransitionAction(
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
    for (const promo of promotions) {
      // Revert student to original class/section
      await tx.studentProfile.update({
        where: { id: promo.studentProfileId },
        data: {
          classId: promo.fromClassId,
          sectionId: promo.fromSectionId,
          status: 'ACTIVE',
        },
      });

      // Re-activate graduated students
      if (promo.status === 'GRADUATED') {
        await tx.user.update({
          where: { id: promo.studentProfile.userId },
          data: { isActive: true },
        });
      }
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
}
