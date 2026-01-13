import React, { useState, useCallback, useEffect } from 'react';
import type { CaptureArea } from '@/types/screenshot';

interface ScreenshotSelectionOverlayProps {
  onSelect: (area: CaptureArea) => void;
  onCancel: () => void;
}

export const ScreenshotSelectionOverlay: React.FC<ScreenshotSelectionOverlayProps> = ({
  onSelect,
  onCancel,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

  // Calculate selection rectangle
  const getSelectionRect = useCallback(() => {
    if (!startPoint || !currentPoint) return null;

    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    return { x, y, width, height };
  }, [startPoint, currentPoint]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsSelecting(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setCurrentPoint({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting) return;
      setCurrentPoint({ x: e.clientX, y: e.clientY });
    },
    [isSelecting]
  );

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const rect = getSelectionRect();
    if (rect && rect.width >= 50 && rect.height >= 50) {
      onSelect(rect);
    } else if (rect) {
      // Selection too small, reset
      setStartPoint(null);
      setCurrentPoint(null);
    }
  }, [isSelecting, getSelectionRect, onSelect]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const selectionRect = getSelectionRect();

  return (
    <div
      data-feedback-ui="overlay"
      className="fixed inset-0 z-[9999] cursor-crosshair select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Dark overlay with cutout for selection */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="selection-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {selectionRect && (
              <rect
                x={selectionRect.x}
                y={selectionRect.y}
                width={selectionRect.width}
                height={selectionRect.height}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#selection-mask)"
        />
      </svg>

      {/* Selection border */}
      {selectionRect && selectionRect.width > 0 && selectionRect.height > 0 && (
        <div
          className="absolute border-2 border-dashed border-primary pointer-events-none"
          style={{
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        >
          {/* Dimensions badge */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium whitespace-nowrap">
            {Math.round(selectionRect.width)} × {Math.round(selectionRect.height)}
          </div>
          
          {/* Corner handles */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm text-foreground text-sm px-4 py-2 rounded-lg shadow-lg border border-border">
        {isSelecting
          ? 'Release to capture selected area'
          : 'Click and drag to select area • Press ESC to cancel'}
      </div>
    </div>
  );
};
