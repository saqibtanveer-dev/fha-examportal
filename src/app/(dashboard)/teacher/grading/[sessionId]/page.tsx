export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { getSessionById } from '@/modules/sessions/session-queries';
import { redirect } from 'next/navigation';
import { GradingInterface } from '@/modules/grading/components';

type Props = { params: Promise<{ sessionId: string }> };

export default async function GradingDetailPage({ params }: Props) {
  const { sessionId } = await params;
  const authSession = await requireRole('TEACHER', 'ADMIN');
  const session = await getSessionById(sessionId);

  if (!session) redirect('/teacher/grading');

  // Allow grading for SUBMITTED, GRADING, and GRADED sessions (for re-grading)
  if (!['SUBMITTED', 'GRADING', 'GRADED'].includes(session.status)) {
    redirect('/teacher/grading');
  }

  const answers = session.studentAnswers
    .filter((a) => a.examQuestion.question.type !== 'MCQ')
    .map((a) => ({
      id: a.id,
      answer: a.answerText ?? '',
      question: {
        id: a.examQuestion.question.id,
        title: a.examQuestion.question.title,
        marks: Number(a.examQuestion.marks),
        type: a.examQuestion.question.type,
        correctAnswer: a.examQuestion.question.modelAnswer,
      },
      answerGrade: a.answerGrade
        ? {
            id: a.answerGrade.id,
            marksAwarded: Number(a.answerGrade.marksAwarded),
            feedback: a.answerGrade.feedback,
            gradedBy: a.answerGrade.gradedBy,
            aiConfidence: a.answerGrade.aiConfidence != null ? Number(a.answerGrade.aiConfidence) : null,
            isReviewed: a.answerGrade.isReviewed,
          }
        : null,
    }));

  const antiCheatInfo = {
    tabSwitchCount: session.tabSwitchCount,
    fullscreenExits: session.fullscreenExits,
    copyPasteAttempts: session.copyPasteAttempts,
    isFlagged: session.isFlagged,
  };

  return (
    <GradingInterface
      sessionId={sessionId}
      answers={answers}
      studentName={`${session.student.firstName} ${session.student.lastName}`}
      antiCheatInfo={antiCheatInfo}
    />
  );
}
