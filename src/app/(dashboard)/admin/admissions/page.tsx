import { Suspense } from 'react';
import { CampaignsPageClient } from './campaigns-page-client';
import { CampaignsListSkeleton } from './admissions-skeleton';

export default function AdmissionsPage() {
  return (
    <Suspense fallback={<CampaignsListSkeleton />}>
      <CampaignsPageClient />
    </Suspense>
  );
}
