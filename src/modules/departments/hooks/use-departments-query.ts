'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  fetchDepartmentsAction, 
  fetchDepartmentByIdAction 
} from '@/modules/departments/department-fetch-actions';

/**
 * Departments list.
 */
export function useDepartmentsList() {
  return useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: fetchDepartmentsAction,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Single department by ID.
 */
export function useDepartmentById(departmentId: string) {
  return useQuery({
    queryKey: ['admin', 'departments', departmentId],
    queryFn: () => fetchDepartmentByIdAction(departmentId),
    enabled: Boolean(departmentId),
  });
}
