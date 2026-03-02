'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import {
  CheckCircle, Brain, Shield, ShieldAlert, AlertTriangle, PenLine, Save,
} from 'lucide-react';
import type { Answer, AntiCheatInfo, AnswerCardProps } from './grading-types';

export function AntiCheatBanner({ info }: { info: AntiCheatInfo }) {
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

export function AnswerCard({
  answer, index, total, marks, feedback, editingGradeId,
  isLoading, isAnyLoading, onMarksChange, onFeedbackChange, onGrade, onApproveAi,
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
          <Badge variant="secondary">{Number(answer.question.marks)} marks</Badge>
        </div>
        <CardTitle className={compact ? 'text-sm' : 'text-lg'}>{answer.question.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-muted/50 p-3">
          <Label className="text-xs text-muted-foreground">Student Answer</Label>
          <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm">{answer.answer || 'No answer provided'}</p>
        </div>

        {answer.question.correctAnswer && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3">
            <Label className="text-xs text-green-700">Model Answer</Label>
            <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm text-green-800">{answer.question.correctAnswer}</p>
          </div>
        )}

        {answer.answerGrade && !isEditing ? (
          <GradeDisplay
            grade={answer.answerGrade}
            isLoading={isLoading}
            isDisabled={isAnyLoading}
            onApprove={(overrides) => onApproveAi(answer.answerGrade!.id, overrides)}
            onEdit={() => onEditGrade(answer.answerGrade!.id)}
          />
        ) : (
          <GradeInput
            answer={answer}
            marks={marks}
            feedback={feedback}
            isLoading={isLoading}
            isDisabled={isAnyLoading}
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

function GradeInput({
  answer, marks, feedback, isLoading, isDisabled, isEditing,
  onMarksChange, onFeedbackChange, onGrade, onApproveWithOverrides, onCancelEdit,
}: {
  answer: Answer;
  marks: Record<string, string>;
  feedback: Record<string, string>;
  isLoading: boolean;
  isDisabled: boolean;
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
          <PenLine className="h-3.5 w-3.5" />Editing existing grade
        </div>
      )}
      <div className="flex gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Marks (max {Number(answer.question.marks)})</Label>
          <Input type="number" min={0} max={Number(answer.question.marks)} step="0.5" value={marks[answer.id] ?? ''} onChange={(e) => onMarksChange(answer.id, e.target.value)} className="w-24" placeholder="0" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Feedback</Label>
        <Textarea value={feedback[answer.id] ?? ''} onChange={(e) => onFeedbackChange(answer.id, e.target.value)} rows={2} placeholder="Optional feedback..." />
      </div>
      <div className="flex gap-2">
        {isEditing && onApproveWithOverrides ? (
          <>
            <Button size="sm" onClick={() => onApproveWithOverrides({ marksAwarded: parseFloat(marks[answer.id] ?? '0'), feedback: feedback[answer.id] ?? '' })} disabled={isDisabled}>
              {isLoading && <Spinner size="sm" className="mr-2" />}<Save className="mr-1 h-3.5 w-3.5" />Save Changes
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit} disabled={isDisabled}>Cancel</Button>
          </>
        ) : (
          <Button size="sm" onClick={() => onGrade(answer.id)} disabled={isDisabled}>
            {isLoading && <Spinner size="sm" className="mr-2" />}<CheckCircle className="mr-1 h-3.5 w-3.5" />Grade Answer
          </Button>
        )}
      </div>
    </div>
  );
}

function GradeDisplay({
  grade, isLoading, isDisabled, onApprove, onEdit,
}: {
  grade: NonNullable<Answer['answerGrade']>;
  isLoading: boolean;
  isDisabled: boolean;
  onApprove: (overrides?: { marksAwarded?: number; feedback?: string }) => void;
  onEdit: () => void;
}) {
  const isAi = grade.gradedBy === 'AI';
  const confidence = grade.aiConfidence != null ? Number(grade.aiConfidence) : null;
  const confidenceColor = confidence != null ? (confidence >= 0.85 ? 'text-green-600' : confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600') : '';

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex flex-wrap items-center gap-2">
        {isAi ? <Brain className="h-4 w-4 text-purple-500" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
        <span className="font-medium">{Number(grade.marksAwarded)} marks</span>
        <Badge variant="outline" className="text-xs">{grade.gradedBy}</Badge>
        {confidence != null && <span className={`text-xs ${confidenceColor}`}>{Math.round(confidence * 100)}% confidence</span>}
        {isAi && grade.isReviewed && <Badge variant="secondary" className="text-xs"><Shield className="mr-1 h-3 w-3" /> Reviewed</Badge>}
      </div>
      {grade.feedback && <p className="whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">{grade.feedback}</p>}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit} disabled={isDisabled}><PenLine className="mr-1 h-3.5 w-3.5" />Edit</Button>
        {isAi && !grade.isReviewed && (
          <Button size="sm" variant="outline" onClick={() => onApprove()} disabled={isDisabled}>
            {isLoading ? <Spinner size="sm" className="mr-1" /> : <Shield className="mr-1 h-3.5 w-3.5" />}Approve
          </Button>
        )}
      </div>
    </div>
  );
}
