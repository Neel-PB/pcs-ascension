import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TableUIStore {
  textWrap: boolean;
  frozenColumns: number;
  setTextWrap: (wrap: boolean) => void;
  setFrozenColumns: (count: number) => void;
}

export const useTableUIStore = create<TableUIStore>()(
  persist(
    (set) => ({
      textWrap: false,
      frozenColumns: 0,
      
      setTextWrap: (wrap) => set({ textWrap: wrap }),
      setFrozenColumns: (count) => set({ frozenColumns: count }),
    }),
    {
      name: 'editable-table-ui',
      version: 1,
    }
  )
);
