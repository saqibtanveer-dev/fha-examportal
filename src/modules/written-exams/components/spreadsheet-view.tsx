'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useBulkEnterWrittenMarks } from '@/modules/written-exams/hooks/use-written-exam-query';
import { Save, RotateCcw } from 'lucide-react';
import { SpreadsheetRow } from './spreadsheet-row';
import type { CellValue } from './spreadsheet-row';
import type { DeepSerialize } from '@/utils/serialize';
import type { WrittenExamSession, WrittenExamQuestion } from '@/modules/written-exams/written-exam-queries';

type Session = DeepSerialize<WrittenExamSession>;
type Question = DeepSerialize<WrittenExamQuestion>;

type Props = {
  examId: string;
  questions: Question[];
  sessions: Session[];
  isFinalized: boolean;
};

type GridData = Record<string, Record<string, CellValue>>;

function buildInitialGrid(sessions: Session[], questions: Question[]): GridData {
  const grid: GridData = {};
  for (const session of sessions) {
    grid[session.id] = {};
    for (const q of questions) {
      const answer = session.answers.find((a) => a.examQuestionId === q.examQuestionId);
      const row = grid[session.id];
      if (row) row[q.examQuestionId] = answer?.grade?.marksAwarded ?? null;
    }
  }
  return grid;
}

export function SpreadsheetView({ examId, questions, sessions, isFinalized }: Props) {
  const bulkMutation = useBulkEnterWrittenMarks(examId);
  const initialGrid = useMemo(() => buildInitialGrid(sessions, questions), [sessions, questions]);
  const [grid, setGrid] = useState<GridData>(initialGrid);
  const [dirtySessionIds, setDirtySessionIds] = useState<Set<string>>(new Set());

  const dataKey = useMemo(() => sessions.map((s) => s.id).join(','), [sessions]);
  useMemo(() => {
    setGrid(buildInitialGrid(sessions, questions));
    setDirtySessionIds(new Set());
  }, [dataKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCellChange = useCallback(
    (sessionId: string, examQuestionId: string, value: CellValue) => {
      setGrid((prev) => ({
        ...prev,
        [sessionId]: { ...prev[sessionId], [examQuestionId]: value },
      }));
      setDirtySessionIds((prev) => new Set(prev).add(sessionId));
    },
    [],
  );

  const handleSaveAll = useCallback(() => {
    const entries: Array<{ sessionId: string; examQuestionId: string; marksAwarded: number }> = [];
    for (const sessionId of dirtySessionIds) {
      const sessionMarks = grid[sessionId];
      if (!sessionMarks) continue;
      for (const [eqId, marks] of Object.entries(sessionMarks)) {
        if (marks !== null && marks !== undefined) {
          entries.push({ sessionId, examQuestionId: eqId, marksAwarded: marks });
        }
      }
    }
    if (entries.length === 0) return;
    bulkMutation.mutate({ examId, entries });
  }, [examId, grid, dirtySessionIds, bulkMutation]);

  const handleReset = useCallback(() => {
    setGrid(buildInitialGrid(sessions, questions));
    setDirtySessionIds(new Set());
  }, [sessions, questions]);

  const nonAbsentSessions = sessions.filter((s) => s.status !== 'ABSENT');
  const absentSessions = sessions.filter((s) => s.status === 'ABSENT');
  const totalMaxMarks = questions.reduce((s, q) => s + q.marks, 0);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {dirtySessionIds.size > 0
            ? `${dirtySessionIds.size} unsaved student${dirtySessionIds.size !== 1 ? 's' : ''}`
            : 'All changes saved'}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={dirtySessionIds.size === 0}
            className="min-h-9"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={isFinalized || dirtySessionIds.size === 0 || bulkMutation.isPending}
            className="min-h-9 min-w-28"
          >
            {bulkMutation.isPending ? (
              <Spinner size="sm" className="mr-1.5" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            Save All{dirtySessionIds.size > 0 ? ` (${dirtySessionIds.size})` : ''}
          </Button>
        </div>
      </div>

      {/* Mobile: Card-based compact view */}
      <div className="md:hidden space-y-2">
        {nonAbsentSessions.map((session) => {
          const values = grid[session.id] ?? {};
          const total = Object.values(values).reduce((s: number, v) => s + (v ?? 0), 0);
          const isDirty = dirtySessionIds.has(session.id);

          return (
            <div
              key={session.id}
              className={cn(
                'rounded-lg border p-3 space-y-2',
                isDirty && 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {session.student.firstName} {session.student.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">#{session.student.rollNumber}</p>
                </div>
                <span className="text-sm font-bold tabular-nums">{total}/{totalMaxMarks}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 xs:grid-cols-4 sm:grid-cols-5">
                {questions.map((q, idx) => (
                  <div key={q.examQuestionId} className="space-y-0.5">
                    <label className="text-[10px] text-muted-foreground leading-none">
                      Q{idx + 1} <span className="text-muted-foreground/60">/{q.marks}</span>
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={q.marks}
                      step="any"
                      value={values[q.examQuestionId] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          handleCellChange(session.id, q.examQuestionId, null);
                          return;
                        }
                        const num = parseFloat(val);
                        if (!isNaN(num) && num >= 0 && num <= q.marks) {
                          handleCellChange(session.id, q.examQuestionId, num);
                        }
                      }}
                      disabled={isFinalized}
                      className="h-8 text-center text-xs tabular-nums px-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {absentSessions.map((session) => (
          <div key={session.id} className="flex items-center justify-between rounded-lg border border-dashed p-3 opacity-60">
            <div className="min-w-0">
              <p className="truncate text-sm">{session.student.firstName} {session.student.lastName}</p>
              <p className="text-xs text-muted-foreground">#{session.student.rollNumber}</p>
            </div>
            <Badge variant="destructive" className="text-xs">Absent</Badge>
          </div>
        ))}
      </div>

      {/* Desktop: Spreadsheet table */}
      <div className="hidden md:block">
        <ScrollArea className="rounded-lg border">
          <div className="min-w-max">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-backdrop-filter:bg-muted/80">
                <tr>
                  <th className="sticky left-0 z-20 bg-muted/95 supports-backdrop-filter:bg-muted/80 border-b border-r px-4 py-2.5 text-left font-medium min-w-52">
                    Student
                  </th>
                  {questions.map((q, idx) => (
                    <th key={q.examQuestionId} className="border-b border-r px-2 py-2.5 text-center font-medium min-w-20">
                      <div className="text-xs">Q{idx + 1}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">/{q.marks}</div>
                    </th>
                  ))}
                  <th className="border-b px-4 py-2.5 text-center font-medium min-w-20">Total</th>
                </tr>
              </thead>
              <tbody>
                {nonAbsentSessions.map((session) => (
                  <SpreadsheetRow
                    key={session.id}
                    session={session}
                    questions={questions}
                    values={grid[session.id] ?? {}}
                    onChange={handleCellChange}
                    disabled={isFinalized}
                    isDirty={dirtySessionIds.has(session.id)}
                    totalMaxMarks={totalMaxMarks}
                  />
                ))}
                {absentSessions.map((session) => (
                  <tr key={session.id} className="text-muted-foreground">
                    <td className="sticky left-0 bg-muted/30 border-b border-r px-4 py-2.5">
                      <span className="flex items-center gap-2">
                        {session.student.firstName} {session.student.lastName}
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Absent</Badge>
                      </span>
                    </td>
                    {questions.map((q) => (
                      <td key={q.examQuestionId} className="border-b border-r px-2 py-2.5 text-center">—</td>
                    ))}
                    <td className="border-b px-4 py-2.5 text-center">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

