'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader, EmptyState } from '@/components/shared';
import { autoGradeSessionAction } from '@/modules/grading/grading-actions';
import { aiGradeSessionAction, finalizeSessionAction } from '@/modules/grading/ai-grading-actions';
import { useGradingSessionsQuery } from '@/modules/grading/hooks/use-grading-sessions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { GradingSkeleton } from './grading-skeleton';
import { toast } from 'sonner';
import { Zap, PenLine, Brain, ShieldAlert, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Session = {
  id: string;
  attemptNumber: number;
  status: string;
  submittedAt: Date | null;
  tabSwitchCount?: number;
  isFlagged?: boolean;
  student: { id: string; firstName: string; lastName: string };
  exam: { id: string; title: string; subject: { id: string; name: string } };
  _count: { studentAnswers: number };
};

/** Track loading state per session + action type */
type LoadingKey = `${string}:${'auto' | 'ai' | 'finalize'}`;

export function GradingPageClient() {
  const [loadingKeys, setLoadingKeys] = useState<Set<LoadingKey>>(new Set());
  const invalidate = useInvalidateCache();

  // React Query — client-first with caching
  const { data: sessions = [], isLoading: isQueryLoading } = useGradingSessionsQuery() as { data: Session[]; isLoading: boolean };

  const startLoading = useCallback((key: LoadingKey) => {
    setLoadingKeys((prev) => new Set(prev).add(key));
  }, []);

  const stopLoading = useCallback((key: LoadingKey) => {
    setLoadingKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isLoading = useCallback((sessionId: string, action?: 'auto' | 'ai' | 'finalize') => {
    if (action) return loadingKeys.has(`${sessionId}:${action}`);
    return (
      loadingKeys.has(`${sessionId}:auto`) ||
      loadingKeys.has(`${sessionId}:ai`) ||
      loadingKeys.has(`${sessionId}:finalize`)
    );
  }, [loadingKeys]);

  if (isQueryLoading) {
    return <GradingSkeleton />;
  }


  async function handleAutoGrade(sessionId: string) {
    const key: LoadingKey = `${sessionId}:auto`;
    startLoading(key);
    try {
      const result = await autoGradeSessionAction(sessionId);
      if (result.success) {
        const data = result.data as { mcqMarks: number; fullyGraded: boolean };
        toast.success(data.fullyGraded ? 'Fully graded!' : `MCQs graded (${data.mcqMarks} marks). Manual grading needed.`);
        await invalidate.afterGrading(sessionId);
      } else {
        toast.error(result.error ?? 'Failed');
      }
    } catch {
      toast.error('Auto-grade failed unexpectedly');
    } finally {
      stopLoading(key);
    }
  }

  async function handleAiGrade(sessionId: string) {
    const key: LoadingKey = `${sessionId}:ai`;
    startLoading(key);
    try {
      const result = await aiGradeSessionAction(sessionId);
      if (result.success && result.data) {
        const { graded, failed, needsReview } = result.data;
        const msg = `AI graded ${graded} answers.${needsReview > 0 ? ` ${needsReview} need review.` : ''}${failed > 0 ? ` ${failed} failed.` : ''}`;
        toast.success(msg);
        await invalidate.afterGrading(sessionId);
      } else {
        toast.error(result.error ?? 'AI grading failed');
      }
    } catch {
      toast.error('AI grading failed unexpectedly');
    } finally {
      stopLoading(key);
    }
  }

  async function handleFinalize(sessionId: string) {
    const key: LoadingKey = `${sessionId}:finalize`;
    startLoading(key);
    try {
      const result = await finalizeSessionAction(sessionId);
      if (result.success) {
        toast.success('Result finalized and published!');
        await invalidate.afterGrading(sessionId);
      } else {
        toast.error(result.error ?? 'Failed to finalize');
      }
    } catch {
      toast.error('Finalization failed unexpectedly');
    } finally {
      stopLoading(key);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grading"
        description="Grade submitted exam answers"
        breadcrumbs={[{ label: 'Teacher', href: '/teacher' }, { label: 'Grading' }]}
      />

      {sessions.length === 0 ? (
        <EmptyState title="No submissions" description="No exam submissions awaiting grading." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => {
            const sessionPending = isLoading(s.id);
            return (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{s.exam.subject.name}</Badge>
                    <div className="flex items-center gap-2">
                      {s.status === 'GRADING' && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs">
                          AI Graded — Review
                        </Badge>
                      )}
                      <Badge variant="secondary">{s._count.studentAnswers} answers</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-base">{s.exam.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Student: {s.student.firstName} {s.student.lastName} (Attempt #{s.attemptNumber})
                  </p>
                  {s.isFlagged && (
                    <div className="mb-3 flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Flagged — {s.tabSwitchCount ?? 0} tab switches detected
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAutoGrade(s.id)}
                      disabled={sessionPending}
                    >
                      {isLoading(s.id, 'auto') ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-1 h-3.5 w-3.5" />}
                      Auto-grade
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAiGrade(s.id)}
                      disabled={sessionPending}
                    >
                      {isLoading(s.id, 'ai') ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Brain className="mr-1 h-3.5 w-3.5" />}
                      AI Grade
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/teacher/grading/${s.id}`}>
                        <PenLine className="mr-1 h-3.5 w-3.5" />Manual
                      </Link>
                    </Button>
                    {s.status === 'GRADING' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleFinalize(s.id)}
                        disabled={sessionPending}
                      >
                        {isLoading(s.id, 'finalize') ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}
                        Finalize
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
