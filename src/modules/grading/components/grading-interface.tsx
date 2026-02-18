'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/shared';
import { gradeAnswerAction, batchGradeAnswersAction } from '@/modules/grading/grading-actions';
import { approveAiGradeAction, finalizeSessionAction } from '@/modules/grading/ai-grading-actions';
import { toast } from 'sonner';
import {
  CheckCircle, ChevronLeft, ChevronRight, Brain, Shield, ShieldAlert,
  AlertTriangle, CheckCheck, PenLine, Save, Send, List,
} from 'lucide-react';

type Answer = {
  id: string;
  answer: string;
  question: { id: string; title: string; marks: number; type: string; correctAnswer: string | null };
  answerGrade: {
    id: string;
    marksAwarded: number;
    feedback: string | null;
    gradedBy: string;
    aiConfidence: number | string | null;
    isReviewed: boolean;
  } | null;
};

type AntiCheatInfo = {
  tabSwitchCount: number;
  fullscreenExits: number;
  copyPasteAttempts: number;
  isFlagged: boolean;
};

type Props = {
  sessionId: string;
  answers: Answer[];
  studentName: string;
  antiCheatInfo?: AntiCheatInfo;
};

type ViewMode = 'step' | 'batch';

export function GradingInterface({ sessionId, answers, studentName, antiCheatInfo }: Props) {
  const [isPending, startTransition] = useTransition();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marks, setMarks] = useState<Record<string, string>>(() => {
    // Pre-populate with existing grades for editing
    const initial: Record<string, string> = {};
    for (const a of answers) {
      if (a.answerGrade) {
        initial[a.id] = String(a.answerGrade.marksAwarded);
      }
    }
    return initial;
  });
  const [feedback, setFeedback] = useState<Record<string, string>>(() => {
    // Pre-populate with existing feedback
    const initial: Record<string, string> = {};
    for (const a of answers) {
      if (a.answerGrade?.feedback) {
        initial[a.id] = a.answerGrade.feedback;
      }
    }
    return initial;
  });
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('step');
  const router = useRouter();

  const current = answers[currentIndex];
  if (!current && viewMode === 'step') return null;

  const ungradedAnswers = answers.filter((a) => !a.answerGrade);
  const gradedCount = answers.length - ungradedAnswers.length;

  const handleGrade = useCallback((answerId: string) => {
    const m = parseFloat(marks[answerId] ?? '0');
    const f = feedback[answerId] ?? '';

    startTransition(async () => {
      const result = await gradeAnswerAction(answerId, m, f);
      if (result.success) {
        toast.success('Answer graded');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed');
      }
    });
  }, [marks, feedback, router]);

  const handleApproveAi = useCallback((gradeId: string, overrides?: { marksAwarded?: number; feedback?: string }) => {
    startTransition(async () => {
      const result = await approveAiGradeAction(gradeId, overrides);
      if (result.success) {
        toast.success(overrides ? 'AI grade updated & approved' : 'AI grade approved');
        setEditingGradeId(null);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to approve');
      }
    });
  }, [router]);

  const handleBatchGrade = useCallback((autoFinalize: boolean) => {
    const grades = answers
      .filter((a) => marks[a.id] !== undefined && marks[a.id] !== '')
      .map((a) => ({
        answerId: a.id,
        marksAwarded: parseFloat(marks[a.id] ?? '0'),
        feedback: feedback[a.id] ?? '',
      }));

    if (grades.length === 0) {
      toast.error('Please enter marks for at least one answer');
      return;
    }

    startTransition(async () => {
      const result = await batchGradeAnswersAction(sessionId, grades, autoFinalize);
      if (result.success) {
        const { graded, errors } = result.data!;
        if (errors.length > 0) {
          toast.warning(`Graded ${graded} answers. ${errors.length} errors.`);
        } else {
          toast.success(autoFinalize
            ? `All ${graded} answers graded & result finalized!`
            : `${graded} answers graded successfully`);
        }
        router.refresh();
      } else {
        toast.error(result.error ?? 'Batch grading failed');
      }
    });
  }, [answers, marks, feedback, sessionId, router]);

  const handleFinalize = useCallback(() => {
    startTransition(async () => {
      const result = await finalizeSessionAction(sessionId);
      if (result.success) {
        toast.success('Result finalized and published!');
        router.push('/teacher/grading');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to finalize');
      }
    });
  }, [sessionId, router]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div>
          <h2 className="font-semibold">Grading: {studentName}</h2>
          <p className="text-sm text-muted-foreground">
            {gradedCount}/{answers.length} graded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={gradedCount === answers.length ? 'default' : 'secondary'}>
            {gradedCount === answers.length ? 'All Graded' : `${ungradedAnswers.length} remaining`}
          </Badge>
          {/* View mode toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'step' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('step')}
            >
              <ChevronRight className="mr-1 h-3.5 w-3.5" />Step
            </Button>
            <Button
              variant={viewMode === 'batch' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('batch')}
            >
              <List className="mr-1 h-3.5 w-3.5" />All
            </Button>
          </div>
        </div>
      </div>

      {/* Anti-cheat info */}
      {antiCheatInfo && (antiCheatInfo.isFlagged || antiCheatInfo.tabSwitchCount > 0 || antiCheatInfo.fullscreenExits > 0 || antiCheatInfo.copyPasteAttempts > 0) && (
        <AntiCheatBanner info={antiCheatInfo} />
      )}

      {/* View based on mode */}
      {viewMode === 'step' ? (
        <>
          {current && (
            <AnswerCard
              answer={current}
              index={currentIndex}
              total={answers.length}
              marks={marks}
              feedback={feedback}
              editingGradeId={editingGradeId}
              isPending={isPending}
              onMarksChange={(id, val) => setMarks((p) => ({ ...p, [id]: val }))}
              onFeedbackChange={(id, val) => setFeedback((p) => ({ ...p, [id]: val }))}
              onGrade={handleGrade}
              onApproveAi={handleApproveAi}
              onEditGrade={(id) => setEditingGradeId(id)}
              onCancelEdit={() => setEditingGradeId(null)}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" />Prev
            </Button>
            <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.min(answers.length - 1, i + 1))} disabled={currentIndex === answers.length - 1}>
              Next<ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        /* Batch view - All questions */
        <div className="space-y-4">
          {answers.map((answer, idx) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              index={idx}
              total={answers.length}
              marks={marks}
              feedback={feedback}
              editingGradeId={editingGradeId}
              isPending={isPending}
              onMarksChange={(id, val) => setMarks((p) => ({ ...p, [id]: val }))}
              onFeedbackChange={(id, val) => setFeedback((p) => ({ ...p, [id]: val }))}
              onGrade={handleGrade}
              onApproveAi={handleApproveAi}
              onEditGrade={(id) => setEditingGradeId(id)}
              onCancelEdit={() => setEditingGradeId(null)}
              compact
            />
          ))}
        </div>
      )}

      {/* Action bar */}
      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {gradedCount === answers.length
            ? 'All answers graded. You can finalize the result.'
            : `${ungradedAnswers.length} answer(s) still need grading.`}
        </p>
        <div className="flex gap-2">
          {viewMode === 'batch' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleBatchGrade(false)}
                disabled={isPending}
              >
                {isPending ? <Spinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                Save All Grades
              </Button>
              <Button
                onClick={() => handleBatchGrade(true)}
                disabled={isPending}
              >
                {isPending ? <Spinner size="sm" className="mr-2" /> : <CheckCheck className="mr-2 h-4 w-4" />}
                Grade &amp; Finalize
              </Button>
            </>
          )}
          {gradedCount === answers.length && (
            <Button onClick={handleFinalize} disabled={isPending} className="bg-green-600 hover:bg-green-700">
              {isPending ? <Spinner size="sm" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
              Finalize Result
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Anti-Cheat Banner ─── */

function AntiCheatBanner({ info }: { info: AntiCheatInfo }) {
  return (
    <div className={`rounded-lg border p-3 ${info.isFlagged ? 'border-destructive bg-destructive/5' : 'border-yellow-300 bg-yellow-50'}`}>
      <div className="flex items-center gap-2 mb-2">
        {info.isFlagged ? (
          <ShieldAlert className="h-4 w-4 text-destructive" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        )}
        <span className={`text-sm font-medium ${info.isFlagged ? 'text-destructive' : 'text-yellow-700'}`}>
          {info.isFlagged ? 'Session Flagged — Suspicious Activity' : 'Anti-Cheat Alerts'}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {info.tabSwitchCount > 0 && <span>Tab switches: <strong>{info.tabSwitchCount}</strong></span>}
        {info.fullscreenExits > 0 && <span>Fullscreen exits: <strong>{info.fullscreenExits}</strong></span>}
        {info.copyPasteAttempts > 0 && <span>Copy/paste attempts: <strong>{info.copyPasteAttempts}</strong></span>}
      </div>
    </div>
  );
}

/* ─── Answer Card (used for both step and batch modes) ─── */

type AnswerCardProps = {
  answer: Answer;
  index: number;
  total: number;
  marks: Record<string, string>;
  feedback: Record<string, string>;
  editingGradeId: string | null;
  isPending: boolean;
  onMarksChange: (id: string, value: string) => void;
  onFeedbackChange: (id: string, value: string) => void;
  onGrade: (answerId: string) => void;
  onApproveAi: (gradeId: string, overrides?: { marksAwarded?: number; feedback?: string }) => void;
  onEditGrade: (gradeId: string) => void;
  onCancelEdit: () => void;
  compact?: boolean;
};

function AnswerCard({
  answer, index, total, marks, feedback, editingGradeId,
  isPending, onMarksChange, onFeedbackChange, onGrade, onApproveAi,
  onEditGrade, onCancelEdit, compact,
}: AnswerCardProps) {
  const isEditing = editingGradeId === answer.answerGrade?.id;

  return (
    <Card>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Q{index + 1}{!compact && ` / ${total}`}</Badge>
            <Badge variant="secondary" className="text-xs">{answer.question.type.replace('_', ' ')}</Badge>
          </div>
          <Badge variant="secondary">{String(answer.question.marks)} marks</Badge>
        </div>
        <CardTitle className={compact ? 'text-sm' : 'text-lg'}>{answer.question.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Student Answer */}
        <div className="rounded-md border bg-muted/50 p-3">
          <Label className="text-xs text-muted-foreground">Student Answer</Label>
          <p className="mt-1 whitespace-pre-wrap text-sm">{answer.answer || 'No answer provided'}</p>
        </div>

        {/* Model Answer */}
        {answer.question.correctAnswer && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <Label className="text-xs text-green-700">Model Answer</Label>
            <p className="mt-1 whitespace-pre-wrap text-sm text-green-800">{answer.question.correctAnswer}</p>
          </div>
        )}

        {/* Grade display or input */}
        {answer.answerGrade && !isEditing ? (
          <GradeDisplay
            grade={answer.answerGrade}
            isPending={isPending}
            onApprove={(overrides) => onApproveAi(answer.answerGrade!.id, overrides)}
            onEdit={() => onEditGrade(answer.answerGrade!.id)}
          />
        ) : (
          <GradeInput
            answer={answer}
            marks={marks}
            feedback={feedback}
            isPending={isPending}
            isEditing={isEditing}
            onMarksChange={onMarksChange}
            onFeedbackChange={onFeedbackChange}
            onGrade={onGrade}
            onApproveWithOverrides={isEditing ? (overrides) => onApproveAi(answer.answerGrade!.id, overrides) : undefined}
            onCancelEdit={isEditing ? onCancelEdit : undefined}
          />
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Grade Input Form ─── */

function GradeInput({
  answer, marks, feedback, isPending, isEditing,
  onMarksChange, onFeedbackChange, onGrade, onApproveWithOverrides, onCancelEdit,
}: {
  answer: Answer;
  marks: Record<string, string>;
  feedback: Record<string, string>;
  isPending: boolean;
  isEditing: boolean;
  onMarksChange: (id: string, value: string) => void;
  onFeedbackChange: (id: string, value: string) => void;
  onGrade: (answerId: string) => void;
  onApproveWithOverrides?: (overrides: { marksAwarded: number; feedback: string }) => void;
  onCancelEdit?: () => void;
}) {
  return (
    <div className="space-y-3 rounded-md border border-dashed p-3">
      {isEditing && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <PenLine className="h-3.5 w-3.5" />
          Editing existing grade
        </div>
      )}
      <div className="flex gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Marks (max {answer.question.marks})</Label>
          <Input
            type="number"
            min={0}
            max={answer.question.marks}
            step="0.5"
            value={marks[answer.id] ?? ''}
            onChange={(e) => onMarksChange(answer.id, e.target.value)}
            className="w-24"
            placeholder="0"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Feedback</Label>
        <Textarea
          value={feedback[answer.id] ?? ''}
          onChange={(e) => onFeedbackChange(answer.id, e.target.value)}
          rows={2}
          placeholder="Optional feedback..."
        />
      </div>
      <div className="flex gap-2">
        {isEditing && onApproveWithOverrides ? (
          <>
            <Button
              size="sm"
              onClick={() => onApproveWithOverrides({
                marksAwarded: parseFloat(marks[answer.id] ?? '0'),
                feedback: feedback[answer.id] ?? '',
              })}
              disabled={isPending}
            >
              {isPending && <Spinner size="sm" className="mr-2" />}
              <Save className="mr-1 h-3.5 w-3.5" />Save Changes
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit} disabled={isPending}>
              Cancel
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => onGrade(answer.id)} disabled={isPending}>
            {isPending && <Spinner size="sm" className="mr-2" />}
            <CheckCircle className="mr-1 h-3.5 w-3.5" />Grade Answer
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── Grade Display with AI indicator and edit capability ─── */

function GradeDisplay({
  grade,
  isPending,
  onApprove,
  onEdit,
}: {
  grade: NonNullable<Answer['answerGrade']>;
  isPending: boolean;
  onApprove: (overrides?: { marksAwarded?: number; feedback?: string }) => void;
  onEdit: () => void;
}) {
  const isAi = grade.gradedBy === 'AI';
  const confidence = grade.aiConfidence != null ? Number(grade.aiConfidence) : null;

  const confidenceColor =
    confidence != null
      ? confidence >= 0.85
        ? 'text-green-600'
        : confidence >= 0.6
          ? 'text-yellow-600'
          : 'text-red-600'
      : '';

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex flex-wrap items-center gap-2">
        {isAi ? (
          <Brain className="h-4 w-4 text-purple-500" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-600" />
        )}
        <span className="font-medium">
          {String(grade.marksAwarded)} marks
        </span>
        <Badge variant="outline" className="text-xs">
          {grade.gradedBy}
        </Badge>
        {confidence != null && (
          <span className={`text-xs ${confidenceColor}`}>
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
        {isAi && grade.isReviewed && (
          <Badge variant="secondary" className="text-xs">
            <Shield className="mr-1 h-3 w-3" /> Reviewed
          </Badge>
        )}
      </div>

      {grade.feedback && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {grade.feedback}
        </p>
      )}

      <div className="flex gap-2">
        {/* Edit button - always available for teacher to modify grades */}
        <Button size="sm" variant="outline" onClick={onEdit} disabled={isPending}>
          <PenLine className="mr-1 h-3.5 w-3.5" />Edit
        </Button>

        {/* Approve button - only for unreviewed AI grades */}
        {isAi && !grade.isReviewed && (
          <Button size="sm" variant="outline" onClick={() => onApprove()} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-1" /> : <Shield className="mr-1 h-3.5 w-3.5" />}
            Approve
          </Button>
        )}
      </div>
    </div>
  );
}
