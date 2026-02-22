'use server';

import { getSessionsForGrading, getSessionById } from '@/modules/sessions/session-queries';
import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';

/**
 * Server action wrapper for React Query to fetch grading sessions.
 */
export async function fetchGradingSessionsAction() {
  const session = await requireRole('TEACHER', 'ADMIN');
  const sessions = await getSessionsForGrading(session.user.id, session.user.role === 'ADMIN');
  return serialize(sessions);
}

/**
 * Server action for fetching a single session by ID.
 */
export async function fetchGradingSessionDetailAction(sessionId: string) {
  await requireRole('TEACHER', 'ADMIN');
  const session = await getSessionById(sessionId);
  if (!session) return null;
  return serialize(session);
}
