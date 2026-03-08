'use server';

// ============================================
// Family Module — Child Diary Fetch Actions
// Reuses shared diary queries (getDiaryEntriesByClassSection, getDiaryEntriesToday)
// Returns same shape as student diary actions → enables full component reuse
// ============================================

import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/utils/serialize';
import {
  getDiaryEntriesByClassSection,
  getDiaryEntriesToday,
} from '@/modules/diary/diary-queries';
import { getTodayDateString } from '@/modules/diary/diary.utils';
import type { ActionResult } from '@/types/action-result';
import { safeFetchAction } from '@/lib/safe-action';

async function getCurrentAcademicSessionId(): Promise<string> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  if (!session) throw new Error('No active academic session found');
  return session.id;
}

/**
 * Fetch diary entries for a child — same shape as student diary (DiaryEntryForStudent).
 */
export const fetchChildDiaryForFamilyAction = safeFetchAction(async (
  studentProfileId: string,
  startDate: string,
  endDate: string,
  subjectId?: string,
) => {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { classId: true, sectionId: true },
  });
  if (!studentProfile) return [];

  const academicSessionId = await getCurrentAcademicSessionId();
  const entries = await getDiaryEntriesByClassSection(
    studentProfile.classId,
    studentProfile.sectionId,
    academicSessionId,
    startDate,
    endDate,
    subjectId,
  );
  return serialize(entries);
});

/**
 * Fetch today's diary entries for a child — same shape as student today diary.
 */
export const fetchChildTodayDiaryForFamilyAction = safeFetchAction(async (
  studentProfileId: string,
) => {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { classId: true, sectionId: true },
  });
  if (!studentProfile) return [];

  const academicSessionId = await getCurrentAcademicSessionId();
  const today = getTodayDateString();
  const entries = await getDiaryEntriesToday(
    studentProfile.classId,
    studentProfile.sectionId,
    academicSessionId,
    today,
  );
  return serialize(entries);
});

/**
 * Mark a diary entry as read by the family (creates receipt on behalf of student).
 */
export async function markChildDiaryAsReadAction(
  studentProfileId: string,
  diaryEntryId: string,
): Promise<ActionResult> {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  await prisma.diaryReadReceipt.upsert({
    where: {
      diaryEntryId_studentProfileId: { diaryEntryId, studentProfileId },
    },
    create: { diaryEntryId, studentProfileId },
    update: {},
  });

  return { success: true };
}
