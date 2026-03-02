'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/shared';
import { ChevronLeft, ChevronRight, CheckCheck, Save, Send, List } from 'lucide-react';
import type { GradingProps } from './grading-types';
import { useGradingState } from './use-grading-state';
import { AntiCheatBanner, AnswerCard } from './grading-sub-components';

export function GradingInterface({ sessionId, answers, studentName, antiCheatInfo }: GradingProps) {
  const g = useGradingState(sessionId, answers);

  const current = answers[g.currentIndex];
  if (!current && g.viewMode === 'step') return null;

  const isBatchSaving = g.loadingKeys.has('batch:save');
  const isBatchFinalizing = g.loadingKeys.has('batch:finalize');
  const isFinalizing = g.loadingKeys.has('finalize');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div>
          <h2 className="font-semibold">Grading: {studentName}</h2>
          <p className="text-sm text-muted-foreground">{g.gradedCount}/{answers.length} graded</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={g.gradedCount === answers.length ? 'default' : 'secondary'}>
            {g.gradedCount === answers.length ? 'All Graded' : `${g.ungradedAnswers.length} remaining`}
          </Badge>
          <div className="flex rounded-md border">
            <Button variant={g.viewMode === 'step' ? 'default' : 'ghost'} size="sm" className="rounded-r-none" onClick={() => g.setViewMode('step')}>
              <ChevronRight className="mr-1 h-3.5 w-3.5" />Step
            </Button>
            <Button variant={g.viewMode === 'batch' ? 'default' : 'ghost'} size="sm" className="rounded-l-none" onClick={() => g.setViewMode('batch')}>
              <List className="mr-1 h-3.5 w-3.5" />All
            </Button>
          </div>
        </div>
      </div>

      {/* Anti-cheat info */}
      {antiCheatInfo && (antiCheatInfo.isFlagged || antiCheatInfo.tabSwitchCount > 0 || antiCheatInfo.fullscreenExits > 0 || antiCheatInfo.copyPasteAttempts > 0) && (
        <AntiCheatBanner info={antiCheatInfo} />
      )}

      {/* View mode */}
      {g.viewMode === 'step' ? (
        <>
          {current && (
            <AnswerCard
              answer={current} index={g.currentIndex} total={answers.length}
              marks={g.marks} feedback={g.feedback} editingGradeId={g.editingGradeId}
              isLoading={g.isItemLoading(current.id) || g.isItemLoading(current.answerGrade?.id ?? '')}
              isAnyLoading={g.isAnyLoading}
              onMarksChange={(id, val) => g.setMarks((p) => ({ ...p, [id]: val }))}
              onFeedbackChange={(id, val) => g.setFeedback((p) => ({ ...p, [id]: val }))}
              onGrade={g.handleGrade} onApproveAi={g.handleApproveAi}
              onEditGrade={(id) => g.setEditingGradeId(id)} onCancelEdit={() => g.setEditingGradeId(null)}
            />
          )}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => g.setCurrentIndex((i) => Math.max(0, i - 1))} disabled={g.currentIndex === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" />Prev
            </Button>
            <span className="text-sm text-muted-foreground">{g.currentIndex + 1} / {answers.length}</span>
            <Button variant="outline" onClick={() => g.setCurrentIndex((i) => Math.min(answers.length - 1, i + 1))} disabled={g.currentIndex === answers.length - 1}>
              Next<ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {answers.map((answer, idx) => (
            <AnswerCard
              key={answer.id} answer={answer} index={idx} total={answers.length}
              marks={g.marks} feedback={g.feedback} editingGradeId={g.editingGradeId}
              isLoading={g.isItemLoading(answer.id) || g.isItemLoading(answer.answerGrade?.id ?? '')}
              isAnyLoading={g.isAnyLoading}
              onMarksChange={(id, val) => g.setMarks((p) => ({ ...p, [id]: val }))}
              onFeedbackChange={(id, val) => g.setFeedback((p) => ({ ...p, [id]: val }))}
              onGrade={g.handleGrade} onApproveAi={g.handleApproveAi}
              onEditGrade={(id) => g.setEditingGradeId(id)} onCancelEdit={() => g.setEditingGradeId(null)} compact
            />
          ))}
        </div>
      )}

      {/* Action bar */}
      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {g.gradedCount === answers.length ? 'All answers graded. You can finalize the result.' : `${g.ungradedAnswers.length} answer(s) still need grading.`}
        </p>
        <div className="flex gap-2">
          {g.viewMode === 'batch' && (
            <>
              <Button variant="outline" onClick={() => g.handleBatchGrade(false)} disabled={g.isAnyLoading}>
                {isBatchSaving ? <Spinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}Save All Grades
              </Button>
              <Button onClick={() => g.handleBatchGrade(true)} disabled={g.isAnyLoading}>
                {isBatchFinalizing ? <Spinner size="sm" className="mr-2" /> : <CheckCheck className="mr-2 h-4 w-4" />}Grade & Finalize
              </Button>
            </>
          )}
          {g.gradedCount === answers.length && (
            <Button onClick={g.handleFinalize} disabled={g.isAnyLoading} className="bg-green-600 hover:bg-green-700">
              {isFinalizing ? <Spinner size="sm" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}Finalize Result
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
