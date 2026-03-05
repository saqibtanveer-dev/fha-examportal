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
import { CheckCircle2, AlertTriangle } from 'lucide-react';

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {canFinalize ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            {isRefinalize ? 'Recalculate Results' : 'Finalize Results'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {isRefinalize ? (
                <p>This will recalculate scores, grades, and rankings for all students.</p>
              ) : (
                <p>
                  This will calculate final scores, assign grades, and rank all students.
                  Make sure all marks are entered correctly before proceeding.
                </p>
              )}

              {/* Stats summary */}
              <div className="rounded-md border p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="font-medium text-green-700">{stats.completedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Absent</span>
                  <span className="font-medium text-red-700">{stats.absentCount}</span>
                </div>
                {incompleteCount > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Incomplete (marks not entered)</span>
                    <span className="font-medium">{incompleteCount}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1">
                  <span>Total</span>
                  <span className="font-medium">{stats.totalStudents}</span>
                </div>
              </div>

              {!canFinalize && incompleteCount > 0 && (
                <p className="text-sm text-destructive">
                  Cannot finalize: {incompleteCount} student{incompleteCount !== 1 ? 's' : ''} still
                  have incomplete marks. Enter all marks or mark them as absent first.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={activeMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={!canFinalize || activeMutation.isPending}>
            {activeMutation.isPending && <Spinner size="sm" className="mr-2" />}
            {isRefinalize ? 'Recalculate' : 'Finalize'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
