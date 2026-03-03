'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook for targeted cache invalidation after mutations.
 * Provides fine-grained invalidation by module/scope.
 *
 * Usage:
 *   const invalidate = useInvalidateCache();
 *   await invalidate.exams(); // invalidates all exam queries
 *   await invalidate.examDetail('123'); // invalidates specific exam
 */
export function useInvalidateCache() {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback(
    async (queryKey: readonly unknown[]) => {
      await queryClient.invalidateQueries({ queryKey });
    },
    [queryClient],
  );

  return {
    // ── Full module invalidation ──
    exams: () => invalidateQueries(queryKeys.exams.all),
    questions: () => invalidateQueries(queryKeys.questions.all),
    grading: () => invalidateQueries(queryKeys.grading.all),
    results: () => invalidateQueries(queryKeys.results.all),
    subjects: () => invalidateQueries(queryKeys.subjects.all),
    classes: () => invalidateQueries(queryKeys.classes.all),
    academicSessions: () => invalidateQueries(queryKeys.academicSessions.all),
    users: () => invalidateQueries(queryKeys.users.all),
    notifications: () => invalidateQueries(queryKeys.notifications.all),
    departments: () => invalidateQueries(queryKeys.departments.all),
    settings: () => invalidateQueries(queryKeys.settings.all),
    principal: () => invalidateQueries(queryKeys.principal.all),
    principalDashboard: () => invalidateQueries(['principal', 'dashboard']),

    // ── Granular invalidation ──
    examLists: () => invalidateQueries(queryKeys.exams.lists()),
    examDetail: (id: string) => invalidateQueries(queryKeys.exams.detail(id)),
    questionLists: () => invalidateQueries(queryKeys.questions.lists()),
    gradingSessions: () => invalidateQueries(queryKeys.grading.sessions()),
    gradingSession: (id: string) => invalidateQueries(queryKeys.grading.session(id)),
    resultDetail: (id: string) => invalidateQueries(queryKeys.results.detail(id)),

    // ── Cross-module invalidation for actions that affect multiple caches ──
    afterExamCreate: async () => {
      await Promise.all([
        invalidateQueries(queryKeys.exams.all),
        invalidateQueries(queryKeys.questions.all),
      ]);
    },
    afterGrading: async (sessionId: string) => {
      await Promise.all([
        invalidateQueries(queryKeys.grading.session(sessionId)),
        invalidateQueries(queryKeys.grading.sessions()),
        invalidateQueries(queryKeys.results.all),
      ]);
    },
    afterExamPublish: async () => {
      await Promise.all([
        invalidateQueries(queryKeys.exams.all),
        invalidateQueries(queryKeys.notifications.all),
      ]);
    },

    // ── Admission Module Invalidation ──
    campaigns: () => invalidateQueries(queryKeys.campaigns.all),
    campaignLists: () => invalidateQueries(queryKeys.campaigns.lists()),
    campaignDetail: (id: string) => invalidateQueries(queryKeys.campaigns.detail(id)),
    campaignAnalytics: (id: string) => invalidateQueries(queryKeys.campaigns.analytics(id)),
    applicants: () => invalidateQueries(queryKeys.applicants.all),
    applicantLists: () => invalidateQueries(queryKeys.applicants.lists()),
    applicantDetail: (id: string) => invalidateQueries(queryKeys.applicants.detail(id)),
    meritList: (campaignId: string) => invalidateQueries(queryKeys.meritList.byCampaign(campaignId)),
    scholarshipReport: (campaignId: string) => invalidateQueries(queryKeys.scholarshipReport.byCampaign(campaignId)),

    afterCampaignMutation: async (campaignId?: string) => {
      const promises = [
        invalidateQueries(queryKeys.campaigns.all),
      ];
      if (campaignId) promises.push(invalidateQueries(queryKeys.campaigns.detail(campaignId)));
      await Promise.all(promises);
    },
    afterDecision: async (campaignId: string) => {
      await Promise.all([
        invalidateQueries(queryKeys.applicants.all),
        invalidateQueries(queryKeys.meritList.byCampaign(campaignId)),
        invalidateQueries(queryKeys.scholarshipReport.byCampaign(campaignId)),
        invalidateQueries(queryKeys.campaigns.detail(campaignId)),
        invalidateQueries(queryKeys.campaigns.analytics(campaignId)),
      ]);
    },
    afterEnrollment: async (campaignId: string) => {
      await Promise.all([
        invalidateQueries(queryKeys.applicants.all),
        invalidateQueries(queryKeys.campaigns.detail(campaignId)),
        invalidateQueries(queryKeys.users.all),
      ]);
    },

    // ── Timetable Module Invalidation ──
    timetable: () => invalidateQueries(queryKeys.timetable.all),
    periodSlots: () => invalidateQueries(queryKeys.timetable.periodSlots()),
    timetableByClass: (classId: string, sectionId: string) =>
      invalidateQueries(queryKeys.timetable.byClass(classId, sectionId)),
    timetableByTeacher: (teacherProfileId: string) =>
      invalidateQueries(queryKeys.timetable.byTeacher(teacherProfileId)),
    afterTimetableMutation: async () => {
      await invalidateQueries(queryKeys.timetable.all);
    },

    // ── Attendance Module Invalidation ──
    attendance: () => invalidateQueries(queryKeys.attendance.all),
    dailyAttendance: () => invalidateQueries(queryKeys.attendance.daily()),
    subjectAttendance: () => invalidateQueries(queryKeys.attendance.subject()),
    attendanceStats: () => invalidateQueries(queryKeys.attendance.stats()),
    afterAttendanceMark: async (classId: string, sectionId: string, date: string) => {
      await Promise.all([
        invalidateQueries(queryKeys.attendance.dailyByClassDate(classId, sectionId, date)),
        invalidateQueries(queryKeys.attendance.stats()),
      ]);
    },
    afterSubjectAttendanceMark: async () => {
      await Promise.all([
        invalidateQueries(queryKeys.attendance.subject()),
        invalidateQueries(queryKeys.attendance.stats()),
      ]);
    },

    // ── Nuclear option ──
    all: () => queryClient.invalidateQueries(),
  };
}
