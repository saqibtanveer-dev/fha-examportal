'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useApplicantsQuery } from '@/modules/admissions/hooks/use-admissions-query';
import { ApplicantTable } from '@/modules/admissions/components/applicant-table';
import { AddCandidateDialog } from '@/modules/admissions/components/add-candidate-dialog';
import { ApplicantDetailSheet } from '@/modules/admissions/components/applicant-detail-sheet';
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
  const { data, isLoading } = useApplicantsQuery(
    { page: 1, pageSize: 100 },
    { campaignId },
  );
  const invalidate = useInvalidateCache();
  const [isPending, startTransition] = useTransition();

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  const result = data as any;
  const applicants = result?.success ? (result.data?.data ?? []) : [];
  const selectedApplicant = selectedApplicantId
    ? applicants.find((a: any) => a.id === selectedApplicantId) ?? null
    : null;

  function handleBulkAction(ids: string[], decision: string) {
    startTransition(async () => {
      const result = await bulkDecisionAction({
        applicantIds: ids,
        decision: decision as 'ACCEPTED' | 'REJECTED' | 'WAITLISTED',
      });
      if (result.success) {
        toast.success(`${(result.data as any)?.processed ?? ids.length} applicants updated`);
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
          {applicants.length} candidate{applicants.length !== 1 ? 's' : ''}
        </h3>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      {applicants.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-muted-foreground" />}
          title="No candidates yet"
          description="Add candidates to this campaign using the button above."
        />
      ) : (
        <ApplicantTable
          applicants={applicants}
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
        onOpenChange={(open) => { if (!open) setSelectedApplicantId(null); }}
      />
    </div>
  );
}
