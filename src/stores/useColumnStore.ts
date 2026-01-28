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
          const existingColumns = state.columnsByNamespace[namespace];
          
          // If no existing columns, initialize fresh
          if (!existingColumns) {
            return {
              columnsByNamespace: {
                ...state.columnsByNamespace,
                [namespace]: columns,
              },
            };
          }
          
          // Merge new columns into existing state, preserving stored order
          const existingIds = new Set(existingColumns.map(c => c.id));
          const newColumns = columns.filter(c => !existingIds.has(c.id));
          
          if (newColumns.length === 0) {
            return state; // No new columns to add
          }
          
          // Insert new columns at their intended positions
          const merged = [...existingColumns];
          newColumns.forEach(newCol => {
            const intendedIndex = columns.findIndex(c => c.id === newCol.id);
            // Find the closest existing column before this position
            let insertIndex = 0;
            for (let i = intendedIndex - 1; i >= 0; i--) {
              const existingIndex = merged.findIndex(c => c.id === columns[i].id);
              if (existingIndex !== -1) {
                insertIndex = existingIndex + 1;
                break;
              }
            }
            merged.splice(insertIndex, 0, newCol);
          });
          
          // Recompute order indices
          const reordered = merged.map((col, index) => ({ ...col, order: index }));
          
          return {
            columnsByNamespace: {
              ...state.columnsByNamespace,
              [namespace]: reordered,
            },
          };
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
      version: 3,
    }
  )
);
