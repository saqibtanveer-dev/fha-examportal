import { Spinner } from '@/components/shared';
import { AlertTriangle } from 'lucide-react';
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answeredCount: number;
  totalQuestions: number;
  isPending: boolean;
  onConfirm: () => void;
};

export function SubmitConfirmDialog({
  open,
  onOpenChange,
  answeredCount,
  totalQuestions,
  isPending,
  onConfirm,
}: Props) {
  const unanswered = totalQuestions - answeredCount;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Test?</AlertDialogTitle>
          <AlertDialogDescription>
            You have answered {answeredCount} of {totalQuestions} questions.
            {unanswered > 0 && (
              <span className="mt-1 block text-yellow-600">
                <AlertTriangle className="mr-1 inline h-4 w-4" />
                {unanswered} questions are unanswered.
              </span>
            )}
            Once submitted, you cannot change your answers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Test</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
