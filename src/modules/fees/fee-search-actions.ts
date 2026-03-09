'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';
import { safeFetchAction } from '@/lib/safe-action';

export type SearchableFamily = {
  familyProfileId: string;
  parentName: string;
  relationship: string;
  childrenCount: number;
  childrenNames: string;
};

/**
 * Search family profiles by parent name. Admin-only.
 */
export const searchFamiliesAction = safeFetchAction(async (
  query: string,
): Promise<ActionResult<SearchableFamily[]>> => {
  await requireRole('ADMIN');

  if (!query || query.trim().length < 2) {
    return { success: true, data: [] };
  }

  const term = query.trim();

  const families = await prisma.familyProfile.findMany({
    where: {
      user: {
        isActive: true,
        deletedAt: null,
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
        ],
      },
    },
    include: {
      user: { select: { firstName: true, lastName: true } },
      studentLinks: {
        where: { isActive: true },
        include: {
          studentProfile: {
            select: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
    take: 20,
    orderBy: { user: { firstName: 'asc' } },
  });

  return {
    success: true,
    data: families.map((f) => ({
      familyProfileId: f.id,
      parentName: `${f.user.firstName} ${f.user.lastName}`,
      relationship: f.relationship,
      childrenCount: f.studentLinks.length,
      childrenNames: f.studentLinks
        .map((l) => `${l.studentProfile.user.firstName} ${l.studentProfile.user.lastName}`)
        .join(', '),
    })),
  };
});
