'use client';

import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  const [search, setSearch] = useState('');

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

  const filteredMeritList = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return meritList;
    return meritList.filter((entry: any) => {
      const fullName = `${entry.applicant?.firstName ?? ''} ${entry.applicant?.lastName ?? ''}`.toLowerCase();
      return fullName.includes(needle)
        || String(entry.applicant?.applicationNumber ?? '').toLowerCase().includes(needle)
        || String(entry.applicant?.email ?? '').toLowerCase().includes(needle);
    });
  }, [meritList, search]);

  const meritStats = useMemo(() => {
    const ranked = meritList.length;
    const passed = meritList.filter((entry: any) => entry.isPassed).length;
    const scholarships = meritList.filter((entry: any) => !!entry.applicant?.scholarship).length;
    const accepted = meritList.filter((entry: any) => entry.applicant?.status === 'ACCEPTED').length;
    return { ranked, passed, scholarships, accepted };
  }, [meritList]);

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

      <div className="grid gap-2 sm:grid-cols-4">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Ranked</p><p className="text-xl font-semibold">{meritStats.ranked}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Passed</p><p className="text-xl font-semibold">{meritStats.passed}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Scholarships</p><p className="text-xl font-semibold">{meritStats.scholarships}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Accepted</p><p className="text-xl font-semibold">{meritStats.accepted}</p></CardContent></Card>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Search by name, email, or application #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center rounded-md border px-3 text-sm text-muted-foreground">
          Showing {filteredMeritList.length} of {meritList.length}
        </div>
      </div>

      <MeritListTable entries={filteredMeritList} />
    </div>
  );
}
