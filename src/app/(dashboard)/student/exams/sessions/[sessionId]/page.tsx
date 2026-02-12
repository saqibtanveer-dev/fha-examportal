export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { getSessionById } from '@/modules/sessions/session-queries';
import { redirect } from 'next/navigation';
import { ExamTakingView } from '@/modules/sessions/components';
import { serialize } from '@/utils/serialize';
import { prisma } from '@/lib/prisma';

type Props = { params: Promise<{ sessionId: string }> };

export default async function ExamSessionPage({ params }: Props) {
  const { sessionId } = await params;
  const authSession = await requireRole('STUDENT');
  const session = await getSessionById(sessionId);

  if (!session || session.studentId !== authSession.user.id) redirect('/student/exams');
  if (session.status === 'SUBMITTED' || session.status === 'GRADED') {
    // Look up the ExamResult by sessionId (not by id) to get the correct resultId
    const result = await prisma.examResult.findUnique({
      where: { sessionId },
      select: { id: true },
    });
    if (result) {
      redirect(`/student/results/${result.id}`);
    }
    // No result yet (waiting for grading) — redirect back to exams list
    redirect('/student/exams');
  }

  return <ExamTakingView session={serialize(session)} />;
}
