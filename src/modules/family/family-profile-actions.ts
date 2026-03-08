'use server';

// ============================================
// Family Module — Profile & Children Fetch Actions
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';
import type { FamilyProfileWithChildren, LinkedChild } from './family.types';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Fetch the current family user's profile with all linked children.
 */
export const fetchFamilyProfileAction = safeFetchAction(async () : Promise<ActionResult<FamilyProfileWithChildren>> => {
  const session = await requireRole('FAMILY');

  const profile = await prisma.familyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      studentLinks: {
        where: { isActive: true },
        include: {
          studentProfile: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
              class: { select: { id: true, name: true } },
              section: { select: { id: true, name: true } },
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
    userId: link.studentProfile.userId,
    studentName: `${link.studentProfile.user.firstName} ${link.studentProfile.user.lastName}`,
    classId: link.studentProfile.class.id,
    sectionId: link.studentProfile.section.id,
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
});

/**
 * Fetch just the list of linked children (lightweight for selectors).
 */
export const fetchLinkedChildrenAction = safeFetchAction(async () : Promise<ActionResult<LinkedChild[]>> => {
  const session = await requireRole('FAMILY');

  const profile = await prisma.familyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      studentLinks: {
        where: { isActive: true },
        include: {
          studentProfile: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
              class: { select: { id: true, name: true } },
              section: { select: { id: true, name: true } },
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
    userId: link.studentProfile.userId,
    studentName: `${link.studentProfile.user.firstName} ${link.studentProfile.user.lastName}`,
    classId: link.studentProfile.class.id,
    sectionId: link.studentProfile.section.id,
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
});
