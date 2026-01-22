import { useEffect, useRef } from 'react';
import { useWorkforceDrawerStore } from '@/stores/useWorkforceDrawerStore';
import { useWorkforceResizable } from '@/hooks/useWorkforceResizable';
import { Button } from '@/components/ui/button';
import { WorkforceKPISection } from './WorkforceKPISection';
import { Building2 } from 'lucide-react';

const MIN_WIDTH = 490;
const MAX_WIDTH_VW = 0.7;
const SNAP_POINTS = [400, 520, 640, 820];

interface WorkforceDrawerProps {
  activeTab?: string;
  selectedDepartment?: string | null;
  selectedRegion?: string | null;
  selectedMarket?: string | null;
  selectedFacility?: string | null;
  selectedLevel2?: string | null;
  selectedPstat?: string | null;
  volumeType?: 'target' | 'override' | null;
  volumeValue?: number | null;
}

export const WorkforceDrawer = ({ 
  activeTab,
  selectedDepartment,
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedLevel2,
  selectedPstat,
  volumeType,
  volumeValue 
}: WorkforceDrawerProps) => {
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

        {/* Fixed Header Row - matching global header */}
        <div 
          className="flex items-center justify-between px-6 border-b border-border flex-shrink-0" 
          style={{ height: 'var(--header-height)' }}
        >
          <h1 className="text-lg font-semibold text-foreground">Positions Checklist</h1>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-2 pb-4 flex flex-col min-h-0">
        {!selectedFacility && !selectedDepartment ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Select a Facility
              </h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Choose a facility from the filters to view the positions checklist and KPIs.
              </p>
            </div>
          ) : (
            <>
            <WorkforceKPISection
              activeTab={activeTab}
              selectedDepartment={selectedDepartment}
              selectedRegion={selectedRegion}
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
              selectedLevel2={selectedLevel2}
              selectedPstat={selectedPstat}
              volumeType={volumeType}
              volumeValue={volumeValue}
            />
              <div className="mt-4">
                {/* Future content area */}
              </div>
            </>
          )}
        </div>

      </div>
    </>
  );
};
