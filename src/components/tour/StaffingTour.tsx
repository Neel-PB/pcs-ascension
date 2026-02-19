import Joyride, { CallBackProps, EVENTS, STATUS } from 'react-joyride';
import { useTour } from '@/hooks/useTour';
import { useTourStore } from '@/stores/useTourStore';
import { staffingSteps, planningSteps, varianceSteps, forecastSteps, volumeSettingsSteps, npSettingsSteps } from './tourSteps';
import { TourTooltip } from './TourTooltip';

const TAB_SEQUENCE = ['summary', 'planning', 'variance', 'forecasts', 'volume-settings', 'np-settings'];
const TOUR_KEY_MAP: Record<string, string> = {
  summary: 'staffing',
  planning: 'staffing-planning',
  variance: 'staffing-variance',
  forecasts: 'staffing-forecasts',
  'volume-settings': 'staffing-volume-settings',
  'np-settings': 'staffing-np-settings',
};

interface StaffingTourProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function StaffingTour({ activeTab = 'summary', onTabChange }: StaffingTourProps) {
  const tourKey = TOUR_KEY_MAP[activeTab] || 'staffing';
  const steps = activeTab === 'planning' ? planningSteps : activeTab === 'variance' ? varianceSteps : activeTab === 'forecasts' ? forecastSteps : activeTab === 'volume-settings' ? volumeSettingsSteps : activeTab === 'np-settings' ? npSettingsSteps : staffingSteps;
  const { run, setRun, completeTour } = useTour(tourKey);

  const handleCallback = (data: CallBackProps) => {
    const { status, type, step } = data;
    if (type === EVENTS.STEP_BEFORE && step?.target) {
      const el = document.querySelector(step.target as string);
      if (el) {
        el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' });
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    }
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      document.body.style.overflow = '';
      completeTour();

      const resetScroll = () => {
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
          mainContainer.scrollTo({ top: 0, behavior: 'instant' });
          (mainContainer as HTMLElement).style.overflow = '';
          (mainContainer as HTMLElement).style.overflowX = '';
          (mainContainer as HTMLElement).style.overflowY = '';
        }
        const scrollContainers = document.querySelectorAll(
          '[class*="overflow-auto"], [class*="overflow-y-auto"], [class*="overflow-x-auto"], [class*="overflow-y-scroll"], [class*="overflow-x-scroll"]'
        );
        scrollContainers.forEach(el => {
          (el as HTMLElement).style.overflow = '';
          (el as HTMLElement).style.overflowX = '';
          (el as HTMLElement).style.overflowY = '';
        });
      };

      setTimeout(resetScroll, 100);
      setTimeout(resetScroll, 300);

      // Cross-tab continuation: only on FINISHED (not skipped)
      if (status === STATUS.FINISHED && onTabChange) {
        const currentIndex = TAB_SEQUENCE.indexOf(activeTab);
        if (currentIndex >= 0 && currentIndex < TAB_SEQUENCE.length - 1) {
          const nextTab = TAB_SEQUENCE[currentIndex + 1];
          onTabChange(nextTab);
          setTimeout(() => {
            useTourStore.getState().startTour(TOUR_KEY_MAP[nextTab] || nextTab);
          }, 500);
        }
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      scrollToFirstStep={false}
      disableScrollParentFix
      disableOverlayClose={false}
      callback={handleCallback}
      tooltipComponent={TourTooltip}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: 'hsl(var(--card))',
          backgroundColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: 'hsl(var(--primary))',
        },
        spotlight: {
          borderRadius: 12,
          padding: 6,
          boxShadow: '0 0 0 2px hsl(var(--primary) / 0.3), 0 0 15px 4px hsl(var(--primary) / 0.1)',
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
}
