'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchDailyAttendanceAction,
  fetchStudentDailyAttendanceAction,
  fetchSubjectAttendanceAction,
  fetchStudentSubjectAttendanceAction,
  fetchStudentsForMarkingAction,
  fetchHasDailyAttendanceAction,
} from '../attendance-client-daily-fetch-actions';

export function useDailyAttendance(
  classId: string,
  sectionId: string,
  date: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.attendance.dailyByClassDate(classId, sectionId, date),
    queryFn: () => fetchDailyAttendanceAction(classId, sectionId, date),
    enabled: enabled && !!classId && !!sectionId && !!date,
  });
}

export function useStudentDailyAttendance(
  studentProfileId: string,
  startDate: string,
  endDate: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.attendance.studentDaily(studentProfileId), startDate, endDate],
    queryFn: () => fetchStudentDailyAttendanceAction(studentProfileId, startDate, endDate),
    enabled: enabled && !!studentProfileId && !!startDate && !!endDate,
  });
}

export function useSubjectAttendance(
  classId: string,
  sectionId: string,
  subjectId: string,
  periodSlotId: string,
  date: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.attendance.subjectBySlot(classId, sectionId, subjectId, periodSlotId, date),
    queryFn: () => fetchSubjectAttendanceAction(classId, sectionId, subjectId, periodSlotId, date),
    enabled: enabled && !!classId && !!sectionId && !!subjectId && !!periodSlotId && !!date,
  });
}

export function useStudentSubjectAttendance(
  studentProfileId: string,
  startDate: string,
  endDate: string,
  subjectId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.attendance.studentSubject(studentProfileId), startDate, endDate, subjectId],
    queryFn: () => fetchStudentSubjectAttendanceAction(studentProfileId, startDate, endDate, subjectId),
    enabled: enabled && !!studentProfileId && !!startDate && !!endDate,
  });
}

export function useStudentsForMarking(
  classId: string,
  sectionId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.attendance.studentsForMarking(classId, sectionId),
    queryFn: () => fetchStudentsForMarkingAction(classId, sectionId),
    enabled: enabled && !!classId && !!sectionId,
  });
}

export function useHasDailyAttendance(
  classId: string,
  sectionId: string,
  date: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...queryKeys.attendance.dailyByClassDate(classId, sectionId, date), 'exists'],
    queryFn: () => fetchHasDailyAttendanceAction(classId, sectionId, date),
    enabled: enabled && !!classId && !!sectionId && !!date,
  });
}
