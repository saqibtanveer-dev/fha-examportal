'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchDepartmentsAction,
  fetchDepartmentByIdAction,
} from '@/modules/departments/department-fetch-actions';

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useDepartmentsList() {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: fetchDepartmentsAction,
    staleTime: STALE_TIME,
  });
}

export function useDepartmentById(departmentId: string) {
  return useQuery({
    queryKey: queryKeys.departments.detail(departmentId),
    queryFn: () => fetchDepartmentByIdAction(departmentId),
    enabled: Boolean(departmentId),
  });
}
