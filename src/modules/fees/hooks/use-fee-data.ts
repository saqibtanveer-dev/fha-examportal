'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchStudentAssignmentsAction,
  fetchFamilyPaymentsAction,
} from '../fee-fetch-actions';
import {
  fetchMyFeesAction,
  fetchFamilyChildrenWithFeesAction,
  fetchMyCreditBalanceAction,
} from '../fee-self-service-actions';

// ── Student's own fees ──

export function useMyFees(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.fees.all, 'my-fees'],
    queryFn: () => fetchMyFeesAction(),
    enabled,
  });
}

// ── Student credit balance ──

export function useMyCreditBalance(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.fees.all, 'my-credit-balance'],
    queryFn: () => fetchMyCreditBalanceAction(),
    enabled,
  });
}

// ── Student assignments (used by admin/teacher/family viewing a specific student) ──

export function useStudentAssignments(
  studentProfileId: string,
  month?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.fees.assignments(), studentProfileId, month],
    queryFn: () => fetchStudentAssignmentsAction(studentProfileId, month),
    enabled: enabled && !!studentProfileId,
  });
}

// ── Family children with fees ──

export function useFamilyChildrenWithFees(
  familyProfileId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.fees.familyPayments(), 'children', familyProfileId],
    queryFn: () => fetchFamilyChildrenWithFeesAction(familyProfileId),
    enabled: enabled && !!familyProfileId,
  });
}

// ── Family payment history ──

export function useFamilyPaymentHistory(
  familyProfileId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.fees.familyPayments(), familyProfileId],
    queryFn: () => fetchFamilyPaymentsAction(familyProfileId),
    enabled: enabled && !!familyProfileId,
  });
}
