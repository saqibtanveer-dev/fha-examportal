'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  startTestSessionAction,
  submitAnswerAction,
  submitTestAction,
  heartbeatAction,
  recordProctoringEventAction,
} from '@/modules/admissions/portal-actions';
import {
  ADMISSION_AUTO_SAVE_INTERVAL_MS,
  ADMISSION_HEARTBEAT_INTERVAL_MS,
} from '@/lib/constants';
import type { Question, AnswerState } from './test-taking-types';

export function useTestSession(accessToken: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');

  const tabSwitchRef = useRef(0);
  const fullscreenExitRef = useRef(0);

  // ── Start test session ──────────────────────────────────────
  useEffect(() => {
    startTestSessionAction({ token: accessToken }).then((result) => {
      if (result.success && result.data) {
        const data = result.data as {
          sessionId: string;
          questions: Question[];
          endsAt: string | null;
        };
        setSessionId(data.sessionId);
        setQuestions(data.questions);

        const restored: AnswerState = {};
        for (const q of data.questions) {
          if (q.existingAnswer) {
            restored[q.campaignQuestionId] = {
              selectedOptionId: q.existingAnswer.selectedOptionId ?? undefined,
              answerText: q.existingAnswer.answerText ?? undefined,
              dirty: false,
            };
          }
        }
        setAnswers(restored);
        setIsStarting(false);
      } else {
        toast.error(result.error ?? 'Failed to start test');
      }
    });
  }, [accessToken]);

  // ── Heartbeat ───────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    const fetchHeartbeat = async () => {
      const r = await heartbeatAction({ sessionId, accessToken });
      if (r.success && r.data) {
        setRemainingSeconds(
          (r.data as { remainingSeconds: number | null }).remainingSeconds,
        );
      }
    };
    fetchHeartbeat();
    const interval = setInterval(fetchHeartbeat, ADMISSION_HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [sessionId, accessToken]);

  // ── Countdown timer ─────────────────────────────────────────
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds]);

  // ── Auto-save dirty answers ─────────────────────────────────
  const saveDirtyAnswers = useCallback(async () => {
    if (!sessionId) return;
    for (const [campaignQuestionId, answer] of Object.entries(answers)) {
      if (!answer.dirty) continue;
      await submitAnswerAction({
        sessionId,
        campaignQuestionId,
        selectedOptionId: answer.selectedOptionId,
        answerText: answer.answerText,
      });
      setAnswers((prev) => ({
        ...prev,
        [campaignQuestionId]: { ...prev[campaignQuestionId]!, dirty: false },
      }));
    }
  }, [sessionId, answers]);

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(saveDirtyAnswers, ADMISSION_AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [sessionId, saveDirtyAnswers]);

  // ── Tab visibility proctoring ───────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    function handleVisibility() {
      if (document.hidden) {
        tabSwitchRef.current++;
        recordProctoringEventAction({
          sessionId: sessionId!,
          accessToken,
          eventType: 'TAB_SWITCH',
        }).catch(() => {});
        if (tabSwitchRef.current >= 3) {
          toast.warning(
            'Warning: Multiple tab switches detected. Your test may be flagged.',
          );
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [sessionId, accessToken]);

  // ── Fullscreen proctoring ───────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        fullscreenExitRef.current++;
        recordProctoringEventAction({
          sessionId: sessionId!,
          accessToken,
          eventType: 'FULLSCREEN_EXIT',
        }).catch(() => {});
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [sessionId, accessToken]);

  // ── Handlers ────────────────────────────────────────────────
  function updateAnswer(
    campaignQuestionId: string,
    update: Partial<{ selectedOptionId: string; answerText: string }>,
  ) {
    setAnswers((prev) => ({
      ...prev,
      [campaignQuestionId]: { ...prev[campaignQuestionId], ...update, dirty: true },
    }));
  }

  function handleSubmitTest() {
    if (!sessionId) return;
    startTransition(async () => {
      await saveDirtyAnswers();
      const result = await submitTestAction({
        sessionId,
        tabSwitchCount: tabSwitchRef.current,
        fullscreenExitCount: fullscreenExitRef.current,
      } as Parameters<typeof submitTestAction>[0]);
      if (result.success && result.data) {
        setIsSubmitted(true);
        setApplicationNumber(
          (result.data as { applicationNumber: string }).applicationNumber ?? '',
        );
        document.exitFullscreen?.().catch(() => {});
      } else {
        toast.error(result.error ?? 'Failed to submit test');
      }
    });
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return {
    router,
    isPending,
    questions,
    answers,
    currentIndex,
    setCurrentIndex,
    remainingSeconds,
    isStarting,
    isSubmitted,
    showSubmitConfirm,
    setShowSubmitConfirm,
    applicationNumber,
    updateAnswer,
    handleSubmitTest,
    formatTime,
  };
}
