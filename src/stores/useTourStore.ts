import { create } from 'zustand';
import { markAllToursCompleted, APP_TOUR_SEQUENCE } from '@/components/tour/tourConfig';

const TOUR_PREFIX = 'helix-tour-';

interface TourState {
  activeTour: string | null;
  skipMode: 'section' | 'all' | null;
  singleSection: boolean;
  startTour: (tourId: string) => void;
  startSingleTour: (tourId: string) => void;
  startFullTour: () => void;
  stopTour: () => void;
  setSkipMode: (mode: 'section' | 'all') => void;
  clearSkipMode: () => void;
  skipAllTours: () => void;
}

export const useTourStore = create<TourState>((set) => ({
  activeTour: null,
  skipMode: null,
  singleSection: false,
  startTour: (tourId: string) => set({ activeTour: tourId, singleSection: false }),
  startSingleTour: (tourId: string) => set({ activeTour: tourId, singleSection: true }),
  startFullTour: () => {
    APP_TOUR_SEQUENCE.forEach((s) => {
      localStorage.removeItem(`${TOUR_PREFIX}${s.tourKey}-completed`);
    });
    set({ activeTour: 'staffing', singleSection: false, skipMode: null });
  },
  stopTour: () => set({ activeTour: null }),
  setSkipMode: (mode) => set({ skipMode: mode }),
  clearSkipMode: () => set({ skipMode: null }),
  skipAllTours: () => {
    markAllToursCompleted();
    set({ activeTour: null, skipMode: 'all' });
  },
}));
