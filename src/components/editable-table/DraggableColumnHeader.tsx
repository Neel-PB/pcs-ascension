import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUp, ArrowDown, Info } from '@/lib/icons';
import { ColumnDef } from '@/types/table';
import { ColumnResizeHandle } from './ColumnResizeHandle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DraggableColumnHeaderProps<T = any> {
  column: ColumnDef<T>;
  onResize: (width: number) => void;
  onSort?: (direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export function DraggableColumnHeader<T = any>({
  column,
  onResize,
  onSort,
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
    transform: transform 
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    willChange: isDragging ? 'transform' : undefined,
  } as React.CSSProperties;

  const isActive = sortField === column.id;

  const handleSort = () => {
    if (!onSort) return;
    const newDirection = isActive && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(newDirection);
  };

  const getSortIcon = () => {
    if (!column.sortable) return null;
    if (isActive) {
      return sortDirection === 'asc' ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      );
    }
    // Show muted icon on hover for sortable but unsorted columns
    return <ArrowUp className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-column-header
      onClick={onSort ? handleSort : undefined}
      className={cn(
        "relative group h-12 px-4 flex items-center gap-2",
        "text-xs uppercase tracking-wider font-medium text-muted-foreground",
        "border-r border-border last:border-r-0",
        "[backface-visibility:hidden] [transform-style:preserve-3d]",
        "[-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale]",
        onSort && "cursor-pointer select-none",
        column.headerClassName
      )}
    >
      {/* Drag handle - absolutely positioned, shows on hover */}
      {column.draggable && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing z-10 flex items-center justify-center p-1"
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          {/* Vertical line indicator */}
          <div className="w-0.5 h-4 bg-muted-foreground/40 rounded-full hover:bg-muted-foreground transition-colors" />
        </div>
      )}

      {/* Column label */}
      <span className="truncate flex-1 min-w-0 text-left">
        {column.renderHeader ? column.renderHeader(column) : column.label}
      </span>

      {/* Info icon with tooltip - only shown when column has tooltip */}
      {column.tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex-shrink-0 inline-flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs z-[100]">
            <p className="text-sm">{column.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Sort icon (if active) */}
      {column.sortable && getSortIcon()}

      {/* Resize handle */}
      {column.resizable && (
        <ColumnResizeHandle 
          onResize={onResize} 
          minWidth={column.minWidth}
        />
      )}
    </div>
  );
}
