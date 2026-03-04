'use server';

// ============================================
// Diary Module — Student & Principal Actions
// ============================================

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { safeAction } from '@/lib/safe-action';
import { actionSuccess, actionError } from '@/types/action-result';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import { principalNoteSchema } from '@/validations/diary-schemas';
import type { ActionResult } from '@/types/action-result';

function revalidateDiaryPaths() {
  revalidatePath('/teacher/diary');
  revalidatePath('/student/diary');
  revalidatePath('/principal/diary');
}

// ── Mark Diary as Read (Student) ──

export const markDiaryReadAction = safeAction(
  async function markDiaryReadAction(diaryEntryId: string): Promise<ActionResult> {
    const session = await requireRole('STUDENT');
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!studentProfile) return actionError('Student profile not found');

    await prisma.diaryReadReceipt.upsert({
      where: {
        diaryEntryId_studentProfileId: {
          diaryEntryId,
          studentProfileId: studentProfile.id,
        },
      },
      create: { diaryEntryId, studentProfileId: studentProfile.id },
      update: {},
    });

    return actionSuccess();
  },
);

// ── Add Principal Note ──

export const addPrincipalNoteAction = safeAction(
  async function addPrincipalNoteAction(
    input: unknown & { diaryEntryId: string },
  ): Promise<ActionResult<{ id: string }>> {
    const session = await requireRole('PRINCIPAL', 'ADMIN');
    const { diaryEntryId, ...rest } = input as { diaryEntryId: string; [key: string]: unknown };
    const parsed = principalNoteSchema.safeParse(rest);
    if (!parsed.success) return actionError('Invalid input');

    const entry = await prisma.diaryEntry.findUnique({
      where: { id: diaryEntryId },
      select: { id: true, deletedAt: true },
    });
    if (!entry || entry.deletedAt) return actionError('Diary entry not found');

    const note = await prisma.diaryPrincipalNote.create({
      data: {
        diaryEntryId,
        principalId: session.user.id,
        note: parsed.data.note,
      },
    });

    createAuditLog(
      session.user.id,
      'ADD_PRINCIPAL_DIARY_NOTE',
      'DiaryPrincipalNote',
      note.id,
      { diaryEntryId },
    ).catch(() => {});

    revalidateDiaryPaths();
    return actionSuccess({ id: note.id });
  },
);
