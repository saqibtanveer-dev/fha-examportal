'use client';

import { useMutation } from '@tanstack/react-query';
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
  createCampaignQuestionAction,
  importCsvQuestionsAction,
  removeQuestionsFromCampaignAction,
  configureScholarshipTiersAction,
  makeDecisionAction,
  bulkDecisionAction,
  promoteFromWaitlistAction,
  autoAssignScholarshipsAction,
  enrollApplicantAction,
  bulkEnrollAction,
  generateMeritListAction,
  addCandidateAction,
  bulkAddCandidatesAction,
  regenerateTestPinAction,
  updateCandidateAction,
} from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';

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

export function useCreateCampaignQuestion() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: createCampaignQuestionAction,
    onSuccess: () => invalidate.campaigns(),
  });
}

export function useImportCsvQuestions() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: importCsvQuestionsAction,
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
    onSuccess: () => invalidate.campaigns(),
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

// ============================================
// Candidate Management Mutations
// ============================================

export function useAddCandidate() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: addCandidateAction,
    onSuccess: () => invalidate.afterDecision(''),
  });
}

export function useBulkAddCandidates() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: bulkAddCandidatesAction,
    onSuccess: () => invalidate.afterDecision(''),
  });
}

export function useRegenerateTestPin() {
  return useMutation({
    mutationFn: regenerateTestPinAction,
  });
}

export function useUpdateCandidate() {
  const invalidate = useInvalidateCache();
  return useMutation({
    mutationFn: updateCandidateAction,
    onSuccess: () => invalidate.afterDecision(''),
  });
}
