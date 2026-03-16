'use client';

import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useApplicantDetailQuery, useApplicantsQuery } from '@/modules/admissions/hooks/use-admissions-query';
import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import { ApplicantTable } from '@/modules/admissions/components/applicant-table';
import { AddCandidateDialog } from '@/modules/admissions/components/add-candidate-dialog';
import type { ApplicantDetailSheet as _ADS } from '@/modules/admissions/components/applicant-detail-sheet';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ApplicantDetailSheet = dynamic<ComponentProps<typeof _ADS>>(
  () => import('@/modules/admissions/components/applicant-detail-sheet').then(m => ({ default: m.ApplicantDetailSheet })),
  { ssr: false },
);
import { EmptyState, Spinner } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { bulkDecisionAction } from '@/modules/admissions/admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Users, UserPlus } from 'lucide-react';

type Props = {
  campaignId: string;
};

export function ApplicantsTabContent({ campaignId }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | string>('ALL');
  const { data, isLoading } = useApplicantsQuery(
    { page: 1, pageSize: 100 },
    { campaignId },
  );
  const { data: applicantDetailResult, isLoading: isApplicantDetailLoading } = useApplicantDetailQuery(
    selectedApplicantId ?? undefined,
  );
  const invalidate = useInvalidateCache();
  const [isPending, startTransition] = useTransition();

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  const result = data;
  const applicants = result?.success ? (result.data?.data ?? []) : [];

  const statuses = useMemo(() => {
    const set = new Set<string>();
    for (const applicant of applicants) {
      if (applicant.status) set.add(applicant.status);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return applicants.filter((applicant) => {
      if (statusFilter !== 'ALL' && applicant.status !== statusFilter) return false;
      if (!needle) return true;

      const fullName = `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
      return (
        fullName.includes(needle)
        || String(applicant.email ?? '').toLowerCase().includes(needle)
        || String(applicant.applicationNumber ?? '').toLowerCase().includes(needle)
      );
    });
  }, [applicants, statusFilter, search]);

  const stats = useMemo(() => {
    const total = applicants.length;
    const activeTest = applicants.filter((a) => a.status === 'TEST_IN_PROGRESS').length;
    const graded = applicants.filter((a) => a.status === 'GRADED').length;
    const accepted = applicants.filter((a) => a.status === 'ACCEPTED').length;
    return { total, activeTest, graded, accepted };
  }, [applicants]);
  const selectedApplicant =
    applicantDetailResult?.success && applicantDetailResult.data
      ? applicantDetailResult.data
      : null;

  function handleBulkAction(ids: string[], decision: string) {
    startTransition(async () => {
      const result = await bulkDecisionAction({
        applicantIds: ids,
        decision: decision as 'ACCEPTED' | 'REJECTED' | 'WAITLISTED',
      });
      if (result.success) {
        toast.success(`${result.data?.processed ?? ids.length} applicants updated`);
        invalidate.afterDecision(campaignId);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {applicants.length} candidate{applicants.length !== 1 ? 's' : ''} total
        </h3>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-semibold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">In Test</p><p className="text-xl font-semibold">{stats.activeTest}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Graded</p><p className="text-xl font-semibold">{stats.graded}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Accepted</p><p className="text-xl font-semibold">{stats.accepted}</p></CardContent></Card>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Input
          placeholder="Search by name, email, or application #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>{status.replaceAll('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center rounded-md border px-3 text-sm text-muted-foreground">
          Showing {filteredApplicants.length} of {applicants.length}
        </div>
      </div>

      {filteredApplicants.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-muted-foreground" />}
          title={applicants.length === 0 ? 'No candidates yet' : 'No candidates match current filters'}
          description={applicants.length === 0
            ? 'Add candidates to this campaign using the button above.'
            : 'Try changing search or status filters.'}
        />
      ) : (
        <ApplicantTable
          applicants={filteredApplicants}
          campaignId={campaignId}
          onViewDetail={(id) => setSelectedApplicantId(id)}
          onBulkAction={handleBulkAction}
        />
      )}

      <AddCandidateDialog
        campaignId={campaignId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <ApplicantDetailSheet
        applicant={selectedApplicant}
        open={!!selectedApplicantId}
        isLoading={isApplicantDetailLoading}
        onOpenChange={(open) => { if (!open) setSelectedApplicantId(null); }}
      />
    </div>
  );
}
