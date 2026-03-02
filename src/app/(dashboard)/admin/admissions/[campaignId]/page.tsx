import { Suspense } from 'react';
import { CampaignDetailClient } from './campaign-detail-client';
import { CampaignDetailSkeleton } from '../admissions-skeleton';

type Props = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignDetailPage({ params }: Props) {
  const { campaignId } = await params;
  return (
    <Suspense fallback={<CampaignDetailSkeleton />}>
      <CampaignDetailClient campaignId={campaignId} />
    </Suspense>
  );
}
