import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkforceDrawerState {
  isOpen: boolean;
  width: number;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setWidth: (width: number) => void;
}

export const useWorkforceDrawerStore = create<WorkforceDrawerState>()(
  persist(
    (set) => ({
      isOpen: false,
      width: 520,
      setOpen: (open) => set({ isOpen: open }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setWidth: (width) => set({ width }),
    }),
    {
      name: 'workforce-drawer-storage',
      partialize: (state) => ({ width: state.width }),
    }
  )
);
