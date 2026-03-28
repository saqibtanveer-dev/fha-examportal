'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/shared';
import {
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle2,
  GraduationCap,
  Layers,
  School,
  XCircle,
  Users,
} from 'lucide-react';
import type { YearTransitionProps } from './year-transition-types';
import { useYearTransition } from './use-year-transition';
import { ClassConfigCard } from './class-config-card';
import { SessionTransitionsCard } from './session-transitions-card';
import { SummaryCard } from './summary-card';

export function YearTransitionClient({
  classes: initialClasses,
  sessions,
  currentSessionId,
}: YearTransitionProps) {
  const yt = useYearTransition({ initialClasses, currentSessionId });
  const allClasses = useMemo(
    () => initialClasses.map((cls) => ({
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      sections: cls.sections,
    })),
    [initialClasses],
  );

  const executeDisabled =
    yt.isPending ||
    !yt.selectedSessionId ||
    yt.summary.total === 0 ||
    yt.validation.hasBlockingIssues;

  const executeDisabledReason = !yt.selectedSessionId
    ? 'Pick an academic session first.'
    : yt.summary.total === 0
      ? 'Select at least one student in the chosen class.'
      : yt.validation.hasBlockingIssues
        ? 'Resolve validation issues before executing.'
        : null;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Guided Year Transition Workflow
          </CardTitle>
          <CardDescription>
            Built for school operators: pick session, focus one class, review actions, then execute safely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">
              Review completion for selected class
            </span>
            <span className="font-medium">{yt.summary.total}/{yt.activeStudentsTotal} selected ({yt.reviewProgress}%)</span>
          </div>
          <Progress value={yt.reviewProgress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Step 1</Badge>
            <School className="h-4 w-4" />
            Academic Session
          </CardTitle>
          <CardDescription>
            Choose the session you are working on. Existing processed transitions will appear below for safe partial undo.
          </CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Step 2</Badge>
            <Layers className="h-4 w-4" />
            Pick Class To Process
          </CardTitle>
          <CardDescription>
            Work class-by-class for better control. Actions and execution apply to only this selected class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={yt.selectedClassId} onValueChange={yt.setSelectedClassId}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {yt.configs.map((cfg) => (
                <SelectItem key={cfg.fromClassId} value={cfg.fromClassId}>
                  {cfg.fromClassName} ({cfg.students.length} students)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="To Promote" count={yt.summary.promote} icon={<ArrowUpCircle className="h-5 w-5 text-blue-500" />} />
        <SummaryCard label="To Graduate" count={yt.summary.graduate} icon={<GraduationCap className="h-5 w-5 text-green-500" />} />
        <SummaryCard label="To Hold Back" count={yt.summary.holdBack} icon={<XCircle className="h-5 w-5 text-orange-500" />} />
        <SummaryCard label="Selected Students" count={yt.summary.total} icon={<Users className="h-5 w-5 text-gray-500" />} />
      </div>

      {yt.validation.hasBlockingIssues ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Resolve Required Items Before Execute
            </CardTitle>
            <CardDescription>
              These are blocking issues found in selected students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {yt.validation.missingTargetClass > 0 ? (
                <li>{yt.validation.missingTargetClass} student(s) marked as promote but target class is missing.</li>
              ) : null}
              {yt.validation.missingTargetSection > 0 ? (
                <li>{yt.validation.missingTargetSection} student(s) marked as promote but target section is missing or invalid.</li>
              ) : null}
              {yt.validation.invalidGraduateAction > 0 ? (
                <li>{yt.validation.invalidGraduateAction} student(s) marked as graduate in non-final class.</li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <SessionTransitionsCard
        isPending={yt.isPending}
        isLoadingTransitions={yt.isLoadingTransitions}
        sessionTransitions={yt.sessionTransitions}
        selectedTransitionIds={yt.selectedTransitionIds}
        onToggleTransitionSelection={yt.toggleTransitionSelection}
        onSetAllTransitionSelection={yt.setAllTransitionSelection}
        onOpenUndoSelected={() => yt.setUndoSelectedConfirmOpen(true)}
        onOpenUndoAll={() => yt.setUndoConfirmOpen(true)}
      />

      {yt.configs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">No active students found in any class.</CardContent>
        </Card>
      ) : yt.activeConfigs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Select a class to configure promotions.
          </CardContent>
        </Card>
      ) : (
        yt.activeConfigs.map((cfg) => {
          const classIdx = yt.configs.findIndex((entry) => entry.fromClassId === cfg.fromClassId);
          if (classIdx < 0) return null;

          return (
            <ClassConfigCard
              key={cfg.fromClassId}
              cfg={cfg}
              allClasses={allClasses}
              classIdx={classIdx}
              onStudentSelected={yt.updateStudentSelected}
              onSelectAllStudents={yt.setAllStudentsSelected}
              onSelectOnlyClass={yt.selectOnlyClass}
              onStudentAction={yt.updateStudentAction}
              onStudentTargetClass={yt.updateStudentTargetClass}
              onStudentSection={yt.updateStudentSection}
              onDefaultSection={yt.updateDefaultSection}
              onSetAll={yt.setAllStudentsAction}
            />
          );
        })
      )}

      {yt.activeConfigs.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Step 3: Review and Execute</p>
              <p className="text-sm text-muted-foreground">
                Transition will run safely in chunks and skip already processed students automatically.
              </p>
              {executeDisabledReason ? (
                <p className="mt-1 text-xs text-destructive">{executeDisabledReason}</p>
              ) : null}
            </div>
            <Button size="lg" onClick={() => yt.setConfirmOpen(true)} disabled={executeDisabled}>
              {yt.isPending ? <Spinner size="sm" className="mr-2" /> : <ArrowUpCircle className="mr-2 h-5 w-5" />}
              Execute Year Transition ({yt.summary.total} students)
            </Button>
          </div>
        </div>
      )}

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
                  {yt.summary.promote > 0 && <li><strong>Promote {yt.summary.promote}</strong> student{yt.summary.promote !== 1 ? 's' : ''} to the target class/section</li>}
                  {yt.summary.graduate > 0 && <li><strong>Graduate {yt.summary.graduate}</strong> student{yt.summary.graduate !== 1 ? 's' : ''} (accounts will be deactivated)</li>}
                  {yt.summary.holdBack > 0 && <li><strong>Hold back {yt.summary.holdBack}</strong> student{yt.summary.holdBack !== 1 ? 's' : ''} in current class</li>}
                </ul>
                <p className="text-sm font-medium text-amber-700">
                  You can run this multiple times class-by-class. Already processed students are skipped automatically.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={yt.handleExecute} disabled={yt.validation.hasBlockingIssues}>
              {yt.isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Confirm & Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={yt.undoSelectedConfirmOpen} onOpenChange={yt.setUndoSelectedConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Undo Selected Transitions?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will revert only selected students to their previous class/section and re-activate graduated users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={yt.handleUndoSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {yt.isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Undo Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={yt.undoConfirmOpen} onOpenChange={yt.setUndoConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Undo All Session Transitions?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will revert all processed transitions in the selected session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={yt.handleUndo} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {yt.isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Undo All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
