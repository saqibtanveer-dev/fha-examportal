'use client';

import { useEffect, useCallback, useRef } from 'react';
import { recordProctoringEventAction } from '@/modules/admissions/portal/portal-test-actions';

type ViolationType = 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'COPY_PASTE';

type UseAntiCheatOptions = {
  sessionId: string | null;
  accessToken: string;
  onViolation?: (type: ViolationType, count: number) => void;
};

/**
 * Anti-cheating hook for admission test sessions.
 * Mirrors exam module: tab switch, fullscreen exit, copy/paste blocking.
 */
export function useAntiCheat({ sessionId, accessToken, onViolation }: UseAntiCheatOptions) {
  const countsRef = useRef({ tabSwitch: 0, fullscreenExit: 0, copyPaste: 0 });

  const logViolation = useCallback(
    (type: ViolationType) => {
      if (!sessionId) return;
      switch (type) {
        case 'TAB_SWITCH':
          countsRef.current.tabSwitch++;
          break;
        case 'FULLSCREEN_EXIT':
          countsRef.current.fullscreenExit++;
          break;
        case 'COPY_PASTE':
          countsRef.current.copyPaste++;
          break;
      }
      const count =
        type === 'TAB_SWITCH' ? countsRef.current.tabSwitch :
        type === 'FULLSCREEN_EXIT' ? countsRef.current.fullscreenExit :
        countsRef.current.copyPaste;
      onViolation?.(type, count);

      if (type !== 'COPY_PASTE') {
        recordProctoringEventAction({
          sessionId,
          accessToken,
          eventType: type as 'TAB_SWITCH' | 'FULLSCREEN_EXIT',
        }).catch(() => {});
      }
    },
    [sessionId, accessToken, onViolation],
  );

  // Tab visibility
  useEffect(() => {
    if (!sessionId) return;
    const handler = () => { if (document.hidden) logViolation('TAB_SWITCH'); };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [sessionId, logViolation]);

  // Fullscreen exit
  useEffect(() => {
    if (!sessionId) return;
    const handler = () => { if (!document.fullscreenElement) logViolation('FULLSCREEN_EXIT'); };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [sessionId, logViolation]);

  // Copy/paste/cut blocking + context menu + keyboard shortcuts
  useEffect(() => {
    if (!sessionId) return;
    const blockClipboard = (e: ClipboardEvent) => { e.preventDefault(); logViolation('COPY_PASTE'); };
    const blockContext = (e: MouseEvent) => { e.preventDefault(); };
    const blockKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        logViolation('COPY_PASTE');
      }
      if (e.key === 'PrintScreen') { e.preventDefault(); logViolation('COPY_PASTE'); }
    };

    document.addEventListener('copy', blockClipboard);
    document.addEventListener('paste', blockClipboard);
    document.addEventListener('cut', blockClipboard);
    document.addEventListener('contextmenu', blockContext);
    document.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('copy', blockClipboard);
      document.removeEventListener('paste', blockClipboard);
      document.removeEventListener('cut', blockClipboard);
      document.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('keydown', blockKeys);
    };
  }, [sessionId, logViolation]);

  // Request fullscreen on mount
  useEffect(() => {
    if (!sessionId) return;
    const timer = setTimeout(() => {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [sessionId]);

  return countsRef;
}
