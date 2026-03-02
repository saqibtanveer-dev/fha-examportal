/**
 * Admission read-only server actions — all queries wrapped with auth + serialization.
 */

'use server';

import { requireRole } from '@/lib/auth-utils';
import { serialize } from '@/utils/serialize';
import type { ActionResult } from '@/types/action-result';
import { actionError, actionSuccess } from '@/types/action-result';
import {
  listCampaigns,
  getCampaignById,
  getPublicCampaigns,
  getPublicCampaignDetail,
  listApplicants,
  getApplicantById,
  getMeritList,
  getScholarshipReport,
  getCampaignStats,
  getCampaignAnalytics,
} from './admission-queries';
import type { CampaignListFilters, ApplicantListFilters } from './admission-queries';
import type { PaginationParams } from '@/utils/pagination';

// ============================================
// Campaign Fetch Actions (Admin)
// ============================================

export async function fetchCampaignsAction(
  params: PaginationParams,
  filters?: CampaignListFilters,
): Promise<ActionResult<ReturnType<typeof serialize>>> {
  await requireRole('ADMIN', 'TEACHER');
  const result = await listCampaigns(params, filters);
  return actionSuccess(serialize(result));
}

export async function fetchCampaignDetailAction(
  campaignId: string,
): Promise<ActionResult<ReturnType<typeof serialize>>> {
  await requireRole('ADMIN', 'TEACHER');
  const campaign = await getCampaignById(campaignId);
  if (!campaign) return actionError('Campaign not found');
  return actionSuccess(serialize(campaign));
}

export async function fetchCampaignStatsAction(
  campaignId: string,
): Promise<ActionResult<ReturnType<typeof serialize>>> {
  await requireRole('ADMIN');
  const stats = await getCampaignStats(campaignId);
  return actionSuccess(serialize(stats));
}

export async function fetchCampaignAnalyticsAction(
  campaignId: string,
): Promise<ActionResult<ReturnType<typeof serialize>>> {
  await requireRole('ADMIN');
  const analytics = await getCampaignAnalytics(campaignId);
  return actionSuccess(serialize(analytics));
}

// ============================================
// Applicant Fetch Actions (Admin)
// ============================================

export async function fetchApplicantsAction(
  params: PaginationParams,
  filters?: Partial<ApplicantListFilters>,
): Promise<ActionResult<ReturnType<typeof serialize>>> {
  await requireRole('ADMIN', 'TEACHER');
  const result = await listApplicants(params, filters);
  return actionSuccess(serialize(result));
}

export async function fetchApplicantDetailAction(
  applicantId: string,
): Promise<ActionResult<ReturnType<typeof serialize>>> {
  await requireRole('ADMIN', 'TEACHER');
  const applicant = await getApplicantById(applicantId);
  if (!applicant) return actionError('Applicant not found');
  return actionSuccess(serialize(applicant));
}

// ============================================
// Merit List & Scholarship (Admin)
// ============================================

export async function fetchMeritListAction(
  campaignId: string,
): Promise<ActionResult<ReturnType<typeof serialize>>> {
  await requireRole('ADMIN');
  const meritList = await getMeritList(campaignId);
  return actionSuccess(serialize(meritList));
}

export async function fetchScholarshipReportAction(
  campaignId: string,
): Promise<ActionResult<ReturnType<typeof serialize>>> {
  await requireRole('ADMIN');
  const report = await getScholarshipReport(campaignId);
  return actionSuccess(serialize(report));
}

// ============================================
// Public Fetch Actions (No Auth)
// ============================================

export async function fetchPublicCampaignsAction(): Promise<
  ActionResult<ReturnType<typeof serialize>>
> {
  const campaigns = await getPublicCampaigns();
  return actionSuccess(serialize(campaigns));
}

export async function fetchPublicCampaignDetailAction(
  slug: string,
): Promise<ActionResult<ReturnType<typeof serialize>>> {
  const campaign = await getPublicCampaignDetail(slug);
  if (!campaign) return actionError('Campaign not found');
  return actionSuccess(serialize(campaign));
}
