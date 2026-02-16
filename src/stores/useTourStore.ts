import { create } from 'zustand';

interface TourState {
  activeTour: string | null;
  startTour: (tourId: string) => void;
  stopTour: () => void;
}

export const useTourStore = create<TourState>((set) => ({
  activeTour: null,
  startTour: (tourId: string) => set({ activeTour: tourId }),
  stopTour: () => set({ activeTour: null }),
}));
