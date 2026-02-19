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

  const tableCellTargets = [
    '[data-tour="positions-active-fte-cell"]',
    '[data-tour="positions-shift-cell"]',
    '[data-tour="positions-comments"]',
  ];

  const restoreTableContainment = () => {
    // Restore overflow on ancestors we modified
    document.querySelectorAll('[data-tour-orig-overflow]').forEach(node => {
      const htmlEl = node as HTMLElement;
      htmlEl.style.overflow = htmlEl.getAttribute('data-tour-orig-overflow') || '';
      htmlEl.style.overflowX = htmlEl.getAttribute('data-tour-orig-overflow-x') || '';
      htmlEl.removeAttribute('data-tour-orig-overflow');
      htmlEl.removeAttribute('data-tour-orig-overflow-x');
    });
    // Restore contain: layout on virtual body
    const virtualBody = document.querySelector('[data-tour-virtual-body]');
    if (virtualBody) (virtualBody as HTMLElement).style.contain = 'layout';
  };

  const handleCallback = (data: CallBackProps) => {
    const { status, type, step } = data;
    if (type === EVENTS.STEP_BEFORE && step?.target) {
      const isTableCellStep = tableCellTargets.includes(step.target as string);

      // Restore containment before each step (clean slate)
      restoreTableContainment();

      const el = document.querySelector(step.target as string);
      if (el) {
        el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTo({ top: 0, behavior: 'instant' });
        }

        if (isTableCellStep) {
          // Neutralize contain: layout on VirtualizedTableBody
          const virtualBody = el.closest('[data-tour-virtual-body]');
          if (virtualBody) (virtualBody as HTMLElement).style.contain = 'none';

          // Set overflow visible on scroll ancestors up to the table root
          let parent = el.parentElement;
          while (parent) {
            const computed = getComputedStyle(parent);
            if (computed.overflow !== 'visible' || computed.overflowX !== 'visible') {
              parent.setAttribute('data-tour-orig-overflow', parent.style.overflow);
              parent.setAttribute('data-tour-orig-overflow-x', parent.style.overflowX);
              parent.style.overflow = 'visible';
              parent.style.overflowX = 'visible';
            }
            if (parent.matches('[data-tour="positions-table"]')) break;
            parent = parent.parentElement;
          }
        }

        // Force Joyride to recalculate spotlight after scroll settles
        setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
      }
    }
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      document.body.style.overflow = '';
      restoreTableContainment();
      completeTour();

      const resetScroll = () => {
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'instant' });
        const tableContainer = document.querySelector('[class*="overflow-x-auto"]');
        if (tableContainer) {
          tableContainer.scrollTo({ left: 0, behavior: 'instant' });
          (tableContainer as HTMLElement).style.overflow = '';
        }
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
      disableScrolling
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
