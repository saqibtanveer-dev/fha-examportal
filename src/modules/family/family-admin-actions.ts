'use server';

// ============================================
// Family Admin Actions — Link/Unlink Students
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import { linkStudentSchema, unlinkStudentSchema } from '@/validations/family-schemas';
import type { ActionResult } from '@/types/action-result';
import type { LinkStudentInput, UnlinkStudentInput } from '@/validations/family-schemas';
import { MAX_CHILDREN_PER_FAMILY } from './family.constants';

import { logger } from '@/lib/logger';
/**
 * Link a student to a family profile. Admin-only.
 */
export const linkStudentToFamilyAction = safeAction(
  async function linkStudentToFamily(input: LinkStudentInput): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('ADMIN');

    const parsed = linkStudentSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' };
    }

    const { familyProfileId, studentProfileId, relationship, isPrimary } = parsed.data;

    // Verify family profile exists
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { id: familyProfileId },
      include: { studentLinks: { where: { isActive: true } } },
    });
    if (!familyProfile) {
      return { success: false, error: 'Family profile not found' };
    }

    // Check max children limit
    if (familyProfile.studentLinks.length >= MAX_CHILDREN_PER_FAMILY) {
      return { success: false, error: `Maximum ${MAX_CHILDREN_PER_FAMILY} children per family` };
    }

    // Verify student profile exists and is active
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { user: { select: { isActive: true } } },
    });
    if (!studentProfile) {
      return { success: false, error: 'Student profile not found' };
    }
    if (!studentProfile.user.isActive) {
      return { success: false, error: 'Cannot link to an inactive student' };
    }

    // Check for existing link (might be soft-deactivated)
    const existingLink = await prisma.familyStudentLink.findUnique({
      where: {
        familyProfileId_studentProfileId: { familyProfileId, studentProfileId },
      },
    });

    if (existingLink) {
      if (existingLink.isActive) {
        return { success: false, error: 'This student is already linked to this family' };
      }
      // Reactivate soft-deactivated link
      const reactivated = await prisma.familyStudentLink.update({
        where: { id: existingLink.id },
        data: { isActive: true, relationship, isPrimary },
      });
      return { success: true, data: { id: reactivated.id } };
    }

    // If isPrimary, reset other primary links for this student
    if (isPrimary) {
      await prisma.familyStudentLink.updateMany({
        where: { studentProfileId, isPrimary: true, isActive: true },
        data: { isPrimary: false },
      });
    }

    const link = await prisma.familyStudentLink.create({
      data: {
        familyProfileId,
        studentProfileId,
        relationship,
        isPrimary,
        linkedById: session.user.id,
      },
    });

    createAuditLog(
      session.user.id, 'LINK_FAMILY_STUDENT', 'FAMILY_STUDENT_LINK', link.id,
      { familyProfileId, studentProfileId, relationship },
    ).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidatePath('/admin/users');
    return { success: true, data: { id: link.id } };
  },
);

/**
 * Unlink (soft-deactivate) a student from a family profile. Admin-only.
 */
export const unlinkStudentFromFamilyAction = safeAction(
  async function unlinkStudentFromFamily(input: UnlinkStudentInput): Promise<ActionResult> {
    const session = await requireRole('ADMIN');

    const parsed = unlinkStudentSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' };
    }

    const { familyProfileId, studentProfileId } = parsed.data;

    const link = await prisma.familyStudentLink.findUnique({
      where: {
        familyProfileId_studentProfileId: { familyProfileId, studentProfileId },
      },
    });

    if (!link || !link.isActive) {
      return { success: false, error: 'Active link not found' };
    }

    await prisma.familyStudentLink.update({
      where: { id: link.id },
      data: { isActive: false },
    });

    createAuditLog(
      session.user.id, 'UNLINK_FAMILY_STUDENT', 'FAMILY_STUDENT_LINK', link.id,
      { familyProfileId, studentProfileId },
    ).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidatePath('/admin/users');
    return { success: true };
  },
);
