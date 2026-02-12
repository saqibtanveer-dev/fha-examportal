import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { ExamInstructionsClient } from './exam-instructions-client';
import { serialize } from '@/utils/serialize';

type Props = { params: Promise<{ examId: string }> };

export default async function ExamInstructionsPage({ params }: Props) {
  const session = await requireRole('STUDENT');
  const { examId } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId, deletedAt: null },
    include: {
      subject: { select: { name: true, code: true } },
      _count: { select: { examQuestions: true } },
    },
  });

  if (!exam || (exam.status !== 'PUBLISHED' && exam.status !== 'ACTIVE')) {
    notFound();
  }

  // Check if student already has an active session — redirect directly
  const existingSession = await prisma.examSession.findFirst({
    where: {
      examId,
      studentId: session.user.id,
      status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
    },
  });

  if (existingSession) {
    redirect(`/student/exams/sessions/${existingSession.id}`);
  }

  return <ExamInstructionsClient exam={serialize(exam)} />;
}
