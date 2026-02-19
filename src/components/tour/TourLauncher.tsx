import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, RotateCcw, Play } from '@/lib/icons';
import { APP_TOUR_SEQUENCE, TourSection } from './tourConfig';
import { useTourStore } from '@/stores/useTourStore';
import { useFeedbackStore } from '@/stores/useFeedbackStore';
import { useWorkforceDrawerStore } from '@/stores/useWorkforceDrawerStore';
import {
  staffingSteps, planningSteps, varianceSteps, forecastSteps, volumeSettingsSteps, npSettingsSteps,
  adminUsersTourSteps, adminFeedTourSteps, adminRbacTourSteps, adminAuditTourSteps, adminSettingsTourSteps,
  feedbackTourSteps, aiHubTourSteps, checklistTourSteps,
} from './tourSteps';
import { employeesTourSteps, contractorsTourSteps, requisitionsTourSteps } from './positionsTourSteps';
import { headerTourSteps } from './headerTourSteps';

const TOUR_PREFIX = 'helix-tour-';

const STEP_COUNTS: Record<string, number> = {
  'staffing': staffingSteps.length,
  'staffing-planning': planningSteps.length,
  'staffing-variance': varianceSteps.length,
  'staffing-forecasts': forecastSteps.length,
  'staffing-volume-settings': volumeSettingsSteps.length,
  'staffing-np-settings': npSettingsSteps.length,
  'positions-employees': employeesTourSteps.length,
  'positions-contractors': contractorsTourSteps.length,
  'positions-requisitions': requisitionsTourSteps.length,
  'admin-users': adminUsersTourSteps.length,
  'admin-feed': adminFeedTourSteps.length,
  'admin-access-control': adminRbacTourSteps.length,
  'admin-audit-log': adminAuditTourSteps.length,
  'admin-settings': adminSettingsTourSteps.length,
  'header': headerTourSteps.length,
  'feedback': feedbackTourSteps.length,
  'ai-hub': aiHubTourSteps.length,
  'checklist': checklistTourSteps.length,
};

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
  const { startSingleTour } = useTourStore();
  const [, forceUpdate] = useState(0);

  const handleLaunch = useCallback((section: TourSection) => {
    onOpenChange(false);

    // Reset this tour so it can run
    resetTour(section.tourKey);

    const overlayKeys = ['feedback', 'ai-hub', 'checklist', 'header'];
    if (overlayKeys.includes(section.tourKey)) {
      // Open overlay panel first
      if (section.tourKey === 'feedback') {
        useFeedbackStore.getState().setOpen(true);
      } else if (section.tourKey === 'checklist') {
        useWorkforceDrawerStore.getState().setOpen(true);
      }
      // AI hub doesn't have a store-based open, header doesn't need panel
      setTimeout(() => {
        startSingleTour(section.tourKey);
      }, 600);
    } else if (section.page && section.tab) {
      navigate(`${section.page}?tab=${section.tab}&tour=true`);
      setTimeout(() => {
        startSingleTour(section.tourKey);
      }, 600);
    }
  }, [navigate, onOpenChange, startSingleTour]);

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
                  const stepCount = STEP_COUNTS[section.tourKey] || 0;
                  return (
                    <button
                      key={section.tourKey}
                      onClick={() => handleLaunch(section)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-accent/50 transition-colors group"
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        completed
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {completed ? <Check className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{section.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                        {stepCount} steps
                      </Badge>
                      {completed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleReset(section.tourKey, e)}
                          title="Reset tour"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                    </button>
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
