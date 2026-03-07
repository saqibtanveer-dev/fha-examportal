'use client';

import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DeepSerialize } from '@/utils/serialize';
import type { WrittenExamSession, WrittenExamQuestion } from '@/modules/written-exams/written-exam-queries';

type Session = DeepSerialize<WrittenExamSession>;
type Question = DeepSerialize<WrittenExamQuestion>;

export type CellValue = number | null;

export function SpreadsheetRow({
  session,
  questions,
  values,
  onChange,
  disabled,
  isDirty,
  totalMaxMarks,
}: {
  session: Session;
  questions: Question[];
  values: Record<string, CellValue>;
  onChange: (sessionId: string, examQuestionId: string, value: CellValue) => void;
  disabled: boolean;
  isDirty: boolean;
  totalMaxMarks: number;
}) {
  const total = Object.values(values).reduce((s: number, v) => s + (v ?? 0), 0);

  return (
    <tr className={cn(isDirty && 'bg-amber-50/50 dark:bg-amber-950/20')}>
      <td className={cn(
        'sticky left-0 border-b border-r px-4 py-2',
        isDirty ? 'bg-amber-50/50 dark:bg-amber-950/20' : 'bg-background',
      )}>
        <div className="font-medium leading-tight">{session.student.firstName} {session.student.lastName}</div>
        <div className="text-xs text-muted-foreground"># {session.student.rollNumber}</div>
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
      <td className="border-b px-4 py-2 text-center">
        <span className="font-bold tabular-nums">{total}</span>
        <span className="text-muted-foreground">/{totalMaxMarks}</span>
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
      inputMode="decimal"
      min={0}
      max={maxMarks}
      step="any"
      value={value ?? ''}
      onChange={handleChange}
      disabled={disabled}
      className="h-8 w-full text-center text-sm tabular-nums"
    />
  );
}
