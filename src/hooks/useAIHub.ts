import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AIHubState {
  isOpen: boolean;
  width: number;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setWidth: (width: number) => void;
}

export const useAIHub = create<AIHubState>()(
  persist(
    (set) => ({
      isOpen: false,
      width: 520,
      setOpen: (open) => set({ isOpen: open }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setWidth: (width) => set({ width }),
    }),
    {
      name: 'ai-hub-storage',
      partialize: (state) => ({ width: state.width }),
    }
  )
);
