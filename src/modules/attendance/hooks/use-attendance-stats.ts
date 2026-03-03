'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchDailyAttendanceCountsAction,
  fetchStudentDailyAttendanceCountsAction,
  fetchClassAttendanceTrendAction,
  fetchStudentWiseAttendanceAction,
  fetchSchoolAttendanceForDateAction,
  fetchActiveStudentCountAction,
} from '../attendance-fetch-actions';

export function useDailyAttendanceCounts(
  classId: string,
  sectionId: string,
  date: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.attendance.stats(), 'counts', classId, sectionId, date],
    queryFn: () => fetchDailyAttendanceCountsAction(classId, sectionId, date),
    enabled: enabled && !!classId && !!sectionId && !!date,
  });
}

export function useStudentAttendanceCounts(
  studentProfileId: string,
  startDate: string,
  endDate: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.attendance.studentDaily(studentProfileId), 'counts', startDate, endDate],
    queryFn: () => fetchStudentDailyAttendanceCountsAction(studentProfileId, startDate, endDate),
    enabled: enabled && !!studentProfileId && !!startDate && !!endDate,
  });
}

export function useClassAttendanceTrend(
  classId: string,
  sectionId: string,
  startDate: string,
  endDate: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.attendance.classTrend(classId, sectionId), startDate, endDate],
    queryFn: () => fetchClassAttendanceTrendAction(classId, sectionId, startDate, endDate),
    enabled: enabled && !!classId && !!sectionId && !!startDate && !!endDate,
  });
}

export function useStudentWiseAttendance(
  classId: string,
  sectionId: string,
  startDate: string,
  endDate: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.attendance.stats(), 'student-wise', classId, sectionId, startDate, endDate],
    queryFn: () => fetchStudentWiseAttendanceAction(classId, sectionId, startDate, endDate),
    enabled: enabled && !!classId && !!sectionId && !!startDate && !!endDate,
  });
}

export function useSchoolAttendanceOverview(date: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.attendance.schoolOverview(date),
    queryFn: () => fetchSchoolAttendanceForDateAction(date),
    enabled: enabled && !!date,
  });
}

export function useActiveStudentCount(classId: string, sectionId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.attendance.studentsForMarking(classId, sectionId), 'count'],
    queryFn: () => fetchActiveStudentCountAction(classId, sectionId),
    enabled: enabled && !!classId && !!sectionId,
  });
}
