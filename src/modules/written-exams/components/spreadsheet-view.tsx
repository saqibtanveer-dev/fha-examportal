'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useBulkEnterWrittenMarks, useMarkAbsent } from '@/modules/written-exams/hooks/use-written-exam-query';
import { Save, RotateCcw } from 'lucide-react';
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

type CellValue = number | null;
type GridData = Record<string, Record<string, CellValue>>; // sessionId -> examQuestionId -> marks

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

  // Reset grid when data changes externally
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

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {dirtySessionIds.size} unsaved student{dirtySessionIds.size !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={dirtySessionIds.size === 0}>
            <RotateCcw className="mr-1 h-4 w-4" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={isFinalized || dirtySessionIds.size === 0 || bulkMutation.isPending}
          >
            {bulkMutation.isPending ? <Spinner size="sm" className="mr-1" /> : <Save className="mr-1 h-4 w-4" />}
            Save All ({dirtySessionIds.size})
          </Button>
        </div>
      </div>

      {/* Grid */}
      <ScrollArea className="rounded-md border">
        <div className="min-w-max">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
              <tr>
                <th className="sticky left-0 z-20 bg-muted/90 border-b border-r px-3 py-2 text-left font-medium min-w-50">
                  Student
                </th>
                {questions.map((q, idx) => (
                  <th key={q.examQuestionId} className="border-b border-r px-2 py-2 text-center font-medium min-w-20">
                    <div>Q{idx + 1}</div>
                    <div className="text-xs text-muted-foreground font-normal">/{q.marks}</div>
                  </th>
                ))}
                <th className="border-b px-3 py-2 text-center font-medium min-w-20">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Absent students shown separately at bottom */}
              {nonAbsentSessions.map((session) => (
                <SpreadsheetRow
                  key={session.id}
                  session={session}
                  questions={questions}
                  values={grid[session.id] ?? {}}
                  onChange={handleCellChange}
                  disabled={isFinalized}
                  isDirty={dirtySessionIds.has(session.id)}
                />
              ))}
              {sessions
                .filter((s) => s.status === 'ABSENT')
                .map((session) => (
                  <tr key={session.id} className="bg-red-50/50">
                    <td className="sticky left-0 bg-red-50/50 border-b border-r px-3 py-2">
                      <span className="text-muted-foreground">
                        {session.student.firstName} {session.student.lastName}
                      </span>
                      <Badge variant="destructive" className="ml-2 text-xs">Absent</Badge>
                    </td>
                    {questions.map((q) => (
                      <td key={q.examQuestionId} className="border-b border-r px-2 py-2 text-center text-muted-foreground">
                        —
                      </td>
                    ))}
                    <td className="border-b px-3 py-2 text-center text-muted-foreground">—</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function SpreadsheetRow({
  session,
  questions,
  values,
  onChange,
  disabled,
  isDirty,
}: {
  session: Session;
  questions: Question[];
  values: Record<string, CellValue>;
  onChange: (sessionId: string, examQuestionId: string, value: CellValue) => void;
  disabled: boolean;
  isDirty: boolean;
}) {
  const total = Object.values(values).reduce((s: number, v) => s + (v ?? 0), 0);
  const totalMax = questions.reduce((s, q) => s + q.marks, 0);

  return (
    <tr className={isDirty ? 'bg-amber-50/50' : undefined}>
      <td className={`sticky left-0 border-b border-r px-3 py-2 ${isDirty ? 'bg-amber-50/50' : 'bg-background'}`}>
        <div className="font-medium">
          {session.student.firstName} {session.student.lastName}
        </div>
        <div className="text-xs text-muted-foreground">
          #{session.student.rollNumber}
        </div>
      </td>
      {questions.map((q) => (
        <td key={q.examQuestionId} className="border-b border-r px-1 py-1">
          <SpreadsheetCell
            sessionId={session.id}
            examQuestionId={q.examQuestionId}
            maxMarks={q.marks}
            value={values[q.examQuestionId] ?? null}
            onChange={onChange}
            disabled={disabled}
          />
        </td>
      ))}
      <td className="border-b px-3 py-2 text-center font-medium">
        {total}/{totalMax}
      </td>
    </tr>
  );
}

function SpreadsheetCell({
  sessionId,
  examQuestionId,
  maxMarks,
  value,
  onChange,
  disabled,
}: {
  sessionId: string;
  examQuestionId: string;
  maxMarks: number;
  value: CellValue;
  onChange: (sessionId: string, examQuestionId: string, value: CellValue) => void;
  disabled: boolean;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '') {
        onChange(sessionId, examQuestionId, null);
        return;
      }
      const num = parseFloat(val);
      if (isNaN(num) || num < 0 || num > maxMarks) return;
      onChange(sessionId, examQuestionId, num);
    },
    [sessionId, examQuestionId, maxMarks, onChange],
  );

  return (
    <Input
      type="number"
      min={0}
      max={maxMarks}
      step="any"
      value={value ?? ''}
      onChange={handleChange}
      disabled={disabled}
      className="h-8 w-full text-center text-sm"
    />
  );
}
