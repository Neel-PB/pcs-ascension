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

export function TableRow<T = any>({
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
        return <NumberCell value={value} onClick={onClick} className={column.className} />;
      
      case 'badge':
        return <BadgeCell value={value} onClick={onClick} className={column.className} />;
      
      case 'date':
        return <DateCell value={value} onClick={onClick} className={column.className} />;
      
      case 'text':
      default:
        return <TextCell value={value} onClick={onClick} className={column.className} />;
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
    >
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex items-center overflow-hidden"
        >
          {renderCell(column)}
        </div>
      ))}
    </div>
  );
}
