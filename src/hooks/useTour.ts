import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTourStore } from '@/stores/useTourStore';

const TOUR_PREFIX = 'helix-tour-';

export function useTour(pageKey: string) {
  const { activeTour, stopTour } = useTourStore();
  const [run, setRun] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Start when triggered from header dropdown (match exact key or base path)
  useEffect(() => {
    if (activeTour === pageKey || activeTour === pageKey.split('-')[0]) {
      setRun(true);
    }
  }, [activeTour, pageKey]);

  // Start when navigated to with ?tour=true
  useEffect(() => {
    if (searchParams.get('tour') === 'true') {
      // Clear the param to avoid re-triggering
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('tour');
        return next;
      }, { replace: true });
      // Start after a short delay for tab content to render
      const timer = setTimeout(() => setRun(true), 600);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  return { run, setRun, completeTour, resetTour };
}
