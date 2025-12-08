import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkforceSidebarState {
  width: number;
  setWidth: (width: number) => void;
}

const MIN_WIDTH = 280;
const MAX_WIDTH_PERCENT = 0.5;
const DEFAULT_WIDTH = 320;

export const useWorkforceSidebarStore = create<WorkforceSidebarState>()(
  persist(
    (set) => ({
      width: DEFAULT_WIDTH,
      setWidth: (width: number) => {
        const maxWidth = window.innerWidth * MAX_WIDTH_PERCENT;
        const clampedWidth = Math.max(MIN_WIDTH, Math.min(width, maxWidth));
        set({ width: clampedWidth });
      },
    }),
    {
      name: "workforce-sidebar-width",
    }
  )
);

export const SIDEBAR_MIN_WIDTH = MIN_WIDTH;
export const SIDEBAR_MAX_WIDTH_PERCENT = MAX_WIDTH_PERCENT;
export const SIDEBAR_DEFAULT_WIDTH = DEFAULT_WIDTH;
