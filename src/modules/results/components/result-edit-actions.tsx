'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/shared';
import { reopenSessionAction } from '@/modules/grading/ai-grading-actions';
import { toast } from 'sonner';
import { RotateCcw, PenLine } from 'lucide-react';
import Link from 'next/link';

type Props = {
  sessionId: string;
  sessionStatus: string;
};

export function ResultEditActions({ sessionId, sessionStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isGraded = sessionStatus === 'GRADED';
  const isGrading = sessionStatus === 'GRADING';
  const isSubmitted = sessionStatus === 'SUBMITTED';

  function handleReopen() {
    if (!confirm('This will reopen the session for re-grading. The current result will be removed until you finalize again. Continue?')) {
      return;
    }

    startTransition(async () => {
      const result = await reopenSessionAction(sessionId);
      if (result.success) {
        toast.success('Session reopened for re-grading');
        router.push(`/teacher/grading/${sessionId}`);
      } else {
        toast.error(result.error ?? 'Failed to reopen');
      }
    });
  }

  return (
    <div className="flex gap-2">
      {/* If graded, allow reopening for re-grading */}
      {isGraded && (
        <Button variant="outline" size="sm" onClick={handleReopen} disabled={isPending}>
          {isPending ? <Spinner size="sm" className="mr-1" /> : <RotateCcw className="mr-1 h-3.5 w-3.5" />}
          Reopen for Re-grading
        </Button>
      )}

      {/* If still in grading/submitted, link to grading interface */}
      {(isGrading || isSubmitted) && (
        <Button size="sm" asChild>
          <Link href={`/teacher/grading/${sessionId}`}>
            <PenLine className="mr-1 h-3.5 w-3.5" />Grade / Edit
          </Link>
        </Button>
      )}
    </div>
  );
}
