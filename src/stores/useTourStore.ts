import { create } from 'zustand';
import { markAllToursCompleted, APP_TOUR_SEQUENCE } from '@/components/tour/tourConfig';
import { supabase } from '@/integrations/supabase/client';

const TOUR_PREFIX = 'helix-tour-';

interface MicroTourStep {
  tourKey: string;
  stepIndex: number;
}

interface TourState {
  activeTour: string | null;
  skipMode: 'section' | 'all' | null;
  singleSection: boolean;
  isOnboarding: boolean;
  microTourStep: MicroTourStep | null;
  onboardingChecked: boolean;
  startTour: (tourId: string) => void;
  startSingleTour: (tourId: string) => void;
  startFullTour: () => void;
  startMicroTour: (tourKey: string, stepIndex: number) => void;
  clearMicroTour: () => void;
  stopTour: () => void;
  setSkipMode: (mode: 'section' | 'all') => void;
  clearSkipMode: () => void;
  skipAllTours: () => void;
  markOnboardingComplete: (userId: string) => Promise<void>;
  setOnboardingChecked: (val: boolean) => void;
}

export const useTourStore = create<TourState>((set) => ({
  activeTour: null,
  skipMode: null,
  singleSection: false,
  microTourStep: null,
  onboardingChecked: false,
  startTour: (tourId: string) => set({ activeTour: tourId, singleSection: false, microTourStep: null }),
  startSingleTour: (tourId: string) => set({ activeTour: tourId, singleSection: true, microTourStep: null }),
  startFullTour: () => {
    APP_TOUR_SEQUENCE.forEach((s) => {
      localStorage.removeItem(`${TOUR_PREFIX}${s.tourKey}-completed`);
    });
    set({ activeTour: 'staffing', singleSection: false, skipMode: null, microTourStep: null });
  },
  startMicroTour: (tourKey: string, stepIndex: number) =>
    set({ activeTour: tourKey, singleSection: true, microTourStep: { tourKey, stepIndex } }),
  clearMicroTour: () => set({ microTourStep: null }),
  stopTour: () => set({ activeTour: null, microTourStep: null }),
  setSkipMode: (mode) => set({ skipMode: mode }),
  clearSkipMode: () => set({ skipMode: null }),
  skipAllTours: () => {
    markAllToursCompleted();
    set({ activeTour: null, skipMode: 'all', microTourStep: null });
  },
  markOnboardingComplete: async (userId: string) => {
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true } as any)
      .eq('id', userId);
    set({ onboardingChecked: true });
  },
  setOnboardingChecked: (val: boolean) => set({ onboardingChecked: val }),
}));
