'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Spinner } from '@/components/shared';
import {
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  GraduationCap,
  ArrowUpCircle,
  XCircle,
  Users,
} from 'lucide-react';
import type { PromotionSummary } from './year-transition-types';
import { SummaryCard } from './summary-card';

type Props = {
  promotionSummary: PromotionSummary;
  isPending: boolean;
  undoConfirmOpen: boolean;
  setUndoConfirmOpen: (open: boolean) => void;
  onUndo: () => void;
};

export function TransitionDoneView({
  promotionSummary,
  isPending,
  undoConfirmOpen,
  setUndoConfirmOpen,
  onUndo,
}: Props) {
  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Year Transition Completed
          </CardTitle>
          <CardDescription>
            The year transition has already been executed for the current session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Promoted" count={promotionSummary.PROMOTED ?? 0} icon={<ArrowUpCircle className="h-5 w-5 text-blue-500" />} />
            <SummaryCard label="Graduated" count={promotionSummary.GRADUATED ?? 0} icon={<GraduationCap className="h-5 w-5 text-green-500" />} />
            <SummaryCard label="Held Back" count={promotionSummary.HELD_BACK ?? 0} icon={<XCircle className="h-5 w-5 text-orange-500" />} />
            <SummaryCard label="Total" count={promotionSummary.total ?? 0} icon={<Users className="h-5 w-5 text-gray-500" />} />
          </div>

          <div className="mt-6">
            <Button variant="destructive" size="sm" onClick={() => setUndoConfirmOpen(true)} disabled={isPending}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Undo Year Transition
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">
              This will revert all students to their previous classes and re-activate graduated students.
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={undoConfirmOpen} onOpenChange={setUndoConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Undo Year Transition?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will revert ALL student promotions, graduations, and hold-backs. Students will be moved
              back to their original classes. This action should only be used if the transition was done in error.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onUndo} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Yes, Undo Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
