'use client';

// ============================================
// Diary Module — Query Hooks
// ============================================

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchTeacherDiaryEntriesAction,
  fetchTeacherSubjectClassesAction,
  fetchTeacherDiaryCalendarAction,
  fetchStudentDiaryAction,
  fetchStudentTodayDiaryAction,
  fetchAllDiaryEntriesAction,
  fetchDiaryEntryDetailAction,
} from '../diary-client-fetch-actions';
import {
  fetchDiaryCoverageAction,
  fetchDiaryStatsAction,
} from '../diary-client-analytics-fetch-actions';
import type { DiaryFilters } from '../diary.types';

// ── Teacher Hooks ──

export function useTeacherDiaryEntries(filters?: DiaryFilters, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.diary.teacherEntries('me'), filters],
    queryFn: () => fetchTeacherDiaryEntriesAction(filters),
    enabled,
  });
}

export function useTeacherSubjectClasses(enabled = true) {
  return useQuery({
    queryKey: queryKeys.diary.teacherSubjectClasses(),
    queryFn: () => fetchTeacherSubjectClassesAction(),
    enabled,
  });
}

export function useTeacherDiaryCalendar(year: number, month: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.diary.teacherCalendar('me', year, month),
    queryFn: () => fetchTeacherDiaryCalendarAction(year, month),
    enabled,
  });
}

// ── Student Hooks ──

export function useStudentDiary(
  startDate: string,
  endDate: string,
  subjectId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.diary.studentEntries('me', 'me'), startDate, endDate, subjectId],
    queryFn: () => fetchStudentDiaryAction(startDate, endDate, subjectId),
    enabled: enabled && !!startDate && !!endDate,
  });
}

export function useStudentTodayDiary(enabled = true) {
  return useQuery({
    queryKey: queryKeys.diary.studentToday('me', 'me'),
    queryFn: () => fetchStudentTodayDiaryAction(),
    enabled,
  });
}

// ── Principal Hooks ──

export function useAllDiaryEntries(filters?: DiaryFilters, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.diary.all, 'all-entries', filters],
    queryFn: () => fetchAllDiaryEntriesAction(filters),
    enabled,
  });
}

export function useDiaryEntryDetail(entryId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.diary.detail(entryId),
    queryFn: () => fetchDiaryEntryDetailAction(entryId),
    enabled: enabled && !!entryId,
  });
}

export function useDiaryCoverage(
  startDate: string,
  endDate: string,
  classId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.diary.coverage(startDate, endDate), classId],
    queryFn: () => fetchDiaryCoverageAction(startDate, endDate, classId),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 min cache for coverage
  });
}

export function useDiaryStats(startDate: string, endDate: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.diary.stats(startDate, endDate),
    queryFn: () => fetchDiaryStatsAction(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}
