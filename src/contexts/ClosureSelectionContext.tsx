import React, { createContext, useContext, ReactNode } from 'react';
import { useClosureSelections, ClosureSelectionKey } from '@/hooks/useClosureSelections';

interface ClosureSelectionContextValue {
  getSelectedIds: (key: ClosureSelectionKey) => Set<string>;
  isSelected: (key: ClosureSelectionKey, closureId: string) => boolean;
  toggleSelection: (key: ClosureSelectionKey, closureId: string) => void;
  setSelectionsForKey: (key: ClosureSelectionKey, closureIds: string[]) => void;
  clearSelectionsForKey: (key: ClosureSelectionKey) => void;
  clearAllSelections: () => void;
  getSelectedFteSum: (key: ClosureSelectionKey, details: { id: string; fte: number; count: number }[]) => number;
  saveSelections: (key: ClosureSelectionKey) => Promise<boolean>;
  isSaving: boolean;
}

const ClosureSelectionContext = createContext<ClosureSelectionContextValue | null>(null);

export function ClosureSelectionProvider({ children }: { children: ReactNode }) {
  const closureSelections = useClosureSelections();

  return (
    <ClosureSelectionContext.Provider value={closureSelections}>
      {children}
    </ClosureSelectionContext.Provider>
  );
}

export function useClosureSelectionContext(): ClosureSelectionContextValue {
  const context = useContext(ClosureSelectionContext);
  if (!context) {
    throw new Error('useClosureSelectionContext must be used within a ClosureSelectionProvider');
  }
  return context;
}
