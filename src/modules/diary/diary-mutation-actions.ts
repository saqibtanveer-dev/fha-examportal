'use server';

// ============================================
// Diary Module — Server Mutation Actions (Write)
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
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

async function getTeacherProfileId(userId: string): Promise<string> {
  const profile = await prisma.teacherProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new Error('Teacher profile not found');
  return profile.id;
}

async function getCurrentSessionId(): Promise<string> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  if (!session) throw new Error('No active academic session');
  return session.id;
}

async function verifyTeacherAssignment(
  teacherProfileId: string,
  subjectId: string,
  classId: string,
): Promise<boolean> {
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId: teacherProfileId, subjectId, classId },
  });
  return !!assignment;
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

    const teacherProfileId = await getTeacherProfileId(session.user.id);
    const isAdmin = session.user.role === 'ADMIN';

    if (!isAdmin) {
      const hasAssignment = await verifyTeacherAssignment(teacherProfileId, subjectId, classId);
      if (!hasAssignment) return actionError('You are not assigned to teach this subject in this class');
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
      const teacherProfileId = await getTeacherProfileId(session.user.id);
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
      const teacherProfileId = await getTeacherProfileId(session.user.id);
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
      const teacherProfileId = await getTeacherProfileId(session.user.id);
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

// ── Action 5: Copy Diary to Other Sections ──

export const copyDiaryToSectionsAction = safeAction(
  async function copyDiaryToSectionsAction(
    input: unknown & { entryId: string },
  ): Promise<ActionResult<{ count: number }>> {
    const session = await requireRole('TEACHER', 'ADMIN');
    const { entryId, ...rest } = input as { entryId: string; [key: string]: unknown };
    const parsed = copyDiaryToSectionsSchema.safeParse(rest);
    if (!parsed.success) return actionError('Invalid input');

    const entry = await prisma.diaryEntry.findUnique({ where: { id: entryId } });
    if (!entry || entry.deletedAt) return actionError('Diary entry not found');

    const isAdmin = session.user.role === 'ADMIN';
    if (!isAdmin) {
      const teacherProfileId = await getTeacherProfileId(session.user.id);
      if (entry.teacherProfileId !== teacherProfileId) {
        return actionError('You can only copy your own diary entries');
      }
    }

    const results = await prisma.$transaction(
      parsed.data.targetSectionIds.map((sectionId) =>
        prisma.diaryEntry.upsert({
          where: {
            teacherProfileId_classId_sectionId_subjectId_date_academicSessionId: {
              teacherProfileId: entry.teacherProfileId,
              classId: entry.classId,
              sectionId,
              subjectId: entry.subjectId,
              date: entry.date,
              academicSessionId: entry.academicSessionId,
            },
          },
          create: {
            teacherProfileId: entry.teacherProfileId,
            classId: entry.classId,
            sectionId,
            subjectId: entry.subjectId,
            date: entry.date,
            title: entry.title,
            content: entry.content,
            status: entry.status,
            academicSessionId: entry.academicSessionId,
          },
          update: {
            title: entry.title,
            content: entry.content,
            status: entry.status,
            isEdited: true,
            editedAt: new Date(),
          },
        }),
      ),
    );

    createAuditLog(
      session.user.id,
      'COPY_DIARY_ENTRY',
      'DiaryEntry',
      entryId,
      { targetSectionIds: parsed.data.targetSectionIds, count: results.length },
    ).catch(() => {});

    revalidateDiaryPaths();
    return actionSuccess({ count: results.length });
  },
);
