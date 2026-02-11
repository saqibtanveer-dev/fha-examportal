import { PageHeader } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, ClipboardList, PenTool } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function getTeacherStats(userId: string) {
  const [questionCount, examCount, pendingGrading] = await Promise.all([
    prisma.question.count({ where: { createdById: userId, deletedAt: null } }),
    prisma.exam.count({ where: { createdById: userId, deletedAt: null } }),
    prisma.examSession.count({
      where: {
        exam: { createdById: userId },
        status: { in: ['SUBMITTED', 'GRADING'] },
      },
    }),
  ]);
  return { questionCount, examCount, pendingGrading };
}

export default async function TeacherDashboardPage() {
  const session = await auth();
  const stats = await getTeacherStats(session!.user.id);

  const cards = [
    { title: 'My Questions', value: stats.questionCount, icon: FileQuestion },
    { title: 'My Exams', value: stats.examCount, icon: ClipboardList },
    { title: 'Pending Grading', value: stats.pendingGrading, icon: PenTool },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Teacher Dashboard" description="Manage your questions and exams" />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
