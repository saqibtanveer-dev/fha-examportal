'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { getAcademicSessionsForSelect, listAcademicSessions } from './session-queries';

/**
 * Fetch all academic sessions (admin only).
 */
export async function fetchAcademicSessionsAction() {
  await requireRole('ADMIN');
  const result = await listAcademicSessions();
  return serialize(result);
}

/**
 * Fetch academic sessions for select dropdowns (id + name + isCurrent).
 */
export async function fetchAcademicSessionsForSelectAction() {
  await requireRole('ADMIN');
  const result = await getAcademicSessionsForSelect();
  return serialize(result);
}
