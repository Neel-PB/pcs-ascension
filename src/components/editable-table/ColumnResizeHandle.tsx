import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

interface ColumnResizeHandleProps {
  onResize: (width: number) => void;
  minWidth?: number;
}

export function ColumnResizeHandle({ onResize, minWidth = 100 }: ColumnResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      const startX = e.clientX;
      const headerCell = (e.target as HTMLElement).closest('[data-column-header]') as HTMLElement;
      if (!headerCell) return;
      
      const startWidth = headerCell.offsetWidth;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const diff = moveEvent.clientX - startX;
        const newWidth = Math.max(minWidth, startWidth + diff);
        onResize(newWidth);
      };

      const handlePointerUp = () => {
        setIsResizing(false);
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [onResize, minWidth]
  );

  return (
    <div
      onPointerDown={handlePointerDown}
      className={cn(
        "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize",
        "hover:bg-primary hover:shadow-lg transition-all",
        isResizing && "bg-primary shadow-lg"
      )}
      style={{ zIndex: 10 }}
    />
  );
}
