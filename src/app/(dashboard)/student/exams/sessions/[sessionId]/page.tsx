export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { getSessionById } from '@/modules/sessions/session-queries';
import { redirect } from 'next/navigation';
import { ExamTakingView } from '@/modules/sessions/components';
import { serialize } from '@/utils/serialize';

type Props = { params: Promise<{ sessionId: string }> };

export default async function ExamSessionPage({ params }: Props) {
  const { sessionId } = await params;
  const authSession = await auth();
  const session = await getSessionById(sessionId);

  if (!session || session.studentId !== authSession?.user.id) redirect('/student/exams');
  if (session.status === 'SUBMITTED' || session.status === 'GRADED') {
    redirect(`/student/results/${sessionId}`);
  }

  return <ExamTakingView session={serialize(session)} />;
}
