'use client';

import { useFinalizeWrittenExam, useRefinalizeWrittenExam } from '@/modules/written-exams/hooks/use-written-exam-query';
import { Spinner } from '@/components/shared';
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
import { CheckCircle2, AlertTriangle, Users, UserX, UserCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type Stats = {
  totalStudents: number;
  completedCount: number;
  inProgressCount: number;
  absentCount: number;
  pendingCount: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  isRefinalize: boolean;
  stats: Stats;
};

export function FinalizeDialog({ open, onOpenChange, examId, isRefinalize, stats }: Props) {
  const finalizeMutation = useFinalizeWrittenExam(examId);
  const refinalizeMutation = useRefinalizeWrittenExam(examId);

  const activeMutation = isRefinalize ? refinalizeMutation : finalizeMutation;
  const isProcessing = activeMutation.isPending;
  const incompleteCount = stats.inProgressCount + stats.pendingCount;
  const canFinalize = stats.completedCount > 0 && incompleteCount === 0;

  const handleConfirm = () => {
    activeMutation.mutate(undefined, {
      onSuccess: (result) => {
        if (result.success) onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isProcessing) return;
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent className="max-w-md sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {canFinalize ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            {isRefinalize ? 'Recalculate Results' : 'Finalize Results'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isRefinalize
              ? 'This will recalculate scores, grades, and rankings for all students.'
              : 'This will calculate final scores, assign grades, and rank all students. Make sure all marks are entered correctly before proceeding.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={UserCheck}
            label="Completed"
            value={stats.completedCount}
            className="text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900"
          />
          <StatCard
            icon={UserX}
            label="Absent"
            value={stats.absentCount}
            className="text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
          />
          {incompleteCount > 0 && (
            <StatCard
              icon={Clock}
              label="Incomplete"
              value={incompleteCount}
              className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
            />
          )}
          <StatCard
            icon={Users}
            label="Total"
            value={stats.totalStudents}
            className="text-foreground bg-muted/50 border-border"
          />
        </div>

        {!canFinalize && incompleteCount > 0 && (
          <p className="text-sm text-destructive">
            Cannot finalize: {incompleteCount} student{incompleteCount !== 1 ? 's' : ''} still
            have incomplete marks. Enter all marks or mark them as absent first.
          </p>
        )}

        {isProcessing && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span className="font-medium">
                {isRefinalize ? 'Recalculating results...' : 'Finalizing results...'}
              </span>
            </div>
            <p className="mt-1 text-xs opacity-90">
              Please wait and do not close this dialog. This can take a few seconds for large classes.
            </p>
          </div>
        )}

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
          <AlertDialogCancel disabled={isProcessing} className="min-h-10">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canFinalize || isProcessing}
            className="min-h-10"
          >
            {isProcessing && <Spinner size="sm" className="mr-2" />}
            {isRefinalize ? (isProcessing ? 'Recalculating...' : 'Recalculate') : (isProcessing ? 'Finalizing...' : 'Finalize')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2.5 rounded-lg border p-2.5', className)}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs leading-none opacity-80">{label}</p>
        <p className="text-lg font-bold tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  );
}
