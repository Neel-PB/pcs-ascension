import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { RotateCcw, Play, ChevronRight } from '@/lib/icons';
import { APP_TOUR_SEQUENCE, TourSection } from './tourConfig';
import { useTourStore } from '@/stores/useTourStore';
import { useFeedbackStore } from '@/stores/useFeedbackStore';
import { useWorkforceDrawerStore } from '@/stores/useWorkforceDrawerStore';
import { TOUR_STEP_REGISTRY, getStepTitle } from './tourStepRegistry';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const TOUR_PREFIX = 'helix-tour-';

interface TourGroup {
  label: string;
  sections: TourSection[];
}

const GROUPS: TourGroup[] = [
  {
    label: 'Staffing',
    sections: APP_TOUR_SEQUENCE.filter(s => s.page === '/staffing'),
  },
  {
    label: 'Positions',
    sections: APP_TOUR_SEQUENCE.filter(s => s.page === '/positions'),
  },
  {
    label: 'Admin',
    sections: APP_TOUR_SEQUENCE.filter(s => s.page === '/admin'),
  },
  {
    label: 'Overlays',
    sections: APP_TOUR_SEQUENCE.filter(s => s.page === null),
  },
];

function isCompleted(tourKey: string): boolean {
  return localStorage.getItem(`${TOUR_PREFIX}${tourKey}-completed`) === 'true';
}

function resetTour(tourKey: string) {
  localStorage.removeItem(`${TOUR_PREFIX}${tourKey}-completed`);
}

interface TourLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TourLauncher({ open, onOpenChange }: TourLauncherProps) {
  const navigate = useNavigate();
  const { startSingleTour, startMicroTour } = useTourStore();
  const [, forceUpdate] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((tourKey: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(tourKey)) {
        next.delete(tourKey);
      } else {
        next.add(tourKey);
      }
      return next;
    });
  }, []);

  const navigateAndLaunch = useCallback((section: TourSection, callback: () => void) => {
    onOpenChange(false);

    const overlayKeys = ['feedback', 'ai-hub', 'checklist', 'header'];
    if (overlayKeys.includes(section.tourKey)) {
      if (section.tourKey === 'feedback') {
        useFeedbackStore.getState().setOpen(true);
      } else if (section.tourKey === 'checklist') {
        useWorkforceDrawerStore.getState().setOpen(true);
      }
      setTimeout(callback, 600);
    } else if (section.page && section.tab) {
      navigate(`${section.page}?tab=${section.tab}&tour=true`);
      setTimeout(callback, 600);
    }
  }, [navigate, onOpenChange]);

  const handleLaunch = useCallback((section: TourSection) => {
    resetTour(section.tourKey);
    navigateAndLaunch(section, () => {
      startSingleTour(section.tourKey);
    });
  }, [navigateAndLaunch, startSingleTour]);

  const handleMicroLaunch = useCallback((section: TourSection, stepIndex: number) => {
    resetTour(section.tourKey);
    navigateAndLaunch(section, () => {
      startMicroTour(section.tourKey, stepIndex);
    });
  }, [navigateAndLaunch, startMicroTour]);

  const handleReset = useCallback((tourKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    resetTour(tourKey);
    forceUpdate(n => n + 1);
  }, []);

  const completedCount = APP_TOUR_SEQUENCE.filter(s => isCompleted(s.tourKey)).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[440px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg">All Tours</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {APP_TOUR_SEQUENCE.length} completed
          </p>
        </SheetHeader>

        <div className="space-y-6">
          {GROUPS.map(group => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.sections.map(section => {
                  const completed = isCompleted(section.tourKey);
                  const steps = TOUR_STEP_REGISTRY[section.tourKey] || [];
                  const stepCount = steps.length;
                  const isExpanded = expandedSections.has(section.tourKey);

                  return (
                    <Collapsible
                      key={section.tourKey}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(section.tourKey)}
                    >
                      <div className="flex items-center gap-2 py-1.5 px-1">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0"
                          >
                            <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (completed) {
                              resetTour(section.tourKey);
                              forceUpdate(n => n + 1);
                            }
                            handleLaunch(section);
                          }}
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            completed
                              ? 'bg-primary/15 text-primary'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title={completed ? 'Reset tour' : 'Play tour'}
                        >
                          {completed ? <RotateCcw className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </button>

                        <button
                          onClick={() => handleLaunch(section)}
                          className="flex-1 min-w-0 text-left hover:text-primary transition-colors"
                        >
                          <span className="text-sm font-medium">{section.name}</span>
                        </button>

                        <span className="flex-shrink-0 w-16 text-right text-xs text-muted-foreground">
                          {stepCount} steps
                        </span>
                      </div>

                      <CollapsibleContent>
                        <div className="ml-8 border-l border-border pl-3 py-1 space-y-0.5">
                          {steps.map((step, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleMicroLaunch(section, idx)}
                              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                            >
                              {getStepTitle(step)}
                            </button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
