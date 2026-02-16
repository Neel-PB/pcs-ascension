import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '@/hooks/useTour';
import { staffingSteps, planningSteps, varianceSteps } from './tourSteps';
import { TourTooltip } from './TourTooltip';

interface StaffingTourProps {
  activeTab?: string;
}

export function StaffingTour({ activeTab = 'summary' }: StaffingTourProps) {
  const tourKey = activeTab === 'planning' ? 'staffing-planning' : activeTab === 'variance' ? 'staffing-variance' : 'staffing';
  const steps = activeTab === 'planning' ? planningSteps : activeTab === 'variance' ? varianceSteps : staffingSteps;
  const { run, setRun, completeTour } = useTour(tourKey);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      completeTour();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
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
