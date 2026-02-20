import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ColumnDef } from '@/types/table';
import { TableRow } from './TableRow';

interface VirtualizedTableBodyProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  gridTemplate: string;
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowClassName?: string | ((row: T) => string);
  rowHeight?: number;
}

export function VirtualizedTableBody<T = any>({
  data,
  columns,
  gridTemplate,
  getRowId,
  onRowClick,
  rowClassName,
  rowHeight = 48, // h-12 = 48px
}: VirtualizedTableBodyProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10, // Render 10 extra rows for smooth scrolling
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      ref={parentRef}
      data-tour-virtual-body
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{ contain: 'layout' }}
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const row = data[virtualRow.index];
          const rowId = getRowId(row);
          
          return (
            <div
              key={rowId}
              data-tour={virtualRow.index === 0 ? 'positions-row' : undefined}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TableRow
                data={row}
                columns={columns}
                gridTemplate={gridTemplate}
                onClick={() => onRowClick?.(row)}
                className={typeof rowClassName === 'function' ? rowClassName(row) : rowClassName}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
