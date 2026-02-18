import { prisma } from '@/lib/prisma';
import { DEFAULT_GRADING_SCALE } from '@/lib/constants';

/**
 * Auto-grade all MCQ answers in a session.
 * Uses a transaction to batch all grade upserts atomically.
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
          answerGrade: true,
        },
      },
    },
  });

  if (!session) return 0;

  // Filter to only MCQ answers that haven't been graded yet
  const mcqAnswers = session.studentAnswers.filter(
    (a) => a.examQuestion.question.type === 'MCQ' && !a.answerGrade,
  );

  if (mcqAnswers.length === 0) {
    // Return existing MCQ marks
    return session.studentAnswers
      .filter((a) => a.examQuestion.question.type === 'MCQ' && a.answerGrade)
      .reduce((sum, a) => sum + Number(a.answerGrade!.marksAwarded), 0);
  }

  let totalMarks = 0;

  // Batch all grade upserts in a single transaction to avoid N+1
  await prisma.$transaction(async (tx) => {
    for (const answer of mcqAnswers) {
      const q = answer.examQuestion.question;
      const correctOptionIds = new Set(q.mcqOptions.filter((o) => o.isCorrect).map((o) => o.id));
      const isCorrect = answer.selectedOptionId != null && correctOptionIds.has(answer.selectedOptionId);
      const correctTexts = q.mcqOptions.filter((o) => o.isCorrect).map((o) => o.text).join(', ');
      const marks = isCorrect ? Number(answer.examQuestion.marks) : 0;
      const maxMarks = Number(answer.examQuestion.marks);
      totalMarks += marks;

      await tx.answerGrade.upsert({
        where: { studentAnswerId: answer.id },
        create: {
          studentAnswerId: answer.id,
          gradedBy: 'SYSTEM',
          marksAwarded: marks,
          maxMarks,
          feedback: isCorrect ? 'Correct' : `Incorrect. Correct: ${correctTexts || 'N/A'}`,
        },
        update: {
          marksAwarded: marks,
          feedback: isCorrect ? 'Correct' : `Incorrect. Correct: ${correctTexts || 'N/A'}`,
        },
      });
    }
  });

  // Add existing MCQ marks
  totalMarks += session.studentAnswers
    .filter((a) => a.examQuestion.question.type === 'MCQ' && a.answerGrade)
    .reduce((sum, a) => sum + Number(a.answerGrade!.marksAwarded), 0);

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
 * Uses a serializable transaction to prevent race conditions.
 * Does NOT auto-publish — publishedAt is only set when explicitly publishing.
 */
export async function calculateResult(sessionId: string) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.examSession.findUnique({
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

    const result = await tx.examResult.upsert({
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
        // publishedAt intentionally NOT set — teacher must explicitly publish
      },
      update: {
        obtainedMarks,
        totalMarks,
        percentage,
        isPassed,
        grade,
        // Preserve existing publishedAt on recalculation
      },
    });

    await tx.examSession.update({
      where: { id: sessionId },
      data: { status: 'GRADED' },
    });

    return result;
  }, {
    isolationLevel: 'Serializable',
  });
}
