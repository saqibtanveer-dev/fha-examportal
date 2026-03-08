'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { getAcademicSessionsForSelect, listAcademicSessions } from './session-queries';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Fetch all academic sessions (admin only).
 */
export const fetchAcademicSessionsAction = safeFetchAction(async () => {
  await requireRole('ADMIN');
  const result = await listAcademicSessions();
  return serialize(result);
});

/**
 * Fetch academic sessions for select dropdowns (id + name + isCurrent).
 */
export const fetchAcademicSessionsForSelectAction = safeFetchAction(async () => {
  await requireRole('ADMIN');
  const result = await getAcademicSessionsForSelect();
  return serialize(result);
});
