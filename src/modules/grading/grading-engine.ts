import { prisma } from '@/lib/prisma';
import { DEFAULT_GRADING_SCALE } from '@/lib/constants';

/**
 * Auto-grade all MCQ answers in a session.
 * Returns total auto-graded marks.
 */
export async function autoGradeMcqAnswers(sessionId: string): Promise<number> {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: {
      studentAnswers: {
        include: {
          examQuestion: {
            include: { question: { include: { mcqOptions: true } } },
          },
        },
      },
    },
  });

  if (!session) return 0;

  let totalMarks = 0;

  for (const answer of session.studentAnswers) {
    const q = answer.examQuestion.question;
    if (q.type !== 'MCQ') continue;

    const correctOption = q.mcqOptions.find((o) => o.isCorrect);
    const isCorrect = correctOption?.id === answer.selectedOptionId;
    const marks = isCorrect ? Number(answer.examQuestion.marks) : 0;
    const maxMarks = Number(answer.examQuestion.marks);
    totalMarks += marks;

    await prisma.answerGrade.upsert({
      where: { studentAnswerId: answer.id },
      create: {
        studentAnswerId: answer.id,
        gradedBy: 'SYSTEM',
        marksAwarded: marks,
        maxMarks,
        feedback: isCorrect ? 'Correct' : `Incorrect. Correct: ${correctOption?.text ?? 'N/A'}`,
      },
      update: {
        marksAwarded: marks,
        feedback: isCorrect ? 'Correct' : `Incorrect. Correct: ${correctOption?.text ?? 'N/A'}`,
      },
    });
  }

  return totalMarks;
}

/**
 * Check if all answers in a session are graded.
 */
export async function isSessionFullyGraded(sessionId: string): Promise<boolean> {
  const totalAnswers = await prisma.studentAnswer.count({ where: { sessionId } });
  const gradedAnswers = await prisma.answerGrade.count({
    where: { studentAnswer: { sessionId } },
  });
  return totalAnswers > 0 && totalAnswers === gradedAnswers;
}

/**
 * Derive letter grade from percentage using the default grading scale.
 */
function deriveGrade(percentage: number): string {
  const entry = DEFAULT_GRADING_SCALE.find(
    (g) => percentage >= g.minPercentage && percentage <= g.maxPercentage,
  );
  return entry?.grade ?? 'F';
}

/**
 * Calculate and save exam result from graded answers.
 */
export async function calculateResult(sessionId: string) {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: {
      exam: true,
      studentAnswers: { include: { answerGrade: true } },
    },
  });

  if (!session) return null;

  const obtainedMarks = session.studentAnswers.reduce(
    (sum, a) => sum + (a.answerGrade ? Number(a.answerGrade.marksAwarded) : 0),
    0,
  );

  const totalMarks = Number(session.exam.totalMarks);
  const passingMarks = Number(session.exam.passingMarks);
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const isPassed = obtainedMarks >= passingMarks;
  const grade = deriveGrade(percentage);

  const result = await prisma.examResult.upsert({
    where: { sessionId },
    create: {
      sessionId,
      studentId: session.studentId,
      examId: session.examId,
      obtainedMarks,
      totalMarks,
      percentage,
      isPassed,
      grade,
    },
    update: {
      obtainedMarks,
      totalMarks,
      percentage,
      isPassed,
      grade,
    },
  });

  await prisma.examSession.update({
    where: { id: sessionId },
    data: { status: 'GRADED' },
  });

  return result;
}
