import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared';
import { BookOpen, CheckCircle, Clock, Trophy } from 'lucide-react';

export default async function StudentDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const [totalExams, completed, pending, avgScore] = await Promise.all([
    prisma.examSession.count({ where: { studentId: userId } }),
    prisma.examSession.count({ where: { studentId: userId, status: { in: ['SUBMITTED', 'GRADED'] } } }),
    prisma.examSession.count({ where: { studentId: userId, status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } } }),
    prisma.examResult.aggregate({ where: { studentId: userId }, _avg: { percentage: true } }),
  ]);

  const stats = [
    { label: 'Total Exams', value: totalExams, icon: BookOpen },
    { label: 'Completed', value: completed, icon: CheckCircle },
    { label: 'Pending', value: pending, icon: Clock },
    { label: 'Avg Score', value: `${(avgScore._avg.percentage ?? 0).toFixed(1)}%`, icon: Trophy },
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
