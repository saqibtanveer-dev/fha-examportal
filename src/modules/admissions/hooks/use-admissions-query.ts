'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchCampaignsAction,
  fetchCampaignDetailAction,
  fetchCampaignStatsAction,
  fetchCampaignAnalyticsAction,
  fetchApplicantsAction,
  fetchApplicantDetailAction,
  fetchMeritListAction,
  fetchScholarshipReportAction,
} from '../admission-fetch-actions';
import type { PaginationParams } from '@/utils/pagination';
import type { CampaignListFilters, ApplicantListFilters } from '../admission-queries';

// ============================================
// Campaign Queries
// ============================================

export function useCampaignsQuery(
  params: PaginationParams,
  filters?: CampaignListFilters,
) {
  return useQuery({
    queryKey: queryKeys.campaigns.list({ ...params, ...filters }),
    queryFn: () => fetchCampaignsAction(params, filters),
  });
}

export function useCampaignDetailQuery(campaignId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.campaigns.detail(campaignId!),
    queryFn: () => fetchCampaignDetailAction(campaignId!),
    enabled: !!campaignId,
  });
}

export function useCampaignStatsQuery(campaignId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.campaigns.analytics(campaignId!),
    queryFn: () => fetchCampaignStatsAction(campaignId!),
    enabled: !!campaignId,
  });
}

export function useCampaignAnalyticsQuery(campaignId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.campaigns.analytics(campaignId! + '-full'),
    queryFn: () => fetchCampaignAnalyticsAction(campaignId!),
    enabled: !!campaignId,
  });
}

// ============================================
// Applicant Queries
// ============================================

export function useApplicantsQuery(
  params: PaginationParams,
  filters?: Partial<ApplicantListFilters>,
) {
  return useQuery({
    queryKey: queryKeys.applicants.list({ ...params, ...filters }),
    queryFn: () => fetchApplicantsAction(params, filters),
  });
}

export function useApplicantDetailQuery(applicantId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.applicants.detail(applicantId!),
    queryFn: () => fetchApplicantDetailAction(applicantId!),
    enabled: !!applicantId,
  });
}

// ============================================
// Merit List & Scholarship
// ============================================

export function useMeritListQuery(campaignId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.meritList.byCampaign(campaignId!),
    queryFn: () => fetchMeritListAction(campaignId!),
    enabled: !!campaignId,
  });
}

export function useScholarshipReportQuery(campaignId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.scholarshipReport.byCampaign(campaignId!),
    queryFn: () => fetchScholarshipReportAction(campaignId!),
    enabled: !!campaignId,
  });
}
