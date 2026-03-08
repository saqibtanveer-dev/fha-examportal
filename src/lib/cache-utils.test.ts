import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useInvalidateCache } from '@/lib/cache-utils';
import { queryKeys } from '@/lib/query-keys';

// Mock reference store
vi.mock('@/stores/reference-store', () => ({
  useReferenceStore: {
    getState: () => ({ invalidate: vi.fn() }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const spy = vi.spyOn(queryClient, 'invalidateQueries');

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, spy, Wrapper };
}

describe('useInvalidateCache', () => {
  let spy: ReturnType<typeof vi.spyOn>;
  let Wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    const ctx = createWrapper();
    spy = ctx.spy;
    Wrapper = ctx.Wrapper;
  });

  describe('full module invalidation', () => {
    it.each([
      ['exams', queryKeys.exams.all],
      ['questions', queryKeys.questions.all],
      ['grading', queryKeys.grading.all],
      ['results', queryKeys.results.all],
      ['users', queryKeys.users.all],
      ['notifications', queryKeys.notifications.all],
      ['departments', queryKeys.departments.all],
      ['settings', queryKeys.settings.all],
      ['principal', queryKeys.principal.all],
      ['diary', queryKeys.diary.all],
      ['campaigns', queryKeys.campaigns.all],
      ['applicants', queryKeys.applicants.all],
      ['timetable', queryKeys.timetable.all],
      ['datesheet', queryKeys.datesheet.all],
      ['attendance', queryKeys.attendance.all],
    ] as const)('invalidate.%s() uses correct key', async (method, expectedKey) => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test helper: dynamic method access
      await act(() => (result.current as any)[method]());
      expect(spy).toHaveBeenCalledWith({ queryKey: expectedKey });
    });
  });

  describe('granular invalidation', () => {
    it('examDetail invalidates specific exam', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.examDetail('exam-123'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.exams.detail('exam-123') });
    });

    it('campaignDetail invalidates specific campaign', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.campaignDetail('c-1'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.campaigns.detail('c-1') });
    });

    it('applicantDetail invalidates specific applicant', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.applicantDetail('a-1'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.applicants.detail('a-1') });
    });

    it('meritList invalidates by campaign', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.meritList('c-1'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.meritList.byCampaign('c-1') });
    });

    it('timetableByClass invalidates specific class timetable', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.timetableByClass('c1', 's1'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.timetable.byClass('c1', 's1') });
    });

    it('writtenExamMarkEntry invalidates specific mark entry', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.writtenExamMarkEntry('we-1'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.writtenExams.markEntry('we-1') });
    });
  });

  describe('cross-module invalidation', () => {
    it('afterExamCreate invalidates exams + questions', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.afterExamCreate());
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.exams.all });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.questions.all });
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('afterGrading invalidates grading session + sessions + results', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.afterGrading('gs-1'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.grading.session('gs-1') });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.grading.sessions() });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.results.all });
      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('afterDecision invalidates applicants + merit + scholarship + campaign', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.afterDecision('c-1'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.applicants.all });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.meritList.byCampaign('c-1') });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.scholarshipReport.byCampaign('c-1') });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.campaigns.detail('c-1') });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.campaigns.analytics('c-1') });
      expect(spy).toHaveBeenCalledTimes(5);
    });

    it('afterAttendanceMark invalidates daily + stats', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.afterAttendanceMark('c1', 's1', '2024-01-01'));
      expect(spy).toHaveBeenCalledWith({
        queryKey: queryKeys.attendance.dailyByClassDate('c1', 's1', '2024-01-01'),
      });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.attendance.stats() });
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('afterWrittenExamFinalize invalidates markEntry + exams + results', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.afterWrittenExamFinalize('we-1'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.writtenExams.markEntry('we-1') });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.exams.all });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.results.all });
      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('afterEnrollment invalidates applicants + campaign + users', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.afterEnrollment('c-1'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.applicants.all });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.campaigns.detail('c-1') });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.users.all });
      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('afterDatesheetPublish invalidates datesheet + detail + notifications', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.afterDatesheetPublish('ds-1'));
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.datesheet.all });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.datesheet.detail('ds-1') });
      expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.notifications.all });
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });

  describe('nuclear option', () => {
    it('all() invalidates everything with no filter', async () => {
      const { result } = renderHook(() => useInvalidateCache(), { wrapper: Wrapper });
      await act(() => result.current.all());
      expect(spy).toHaveBeenCalledWith();
    });
  });
});
