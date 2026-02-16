import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import type { Step } from 'react-joyride';
import { useTour } from '@/hooks/useTour';
import { TourTooltip } from './TourTooltip';

interface OverlayTourProps {
  tourKey: string;
  steps: Step[];
}

export function OverlayTour({ tourKey, steps }: OverlayTourProps) {
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
          zIndex: 10001,
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
