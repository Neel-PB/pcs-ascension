import { useEffect, useRef } from 'react';
import { useWorkforceDrawerStore } from '@/stores/useWorkforceDrawerStore';
import { useWorkforceResizable } from '@/hooks/useWorkforceResizable';
import { Button } from '@/components/ui/button';

const MIN_WIDTH = 490;
const MAX_WIDTH_VW = 0.7;
const SNAP_POINTS = [400, 520, 640, 820];

interface WorkforceDrawerProps {
  activeTab?: string;
}

export const WorkforceDrawer = ({ activeTab }: WorkforceDrawerProps) => {
  const { isOpen, setOpen } = useWorkforceDrawerStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const { isDragging, currentWidth, handlePointerDown } = useWorkforceResizable({
    minWidth: MIN_WIDTH,
    maxWidthVw: MAX_WIDTH_VW,
    snapPoints: SNAP_POINTS,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen && panelRef.current?.contains(document.activeElement)) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[70] lg:hidden"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div
        ref={panelRef}
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-8">
          {/* Blank content area - ready for tab-specific content */}
        </div>

        {/* Footer with Close Button */}
        <div className="flex-shrink-0 px-6 py-3 border-t flex justify-end">
          <Button variant="default" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
};
