'use server';

// ============================================
// Diary Module — Server Mutation Actions (Write)
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { assertTeacherSubjectSectionAccess, getTeacherProfileIdOrThrow } from '@/lib/authorization-guards';
import { safeAction } from '@/lib/safe-action';
import { actionSuccess, actionError } from '@/types/action-result';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import {
  createDiaryEntrySchema,
  updateDiaryEntrySchema,
  copyDiaryToSectionsSchema,
} from '@/validations/diary-schemas';
import type { ActionResult } from '@/types/action-result';
import { isFutureDate, isToday } from './diary.utils';

// ── Helpers ──

async function getCurrentSessionId(): Promise<string> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  if (!session) throw new Error('No active academic session');
  return session.id;
}

function revalidateDiaryPaths() {
  revalidatePath('/teacher/diary');
  revalidatePath('/student/diary');
  revalidatePath('/principal/diary');
}

// ── Action 1: Create Diary Entry ──

export const createDiaryEntryAction = safeAction(
  async function createDiaryEntryAction(input: unknown): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('TEACHER', 'ADMIN');
    const parsed = createDiaryEntrySchema.safeParse(input);
    if (!parsed.success) return actionError('Invalid input: ' + parsed.error.message);

    const { classId, sectionId, subjectId, date, title, content, status } = parsed.data;

    if (isFutureDate(date)) return actionError('Cannot create diary entries for future dates');

    const teacherProfileId = await getTeacherProfileIdOrThrow(session.user.id);
    const isAdmin = session.user.role === 'ADMIN';

    if (!isAdmin) {
      await assertTeacherSubjectSectionAccess(teacherProfileId, subjectId, classId, sectionId);
    }

    const academicSessionId = await getCurrentSessionId();

    // Upsert: if draft exists for same combo, update it; otherwise create
    const entry = await prisma.diaryEntry.upsert({
      where: {
        teacherProfileId_classId_sectionId_subjectId_date_academicSessionId: {
          teacherProfileId,
          classId,
          sectionId,
          subjectId,
          date: new Date(date),
          academicSessionId,
        },
      },
      create: {
        teacherProfileId,
        classId,
        sectionId,
        subjectId,
        date: new Date(date),
        title,
        content,
        status: status ?? 'PUBLISHED',
        academicSessionId,
      },
      update: {
        title,
        content,
        status: status ?? 'PUBLISHED',
        isEdited: true,
        editedAt: new Date(),
        deletedAt: null, // restore if soft-deleted
      },
    });

    createAuditLog(
      session.user.id,
      'CREATE_DIARY_ENTRY',
      'DiaryEntry',
      entry.id,
      { classId, sectionId, subjectId, date, status },
    ).catch(() => {});

    revalidateDiaryPaths();
    return actionSuccess({ id: entry.id });
  },
);

// ── Action 2: Update Diary Entry ──

export const updateDiaryEntryAction = safeAction(
  async function updateDiaryEntryAction(
    input: unknown & { entryId: string },
  ): Promise<ActionResult> {
    const session = await requireRole('TEACHER', 'ADMIN');
    const { entryId, ...rest } = input as { entryId: string; [key: string]: unknown };
    const parsed = updateDiaryEntrySchema.safeParse(rest);
    if (!parsed.success) return actionError('Invalid input: ' + parsed.error.message);

    const entry = await prisma.diaryEntry.findUnique({
      where: { id: entryId },
      select: { teacherProfileId: true, date: true, deletedAt: true },
    });
    if (!entry || entry.deletedAt) return actionError('Diary entry not found');

    const isAdmin = session.user.role === 'ADMIN';
    if (!isAdmin) {
      const teacherProfileId = await getTeacherProfileIdOrThrow(session.user.id);
      if (entry.teacherProfileId !== teacherProfileId) {
        return actionError('You can only edit your own diary entries');
      }
      const entryDate = entry.date.toISOString().slice(0, 10);
      if (!isToday(entryDate)) {
        return actionError('You can only edit diary entries created today');
      }
    }

    await prisma.diaryEntry.update({
      where: { id: entryId },
      data: {
        ...parsed.data,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    createAuditLog(
      session.user.id,
      'UPDATE_DIARY_ENTRY',
      'DiaryEntry',
      entryId,
      parsed.data,
    ).catch(() => {});

    revalidateDiaryPaths();
    return actionSuccess();
  },
);

// ── Action 3: Delete Diary Entry (Soft) ──

export const deleteDiaryEntryAction = safeAction(
  async function deleteDiaryEntryAction(entryId: string): Promise<ActionResult> {
    const session = await requireRole('TEACHER', 'ADMIN');

    const entry = await prisma.diaryEntry.findUnique({
      where: { id: entryId },
      select: { teacherProfileId: true, date: true, deletedAt: true },
    });
    if (!entry || entry.deletedAt) return actionError('Diary entry not found');

    const isAdmin = session.user.role === 'ADMIN';
    if (!isAdmin) {
      const teacherProfileId = await getTeacherProfileIdOrThrow(session.user.id);
      if (entry.teacherProfileId !== teacherProfileId) {
        return actionError('You can only delete your own diary entries');
      }
      const entryDate = entry.date.toISOString().slice(0, 10);
      if (!isToday(entryDate)) {
        return actionError('You can only delete diary entries created today');
      }
    }

    await prisma.diaryEntry.update({
      where: { id: entryId },
      data: { deletedAt: new Date() },
    });

    createAuditLog(session.user.id, 'DELETE_DIARY_ENTRY', 'DiaryEntry', entryId).catch(() => {});
    revalidateDiaryPaths();
    return actionSuccess();
  },
);

// ── Action 4: Publish Draft ──

export const publishDiaryEntryAction = safeAction(
  async function publishDiaryEntryAction(entryId: string): Promise<ActionResult> {
    const session = await requireRole('TEACHER', 'ADMIN');

    const entry = await prisma.diaryEntry.findUnique({
      where: { id: entryId },
      select: { teacherProfileId: true, status: true, deletedAt: true },
    });
    if (!entry || entry.deletedAt) return actionError('Diary entry not found');
    if (entry.status === 'PUBLISHED') return actionError('Entry is already published');

    const isAdmin = session.user.role === 'ADMIN';
    if (!isAdmin) {
      const teacherProfileId = await getTeacherProfileIdOrThrow(session.user.id);
      if (entry.teacherProfileId !== teacherProfileId) {
        return actionError('You can only publish your own diary entries');
      }
    }

    await prisma.diaryEntry.update({
      where: { id: entryId },
      data: { status: 'PUBLISHED' },
    });

    createAuditLog(session.user.id, 'PUBLISH_DIARY_ENTRY', 'DiaryEntry', entryId).catch(() => {});
    revalidateDiaryPaths();
    return actionSuccess();
  },
);

// Re-export copy action from split file
export { copyDiaryToSectionsAction } from './diary-copy-actions';
