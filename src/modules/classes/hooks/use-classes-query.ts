'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchClassesAction,
  fetchActiveClassesAction,
  fetchClassByIdAction,
} from '@/modules/classes/class-fetch-actions';

const STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useClassesList() {
  return useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: fetchClassesAction,
    staleTime: STALE_TIME,
  });
}

export function useActiveClasses() {
  return useQuery({
    queryKey: queryKeys.classes.active(),
    queryFn: fetchActiveClassesAction,
    staleTime: STALE_TIME,
  });
}

export function useClassById(classId: string) {
  return useQuery({
    queryKey: queryKeys.classes.detail(classId),
    queryFn: () => fetchClassByIdAction(classId),
    enabled: Boolean(classId),
  });
}
