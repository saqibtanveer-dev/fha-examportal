'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileCheck, Trophy, UserPlus, TrendingUp, BarChart3 } from 'lucide-react';

type CampaignStatsData = {
  totalApplicants: number;
  verified: number;
  testCompleted: number;
  graded: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
  waitlisted: number;
  enrolled: number;
};

type Props = {
  stats: CampaignStatsData;
};

export function CampaignStatsCards({ stats }: Props) {
  const total = stats.totalApplicants || 1;
  const passRate = stats.graded > 0
    ? ((stats.shortlisted + stats.accepted + stats.enrolled) / stats.graded) * 100
    : 0;

  const cards = [
    {
      title: 'Total Applicants',
      value: stats.totalApplicants,
      icon: Users,
      description: `${stats.verified} verified`,
    },
    {
      title: 'Tests Completed',
      value: stats.testCompleted,
      icon: FileCheck,
      description: `${stats.graded} graded`,
    },
    {
      title: 'Pass Rate',
      value: `${passRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: `${stats.shortlisted} shortlisted`,
    },
    {
      title: 'Accepted',
      value: stats.accepted,
      icon: Trophy,
      description: `${stats.waitlisted} waitlisted`,
    },
    {
      title: 'Enrolled',
      value: stats.enrolled,
      icon: UserPlus,
      description: `${stats.rejected} rejected`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
