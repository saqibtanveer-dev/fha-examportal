'use server';

import { getSessionsForGrading, getSessionById } from '@/modules/sessions/session-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { safeFetchAction } from '@/lib/safe-action';

/**
 * Server action wrapper for React Query to fetch grading sessions.
 */
export const fetchGradingSessionsAction = safeFetchAction(async () => {
  const session = await requireRole('TEACHER', 'ADMIN');
  const sessions = await getSessionsForGrading(session.user.id, session.user.role === 'ADMIN');
  return serialize(sessions);
});

/**
 * Server action for fetching a single session by ID.
 */
export const fetchGradingSessionDetailAction = safeFetchAction(async (sessionId: string) => {
  await requireRole('TEACHER', 'ADMIN');
  const session = await getSessionById(sessionId);
  if (!session) return null;
  return serialize(session);
});
