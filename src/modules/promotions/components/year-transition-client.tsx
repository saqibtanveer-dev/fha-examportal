'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/shared';
import { AlertTriangle, ArrowUpCircle, GraduationCap, XCircle, Users } from 'lucide-react';
import type { YearTransitionProps } from './year-transition-types';
import { useYearTransition } from './use-year-transition';
import { TransitionDoneView } from './transition-done-view';
import { ClassConfigCard } from './class-config-card';
import { SummaryCard } from './summary-card';

export function YearTransitionClient({
  classes: initialClasses,
  sessions,
  promotionSummary,
  currentSessionId,
  transitionDone,
}: YearTransitionProps) {
  const yt = useYearTransition({ initialClasses, currentSessionId, transitionDone });

  // Done state
  if (yt.step === 'done' && transitionDone && promotionSummary) {
    return (
      <TransitionDoneView
        promotionSummary={promotionSummary}
        isPending={yt.isPending}
        undoConfirmOpen={yt.undoConfirmOpen}
        setUndoConfirmOpen={yt.setUndoConfirmOpen}
        onUndo={yt.handleUndo}
      />
    );
  }

  // Configure state
  return (
    <div className="space-y-6">
      {/* Session Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Session</CardTitle>
          <CardDescription>Select the ending academic session. Students will be promoted for the transition out of this session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={yt.selectedSessionId} onValueChange={yt.setSelectedSessionId}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Select academic session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} {s.isCurrent ? '(Current)' : ''}  {s._count.exams} exams
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Summary Bar */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="To Promote" count={yt.summary.promote} icon={<ArrowUpCircle className="h-5 w-5 text-blue-500" />} />
        <SummaryCard label="To Graduate" count={yt.summary.graduate} icon={<GraduationCap className="h-5 w-5 text-green-500" />} />
        <SummaryCard label="To Hold Back" count={yt.summary.holdBack} icon={<XCircle className="h-5 w-5 text-orange-500" />} />
        <SummaryCard label="Total Students" count={yt.summary.total} icon={<Users className="h-5 w-5 text-gray-500" />} />
      </div>

      {/* Class-by-class configuration */}
      {yt.configs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">No active students found in any class.</CardContent>
        </Card>
      ) : (
        yt.configs.map((cfg, classIdx) => (
          <ClassConfigCard
            key={cfg.fromClassId}
            cfg={cfg}
            classIdx={classIdx}
            onStudentAction={yt.updateStudentAction}
            onStudentSection={yt.updateStudentSection}
            onDefaultSection={yt.updateDefaultSection}
            onSetAll={yt.setAllStudentsAction}
          />
        ))
      )}

      {/* Execute Button */}
      {yt.configs.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button size="lg" onClick={() => yt.setConfirmOpen(true)} disabled={yt.isPending || !yt.selectedSessionId || yt.summary.total === 0}>
            <ArrowUpCircle className="mr-2 h-5 w-5" />
            Execute Year Transition ({yt.summary.total} students)
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={yt.confirmOpen} onOpenChange={yt.setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Year Transition
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>You are about to execute a year transition that will:</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {yt.summary.promote > 0 && <li><strong>Promote {yt.summary.promote}</strong> student{yt.summary.promote !== 1 ? 's' : ''} to the next class</li>}
                  {yt.summary.graduate > 0 && <li><strong>Graduate {yt.summary.graduate}</strong> student{yt.summary.graduate !== 1 ? 's' : ''} (accounts will be deactivated)</li>}
                  {yt.summary.holdBack > 0 && <li><strong>Hold back {yt.summary.holdBack}</strong> student{yt.summary.holdBack !== 1 ? 's' : ''} in their current class</li>}
                </ul>
                <p className="text-sm font-medium text-amber-600">This action can be undone, but should be done carefully. Students will be notified.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={yt.handleExecute}>
              {yt.isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Confirm & Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
