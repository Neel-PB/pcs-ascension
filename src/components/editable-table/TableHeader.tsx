import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnDef } from '@/types/table';
import { DraggableColumnHeader } from './DraggableColumnHeader';

interface TableHeaderProps<T = any> {
  columns: ColumnDef<T>[];
  gridTemplate: string;
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
  onColumnResize: (columnId: string, width: number) => void;
  onColumnHide: (columnId: string) => void;
  onColumnResetWidth: (columnId: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export function TableHeader<T = any>({
  columns,
  gridTemplate,
  onSort,
  onColumnResize,
  onColumnHide,
  onColumnResetWidth,
  sortField,
  sortDirection,
}: TableHeaderProps<T>) {
  const columnIds = columns.map((col) => col.id);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: gridTemplate,
      }}
      className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b border-border"
    >
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        {columns.map((column) => (
          <DraggableColumnHeader
            key={column.id}
            column={column}
            onResize={(width) => onColumnResize(column.id, width)}
            onSort={column.sortable && onSort ? (direction) => onSort(column.id, direction) : undefined}
            onHide={() => onColumnHide(column.id)}
            onResetWidth={() => onColumnResetWidth(column.id)}
            sortField={sortField}
            sortDirection={sortDirection}
          />
        ))}
      </SortableContext>
    </div>
  );
}
