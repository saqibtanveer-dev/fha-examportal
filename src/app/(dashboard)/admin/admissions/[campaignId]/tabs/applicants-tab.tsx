'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { useApplicantsQuery } from '@/modules/admissions/hooks/use-admissions-query';
import { ApplicantTable } from '@/modules/admissions/components/applicant-table';
import { EmptyState, Spinner } from '@/components/shared';
import { bulkDecisionAction } from '@/modules/admissions/admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { Users } from 'lucide-react';

type Props = {
  campaignId: string;
};

export function ApplicantsTabContent({ campaignId }: Props) {
  const { data, isLoading } = useApplicantsQuery(
    { page: 1, pageSize: 100 },
    { campaignId },
  );
  const invalidate = useInvalidateCache();
  const [isPending, startTransition] = useTransition();

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  const result = data as any;
  const applicants = result?.success ? (result.data?.data ?? []) : [];

  if (applicants.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12 text-muted-foreground" />}
        title="No applicants yet"
        description="Applicants will appear here once they register for this campaign."
      />
    );
  }

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
    <ApplicantTable
      applicants={applicants}
      campaignId={campaignId}
      onBulkAction={handleBulkAction}
    />
  );
}
