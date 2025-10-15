import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, ArrowUp, ArrowDown, EyeOff, Maximize2, RotateCcw } from 'lucide-react';

interface ColumnMenuProps {
  onSortAsc: () => void;
  onSortDesc: () => void;
  onHide: () => void;
  onResetWidth: () => void;
  canHide: boolean;
}

export function ColumnMenu({
  onSortAsc,
  onSortDesc,
  onHide,
  onResetWidth,
  canHide,
}: ColumnMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onSortAsc}>
          <ArrowUp className="mr-2 h-4 w-4" />
          Sort Ascending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSortDesc}>
          <ArrowDown className="mr-2 h-4 w-4" />
          Sort Descending
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {canHide && (
          <DropdownMenuItem onClick={onHide}>
            <EyeOff className="mr-2 h-4 w-4" />
            Hide Column
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onResetWidth}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Width
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
