'use server';

import { requireRole } from '@/lib/auth-utils';
import { assertGradingAccess } from '@/lib/authorization-guards';
import { serialize } from '@/utils/serialize';
import { getWrittenExamMarkEntryData } from './written-exam-queries';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Server action wrapper for fetching written exam marks entry data.
 * Used by React Query on the client.
 */
export const fetchWrittenExamMarkEntryAction = safeFetchAction(async (examId: string) => {
  const session = await requireRole('TEACHER', 'ADMIN');

  await assertGradingAccess(session.user.id, session.user.role as 'TEACHER' | 'ADMIN', examId);

  const data = await getWrittenExamMarkEntryData(examId);
  if (!data) return null;

  return serialize(data);
});
