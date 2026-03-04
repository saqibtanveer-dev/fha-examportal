'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { DiaryStatsData } from '../diary.types';

type Props = {
  stats: DiaryStatsData;
  className?: string;
};

export function DiaryStatsCards({ stats, className }: Props) {
  const cards = [
    {
      label: 'Total Entries',
      value: stats.totalEntries,
      color: 'text-blue-700',
    },
    {
      label: 'Teachers Submitted',
      value: stats.totalTeachersWithEntries,
      color: 'text-emerald-700',
    },
    {
      label: 'Missing Today',
      value: stats.missingToday.length,
      color: stats.missingToday.length > 0 ? 'text-red-700' : 'text-emerald-700',
    },
    {
      label: 'Coverage',
      value: `${stats.coveragePercent}%`,
      color:
        stats.coveragePercent >= 80
          ? 'text-emerald-700'
          : stats.coveragePercent >= 50
            ? 'text-amber-700'
            : 'text-red-700',
    },
  ];

  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${className ?? ''}`}>
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={`mt-1 text-xl font-bold sm:text-2xl ${card.color}`}>
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
