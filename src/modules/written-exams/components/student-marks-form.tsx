'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/shared';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBatchEnterWrittenMarks, useMarkAbsent } from '@/modules/written-exams/hooks/use-written-exam-query';
import { QuestionMarkInput } from './question-mark-input';
import { ChevronLeft, ChevronRight, UserX, Save, AlertCircle } from 'lucide-react';
import { deriveGrade } from '@/modules/grading/grading-core';
import type { DeepSerialize } from '@/utils/serialize';
import type { WrittenExamSession, WrittenExamQuestion } from '@/modules/written-exams/written-exam-queries';

type Session = DeepSerialize<WrittenExamSession>;
type Question = DeepSerialize<WrittenExamQuestion>;

type Props = {
  examId: string;
  session: Session;
  questions: Question[];
  isFinalized: boolean;
  onNavigate: (direction: 'prev' | 'next') => void;
  currentIndex: number;
  totalStudents: number;
};

type MarkEntry = { examQuestionId: string; marksAwarded: number; feedback?: string };

export function StudentMarksForm({
  examId,
  session,
  questions,
  isFinalized,
  onNavigate,
  currentIndex,
  totalStudents,
}: Props) {
  const batchMutation = useBatchEnterWrittenMarks(examId);
  const { markAbsent, unmarkAbsent } = useMarkAbsent(examId);
  const [absentConfirm, setAbsentConfirm] = useState(false);

  const initialMarks = useMemo(() => {
    const map: Record<string, { marks: number | null; feedback: string }> = {};
    for (const q of questions) {
      const answer = session.answers.find((a) => a.examQuestionId === q.examQuestionId);
      map[q.examQuestionId] = {
        marks: answer?.grade?.marksAwarded ?? null,
        feedback: answer?.grade?.feedback ?? '',
      };
    }
    return map;
  }, [questions, session.answers]);

  const [localMarks, setLocalMarks] = useState(initialMarks);

  const sessionIdRef = useMemo(() => session.id, [session.id]);
  useEffect(() => {
    setLocalMarks(initialMarks);
  }, [sessionIdRef, initialMarks]);

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  const totalObtained = Object.values(localMarks).reduce(
    (s, v) => s + (v.marks ?? 0),
    0,
  );
  const percentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
  const grade = deriveGrade(percentage);
  const filledCount = Object.values(localMarks).filter((v) => v.marks !== null).length;

  const handleMarkChange = useCallback(
    (examQuestionId: string, marks: number | null, feedback?: string) => {
      setLocalMarks((prev) => ({
        ...prev,
        [examQuestionId]: {
          marks,
          feedback: feedback ?? prev[examQuestionId]?.feedback ?? '',
        },
      }));
    },
    [],
  );

  const handleSaveAll = useCallback(() => {
    const entries: MarkEntry[] = [];
    for (const q of questions) {
      const entry = localMarks[q.examQuestionId];
      if (entry?.marks !== null && entry?.marks !== undefined) {
        entries.push({
          examQuestionId: q.examQuestionId,
          marksAwarded: entry.marks,
          feedback: entry.feedback || undefined,
        });
      }
    }
    if (entries.length === 0) return;
    batchMutation.mutate({ sessionId: session.id, marks: entries });
  }, [questions, localMarks, session.id, batchMutation]);

  const handleAbsent = useCallback(() => {
    markAbsent.mutate({ sessionId: session.id });
    setAbsentConfirm(false);
  }, [session.id, markAbsent]);

  const handleUnmarkAbsent = useCallback(() => {
    unmarkAbsent.mutate({ sessionId: session.id });
  }, [session.id, unmarkAbsent]);

  const isAbsent = session.status === 'ABSENT';
  const hasDirtyData = Object.entries(localMarks).some(([eqId, v]) => {
    const answer = session.answers.find((a) => a.examQuestionId === eqId);
    return v.marks !== (answer?.grade?.marksAwarded ?? null);
  });

  return (
    <div className="flex h-full flex-col">
      {/* Student Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold sm:text-lg">
              {session.student.firstName} {session.student.lastName}
            </h3>
            {isAbsent && <Badge variant="destructive">Absent</Badge>}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
            #{session.student.rollNumber} · {session.student.className}-{session.student.sectionName}
          </p>
        </div>
        {hasDirtyData && !isAbsent && (
          <Badge variant="outline" className="ml-2 shrink-0 border-amber-500 text-amber-600 dark:text-amber-400">
            <AlertCircle className="mr-1 h-3 w-3" />
            Unsaved
          </Badge>
        )}
      </div>

      {/* Question Marks List */}
      {isAbsent ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
          <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
            <UserX className="h-10 w-10 text-red-500 dark:text-red-400" />
          </div>
          <p className="font-medium">Student marked as absent</p>
          {!isFinalized && (
            <Button variant="outline" size="sm" onClick={handleUnmarkAbsent} disabled={unmarkAbsent.isPending}>
              {unmarkAbsent.isPending && <Spinner size="sm" className="mr-2" />}
              Remove Absent Status
            </Button>
          )}
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:space-y-3 sm:p-4">
          {questions.map((q, idx) => (
            <QuestionMarkInput
              key={q.examQuestionId}
              index={idx + 1}
              question={q}
              marks={localMarks[q.examQuestionId]?.marks ?? null}
              feedback={localMarks[q.examQuestionId]?.feedback ?? ''}
              onChange={handleMarkChange}
              disabled={isFinalized}
            />
          ))}
        </div>
      )}

      {/* Sticky Footer */}
      {!isAbsent && (
        <div className="sticky bottom-0 border-t bg-background">
          {/* Score Summary */}
          <div className="flex items-center justify-between px-4 py-2 sm:px-6">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold tabular-nums sm:text-lg">
                {totalObtained}/{totalMarks}
              </span>
              <span className="text-xs text-muted-foreground">
                ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'tabular-nums',
                  percentage >= 40
                    ? 'border-green-500 text-green-700 dark:text-green-400'
                    : 'border-red-500 text-red-700 dark:text-red-400',
                )}
              >
                {grade} · {percentage >= 40 ? 'Pass' : 'Fail'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {filledCount}/{questions.length} filled
              </span>
            </div>
          </div>

          {/* Actions */}
          {!isFinalized && (
            <div className="flex items-center gap-2 border-t px-4 py-2.5 sm:px-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAbsentConfirm(true)}
                disabled={batchMutation.isPending}
                className="min-h-9"
              >
                <UserX className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Mark </span>Absent
              </Button>
              <div className="flex-1" />
              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={batchMutation.isPending || !hasDirtyData}
                className="min-h-9 min-w-24"
              >
                {batchMutation.isPending ? (
                  <Spinner size="sm" className="mr-1.5" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                Save All
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between border-t px-3 py-2 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('prev')}
              disabled={currentIndex <= 0}
              className="min-h-9 min-w-20"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Prev
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {currentIndex + 1} / {totalStudents}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('next')}
              disabled={currentIndex >= totalStudents - 1}
              className="min-h-9 min-w-20"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Absent Confirmation */}
      <AlertDialog open={absentConfirm} onOpenChange={setAbsentConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Absent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all entered marks for{' '}
              <span className="font-medium text-foreground">
                {session.student.firstName} {session.student.lastName}
              </span>.
              You can undo this later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAbsent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={markAbsent.isPending}
            >
              {markAbsent.isPending && <Spinner size="sm" className="mr-2" />}
              Mark Absent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
