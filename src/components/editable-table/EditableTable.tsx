import { useState, useMemo, useEffect } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { TableConfig, ColumnDef, ColumnState } from '@/types/table';
import { useColumnStore } from '@/stores/useColumnStore';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { cn } from '@/lib/utils';

export function EditableTable<T = any>({
  columns: columnDefinitions,
  data,
  onRowClick,
  getRowId,
  sortField,
  sortDirection,
  onSort,
  className,
  rowClassName,
  storeNamespace = 'default',
}: TableConfig<T>) {
  const {
    getColumns,
    setColumnWidth,
    setColumnVisibility,
    reorderColumns,
    initializeColumns,
  } = useColumnStore();

  // Initialize column states on mount
  useEffect(() => {
    const defaultColumnStates: ColumnState[] = columnDefinitions.map((col, index) => ({
      id: col.id,
      isVisible: true,
      order: index,
      width: col.width,
    }));
    initializeColumns(storeNamespace, defaultColumnStates);
  }, [storeNamespace, columnDefinitions, initializeColumns]);

  const columnStates = getColumns(storeNamespace);

  // Drag sensors with 5px threshold
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Build visible columns
  const visibleColumns = useMemo(() => {
    const stateMap = new Map(columnStates.map(cs => [cs.id, cs]));
    
    return columnDefinitions
      .filter(col => {
        const state = stateMap.get(col.id);
        return state?.isVisible !== false;
      })
      .sort((a, b) => {
        const stateA = stateMap.get(a.id);
        const stateB = stateMap.get(b.id);
        return (stateA?.order ?? 0) - (stateB?.order ?? 0);
      })
      .map(col => {
        const state = stateMap.get(col.id);
        const storedWidth = state?.width ?? col.width ?? 160;
        const minWidth = col.minWidth ?? 100;
        // Ensure stored width respects minimum width
        return {
          ...col,
          width: Math.max(storedWidth, minWidth),
        };
      });
  }, [columnDefinitions, columnStates]);

  // Calculate grid template
  const gridTemplate = useMemo(() => {
    return visibleColumns
      .map(col => `${col.width}px`)
      .join(' ');
  }, [visibleColumns]);

  // Handlers
  const handleColumnResize = (columnId: string, width: number) => {
    setColumnWidth(storeNamespace, columnId, width);
  };

  const handleColumnHide = (columnId: string) => {
    setColumnVisibility(storeNamespace, columnId, false);
  };

  const handleColumnResetWidth = (columnId: string) => {
    const originalColumn = columnDefinitions.find(c => c.id === columnId);
    if (originalColumn?.width) {
      setColumnWidth(storeNamespace, columnId, originalColumn.width);
    }
  };

  const handleColumnAutoFit = (columnId: string) => {
    const column = columnDefinitions.find(c => c.id === columnId);
    if (!column) return;

    // Create a canvas to measure text width
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set font to match header style
    context.font = '11px system-ui, -apple-system, sans-serif'; // text-xs font

    // Measure header text
    const headerWidth = context.measureText(column.label.toUpperCase()).width;

    // Measure all cell values in this column
    const cellWidths = data.map(row => {
      let value = '';
      
      if (column.getValue) {
        value = String(column.getValue(row) ?? '');
      } else {
        value = String((row as any)[column.id] ?? '');
      }

      // Set font for cell content (slightly larger)
      context.font = '14px system-ui, -apple-system, sans-serif'; // text-sm font
      return context.measureText(value).width;
    });

    // Get the maximum width
    const maxContentWidth = Math.max(headerWidth, ...cellWidths);

    // Add padding for:
    // - Left/right padding (px-4 = 32px)
    // - Drag handle (if draggable: ~20px)
    // - Sort icon (if sortable: ~20px)
    // - Menu button (~30px)
    // - Extra breathing room (20px)
    const paddingAndIcons = 32 + 
      (column.draggable ? 20 : 0) + 
      (column.sortable ? 20 : 0) + 
      30 + 
      20;

    const optimalWidth = Math.ceil(maxContentWidth + paddingAndIcons);

    // Ensure it's within reasonable bounds
    const minWidth = column.minWidth ?? 100;
    const maxWidth = 600; // Don't let columns get too wide
    const finalWidth = Math.max(minWidth, Math.min(maxWidth, optimalWidth));

    setColumnWidth(storeNamespace, columnId, finalWidth);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = visibleColumns.findIndex(col => col.id === active.id);
    const newIndex = visibleColumns.findIndex(col => col.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Get the actual indices in the full column states array
      const allStates = getColumns(storeNamespace);
      const actualOldIndex = allStates.findIndex(cs => cs.id === active.id);
      const actualNewIndex = allStates.findIndex(cs => cs.id === over.id);
      
      if (actualOldIndex !== -1 && actualNewIndex !== -1) {
        reorderColumns(storeNamespace, actualOldIndex, actualNewIndex);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={cn("flex flex-col rounded-lg border bg-card shadow-sm overflow-hidden", className)}>
        <div className="flex-1 overflow-auto">
          <div style={{ minWidth: 'max-content' }}>
            {/* Header */}
            <TableHeader
              columns={visibleColumns}
              gridTemplate={gridTemplate}
              onSort={onSort}
              onColumnResize={handleColumnResize}
              onColumnHide={handleColumnHide}
              onColumnResetWidth={handleColumnResetWidth}
              onColumnAutoFit={handleColumnAutoFit}
              sortField={sortField}
              sortDirection={sortDirection}
            />

            {/* Data rows */}
            {data.map((row) => {
              const rowId = getRowId(row);
              return (
                <TableRow
                  key={rowId}
                  data={row}
                  columns={visibleColumns}
                  gridTemplate={gridTemplate}
                  onClick={() => onRowClick?.(row)}
                  className={typeof rowClassName === 'function' ? rowClassName(row) : rowClassName}
                />
              );
            })}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
