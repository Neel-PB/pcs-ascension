import { useCallback, useEffect, useState } from 'react';
import { useTourStore } from '@/stores/useTourStore';

const TOUR_PREFIX = 'helix-tour-';

export function useTour(pageKey: string) {
  const { activeTour, stopTour } = useTourStore();
  const [run, setRun] = useState(false);

  const storageKey = `${TOUR_PREFIX}${pageKey}-completed`;

  const isCompleted = useCallback(() => {
    return localStorage.getItem(storageKey) === 'true';
  }, [storageKey]);

  const completeTour = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    setRun(false);
    stopTour();
  }, [storageKey, stopTour]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Auto-start on first visit
  useEffect(() => {
    if (!isCompleted()) {
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  // Start when triggered from header dropdown
  useEffect(() => {
    if (activeTour === pageKey) {
      setRun(true);
    }
  }, [activeTour, pageKey]);

  return { run, setRun, completeTour, resetTour };
}
