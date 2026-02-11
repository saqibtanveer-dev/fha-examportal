'use client';

import { useEffect, useCallback, useRef } from 'react';
import { logAntiCheatViolationAction } from '@/modules/sessions/anti-cheat-actions';

type ViolationType = 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'COPY_PASTE';

type UseAntiCheatOptions = {
  sessionId: string;
  enabled?: boolean;
  onViolation?: (type: ViolationType, count: number) => void;
};

/**
 * Anti-cheating hook for exam sessions.
 * Detects tab switches, fullscreen exits, and copy/paste attempts.
 */
export function useAntiCheat({
  sessionId,
  enabled = true,
  onViolation,
}: UseAntiCheatOptions) {
  const countsRef = useRef({ tabSwitch: 0, fullscreenExit: 0, copyPaste: 0 });

  const logViolation = useCallback(
    (type: ViolationType) => {
      if (!enabled) return;

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

      onViolation?.(type, getCounts(type));

      // Fire-and-forget server log
      logAntiCheatViolationAction(sessionId, type).catch(() => {});
    },
    [sessionId, enabled, onViolation],
  );

  function getCounts(type: ViolationType): number {
    switch (type) {
      case 'TAB_SWITCH': return countsRef.current.tabSwitch;
      case 'FULLSCREEN_EXIT': return countsRef.current.fullscreenExit;
      case 'COPY_PASTE': return countsRef.current.copyPaste;
    }
  }

  // Tab visibility detection
  useEffect(() => {
    if (!enabled) return;

    function handleVisibilityChange() {
      if (document.hidden) {
        logViolation('TAB_SWITCH');
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, logViolation]);

  // Fullscreen exit detection
  useEffect(() => {
    if (!enabled) return;

    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        logViolation('FULLSCREEN_EXIT');
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [enabled, logViolation]);

  // Copy/paste blocking
  useEffect(() => {
    if (!enabled) return;

    function handleCopy(e: ClipboardEvent) {
      e.preventDefault();
      logViolation('COPY_PASTE');
    }

    function handlePaste(e: ClipboardEvent) {
      e.preventDefault();
      logViolation('COPY_PASTE');
    }

    function handleCut(e: ClipboardEvent) {
      e.preventDefault();
      logViolation('COPY_PASTE');
    }

    // Block context menu
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    // Block keyboard shortcuts
    function handleKeyDown(e: KeyboardEvent) {
      // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, PrintScreen
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'v', 'x', 'a', 'p'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        logViolation('COPY_PASTE');
      }

      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        logViolation('COPY_PASTE');
      }
    }

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, logViolation]);

  // Request fullscreen on mount
  useEffect(() => {
    if (!enabled) return;

    const requestFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen not supported or blocked
      }
    };

    // Small delay to avoid React StrictMode double-call issues
    const timer = setTimeout(requestFullscreen, 500);
    return () => clearTimeout(timer);
  }, [enabled]);

  return {
    tabSwitchCount: countsRef.current.tabSwitch,
    fullscreenExitCount: countsRef.current.fullscreenExit,
    copyPasteCount: countsRef.current.copyPaste,
  };
}
