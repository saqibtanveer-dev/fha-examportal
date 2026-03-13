'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Play, Trash2, Globe, GlobeLock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
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
import type { ResultTermSummary } from '@/modules/reports/queries/result-term-queries';
import { format } from 'date-fns';

type Props = { terms: ResultTermSummary[] };

export function ConsolidationClient({ terms }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTermId, setSelectedTermId] = useState('');
  const [recompute, setRecompute] = useState(false);
  const [clearConfirmId, setClearConfirmId] = useState<string | null>(null);
  const [publishConfirmId, setPublishConfirmId] = useState<string | null>(null);
  const [unpublishConfirmId, setUnpublishConfirmId] = useState<string | null>(null);

  const selectedTerm = terms.find((t) => t.id === selectedTermId);

  function handleCompute() {
    if (!selectedTermId) { toast.error('Select a result term'); return; }
    startTransition(async () => {
      const res = await computeConsolidatedResultsAction({ resultTermId: selectedTermId, recompute });
      if (res.success && res.data) {
        toast.success(`Consolidation complete — ${res.data.processed} students processed`);
        router.refresh();
      } else {
        toast.error(res.error ?? 'Consolidation failed');
      }
    });
  }

  function handleClear(id: string) {
    startTransition(async () => {
      const res = await clearConsolidatedResultsAction(id);
      if (res.success) {
        toast.success('Results cleared');
        router.refresh();
      } else {
        toast.error(res.error ?? 'Failed to clear');
      }
      setClearConfirmId(null);
    });
  }

  function handlePublish(id: string) {
    startTransition(async () => {
      const res = await publishResultTermAction(id);
      if (res.success) { toast.success('Results published — students can now view their DMCs'); router.refresh(); }
      else toast.error(res.error ?? 'Failed to publish');
      setPublishConfirmId(null);
    });
  }

  function handleUnpublish(id: string) {
    startTransition(async () => {
      const res = await unpublishResultTermAction(id);
      if (res.success) { toast.success('Results unpublished'); router.refresh(); }
      else toast.error(res.error ?? 'Failed');
      setUnpublishConfirmId(null);
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
            <div className="rounded-md border p-3 text-sm space-y-1 bg-muted/30">
              <div className="flex gap-2 flex-wrap">
                <Badge variant={selectedTerm.isPublished ? 'default' : 'secondary'}>
                  {selectedTerm.isPublished ? 'Published' : 'Draft'}
                </Badge>
                {selectedTerm.isComputing && (
                  <Badge variant="outline" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Computing
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {selectedTerm._count.examGroups} exam groups ·{' '}
                {selectedTerm._count.consolidatedResults} results computed
              </p>
              {selectedTerm.computedAt && (
                <p className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Last computed: {format(selectedTerm.computedAt, 'dd MMM yyyy, HH:mm')}
                </p>
              )}
              {selectedTerm._count.consolidatedResults > 0 && (
                <p className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Existing results will be {recompute ? 'overwritten' : 'kept (only new students computed)'}
                </p>
              )}
            </div>
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
              disabled={!selectedTermId || isPending || selectedTerm?.isPublished || selectedTerm?.isComputing}
            >
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Computing...</>
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
        description="All computed results for this term will be deleted. This cannot be undone. You will need to re-run consolidation."
        onConfirm={() => clearConfirmId && handleClear(clearConfirmId)}
        variant="destructive"
        confirmLabel="Clear Results"
      />
      <ConfirmDialog
        open={!!publishConfirmId}
        onOpenChange={(o) => !o && setPublishConfirmId(null)}
        title="Publish Results"
        description="Students and families will be able to view their DMCs and results after publishing."
        onConfirm={() => publishConfirmId && handlePublish(publishConfirmId)}
        confirmLabel="Publish"
      />
      <ConfirmDialog
        open={!!unpublishConfirmId}
        onOpenChange={(o) => !o && setUnpublishConfirmId(null)}
        title="Unpublish Results"
        description="Students and families will no longer be able to view their DMCs."
        onConfirm={() => unpublishConfirmId && handleUnpublish(unpublishConfirmId)}
        variant="destructive"
        confirmLabel="Unpublish"
      />
    </div>
  );
}
