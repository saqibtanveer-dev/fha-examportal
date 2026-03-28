import { useCallback, useState } from 'react';
import { listSessionTransitionsAction } from '@/modules/promotions/promotion-actions';
import { toast } from 'sonner';
import type { SessionTransitionRecord } from './year-transition-types';

export function useSessionTransitionHistory() {
  const [isLoadingTransitions, setIsLoadingTransitions] = useState(false);
  const [sessionTransitions, setSessionTransitions] = useState<SessionTransitionRecord[]>([]);
  const [selectedTransitionIds, setSelectedTransitionIds] = useState<string[]>([]);

  const loadSessionTransitions = useCallback(async (sessionId: string) => {
    if (!sessionId) {
      setSessionTransitions([]);
      setSelectedTransitionIds([]);
      return;
    }

    setIsLoadingTransitions(true);
    try {
      const result = await listSessionTransitionsAction({ academicSessionId: sessionId });

      if (result.success) {
        setSessionTransitions(result.data ?? []);
        setSelectedTransitionIds([]);
      } else {
        toast.error(result.error ?? 'Failed to load existing transitions');
      }
    } catch {
      toast.error('Failed to load existing transitions');
    } finally {
      setIsLoadingTransitions(false);
    }
  }, []);

  const toggleTransitionSelection = useCallback((transitionId: string, selected: boolean) => {
    setSelectedTransitionIds((prev) => {
      if (selected) {
        return prev.includes(transitionId) ? prev : [...prev, transitionId];
      }
      return prev.filter((id) => id !== transitionId);
    });
  }, []);

  const setAllTransitionSelection = useCallback((selected: boolean) => {
    setSelectedTransitionIds(selected ? sessionTransitions.map((row) => row.id) : []);
  }, [sessionTransitions]);

  return {
    isLoadingTransitions,
    sessionTransitions,
    selectedTransitionIds,
    loadSessionTransitions,
    toggleTransitionSelection,
    setAllTransitionSelection,
  };
}
