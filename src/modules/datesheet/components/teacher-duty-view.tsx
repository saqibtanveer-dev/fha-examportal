'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DUTY_ROLE_LABELS } from '../datesheet.constants';
import { formatExamDate, formatTimeRange } from '../datesheet.utils';

type DutyItem = {
  id: string;
  role: string;
  room: string | null;
  entry: {
    examDate: Date | string;
    startTime: string;
    endTime: string;
    room: string | null;
    subject: { name: string };
    class: { name: string };
    section: { name: string };
  };
};

type Props = {
  duties: DutyItem[];
  title?: string;
  className?: string;
};

function groupByDate(duties: DutyItem[]): { date: string; duties: DutyItem[] }[] {
  const map = new Map<string, DutyItem[]>();
  for (const d of duties) {
    const iso = typeof d.entry.examDate === 'string'
      ? d.entry.examDate.slice(0, 10)
      : new Date(d.entry.examDate).toISOString().slice(0, 10);
    const list = map.get(iso) ?? [];
    list.push(d);
    map.set(iso, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, duties]) => ({ date, duties }));
}

export function TeacherDutyView({ duties, title = 'My Exam Duties', className }: Props) {
  const grouped = groupByDate(duties);

  if (duties.length === 0) {
    return (
      <Card className={className}>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No duties assigned.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {grouped.map(({ date, duties: dayDuties }) => (
          <div key={date}>
            <h4 className="font-medium text-sm mb-2">{formatExamDate(date)}</h4>
            <div className="space-y-2">
              {dayDuties.map((d) => (
                <div key={d.id} className="flex items-start gap-3 rounded-md border px-3 py-2">
                  <div className="flex-1 space-y-0.5">
                    <div className="font-medium text-sm">{d.entry.subject.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {d.entry.class.name} — {d.entry.section.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {formatTimeRange(d.entry.startTime, d.entry.endTime)}
                      {(d.room ?? d.entry.room) && ` • Room: ${d.room ?? d.entry.room}`}
                    </div>
                  </div>
                  <Badge variant="outline">{DUTY_ROLE_LABELS[d.role] ?? d.role}</Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
