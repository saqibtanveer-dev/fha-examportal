'use server';

// ============================================
// Family Module — Profile & Children Fetch Actions
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';
import type { FamilyProfileWithChildren, LinkedChild } from './family.types';

/**
 * Fetch the current family user's profile with all linked children.
 */
export async function fetchFamilyProfileAction(): Promise<ActionResult<FamilyProfileWithChildren>> {
  const session = await requireRole('FAMILY');

  const profile = await prisma.familyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      studentLinks: {
        where: { isActive: true },
        include: {
          studentProfile: {
            include: {
              user: { select: { firstName: true, lastName: true } },
              class: { select: { name: true } },
              section: { select: { name: true } },
            },
          },
        },
        orderBy: { linkedAt: 'asc' },
      },
    },
  });

  if (!profile) {
    return { success: false, error: 'Family profile not found. Contact admin.' };
  }

  const children: LinkedChild[] = profile.studentLinks.map((link) => ({
    studentProfileId: link.studentProfile.id,
    studentName: `${link.studentProfile.user.firstName} ${link.studentProfile.user.lastName}`,
    className: link.studentProfile.class.name,
    sectionName: link.studentProfile.section.name,
    rollNumber: link.studentProfile.rollNumber,
    registrationNo: link.studentProfile.registrationNo,
    relationship: link.relationship,
    isPrimary: link.isPrimary,
    status: link.studentProfile.status,
    gender: link.studentProfile.gender,
  }));

  return {
    success: true,
    data: {
      id: profile.id,
      userId: profile.userId,
      relationship: profile.relationship,
      occupation: profile.occupation,
      address: profile.address,
      emergencyPhone: profile.emergencyPhone,
      children,
    },
  };
}

/**
 * Fetch just the list of linked children (lightweight for selectors).
 */
export async function fetchLinkedChildrenAction(): Promise<ActionResult<LinkedChild[]>> {
  const session = await requireRole('FAMILY');

  const profile = await prisma.familyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      studentLinks: {
        where: { isActive: true },
        include: {
          studentProfile: {
            include: {
              user: { select: { firstName: true, lastName: true } },
              class: { select: { name: true } },
              section: { select: { name: true } },
            },
          },
        },
        orderBy: { linkedAt: 'asc' },
      },
    },
  });

  if (!profile) {
    return { success: false, error: 'Family profile not found.' };
  }

  const children: LinkedChild[] = profile.studentLinks.map((link) => ({
    studentProfileId: link.studentProfile.id,
    studentName: `${link.studentProfile.user.firstName} ${link.studentProfile.user.lastName}`,
    className: link.studentProfile.class.name,
    sectionName: link.studentProfile.section.name,
    rollNumber: link.studentProfile.rollNumber,
    registrationNo: link.studentProfile.registrationNo,
    relationship: link.relationship,
    isPrimary: link.isPrimary,
    status: link.studentProfile.status,
    gender: link.studentProfile.gender,
  }));

  return { success: true, data: children };
}
