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
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'instant' });
      }
      const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
      }
      completeTour();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      scrollToFirstStep={false}
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
