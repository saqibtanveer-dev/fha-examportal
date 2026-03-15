'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';
import { getTeacherProfileIdOrThrow, assertTeacherSubjectSectionAccess } from '@/lib/authorization-guards';
import { safeAction } from '@/lib/safe-action';
import { actionSuccess, actionError } from '@/types/action-result';
import { createAuditLog } from '@/modules/audit/audit-queries';
import { revalidatePath } from 'next/cache';
import { copyDiaryToSectionsSchema } from '@/validations/diary-schemas';
import type { ActionResult } from '@/types/action-result';

import { logger } from '@/lib/logger';
function revalidateDiaryPaths() {
  revalidatePath('/teacher/diary');
  revalidatePath('/student/diary');
  revalidatePath('/principal/diary');
}

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
      const teacherProfileId = await getTeacherProfileIdOrThrow(session.user.id);
      if (entry.teacherProfileId !== teacherProfileId) {
        return actionError('You can only copy your own diary entries');
      }
      for (const sectionId of parsed.data.targetSectionIds) {
        await assertTeacherSubjectSectionAccess(
          teacherProfileId,
          entry.subjectId,
          entry.classId,
          sectionId,
        );
      }
    }

    const results = await Promise.all(
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
    ).catch((err) => logger.error({ err }, 'Audit log failed'));

    revalidateDiaryPaths();
    return actionSuccess({ count: results.length });
  },
);
