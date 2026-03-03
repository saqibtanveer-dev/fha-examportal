'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchPeriodSlotsAction,
  fetchActivePeriodSlotsAction,
  fetchTimetableByClassAction,
  fetchTimetableByTeacherAction,
  fetchTeacherProfilesAction,
  fetchSectionsWithClassTeachersAction,
  fetchTeacherAssignedSectionsAction,
} from '../timetable-fetch-actions';

export function usePeriodSlots() {
  return useQuery({
    queryKey: queryKeys.timetable.periodSlots(),
    queryFn: () => fetchPeriodSlotsAction(),
  });
}

export function useActivePeriodSlots() {
  return useQuery({
    queryKey: [...queryKeys.timetable.periodSlots(), 'active'],
    queryFn: () => fetchActivePeriodSlotsAction(),
  });
}

export function useTimetableByClass(
  classId: string,
  sectionId: string,
  academicSessionId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.timetable.byClass(classId, sectionId),
    queryFn: () => fetchTimetableByClassAction(classId, sectionId, academicSessionId),
    enabled: enabled && !!classId && !!sectionId && !!academicSessionId,
  });
}

export function useTimetableByTeacher(
  teacherProfileId: string,
  academicSessionId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.timetable.byTeacher(teacherProfileId),
    queryFn: () => fetchTimetableByTeacherAction(teacherProfileId, academicSessionId),
    enabled: enabled && !!teacherProfileId && !!academicSessionId,
  });
}

export function useTeacherProfiles() {
  return useQuery({
    queryKey: [...queryKeys.timetable.all, 'teachers'],
    queryFn: () => fetchTeacherProfilesAction(),
  });
}

export function useSectionsWithClassTeachers() {
  return useQuery({
    queryKey: [...queryKeys.timetable.all, 'class-teachers'],
    queryFn: () => fetchSectionsWithClassTeachersAction(),
  });
}

export function useTeacherAssignedSections() {
  return useQuery({
    queryKey: [...queryKeys.timetable.all, 'assigned-sections'],
    queryFn: () => fetchTeacherAssignedSectionsAction(),
  });
}
