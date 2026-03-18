'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Play, Trash2, Globe, GlobeLock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/shared';
import {
  computeConsolidatedResultsAction,
  clearConsolidatedResultsAction,
} from '@/modules/reports/actions/consolidation-actions';
import {
  publishResultTermAction,
  unpublishResultTermAction,
} from '@/modules/reports/actions/result-term-actions';
import { getConsolidationJobSnapshotAction } from '@/modules/reports/actions/result-term-consolidation-fetch-actions';
import type { ResultTermSummary } from '@/modules/reports/queries/result-term-queries';
import { format } from 'date-fns';
import { ConsolidationJobStatusPanel } from './consolidation-job-status-panel';
import type { ConsolidationJobSnapshot } from './consolidation-job-types';

type Props = { terms: ResultTermSummary[] };

export function ConsolidationClient({ terms }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTermId, setSelectedTermId] = useState('');
  const [recompute, setRecompute] = useState(false);
  const [jobSnapshot, setJobSnapshot] = useState<ConsolidationJobSnapshot | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [clearConfirmId, setClearConfirmId] = useState<string | null>(null);
  const [publishConfirmId, setPublishConfirmId] = useState<string | null>(null);
  const [unpublishConfirmId, setUnpublishConfirmId] = useState<string | null>(null);

  const selectedTerm = terms.find((t) => t.id === selectedTermId);
  const isBackgroundActive =
    jobSnapshot?.status === 'QUEUED' || jobSnapshot?.status === 'RUNNING' || selectedTerm?.isComputing;

  useEffect(() => {
    if (!selectedTermId) {
      setJobSnapshot(null);
      return;
    }

    let cancelled = false;

    const fetchSnapshot = async () => {
      setIsPolling(true);
      const res = await getConsolidationJobSnapshotAction(selectedTermId);
      const snapshot =
        res && typeof res === 'object' && 'success' in res
          ? (res.success
            ? ((res as { data?: ConsolidationJobSnapshot | null }).data ?? null)
            : null)
          : (res as ConsolidationJobSnapshot | null);

      if (!cancelled) {
        setJobSnapshot(snapshot);
      }
      if (!cancelled) setIsPolling(false);
    };

    void fetchSnapshot();
    const intervalId = setInterval(() => {
      void fetchSnapshot();
    }, 7000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [selectedTermId]);

  useEffect(() => {
    if (jobSnapshot?.status === 'COMPLETED' || jobSnapshot?.status === 'FAILED') {
      router.refresh();
    }
  }, [jobSnapshot?.status, router]);

  function handleCompute() {
    if (!selectedTermId) { toast.error('Select a result term'); return; }
    startTransition(async () => {
      try {
        const res = await computeConsolidatedResultsAction({ resultTermId: selectedTermId, recompute });
        if (res.success && res.data) {
          toast.success('Consolidation queued. Processing started in background.');
          router.refresh();
        } else {
          toast.error(res.error ?? 'Consolidation failed');
        }
      } catch {
        toast.error('Failed to queue consolidation. Please try again.');
      }
    });
  }

  function handleClear(id: string) {
    startTransition(async () => {
      try {
        const res = await clearConsolidatedResultsAction(id);
        if (res.success) {
          toast.success('Results cleared');
          router.refresh();
        } else {
          toast.error(res.error ?? 'Failed to clear');
        }
      } catch {
        toast.error('Failed to clear results. Please try again.');
      } finally {
        setClearConfirmId(null);
      }
    });
  }

  function handlePublish(id: string) {
    startTransition(async () => {
      try {
        const res = await publishResultTermAction(id);
        if (res.success) { toast.success('Results published — students can now view their DMCs'); router.refresh(); }
        else toast.error(res.error ?? 'Failed to publish');
      } catch {
        toast.error('Failed to publish results. Please try again.');
      } finally {
        setPublishConfirmId(null);
      }
    });
  }

  function handleUnpublish(id: string) {
    startTransition(async () => {
      try {
        const res = await unpublishResultTermAction(id);
        if (res.success) { toast.success('Results unpublished'); router.refresh(); }
        else toast.error(res.error ?? 'Failed');
      } catch {
        toast.error('Failed to unpublish results. Please try again.');
      } finally {
        setUnpublishConfirmId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Run Consolidation Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run Consolidation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Result Term *</Label>
              <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a result term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.class.name} ({t.academicSession.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTerm && (
            <ConsolidationJobStatusPanel
              selectedTerm={selectedTerm}
              isBackgroundActive={!!isBackgroundActive}
              isPolling={isPolling}
              recompute={recompute}
              jobSnapshot={jobSnapshot}
            />
          )}

          <div className="flex items-center gap-2">
            <Switch id="recompute" checked={recompute} onCheckedChange={setRecompute} />
            <Label htmlFor="recompute" className="text-sm cursor-pointer">
              Force recompute all students (overwrite existing results)
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCompute}
              disabled={!selectedTermId || isPending || selectedTerm?.isPublished || isBackgroundActive}
            >
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Queueing...</>
              ) : (
                <><Play className="mr-2 h-4 w-4" /> Run Consolidation</>
              )}
            </Button>
            {selectedTerm && selectedTerm._count.consolidatedResults > 0 && !selectedTerm.isPublished && (
              <Button
                variant="outline"
                onClick={() => setClearConfirmId(selectedTermId)}
                disabled={isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* All Terms Status Table */}
      <div className="space-y-3">
        <h3 className="font-semibold">All Active Result Terms</h3>
        {terms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active result terms. Create one first.</p>
        ) : (
          <div className="space-y-3">
            {terms.map((term) => (
              <Card key={term.id}>
                <CardContent className="flex flex-col gap-3 p-3 sm:p-4 sm:py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{term.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {term.class.name} · {term.academicSession.name} ·{' '}
                      {term._count.consolidatedResults} results
                    </p>
                    {term.computedAt && (
                      <p className="text-xs text-muted-foreground">
                        Computed {format(term.computedAt, 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={term.isPublished ? 'default' : 'secondary'}>
                      {term.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    {term._count.consolidatedResults > 0 && !term.isPublished && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setPublishConfirmId(term.id)}
                        disabled={isPending}
                      >
                        <Globe className="mr-1.5 h-3.5 w-3.5" /> Publish
                      </Button>
                    )}
                    {term.isPublished && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUnpublishConfirmId(term.id)}
                        disabled={isPending}
                      >
                        <GlobeLock className="mr-1.5 h-3.5 w-3.5" /> Unpublish
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!clearConfirmId}
        onOpenChange={(o) => !o && setClearConfirmId(null)}
        title="Clear Consolidated Results"
        description={`All computed results for "${terms.find((t) => t.id === clearConfirmId)?.name ?? ''}" will be permanently deleted. You will need to re-run consolidation afterwards.`}
        onConfirm={() => clearConfirmId && handleClear(clearConfirmId)}
        variant="destructive"
        confirmLabel="Clear Results"
      />
      <ConfirmDialog
        open={!!publishConfirmId}
        onOpenChange={(o) => !o && setPublishConfirmId(null)}
        title="Publish Results"
        description={`Publishing "${terms.find((t) => t.id === publishConfirmId)?.name ?? ''}" will make DMCs and results visible to all students and families.`}
        onConfirm={() => publishConfirmId && handlePublish(publishConfirmId)}
        confirmLabel="Publish"
      />
      <ConfirmDialog
        open={!!unpublishConfirmId}
        onOpenChange={(o) => !o && setUnpublishConfirmId(null)}
        title="Unpublish Results"
        description={`Unpublishing "${terms.find((t) => t.id === unpublishConfirmId)?.name ?? ''}" will hide DMCs from students and families.`}
        onConfirm={() => unpublishConfirmId && handleUnpublish(unpublishConfirmId)}
        variant="destructive"
        confirmLabel="Unpublish"
      />
    </div>
  );
}
