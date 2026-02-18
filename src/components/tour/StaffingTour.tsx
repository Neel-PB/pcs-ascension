import Joyride, { CallBackProps, EVENTS, STATUS } from 'react-joyride';
import { useTour } from '@/hooks/useTour';
import { staffingSteps, planningSteps, varianceSteps, forecastSteps, volumeSettingsSteps, npSettingsSteps } from './tourSteps';
import { TourTooltip } from './TourTooltip';

interface StaffingTourProps {
  activeTab?: string;
}

export function StaffingTour({ activeTab = 'summary' }: StaffingTourProps) {
  const tourKey = activeTab === 'planning' ? 'staffing-planning' : activeTab === 'variance' ? 'staffing-variance' : activeTab === 'forecasts' ? 'staffing-forecasts' : activeTab === 'volume-settings' ? 'staffing-volume-settings' : activeTab === 'np-settings' ? 'staffing-np-settings' : 'staffing';
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
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
}
