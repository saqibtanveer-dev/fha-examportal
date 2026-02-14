export const dynamic = 'force-dynamic';

import { PageHeader } from '@/components/shared';
import { listAcademicSessions } from '@/modules/academic-sessions/session-queries';
import {
  getClassesWithActiveStudents,
  getPromotionSummary,
  isTransitionDone,
} from '@/modules/promotions/promotion-queries';
import { YearTransitionClient } from '@/modules/promotions/components/year-transition-client';

export default async function YearTransitionPage() {
  const [classes, sessions] = await Promise.all([
    getClassesWithActiveStudents(),
    listAcademicSessions(),
  ]);

  const currentSession = sessions.find((s) => s.isCurrent);
  let transitionDone = false;
  let promotionSummary: Record<string, number> | null = null;

  if (currentSession) {
    transitionDone = await isTransitionDone(currentSession.id);
    if (transitionDone) {
      promotionSummary = await getPromotionSummary(currentSession.id);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Year Transition"
        description="Promote students to the next class, graduate final-year students, or hold back students who need to repeat."
      />

      <YearTransitionClient
        classes={classes}
        sessions={sessions}
        promotionSummary={promotionSummary}
        currentSessionId={currentSession?.id ?? null}
        transitionDone={transitionDone}
      />
    </div>
  );
}
