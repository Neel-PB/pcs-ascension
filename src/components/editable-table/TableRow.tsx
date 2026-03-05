import { memo } from 'react';
import { ColumnDef } from '@/types/table';
import { TextCell } from './cells/TextCell';
import { NumberCell } from './cells/NumberCell';
import { BadgeCell } from './cells/BadgeCell';
import { DateCell } from './cells/DateCell';
import { cn } from '@/lib/utils';

interface TableRowProps<T = any> {
  data: T;
  columns: ColumnDef<T>[];
  gridTemplate: string;
  onClick?: () => void;
  className?: string;
}

// Memoized table row to prevent re-renders during virtualization scroll
function TableRowInner<T = any>({
  data,
  columns,
  gridTemplate,
  onClick,
  className,
}: TableRowProps<T>) {
  const renderCell = (column: ColumnDef<T>) => {
    // Custom render function takes precedence
    if (column.renderCell) {
      return column.renderCell(data, column);
    }

    const value = column.getValue ? column.getValue(data) : (data as any)[column.id];

    // Render based on type
    switch (column.type) {
      case 'number':
        return <NumberCell value={value} className={column.className} />;
      
      case 'badge':
        return <BadgeCell value={value} className={column.className} />;
      
      case 'date':
        return <DateCell value={value} className={column.className} />;
      
      case 'text':
      default:
        return <TextCell value={value} className={column.className} />;
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: gridTemplate,
      }}
      className={cn(
        "h-12 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex items-center overflow-hidden"
          onClick={column.editable ? (e) => e.stopPropagation() : undefined}
        >
          {renderCell(column)}
        </div>
      ))}
    </div>
  );
}

// Export memoized version with custom comparison for virtualization performance
export const TableRow = memo(TableRowInner, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.gridTemplate === nextProps.gridTemplate &&
    prevProps.columns === nextProps.columns &&
    prevProps.className === nextProps.className
  );
}) as typeof TableRowInner;
