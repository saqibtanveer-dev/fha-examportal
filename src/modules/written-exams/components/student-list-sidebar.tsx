'use client';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Clock, UserX, Circle } from 'lucide-react';
import type { DeepSerialize } from '@/utils/serialize';
import type { WrittenExamSession } from '@/modules/written-exams/written-exam-queries';

type Session = DeepSerialize<WrittenExamSession>;

type Props = {
  sessions: Session[];
  selectedSessionId: string;
  onSelect: (sessionId: string) => void;
  totalMarks: number;
};

const statusConfig = {
  ABSENT: { icon: UserX, color: 'text-red-500 dark:text-red-400', label: 'Absent' },
  COMPLETED: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', label: 'Completed' },
  IN_PROGRESS: { icon: Clock, color: 'text-amber-500 dark:text-amber-400', label: 'In Progress' },
  NOT_STARTED: { icon: Circle, color: 'text-muted-foreground', label: 'Not Started' },
} as const;

function getStatusConfig(session: Session) {
  if (session.status === 'ABSENT') return statusConfig.ABSENT;
  if (session.isComplete) return statusConfig.COMPLETED;
  if (session.status === 'IN_PROGRESS') return statusConfig.IN_PROGRESS;
  return statusConfig.NOT_STARTED;
}

export function StudentListSidebar({ sessions, selectedSessionId, onSelect, totalMarks }: Props) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-1.5" role="listbox" aria-label="Student list">
        {sessions.map((session) => {
          const config = getStatusConfig(session);
          const Icon = config.icon;
          const isSelected = session.id === selectedSessionId;

          return (
            <button
              key={session.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(session.id)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                'min-h-11 active:bg-accent/80',
                'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                isSelected && 'bg-accent ring-1 ring-primary/20',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', config.color)} aria-label={config.label} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-tight">
                  {session.student.firstName} {session.student.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground leading-tight mt-0.5">
                  #{session.student.rollNumber} · {session.student.className}-{session.student.sectionName}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {session.status === 'ABSENT' ? (
                  <span className="text-xs font-medium text-red-500 dark:text-red-400">Absent</span>
                ) : session.totalObtained > 0 || session.isComplete ? (
                  <span className="text-xs font-medium tabular-nums">
                    {session.totalObtained}/{totalMarks}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </button>
          );
        })}

        {sessions.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <UserX className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No students match filters</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
