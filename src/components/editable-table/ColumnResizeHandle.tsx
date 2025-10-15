import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

interface ColumnResizeHandleProps {
  onResize: (width: number) => void;
  minWidth?: number;
  onAutoFit?: () => void;
}

export function ColumnResizeHandle({ onResize, minWidth = 150, onAutoFit }: ColumnResizeHandleProps) {
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
      // Ensure minWidth is at least 100px as absolute minimum
      const effectiveMinWidth = Math.max(minWidth, 100);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const diff = moveEvent.clientX - startX;
        const newWidth = Math.max(effectiveMinWidth, startWidth + diff);
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

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onAutoFit?.();
    },
    [onAutoFit]
  );

  return (
    <div
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize",
        "hover:bg-primary hover:shadow-lg transition-all",
        isResizing && "bg-primary shadow-lg"
      )}
      style={{ zIndex: 10 }}
      title="Double-click to auto-fit"
    />
  );
}
