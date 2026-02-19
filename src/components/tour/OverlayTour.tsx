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
      document.body.style.overflow = '';
      completeTour();

      const resetScroll = () => {
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
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
      scrollToFirstStep
      disableOverlayClose
      disableScrollParentFix
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
