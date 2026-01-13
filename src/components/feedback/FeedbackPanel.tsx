import { useEffect, useCallback } from 'react';
import { useFeedbackStore } from '@/stores/useFeedbackStore';
import { useWorkforceResizable } from '@/hooks/useWorkforceResizable';
import { FeedbackForm } from './FeedbackForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';

const MIN_WIDTH = 400;
const MAX_WIDTH_VW = 0.5;
const SNAP_POINTS = [400, 480, 560];

export const FeedbackPanel: React.FC = () => {
  const { isOpen, setOpen, clearScreenshot } = useFeedbackStore();
  
  const { isDragging, currentWidth, handlePointerDown } = useWorkforceResizable({
    minWidth: MIN_WIDTH,
    maxWidthVw: MAX_WIDTH_VW,
    snapPoints: SNAP_POINTS,
  });

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        useFeedbackStore.getState().toggle();
      }
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    clearScreenshot();
  }, [setOpen, clearScreenshot]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/20 z-[79] md:hidden"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full bg-background border-l border-border shadow-2xl z-80 flex flex-col"
        style={{ width: currentWidth }}
      >
        {/* Resize handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize group hover:bg-primary/20 transition-colors flex items-center justify-center"
          onPointerDown={handlePointerDown}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-primary/30" />
          )}
          <GripVertical className="h-8 w-8 text-muted-foreground/30 group-hover:text-muted-foreground/50 -ml-3" />
        </div>

        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between px-6 border-b border-border"
          style={{ height: 'var(--header-height)' }}
        >
          <h2 className="text-lg font-semibold">Submit Feedback</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <FeedbackForm onSuccess={handleClose} />
          </div>
        </ScrollArea>

        {/* Footer hint */}
        <div className="shrink-0 px-6 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘+Shift+F</kbd> to toggle
          </p>
        </div>
      </div>
    </>
  );
};
