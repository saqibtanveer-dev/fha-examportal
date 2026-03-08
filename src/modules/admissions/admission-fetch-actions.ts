/**
 * Admission read-only server actions — all queries wrapped with auth + serialization.
 */

'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import { actionError, actionSuccess } from '@/types/action-result';
import {
  listCampaigns,
  getCampaignById,
  listApplicants,
  getApplicantById,
  getMeritList,
  getScholarshipReport,
  getCampaignStats,
  getCampaignAnalytics,
} from './admission-queries';
import type { CampaignListFilters, ApplicantListFilters } from './admission-queries';
import type { PaginationParams } from '@/utils/pagination';
import { safeFetchAction } from '@/lib/safe-action';

// ============================================
// Campaign Fetch Actions (Admin)
// ============================================

export const fetchCampaignsAction = safeFetchAction(async (
  params: PaginationParams,
  filters?: CampaignListFilters,
) => {
  await requireRole('ADMIN', 'TEACHER');
  const result = await listCampaigns(params, filters);
  return actionSuccess(serialize(result));
});

export const fetchCampaignDetailAction = safeFetchAction(async (
  campaignId: string,
) => {
  await requireRole('ADMIN', 'TEACHER');
  const campaign = await getCampaignById(campaignId);
  if (!campaign) return actionError('Campaign not found');
  return actionSuccess(serialize(campaign));
});

export const fetchCampaignStatsAction = safeFetchAction(async (
  campaignId: string,
) => {
  await requireRole('ADMIN');
  const stats = await getCampaignStats(campaignId);
  return actionSuccess(serialize(stats));
});

export const fetchCampaignAnalyticsAction = safeFetchAction(async (
  campaignId: string,
) => {
  await requireRole('ADMIN');
  const analytics = await getCampaignAnalytics(campaignId);
  return actionSuccess(serialize(analytics));
});

// ============================================
// Applicant Fetch Actions (Admin)
// ============================================

export const fetchApplicantsAction = safeFetchAction(async (
  params: PaginationParams,
  filters?: Partial<ApplicantListFilters>,
) => {
  await requireRole('ADMIN', 'TEACHER');
  const result = await listApplicants(params, filters);
  return actionSuccess(serialize(result));
});

export const fetchApplicantDetailAction = safeFetchAction(async (
  applicantId: string,
) => {
  await requireRole('ADMIN', 'TEACHER');
  const applicant = await getApplicantById(applicantId);
  if (!applicant) return actionError('Applicant not found');
  return actionSuccess(serialize(applicant));
});

// ============================================
// Merit List & Scholarship (Admin)
// ============================================

export const fetchMeritListAction = safeFetchAction(async (
  campaignId: string,
) => {
  await requireRole('ADMIN');
  const meritList = await getMeritList(campaignId);
  return actionSuccess(serialize(meritList));
});

export const fetchScholarshipReportAction = safeFetchAction(async (
  campaignId: string,
) => {
  await requireRole('ADMIN');
  const report = await getScholarshipReport(campaignId);
  return actionSuccess(serialize(report));
});
