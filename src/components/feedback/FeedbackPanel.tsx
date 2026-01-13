import { useEffect, useRef, useCallback } from 'react';
import { useFeedbackStore } from '@/stores/useFeedbackStore';
import { useFeedbackResizable } from '@/hooks/useFeedbackResizable';
import { FeedbackForm } from './FeedbackForm';
import { Button } from '@/components/ui/button';

const MIN_WIDTH = 490;
const MAX_WIDTH_VW = 0.7;
const SNAP_POINTS = [400, 520, 640, 820];

export const FeedbackPanel: React.FC = () => {
  const { isOpen, setOpen, clearScreenshot } = useFeedbackStore();
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { isDragging, currentWidth, handlePointerDown } = useFeedbackResizable({
    minWidth: MIN_WIDTH,
    maxWidthVw: MAX_WIDTH_VW,
    snapPoints: SNAP_POINTS,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        useFeedbackStore.getState().toggle();
      }
      if (e.key === 'Escape' && isOpen && panelRef.current?.contains(document.activeElement)) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    clearScreenshot();
  }, [setOpen, clearScreenshot]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[70] lg:hidden"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        data-feedback-ui="panel"
        className="fixed right-0 top-0 h-screen bg-background border-l border-border shadow-2xl z-[80] flex flex-col max-lg:w-full transition-transform duration-300"
        style={{ width: currentWidth }}
      >
        {/* Resize Handle (Desktop Only) */}
        <div
          className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 bg-border hover:bg-primary cursor-col-resize transition-all z-10"
          onPointerDown={handlePointerDown}
        >
          {isDragging && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg font-medium">
              {Math.round(currentWidth)}px
            </div>
          )}
        </div>

        {/* Fixed Header Row - matching global header */}
        <div 
          className="flex items-center px-6 border-b border-border flex-shrink-0" 
          style={{ height: 'var(--header-height)' }}
        >
          <h1 className="text-lg font-semibold text-foreground">Submit Feedback</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 flex flex-col min-h-0">
          <FeedbackForm onSuccess={handleClose} />
        </div>

        {/* Footer with Close Button */}
        <div className="flex-shrink-0 px-6 py-3 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘+Shift+F</kbd> to toggle
          </p>
          <Button variant="default" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
};
