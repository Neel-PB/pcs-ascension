import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeedbackState {
  isOpen: boolean;
  width: number;
  capturedScreenshot: Blob | null;
  screenshotPreviewUrl: string | null;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setWidth: (width: number) => void;
  setScreenshot: (blob: Blob | null) => void;
  clearScreenshot: () => void;
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      width: 480,
      capturedScreenshot: null,
      screenshotPreviewUrl: null,
      setOpen: (open) => set({ isOpen: open }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setWidth: (width) => set({ width }),
      setScreenshot: (blob) => {
        // Revoke previous URL if exists
        const prevUrl = get().screenshotPreviewUrl;
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        const url = blob ? URL.createObjectURL(blob) : null;
        set({ capturedScreenshot: blob, screenshotPreviewUrl: url });
      },
      clearScreenshot: () => {
        const prevUrl = get().screenshotPreviewUrl;
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        set({ capturedScreenshot: null, screenshotPreviewUrl: null });
      },
    }),
    {
      name: 'feedback-storage',
      partialize: (state) => ({ width: state.width }),
    }
  )
);
