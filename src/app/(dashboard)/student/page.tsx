export const dynamic = 'force-dynamic';

import { requireRole } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared';
import { BookOpen, CheckCircle, Clock, Trophy, FileText } from 'lucide-react';

export default async function StudentDashboard() {
  const session = await requireRole('STUDENT');
  const userId = session.user.id;

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { classId: true, sectionId: true },
  });

  const [completed, inProgress, avgScore, availableExams, attemptedExamIds] = await Promise.all([
    prisma.examSession.count({ where: { studentId: userId, status: { in: ['SUBMITTED', 'GRADED'] } } }),
    prisma.examSession.count({ where: { studentId: userId, status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } } }),
    prisma.examResult.aggregate({ where: { studentId: userId }, _avg: { percentage: true } }),
    // Count all exams assigned to the student's class
    studentProfile?.classId
      ? prisma.exam.count({
          where: {
            deletedAt: null,
            status: { in: ['PUBLISHED', 'ACTIVE'] },
            examClassAssignments: {
              some: {
                classId: studentProfile.classId,
                OR: [{ sectionId: null }, { sectionId: studentProfile.sectionId ?? undefined }],
              },
            },
          },
        })
      : Promise.resolve(0),
    // Get IDs of exams student has already attempted
    prisma.examSession.findMany({
      where: { studentId: userId },
      select: { examId: true },
      distinct: ['examId'],
    }),
  ]);

  // Count exams assigned to student but never attempted
  const attemptedIds = new Set(attemptedExamIds.map((s) => s.examId));
  let newExams = 0;
  if (studentProfile?.classId) {
    const assignedExams = await prisma.exam.findMany({
      where: {
        deletedAt: null,
        status: { in: ['PUBLISHED', 'ACTIVE'] },
        examClassAssignments: {
          some: {
            classId: studentProfile.classId,
            OR: [{ sectionId: null }, { sectionId: studentProfile.sectionId ?? undefined }],
          },
        },
      },
      select: { id: true },
    });
    newExams = assignedExams.filter((e) => !attemptedIds.has(e.id)).length;
  }

  const stats = [
    { label: 'New Exams', value: newExams, icon: FileText, description: 'Not yet attempted' },
    { label: 'In Progress', value: inProgress, icon: Clock, description: 'Started but not submitted' },
    { label: 'Completed', value: completed, icon: CheckCircle, description: 'Submitted / Graded' },
    { label: 'Avg Score', value: `${(avgScore._avg.percentage ?? 0).toFixed(1)}%`, icon: Trophy, description: 'Overall average' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your exam overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
