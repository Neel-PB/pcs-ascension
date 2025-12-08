import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkforceDrawer } from '@/stores/useWorkforceDrawer';
import { useVerticalResizable } from '@/hooks/useVerticalResizable';

const MIN_HEIGHT = 150;
const MAX_HEIGHT_VH = 0.7; // 70% of viewport

interface WorkforceDrawerProps {
  activeTab: string;
}

export function WorkforceDrawer({ activeTab }: WorkforceDrawerProps) {
  const { isOpen, toggle } = useWorkforceDrawer();
  const { isDragging, currentHeight, handlePointerDown } = useVerticalResizable({
    minHeight: MIN_HEIGHT,
    maxHeightVh: MAX_HEIGHT_VH,
  });

  return (
    <>
      {/* Floating trigger button - visible when drawer is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 z-40"
            style={{ 
              left: 'calc(var(--sidebar-width) + (100vw - var(--sidebar-width)) / 2)',
              transform: 'translateX(-50%)'
            }}
          >
            <Button
              onClick={toggle}
              variant="default"
              size="sm"
              className="shadow-lg gap-2"
            >
              <ChevronUp className="h-4 w-4" />
              Open Panel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer panel - fixed at bottom */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 right-0 z-40 bg-background border-t border-border shadow-2xl"
            style={{ 
              height: currentHeight,
              left: 'var(--sidebar-width)',
            }}
          >
            {/* Drag handle */}
            <div
              onPointerDown={handlePointerDown}
              className={`absolute top-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center group ${
                isDragging ? 'bg-muted' : 'hover:bg-muted/50'
              } transition-colors`}
            >
              <GripHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>

            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border">
              <h3 className="text-sm font-medium text-foreground capitalize">
                {activeTab} Panel
              </h3>
              <Button
                onClick={toggle}
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="h-4 w-4" />
                Close
              </Button>
            </div>

            {/* Content area - blank for now */}
            <div className="p-4 overflow-auto" style={{ height: currentHeight - 60 }}>
              {/* Tab-specific content will go here */}
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Content for {activeTab} tab
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
