'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchDatesheetListAction,
  fetchDatesheetWithEntriesAction,
  fetchDatesheetEntriesAction,
  fetchDatesheetStatsAction,
  fetchPublishedDatesheetListAction,
  fetchMyDutyRosterAction,
  fetchPublishedDatesheetForStudentAction,
  fetchTeacherDutyRosterAction,
} from '../datesheet-fetch-actions';
import type { DatesheetStatus } from '@prisma/client';

export function useDatesheetList(academicSessionId: string, status?: DatesheetStatus) {
  return useQuery({
    queryKey: queryKeys.datesheet.list({ academicSessionId, status }),
    queryFn: () => fetchDatesheetListAction(academicSessionId, status),
    enabled: !!academicSessionId,
  });
}

export function useDatesheetDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.datesheet.detail(id),
    queryFn: () => fetchDatesheetWithEntriesAction(id),
    enabled: !!id,
  });
}

export function useDatesheetEntries(datesheetId: string) {
  return useQuery({
    queryKey: queryKeys.datesheet.entries(datesheetId),
    queryFn: () => fetchDatesheetEntriesAction(datesheetId),
    enabled: !!datesheetId,
  });
}

export function useDatesheetStats(datesheetId: string) {
  return useQuery({
    queryKey: queryKeys.datesheet.stats(datesheetId),
    queryFn: () => fetchDatesheetStatsAction(datesheetId),
    enabled: !!datesheetId,
  });
}

export function usePublishedDatesheets(academicSessionId: string) {
  return useQuery({
    queryKey: queryKeys.datesheet.list({ academicSessionId, status: 'PUBLISHED' }),
    queryFn: () => fetchPublishedDatesheetListAction(academicSessionId),
    enabled: !!academicSessionId,
  });
}

export function useTeacherDutyRoster(datesheetId: string) {
  return useQuery({
    queryKey: [...queryKeys.datesheet.all, 'my-duties', datesheetId],
    queryFn: () => fetchTeacherDutyRosterAction(datesheetId),
    enabled: !!datesheetId,
  });
}

export function useMyDutyRoster(academicSessionId: string) {
  return useQuery({
    queryKey: [...queryKeys.datesheet.all, 'my-all-duties', academicSessionId],
    queryFn: () => fetchMyDutyRosterAction(academicSessionId),
    enabled: !!academicSessionId,
  });
}

export function useStudentDatesheet(academicSessionId: string) {
  return useQuery({
    queryKey: [...queryKeys.datesheet.all, 'student', academicSessionId],
    queryFn: () => fetchPublishedDatesheetForStudentAction(academicSessionId),
    enabled: !!academicSessionId,
  });
}
