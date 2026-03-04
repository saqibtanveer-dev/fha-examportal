'use server';

// ============================================
// Family Module — Child Diary Fetch Actions
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole, assertFamilyStudentAccess } from '@/lib/auth-utils';
import type { ActionResult } from '@/types/action-result';
import type { ChildDiaryEntry } from './family.types';

/**
 * Fetch diary entries for a child with optional filters.
 */
export async function fetchChildDiaryAction(
  studentProfileId: string,
  startDate?: string,
  endDate?: string,
  subjectId?: string,
): Promise<ActionResult<ChildDiaryEntry[]>> {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    select: { classId: true, sectionId: true },
  });

  if (!studentProfile) {
    return { success: false, error: 'Student not found' };
  }

  const where: Record<string, unknown> = {
    classId: studentProfile.classId,
    sectionId: studentProfile.sectionId,
    status: 'PUBLISHED',
    deletedAt: null,
  };

  if (startDate) where.date = { ...(where.date as object ?? {}), gte: new Date(startDate) };
  if (endDate) where.date = { ...(where.date as object ?? {}), lte: new Date(endDate) };
  if (subjectId) where.subjectId = subjectId;

  const entries = await prisma.diaryEntry.findMany({
    where,
    include: {
      subject: { select: { name: true } },
      teacherProfile: {
        include: { user: { select: { firstName: true, lastName: true } } },
      },
      readReceipts: {
        where: { studentProfileId },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { date: 'desc' },
    take: 50,
  });

  return {
    success: true,
    data: entries.map((e) => ({
      id: e.id,
      date: e.date.toISOString(),
      title: e.title,
      content: e.content,
      subjectName: e.subject.name,
      teacherName: `${e.teacherProfile.user.firstName} ${e.teacherProfile.user.lastName}`,
      status: e.status,
      isRead: e.readReceipts.length > 0,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

/**
 * Mark a diary entry as read by the family (creates receipt on behalf of student).
 */
export async function markDiaryAsReadAction(
  studentProfileId: string,
  diaryEntryId: string,
): Promise<ActionResult> {
  const session = await requireRole('FAMILY');
  await assertFamilyStudentAccess(session.user.id, studentProfileId);

  // Check if already read
  const existing = await prisma.diaryReadReceipt.findUnique({
    where: {
      diaryEntryId_studentProfileId: { diaryEntryId, studentProfileId },
    },
  });

  if (existing) {
    return { success: true }; // Already marked
  }

  await prisma.diaryReadReceipt.create({
    data: { diaryEntryId, studentProfileId },
  });

  return { success: true };
}
