import { create } from 'zustand';
import { markAllToursCompleted } from '@/components/tour/tourConfig';

interface TourState {
  activeTour: string | null;
  skipMode: 'section' | 'all' | null;
  startTour: (tourId: string) => void;
  stopTour: () => void;
  setSkipMode: (mode: 'section' | 'all') => void;
  clearSkipMode: () => void;
  skipAllTours: () => void;
}

export const useTourStore = create<TourState>((set) => ({
  activeTour: null,
  skipMode: null,
  startTour: (tourId: string) => set({ activeTour: tourId }),
  stopTour: () => set({ activeTour: null }),
  setSkipMode: (mode) => set({ skipMode: mode }),
  clearSkipMode: () => set({ skipMode: null }),
  skipAllTours: () => {
    markAllToursCompleted();
    set({ activeTour: null, skipMode: 'all' });
  },
}));
