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

    // ── Nuclear option ──
    all: () => queryClient.invalidateQueries(),
  };
}
