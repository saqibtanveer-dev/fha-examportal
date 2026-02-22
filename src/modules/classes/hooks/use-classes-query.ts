'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  fetchClassesAction, 
  fetchActiveClassesAction, 
  fetchClassByIdAction 
} from '@/modules/classes/class-fetch-actions';

/**
 * All classes list.
 */
export function useClassesList() {
  return useQuery({
    queryKey: ['admin', 'classes'],
    queryFn: fetchClassesAction,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Active classes only.
 */
export function useActiveClasses() {
  return useQuery({
    queryKey: ['admin', 'classes', 'active'],
    queryFn: fetchActiveClassesAction,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Single class by ID.
 */
export function useClassById(classId: string) {
  return useQuery({
    queryKey: ['admin', 'classes', classId],
    queryFn: () => fetchClassByIdAction(classId),
    enabled: Boolean(classId),
  });
}
