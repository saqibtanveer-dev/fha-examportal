'use client';

import { useCampaignDetailQuery, useCampaignStatsQuery } from '@/modules/admissions/hooks/use-admissions-query';
import { CampaignDetailSkeleton } from '../admissions-skeleton';
import { CampaignDetailView } from './campaign-detail-view';

export function CampaignDetailClient({ campaignId }: { campaignId: string }) {
  const { data: campaignResult, isLoading } = useCampaignDetailQuery(campaignId);
  const { data: statsResult } = useCampaignStatsQuery(campaignId);

  if (isLoading || !campaignResult) return <CampaignDetailSkeleton />;

  const campaignData = campaignResult as any;
  const campaign = campaignData.success ? campaignData.data : null;
  const statsData = statsResult as any;
  const stats = statsData?.success ? statsData.data : null;

  if (!campaign) return <div>Campaign not found</div>;

  return <CampaignDetailView campaign={campaign} stats={stats} />;
}
