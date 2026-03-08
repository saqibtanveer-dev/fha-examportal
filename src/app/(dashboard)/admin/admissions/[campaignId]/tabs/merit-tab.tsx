'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EmptyState, Spinner } from '@/components/shared';
import { useMeritListQuery } from '@/modules/admissions/hooks/use-admissions-query';
import { MeritListTable } from '@/modules/admissions/components/merit-list-table';
import { generateMeritListAction, autoAssignScholarshipsAction } from '@/modules/admissions/admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Trophy, Award, RefreshCw } from 'lucide-react';

type Props = {
  campaignId: string;
  campaignStatus: string;
};

export function MeritTabContent({ campaignId, campaignStatus }: Props) {
  const { data, isLoading } = useMeritListQuery(campaignId);
  const invalidate = useInvalidateCache();
  const [isPending, startTransition] = useTransition();

  function handleGenerateMerit() {
    startTransition(async () => {
      const result = await generateMeritListAction(campaignId);
      if (result.success) {
        toast.success(`Merit list generated: ${result.data?.ranked ?? 0} ranked`);
        invalidate.afterDecision(campaignId);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleAutoScholarships() {
    startTransition(async () => {
      const result = await autoAssignScholarshipsAction(campaignId);
      if (result.success) {
        toast.success(`Scholarships assigned: ${result.data?.assigned ?? 0}`);
        invalidate.afterDecision(campaignId);
      } else {
        toast.error(result.error);
      }
    });
  }

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  const result = data;
  const meritList = result?.success ? (result.data ?? []) : [];

  const canGenerate = ['TEST_CLOSED', 'GRADING', 'RESULTS_READY', 'RESULTS_PUBLISHED'].includes(campaignStatus);

  if (meritList.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="h-12 w-12 text-muted-foreground" />}
        title="No merit list generated"
        description="Grade applicants and generate the merit list to start making admission decisions."
        action={
          canGenerate ? (
            <Button onClick={handleGenerateMerit} disabled={isPending}>
              {isPending ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Generate Merit List
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{meritList.length} applicants ranked</p>
        <div className="flex gap-2">
          {canGenerate && (
            <Button variant="outline" size="sm" onClick={handleGenerateMerit} disabled={isPending}>
              <RefreshCw className="mr-2 h-3 w-3" />Regenerate
            </Button>
          )}
          <Button size="sm" onClick={handleAutoScholarships} disabled={isPending}>
            <Award className="mr-2 h-3 w-3" />Auto-Assign Scholarships
          </Button>
        </div>
      </div>
      <MeritListTable entries={meritList} />
    </div>
  );
}
