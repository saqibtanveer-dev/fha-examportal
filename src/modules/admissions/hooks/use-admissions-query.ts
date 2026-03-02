'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
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
  fetchPublicCampaignsAction,
  fetchPublicCampaignDetailAction,
} from '../admission-fetch-actions';
import {
  createCampaignAction,
  updateCampaignAction,
  deleteCampaignAction,
  openRegistrationAction,
  closeRegistrationAction,
  activateTestAction,
  closeTestAction,
  triggerGradingAction,
  publishResultsAction,
  completeCampaignAction,
  archiveCampaignAction,
  addQuestionsToCampaignAction,
  removeQuestionsFromCampaignAction,
  configureScholarshipTiersAction,
  makeDecisionAction,
  bulkDecisionAction,
  promoteFromWaitlistAction,
  autoAssignScholarshipsAction,
  enrollApplicantAction,
  bulkEnrollAction,
  generateMeritListAction,
} from '../admission-actions';
import type { PaginationParams } from '@/utils/pagination';
import type { CampaignListFilters, ApplicantListFilters } from '../admission-queries';
import { useInvalidateCache } from '@/lib/cache-utils';

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

// ============================================
// Public Queries (no auth)
// ============================================

export function usePublicCampaignsQuery() {
  return useQuery({
    queryKey: queryKeys.publicCampaigns.list(),
    queryFn: fetchPublicCampaignsAction,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicCampaignDetailQuery(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.publicCampaigns.detail(slug!),
    queryFn: () => fetchPublicCampaignDetailAction(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// Campaign Mutations
// ============================================

export function useCreateCampaign() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: createCampaignAction,
    onSuccess: () => invalidate.campaigns(),
  });
}

export function useUpdateCampaign() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: updateCampaignAction,
    onSuccess: () => invalidate.campaigns(),
  });
}

export function useDeleteCampaign() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: deleteCampaignAction,
    onSuccess: () => invalidate.campaigns(),
  });
}

// ============================================
// Lifecycle Mutations
// ============================================

function useCampaignLifecycleMutation(
  action: (campaignId: string) => Promise<unknown>,
) {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: action,
    onSuccess: () => invalidate.campaigns(),
  });
}

export function useOpenRegistration() {
  return useCampaignLifecycleMutation(openRegistrationAction);
}

export function useCloseRegistration() {
  return useCampaignLifecycleMutation(closeRegistrationAction);
}

export function useActivateTest() {
  return useCampaignLifecycleMutation(activateTestAction);
}

export function useCloseTest() {
  return useCampaignLifecycleMutation(closeTestAction);
}

export function useTriggerGrading() {
  return useCampaignLifecycleMutation(triggerGradingAction);
}

export function usePublishResults() {
  return useCampaignLifecycleMutation(publishResultsAction);
}

export function useCompleteCampaign() {
  return useCampaignLifecycleMutation(completeCampaignAction);
}

export function useArchiveCampaign() {
  return useCampaignLifecycleMutation(archiveCampaignAction);
}

// ============================================
// Question Management Mutations
// ============================================

export function useAddQuestionsToCampaign() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: addQuestionsToCampaignAction,
    onSuccess: () => invalidate.campaigns(),
  });
}

export function useRemoveQuestionsFromCampaign() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: removeQuestionsFromCampaignAction,
    onSuccess: () => invalidate.campaigns(),
  });
}

// ============================================
// Scholarship Mutations
// ============================================

export function useConfigureScholarshipTiers() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: configureScholarshipTiersAction,
    onSuccess: () => invalidate.campaigns(),
  });
}

export function useAutoAssignScholarships() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: autoAssignScholarshipsAction,
    onSuccess: () => invalidate.afterDecision(''),
  });
}

// ============================================
// Decision Mutations
// ============================================

export function useMakeDecision() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: makeDecisionAction,
    onSuccess: () => invalidate.afterDecision(''),
  });
}

export function useBulkDecision() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: bulkDecisionAction,
    onSuccess: () => invalidate.afterDecision(''),
  });
}

export function usePromoteFromWaitlist() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: ({ campaignId, count }: { campaignId: string; count?: number }) =>
      promoteFromWaitlistAction(campaignId, count),
    onSuccess: () => invalidate.afterDecision(''),
  });
}

// ============================================
// Enrollment Mutations
// ============================================

export function useEnrollApplicant() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: enrollApplicantAction,
    onSuccess: () => invalidate.afterEnrollment(''),
  });
}

export function useBulkEnroll() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: bulkEnrollAction,
    onSuccess: () => invalidate.afterEnrollment(''),
  });
}

// ============================================
// Merit List Mutation
// ============================================

export function useGenerateMeritList() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: generateMeritListAction,
    onSuccess: () => invalidate.afterDecision(''),
  });
}
