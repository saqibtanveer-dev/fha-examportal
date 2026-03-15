import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { ResultTermSummary } from '@/modules/reports/queries/result-term-queries';
import type { ConsolidationJobSnapshot } from './consolidation-job-types';

type Props = {
  selectedTerm: ResultTermSummary;
  isBackgroundActive: boolean;
  isPolling: boolean;
  recompute: boolean;
  jobSnapshot: ConsolidationJobSnapshot | null;
};

export function ConsolidationJobStatusPanel({
  selectedTerm,
  isBackgroundActive,
  isPolling,
  recompute,
  jobSnapshot,
}: Props) {
  return (
    <div className="rounded-md border p-3 text-sm space-y-1 bg-muted/30">
      <div className="flex gap-2 flex-wrap">
        <Badge variant={selectedTerm.isPublished ? 'default' : 'secondary'}>
          {selectedTerm.isPublished ? 'Published' : 'Draft'}
        </Badge>
        {isBackgroundActive && (
          <Badge variant="outline" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Computing
          </Badge>
        )}
        {jobSnapshot?.status === 'FAILED' && <Badge variant="destructive">Failed</Badge>}
        {jobSnapshot?.status === 'COMPLETED' && <Badge variant="default">Completed</Badge>}
      </div>

      <p className="text-muted-foreground">
        {selectedTerm._count.examGroups} exam groups · {selectedTerm._count.consolidatedResults} results computed
      </p>

      {isPolling && <p className="text-xs text-muted-foreground">Refreshing job status...</p>}

      {jobSnapshot?.lastEventAt && (
        <p className="text-xs text-muted-foreground">
          Last event: {format(jobSnapshot.lastEventAt, 'dd MMM yyyy, HH:mm')}
        </p>
      )}

      {(jobSnapshot?.run.processed !== null || jobSnapshot?.run.skipped !== null) && (
        <p className="text-xs text-muted-foreground">
          Progress: processed {jobSnapshot?.run.processed ?? 0}, skipped {jobSnapshot?.run.skipped ?? 0}
        </p>
      )}

      {jobSnapshot?.run.error && <p className="text-xs text-red-600">Error: {jobSnapshot.run.error}</p>}

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
  );
}
