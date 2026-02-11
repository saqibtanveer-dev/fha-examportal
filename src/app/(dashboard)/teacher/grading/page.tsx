export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { getSessionsForGrading } from '@/modules/sessions/session-queries';
import { GradingPageClient } from './grading-page-client';

export default async function GradingPage() {
  const session = await requireRole('TEACHER', 'ADMIN');
  const sessions = await getSessionsForGrading(session.user.id);
  return <GradingPageClient sessions={sessions} />;
}
