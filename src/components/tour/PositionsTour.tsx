import Joyride, { CallBackProps, EVENTS, STATUS } from 'react-joyride';
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
    const { status, type, step } = data;
    if (type === EVENTS.STEP_BEFORE && step?.target) {
      const el = document.querySelector(step.target as string);
      if (el) {
        el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTo({ top: 0, behavior: 'instant' });
        }
        // Reset horizontal scroll that scrollIntoView may have caused
        const tableContainer = document.querySelector('[class*="overflow-x-auto"]');
        if (tableContainer) {
          tableContainer.scrollTo({ left: 0, behavior: 'instant' });
        }
      }
    }
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      document.body.style.overflow = '';
      completeTour();

      const resetScroll = () => {
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'instant' });
        document.querySelector('[class*="overflow-x-auto"]')?.scrollTo({ left: 0, behavior: 'instant' });
      };

      setTimeout(resetScroll, 100);
      setTimeout(resetScroll, 300);
    }
  };

  return (
    <Joyride
      key={activeTab}
      steps={steps}
      run={run}
      continuous
      showSkipButton
      scrollToFirstStep={false}
      disableScrolling={false}
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
