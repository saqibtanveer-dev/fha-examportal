export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { getSessionsForGrading } from '@/modules/sessions/session-queries';
import { GradingPageClient } from './grading-page-client';

export default async function GradingPage() {
  const session = await auth();
  const sessions = await getSessionsForGrading(session!.user.id);
  return <GradingPageClient sessions={sessions} />;
}
