'use server';

// ============================================
// Family Module — Student Search for Admin Linking
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';

export type SearchableStudent = {
  studentProfileId: string;
  studentName: string;
  className: string;
  sectionName: string;
  rollNumber: string;
  registrationNo: string;
};

/**
 * Search active students by name/roll/reg for linking. Admin-only.
 */
export async function searchStudentsForLinkingAction(
  query: string,
): Promise<ActionResult<SearchableStudent[]>> {
  await requireRole('ADMIN');

  if (!query || query.trim().length < 2) {
    return { success: true, data: [] };
  }

  const term = query.trim();

  const students = await prisma.studentProfile.findMany({
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
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
    take: 20,
    orderBy: { user: { firstName: 'asc' } },
  });

  // Also search by rollNumber / registrationNo
  const byRoll = await prisma.studentProfile.findMany({
    where: {
      user: { isActive: true, deletedAt: null },
      OR: [
        { rollNumber: { contains: term, mode: 'insensitive' } },
        { registrationNo: { contains: term, mode: 'insensitive' } },
      ],
    },
    include: {
      user: { select: { firstName: true, lastName: true } },
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
    take: 10,
  });

  // Merge and dedupe
  const allStudents = [...students, ...byRoll];
  const seen = new Set<string>();
  const unique = allStudents.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });

  return {
    success: true,
    data: unique.map((s) => ({
      studentProfileId: s.id,
      studentName: `${s.user.firstName} ${s.user.lastName}`,
      className: s.class.name,
      sectionName: s.section.name,
      rollNumber: s.rollNumber,
      registrationNo: s.registrationNo,
    })),
  };
}
