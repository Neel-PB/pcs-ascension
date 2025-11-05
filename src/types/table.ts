import { ReactNode } from 'react';

/**
 * Column definition for the editable table
 */
export interface ColumnDef<T = any> {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'badge' | 'custom';
  
  // Display & behavior
  width?: number;              // Default width in pixels
  minWidth?: number;           // Minimum resize width
  sortable?: boolean;          // Enable sorting
  editable?: boolean;          // Allow inline editing (future)
  resizable?: boolean;         // Allow resizing
  draggable?: boolean;         // Allow reordering
  locked?: boolean;            // Prevent hiding/removal
  tooltip?: string;            // Tooltip text for column header
  
  // Custom rendering
  renderCell?: (data: T, column: ColumnDef<T>) => ReactNode;
  renderHeader?: (column: ColumnDef<T>) => ReactNode;
  
  // Value transformation
  getValue?: (data: T) => any;
  
  // Sorting
  sortFn?: (a: T, b: T) => number;
  
  // Styling
  className?: string;
  headerClassName?: string;
}

/**
 * Table configuration
 */
export interface TableConfig<T = any> {
  columns: ColumnDef<T>[];
  data: T[];
  
  // Core callbacks
  onCellEdit?: (rowId: string, field: keyof T, value: any) => void | Promise<void>;
  onRowClick?: (row: T) => void;
  
  // Row identification
  getRowId: (row: T) => string;
  
  // Sorting
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  
  // Styling
  className?: string;
  rowClassName?: string | ((row: T) => string);
  cellClassName?: string | ((row: T, column: ColumnDef<T>) => string);
  
  // Store namespace for persistence
  storeNamespace?: string;
}

/**
 * Column state stored in Zustand
 */
export interface ColumnState {
  id: string;
  isVisible: boolean;
  order: number;
  width?: number;
}
