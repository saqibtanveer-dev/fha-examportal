export const dynamic = 'force-dynamic';

import { PageHeader } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, ClipboardList, GraduationCap } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-utils';

async function getDashboardStats() {
  const [userCount, subjectCount, examCount, classCount] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.subject.count({ where: { isActive: true } }),
    prisma.exam.count({ where: { deletedAt: null } }),
    prisma.class.count({ where: { isActive: true } }),
  ]);

  return { userCount, subjectCount, examCount, classCount };
}

export default async function AdminDashboardPage() {
  await requireRole('ADMIN');
  const stats = await getDashboardStats();

  const cards = [
    { title: 'Total Users', value: stats.userCount, icon: Users },
    { title: 'Subjects', value: stats.subjectCount, icon: BookOpen },
    { title: 'Exams', value: stats.examCount, icon: ClipboardList },
    { title: 'Classes', value: stats.classCount, icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Overview of your school examination system" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold md:text-3xl">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
