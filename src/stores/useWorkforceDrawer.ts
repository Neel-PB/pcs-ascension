import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkforceDrawerState {
  isOpen: boolean;
  height: number; // in pixels
  setOpen: (isOpen: boolean) => void;
  toggle: () => void;
  setHeight: (height: number) => void;
}

const DEFAULT_HEIGHT_PERCENT = 0.3; // 30% of viewport

export const useWorkforceDrawer = create<WorkforceDrawerState>()(
  persist(
    (set) => ({
      isOpen: false,
      height: typeof window !== 'undefined' ? window.innerHeight * DEFAULT_HEIGHT_PERCENT : 300,
      setOpen: (isOpen) => set({ isOpen }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setHeight: (height) => set({ height }),
    }),
    {
      name: 'workforce-drawer-storage',
      partialize: (state) => ({ height: state.height }), // Only persist height
    }
  )
);
