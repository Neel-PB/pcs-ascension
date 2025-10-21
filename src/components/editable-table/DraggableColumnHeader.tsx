import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUpDown, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { ColumnDef } from '@/types/table';
import { ColumnResizeHandle } from './ColumnResizeHandle';
import { ColumnMenu } from './ColumnMenu';
import { cn } from '@/lib/utils';

interface DraggableColumnHeaderProps<T = any> {
  column: ColumnDef<T>;
  onResize: (width: number) => void;
  onSort?: (direction: 'asc' | 'desc') => void;
  onHide: () => void;
  onResetWidth: () => void;
  onAutoFit: () => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export function DraggableColumnHeader<T = any>({
  column,
  onResize,
  onSort,
  onHide,
  onResetWidth,
  onAutoFit,
  sortField,
  sortDirection,
}: DraggableColumnHeaderProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: !column.draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSortIcon = () => {
    if (!column.sortable || sortField !== column.id) {
      return null; // Don't show sort icon when not sorted
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-column-header
      className={cn(
        "relative group h-10 px-4 flex items-center gap-2",
        "text-xs uppercase tracking-wider font-medium text-muted-foreground",
        "border-r border-border last:border-r-0",
        column.draggable && "cursor-grab active:cursor-grabbing",
        column.headerClassName
      )}
    >
      {/* Drag handle - absolutely positioned, shows on hover */}
      {column.draggable && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
        </div>
      )}

      {/* Column label */}
      <span className="truncate flex-1 min-w-0">{column.label}</span>

      {/* Sort icon */}
      {column.sortable && getSortIcon()}

      {/* Column menu */}
      <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
        <ColumnMenu
          onSortAsc={() => onSort?.('asc')}
          onSortDesc={() => onSort?.('desc')}
          onHide={onHide}
          onResetWidth={onResetWidth}
          onAutoFit={onAutoFit}
          canHide={!column.locked}
        />
      </div>

      {/* Resize handle */}
      {column.resizable && (
        <ColumnResizeHandle 
          onResize={onResize} 
          minWidth={column.minWidth}
          onAutoFit={onAutoFit}
        />
      )}
    </div>
  );
}
