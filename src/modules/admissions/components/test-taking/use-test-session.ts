'use client';

import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { toast } from 'sonner';
import {
  submitAnswerAction,
  submitTestAction,
  heartbeatAction,
} from '@/modules/admissions/portal/portal-test-actions';
import { useAntiCheat } from './use-anti-cheat';
import type { Question, AnswerState } from './test-taking-types';
import { bootstrapTestSession } from './start-test-bootstrap';

const HEARTBEAT_INTERVAL = 30_000;
const AUTO_SAVE_DEBOUNCE = 2_000;
const SAVE_RETRY_ATTEMPTS = 3;
const SAVE_RETRY_DELAY = 500;

export function useTestSession(accessToken: string) {
  const [isPending, startTransition] = useTransition();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [startError, setStartError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [violationWarning, setViolationWarning] = useState('');
  const [startNonce, setStartNonce] = useState(0);

  const sessionIdRef = useRef<string | null>(null);
  const startRequestedTokenRef = useRef<string | null>(null);
  const pendingSaveRef = useRef<Set<string>>(new Set());
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const savingRef = useRef(false);

  // Refs for latest state — avoids stale closures in callbacks/timers
  const answersRef = useRef<AnswerState>(answers);
  answersRef.current = answers;
  const markedForReviewRef = useRef<Set<string>>(markedForReview);
  markedForReviewRef.current = markedForReview;

  // Anti-cheat
  const antiCheatCounts = useAntiCheat({
    sessionId: sessionIdRef.current,
    accessToken,
    onViolation: (type, count) => {
      if (type === 'TAB_SWITCH') {
        setViolationWarning(`Warning: Tab switch detected (${count}). This is being recorded.`);
        toast.warning(`Tab switch detected (${count}x). Activity is monitored.`);
      } else if (type === 'COPY_PASTE') {
        toast.warning('Copy/paste is not allowed during the test.');
      }
      setTimeout(() => setViolationWarning(''), 5000);
    },
  });

  // ── Start session ──
  useEffect(() => {
    const startKey = `${accessToken}:${startNonce}`;
    if (startRequestedTokenRef.current === startKey) return;
    startRequestedTokenRef.current = startKey;

    setIsStarting(true);
    setStartError(null);

    let cancelled = false;
    (async () => {
      const result = await bootstrapTestSession(accessToken);
      if (cancelled) return;
      if (!result.ok) {
        setStartError(result.error);
        setIsStarting(false);
        return;
      }
      sessionIdRef.current = result.data.sessionId;
      const qs = result.data.questions as Question[];
      setQuestions(qs);

      // Restore saved answers
      const restored: AnswerState = {};
      for (const q of qs) {
        if (q.existingAnswer) {
          restored[q.campaignQuestionId] = {
            selectedOptionId: q.existingAnswer.selectedOptionId ?? undefined,
            answerText: q.existingAnswer.answerText ?? undefined,
            dirty: false,
          };
        }
      }
      setAnswers(restored);

      if (result.data.endsAt) {
        const remaining = Math.max(0, Math.floor((new Date(result.data.endsAt).getTime() - Date.now()) / 1000));
        setRemainingSeconds(remaining);
      }
      setIsStarting(false);
    })();
    return () => { cancelled = true; };
  }, [accessToken, startNonce]);

  function retryStart() {
    setStartNonce((prev) => prev + 1);
  }

  // Ref for submit handler — avoids stale closure in timer
  const handleSubmitRef = useRef<() => void>(() => {});

  // ── Countdown timer ──
  const isTimerActive = remainingSeconds !== null && remainingSeconds > 0 && !isSubmitted;
  useEffect(() => {
    if (!isTimerActive) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // ── Heartbeat ──
  useEffect(() => {
    if (!sessionIdRef.current || isSubmitted) return;
    const interval = setInterval(async () => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      const result = await heartbeatAction({ sessionId: sid, accessToken });
      if (result.success && result.data) {
        setRemainingSeconds(result.data.remainingSeconds);
      }
    }, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, [accessToken, isSubmitted]);

  // ── Save a single answer with retry ──
  async function saveOneAnswer(sid: string, cqId: string): Promise<boolean> {
    for (let attempt = 1; attempt <= SAVE_RETRY_ATTEMPTS; attempt++) {
      try {
        const a = answersRef.current[cqId];
        if (!a) return true; // nothing to save
        const result = await submitAnswerAction({
          sessionId: sid,
          campaignQuestionId: cqId,
          selectedOptionId: a.selectedOptionId,
          answerText: a.answerText,
          isMarkedForReview: markedForReviewRef.current.has(cqId),
        });
        if (result.success) return true;
        // Validation or business logic error — don't retry
        if (result.error?.includes('Validation') || result.error?.includes('not active')) {
          console.error(`[TestSession] Save answer failed (no retry): ${result.error}`);
          return false;
        }
        console.warn(`[TestSession] Save attempt ${attempt}/${SAVE_RETRY_ATTEMPTS} failed: ${result.error}`);
      } catch (err) {
        console.error(`[TestSession] Save answer threw (attempt ${attempt}):`, err);
      }
      if (attempt < SAVE_RETRY_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, SAVE_RETRY_DELAY * attempt));
      }
    }
    return false;
  }

  // ── Flush all pending saves ──
  const flushPending = useCallback(async (): Promise<number> => {
    const sid = sessionIdRef.current;
    if (!sid) return 0;
    if (savingRef.current) return 0; // prevent concurrent flushes
    savingRef.current = true;

    try {
      const ids = Array.from(pendingSaveRef.current);
      if (ids.length === 0) return 0;

      let savedCount = 0;
      // Save answers in parallel (max 5 concurrent)
      const batchSize = 5;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((cqId) => saveOneAnswer(sid, cqId)),
        );
        for (let j = 0; j < results.length; j++) {
          const r = results[j];
          const cqId = batch[j]!;
          if (r?.status === 'fulfilled' && r.value) {
            pendingSaveRef.current.delete(cqId);
            savedCount++;
          }
          // On failure, leave in pendingSaveRef for retry
        }
      }
      return savedCount;
    } finally {
      savingRef.current = false;
    }
  }, []);

  function updateAnswer(cqId: string, update: Partial<{ selectedOptionId: string; answerText: string }>) {
    setAnswers((prev) => ({
      ...prev,
      [cqId]: { ...prev[cqId], ...update, dirty: true },
    }));
    pendingSaveRef.current.add(cqId);

    // For MCQ selections: save eagerly (shorter debounce)
    // For text answers: use longer debounce
    clearTimeout(autoSaveTimerRef.current);
    const delay = update.selectedOptionId ? 300 : AUTO_SAVE_DEBOUNCE;
    autoSaveTimerRef.current = setTimeout(flushPending, delay);
  }

  function toggleReview(campaignQuestionId: string) {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(campaignQuestionId)) next.delete(campaignQuestionId);
      else next.add(campaignQuestionId);
      return next;
    });
  }

  function handleSubmitTest() {
    const sid = sessionIdRef.current;
    if (!sid) return;
    clearTimeout(autoSaveTimerRef.current);
    startTransition(async () => {
      // Mark ALL answered questions as pending to guarantee they're saved
      const currentAnswers = answersRef.current;
      for (const cqId of Object.keys(currentAnswers)) {
        if (currentAnswers[cqId]?.selectedOptionId || currentAnswers[cqId]?.answerText) {
          pendingSaveRef.current.add(cqId);
        }
      }

      // Flush with retry — try up to 3 times
      for (let flush = 0; flush < 3; flush++) {
        await flushPending();
        if (pendingSaveRef.current.size === 0) break;
        // Wait before retrying
        await new Promise((r) => setTimeout(r, 1000));
      }

      if (pendingSaveRef.current.size > 0) {
        console.error(`[TestSession] ${pendingSaveRef.current.size} answers failed to save after retries`);
      }

      const counts = antiCheatCounts.current;
      const result = await submitTestAction({
        sessionId: sid,
        tabSwitchCount: counts.tabSwitch,
        fullscreenExitCount: counts.fullscreenExit,
      });
      if (result.success && result.data) {
        setIsSubmitted(true);
        setApplicationNumber(result.data.applicationNumber);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      } else {
        toast.error(result.error ?? 'Failed to submit');
      }
    });
  }
  handleSubmitRef.current = handleSubmitTest;

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, []);

  return {
    isPending,
    questions,
    answers,
    currentIndex,
    setCurrentIndex,
    remainingSeconds,
    isStarting,
    startError,
    isSubmitted,
    applicationNumber,
    markedForReview,
    violationWarning,
    updateAnswer,
    toggleReview,
    handleSubmitTest,
    retryStart,
    formatTime,
  };
}
