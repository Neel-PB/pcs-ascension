import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '@/hooks/useTour';
import { employeesTourSteps, contractorsTourSteps, requisitionsTourSteps } from './positionsTourSteps';
import { TourTooltip } from './TourTooltip';

interface PositionsTourProps {
  activeTab?: string;
}

export function PositionsTour({ activeTab = 'employees' }: PositionsTourProps) {
  const tourKey = activeTab === 'contractors' ? 'positions-contractors' : activeTab === 'requisitions' ? 'positions-requisitions' : 'positions-employees';
  const steps = activeTab === 'contractors' ? contractorsTourSteps : activeTab === 'requisitions' ? requisitionsTourSteps : employeesTourSteps;
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
