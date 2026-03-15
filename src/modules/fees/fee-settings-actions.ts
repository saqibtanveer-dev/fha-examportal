'use server';

import { requireRole } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/modules/audit/audit-queries';
import type { ActionResult } from '@/types/action-result';
import { actionSuccess, actionError } from '@/types/action-result';
import { safeAction } from '@/lib/safe-action';
import { updateFeeSettingsSchema, type UpdateFeeSettingsInput } from '@/validations/fee-schemas';
import { getCurrentAcademicSessionId, upsertFeeSettings } from './fee-queries';

import { logger } from '@/lib/logger';
export const updateFeeSettingsAction = safeAction(
  async function updateFeeSettingsAction(
    input: UpdateFeeSettingsInput,
  ): Promise<ActionResult> {
    const session = await requireRole('ADMIN');
    const parsed = updateFeeSettingsSchema.safeParse(input);
    if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? 'Validation failed');

    const academicSessionId = await getCurrentAcademicSessionId();
    if (!academicSessionId) return actionError('No active academic session');

    await upsertFeeSettings(academicSessionId, parsed.data);

    createAuditLog(session.user.id, 'UPDATE_FEE_SETTINGS', 'FEE_SETTINGS', academicSessionId, parsed.data).catch((err) => logger.error({ err }, 'Audit log failed'));
    revalidatePath('/admin/fees');
    return actionSuccess();
  },
);
