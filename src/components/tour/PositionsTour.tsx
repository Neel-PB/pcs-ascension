import Joyride, { CallBackProps, EVENTS, STATUS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import { useTour } from '@/hooks/useTour';
import { useTourStore } from '@/stores/useTourStore';
import { employeesTourSteps, contractorsTourSteps, requisitionsTourSteps } from './positionsTourSteps';
import { TourTooltip } from './TourTooltip';
import { getNextSection, injectSectionMetadata } from './tourConfig';
import { useMemo } from 'react';

const TAB_SEQUENCE = ['employees', 'contractors', 'requisitions'];
const TOUR_KEY_MAP: Record<string, string> = {
  employees: 'positions-employees',
  contractors: 'positions-contractors',
  requisitions: 'positions-requisitions',
};
const RAW_STEPS_MAP: Record<string, any[]> = {
  employees: employeesTourSteps,
  contractors: contractorsTourSteps,
  requisitions: requisitionsTourSteps,
};

interface PositionsTourProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function PositionsTour({ activeTab = 'employees', onTabChange }: PositionsTourProps) {
  const navigate = useNavigate();
  const tourKey = TOUR_KEY_MAP[activeTab] || 'positions-employees';
  const rawSteps = RAW_STEPS_MAP[activeTab] || employeesTourSteps;
  const steps = useMemo(() => injectSectionMetadata(rawSteps, tourKey), [rawSteps, tourKey]);
  const { run, setRun, completeTour } = useTour(tourKey);

  const tableCellTargets = [
    '[data-tour="positions-active-fte-cell"]',
    '[data-tour="positions-shift-cell"]',
  ];

  const tableHeaderTargets = [
    '[data-tour="positions-comments"]',
  ];

  const handleNextSection = () => {
    const nextSection = getNextSection(tourKey);
    if (!nextSection) return;

    if (nextSection.page === '/positions' && nextSection.tab && onTabChange) {
      onTabChange(nextSection.tab);
      setTimeout(() => {
        useTourStore.getState().startTour(nextSection.tourKey);
      }, 500);
    } else if (nextSection.page) {
      navigate(`${nextSection.page}?tab=${nextSection.tab}&tour=true`);
    } else if (nextSection.tourKey === 'header') {
      // Header is an overlay tour, just start it
      setTimeout(() => {
        useTourStore.getState().startTour('header');
      }, 500);
    }
  };

  const handleCallback = (data: CallBackProps) => {
    const { status, type, step, index } = data;

    // Pre-scroll for the NEXT step if it's a table header target
    if (type === EVENTS.STEP_AFTER) {
      const nextIndex = index + 1;
      if (nextIndex < steps.length) {
        const nextTarget = steps[nextIndex].target as string;
        if (tableHeaderTargets.includes(nextTarget)) {
          const nextEl = document.querySelector(nextTarget);
          if (nextEl) {
            const scrollContainer = nextEl.closest('.overflow-x-auto') as HTMLElement;
            if (scrollContainer) {
              const cellRect = nextEl.getBoundingClientRect();
              const containerRect = scrollContainer.getBoundingClientRect();
              const cellOffsetLeft = cellRect.left - containerRect.left + scrollContainer.scrollLeft;
              const centerOffset = cellOffsetLeft - (containerRect.width / 2) + (cellRect.width / 2);
              scrollContainer.scrollLeft = Math.max(0, centerOffset);
            }
          }
        }
      }
    }
    if (type === EVENTS.STEP_BEFORE && step?.target) {
      const isTableCellStep = tableCellTargets.includes(step.target as string);
      const isTableHeaderStep = tableHeaderTargets.includes(step.target as string);
      const el = document.querySelector(step.target as string);
      if (el) {
        if (isTableCellStep || isTableHeaderStep) {
          // Horizontal: manually scroll the container to center the element
          const scrollContainer = el.closest('.overflow-x-auto') as HTMLElement;
          if (scrollContainer) {
            const cellRect = el.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            const cellOffsetLeft = cellRect.left - containerRect.left + scrollContainer.scrollLeft;
            const centerOffset = cellOffsetLeft - (containerRect.width / 2) + (cellRect.width / 2);
            scrollContainer.scrollLeft = Math.max(0, centerOffset);
          }

          // Vertical: scroll cell into center of the virtual body (body cells only)
          if (isTableCellStep) {
            const virtualBody = el.closest('[data-tour-virtual-body]') as HTMLElement;
            if (virtualBody) {
              const cellRect = el.getBoundingClientRect();
              const bodyRect = virtualBody.getBoundingClientRect();
              const cellOffsetTop = cellRect.top - bodyRect.top + virtualBody.scrollTop;
              const centerOffset = cellOffsetTop - (bodyRect.height / 2) + (cellRect.height / 2);
              virtualBody.scrollTop = Math.max(0, centerOffset);
            }
          }

          // Two-phase: wait for scroll to settle, then re-measure and trigger resize
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
            setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
          }, 50);
        } else {
          el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
          const mainEl = document.querySelector('main');
          if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
          setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
          setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
        }
      }
    }
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      document.body.style.overflow = '';
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

      const { skipMode, clearSkipMode } = useTourStore.getState();
      if (status === STATUS.SKIPPED) {
        if (skipMode === 'section') {
          clearSkipMode();
          handleNextSection();
        } else if (skipMode === 'all') {
          clearSkipMode();
        }
      } else {
        const { singleSection } = useTourStore.getState();
        if (!singleSection) {
          handleNextSection();
        }
      }
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
