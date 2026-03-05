import { prisma } from '@/lib/prisma';

/**
 * Fetch all data needed for the marks entry page of a written exam.
 * Single query with optimal includes to avoid N+1.
 */
export async function getWrittenExamMarkEntryData(examId: string) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId, deletedAt: null },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      examQuestions: {
        orderBy: { sortOrder: 'asc' },
        include: {
          question: {
            select: { id: true, title: true, type: true, difficulty: true },
          },
        },
      },
      examClassAssignments: {
        include: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
      examSessions: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentProfile: {
                select: {
                  rollNumber: true,
                  registrationNo: true,
                  class: { select: { name: true } },
                  section: { select: { name: true } },
                },
              },
            },
          },
          studentAnswers: {
            include: {
              answerGrade: {
                select: {
                  id: true,
                  marksAwarded: true,
                  maxMarks: true,
                  feedback: true,
                },
              },
            },
          },
        },
        orderBy: {
          student: { firstName: 'asc' },
        },
      },
    },
  });

  if (!exam) return null;

  const sessions = exam.examSessions.map((session) => {
    const grades = session.studentAnswers
      .filter((a) => a.answerGrade)
      .map((a) => a.answerGrade!);

    const totalObtained = grades.reduce(
      (sum, g) => sum + Number(g.marksAwarded),
      0,
    );
    const isComplete =
      session.status !== 'ABSENT' &&
      grades.length === exam.examQuestions.length;

    return {
      id: session.id,
      status: session.status,
      student: {
        id: session.student.id,
        firstName: session.student.firstName,
        lastName: session.student.lastName,
        rollNumber: session.student.studentProfile?.rollNumber ?? '',
        registrationNo: session.student.studentProfile?.registrationNo ?? '',
        className: session.student.studentProfile?.class?.name ?? '',
        sectionName: session.student.studentProfile?.section?.name ?? '',
      },
      answers: session.studentAnswers.map((a) => ({
        id: a.id,
        examQuestionId: a.examQuestionId,
        answeredAt: a.answeredAt,
        grade: a.answerGrade
          ? {
              id: a.answerGrade.id,
              marksAwarded: Number(a.answerGrade.marksAwarded),
              maxMarks: Number(a.answerGrade.maxMarks),
              feedback: a.answerGrade.feedback,
            }
          : null,
      })),
      totalObtained,
      isComplete,
    };
  });

  const stats = {
    totalStudents: sessions.length,
    completedCount: sessions.filter((s) => s.isComplete).length,
    inProgressCount: sessions.filter(
      (s) => s.status === 'IN_PROGRESS' && !s.isComplete,
    ).length,
    absentCount: sessions.filter((s) => s.status === 'ABSENT').length,
    pendingCount: sessions.filter((s) => s.status === 'NOT_STARTED').length,
  };

  return {
    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      deliveryMode: exam.deliveryMode,
      totalMarks: Number(exam.totalMarks),
      passingMarks: Number(exam.passingMarks),
      status: exam.status,
      subject: exam.subject,
      createdBy: exam.createdBy,
      classAssignments: exam.examClassAssignments,
    },
    questions: exam.examQuestions.map((eq) => ({
      examQuestionId: eq.id,
      sortOrder: eq.sortOrder,
      marks: Number(eq.marks),
      question: eq.question,
    })),
    sessions,
    stats,
  };
}

export type WrittenExamMarkEntryData = NonNullable<
  Awaited<ReturnType<typeof getWrittenExamMarkEntryData>>
>;

export type WrittenExamSession = WrittenExamMarkEntryData['sessions'][number];
export type WrittenExamQuestion = WrittenExamMarkEntryData['questions'][number];
