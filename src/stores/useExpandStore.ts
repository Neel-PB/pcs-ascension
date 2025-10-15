import { create } from 'zustand';

interface ExpandStore {
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
  isExpanded: (id: string) => boolean;
  collapseAll: () => void;
}

export const useExpandStore = create<ExpandStore>((set, get) => ({
  expandedIds: new Set<string>(),
  
  toggleExpanded: (id) =>
    set((state) => {
      const newExpandedIds = new Set(state.expandedIds);
      if (newExpandedIds.has(id)) {
        newExpandedIds.delete(id);
      } else {
        newExpandedIds.add(id);
      }
      return { expandedIds: newExpandedIds };
    }),
  
  isExpanded: (id) => get().expandedIds.has(id),
  
  collapseAll: () => set({ expandedIds: new Set<string>() }),
}));
