import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColumnState } from '@/types/table';

interface ColumnStore {
  // Namespaced column states
  columnsByNamespace: Record<string, ColumnState[]>;
  
  // Actions
  setColumnVisibility: (namespace: string, id: string, visible: boolean) => void;
  setColumnWidth: (namespace: string, id: string, width: number) => void;
  reorderColumns: (namespace: string, fromIndex: number, toIndex: number) => void;
  initializeColumns: (namespace: string, columns: ColumnState[]) => void;
  resetToDefault: (namespace: string, columns: ColumnState[]) => void;
  getColumns: (namespace: string) => ColumnState[];
}

export const useColumnStore = create<ColumnStore>()(
  persist(
    (set, get) => ({
      columnsByNamespace: {},
      
      setColumnVisibility: (namespace, id, visible) =>
        set((state) => {
          const columns = state.columnsByNamespace[namespace] || [];
          return {
            columnsByNamespace: {
              ...state.columnsByNamespace,
              [namespace]: columns.map((col) =>
                col.id === id ? { ...col, isVisible: visible } : col
              ),
            },
          };
        }),
      
      setColumnWidth: (namespace, id, width) =>
        set((state) => {
          const columns = state.columnsByNamespace[namespace] || [];
          return {
            columnsByNamespace: {
              ...state.columnsByNamespace,
              [namespace]: columns.map((col) =>
                col.id === id ? { ...col, width } : col
              ),
            },
          };
        }),
      
      reorderColumns: (namespace, fromIndex, toIndex) =>
        set((state) => {
          const columns = [...(state.columnsByNamespace[namespace] || [])];
          const [movedColumn] = columns.splice(fromIndex, 1);
          columns.splice(toIndex, 0, movedColumn);
          return {
            columnsByNamespace: {
              ...state.columnsByNamespace,
              [namespace]: columns.map((col, index) => ({ ...col, order: index })),
            },
          };
        }),
      
      initializeColumns: (namespace, columns) =>
        set((state) => {
          // Only initialize if not already present
          if (!state.columnsByNamespace[namespace]) {
            return {
              columnsByNamespace: {
                ...state.columnsByNamespace,
                [namespace]: columns,
              },
            };
          }
          return state;
        }),
      
      resetToDefault: (namespace, columns) =>
        set((state) => ({
          columnsByNamespace: {
            ...state.columnsByNamespace,
            [namespace]: columns,
          },
        })),
      
      getColumns: (namespace) => {
        const state = get();
        return state.columnsByNamespace[namespace] || [];
      },
    }),
    {
      name: 'editable-table-columns',
      version: 1,
    }
  )
);
