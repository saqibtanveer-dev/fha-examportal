import { auth } from '@/lib/auth';
import { getExamsForStudent } from '@/modules/exams/exam-queries';
import { prisma } from '@/lib/prisma';
import { StudentExamsClient } from './student-exams-client';

export default async function StudentExamsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { classId: true, sectionId: true },
  });

  if (!studentProfile?.classId) {
    return <div className="p-6 text-muted-foreground">No class assigned yet.</div>;
  }

  const exams = await getExamsForStudent(
    userId,
    studentProfile.classId,
    studentProfile.sectionId ?? '',
  );

  return <StudentExamsClient exams={exams} />;
}
