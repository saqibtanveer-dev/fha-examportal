export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { getSessionById } from '@/modules/sessions/session-queries';
import { redirect } from 'next/navigation';
import { GradingInterface } from '@/modules/grading/components';

type Props = { params: Promise<{ sessionId: string }> };

export default async function GradingDetailPage({ params }: Props) {
  const { sessionId } = await params;
  const authSession = await auth();
  const session = await getSessionById(sessionId);

  if (!session) redirect('/teacher/grading');

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
        ? { marksAwarded: Number(a.answerGrade.marksAwarded), feedback: a.answerGrade.feedback }
        : null,
    }));

  return (
    <GradingInterface
      sessionId={sessionId}
      answers={answers}
      graderId={authSession!.user.id}
      studentName={`${session.student.firstName} ${session.student.lastName}`}
    />
  );
}
