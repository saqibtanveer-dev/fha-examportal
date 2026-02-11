export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TeacherResultsClient } from './teacher-results-client';

export default async function TeacherResultsPage() {
  const session = await auth();

  const exams = await prisma.exam.findMany({
    where: { createdById: session!.user.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      subject: { select: { code: true } },
      _count: { select: { examResults: true } },
    },
  });

  return <TeacherResultsClient exams={exams} />;
}
