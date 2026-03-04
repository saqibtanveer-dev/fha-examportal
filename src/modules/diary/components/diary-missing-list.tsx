'use client';

import { Card } from '@/components/ui/card';

type MissingItem = {
  teacherName: string;
  employeeId: string;
  subjectName: string;
  className: string;
};

type Props = {
  items: MissingItem[];
  className?: string;
};

export function DiaryMissingList({ items, className }: Props) {
  if (items.length === 0) {
    return (
      <div className={`rounded-lg border bg-emerald-50 p-4 text-center ${className ?? ''}`}>
        <span className="text-emerald-700 font-medium text-sm">
          ✅ All teachers have submitted diary entries today
        </span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold text-red-700">
          ❌ Teachers Missing Diary Today ({items.length})
        </h3>
      </div>
      <div className="divide-y max-h-64 overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <div className="min-w-0">
              <span className="font-medium">{item.teacherName}</span>
              <span className="ml-2 text-xs text-muted-foreground">({item.employeeId})</span>
            </div>
            <div className="shrink-0 text-right text-xs text-muted-foreground">
              {item.subjectName} — {item.className}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
