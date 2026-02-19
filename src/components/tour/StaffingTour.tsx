import Joyride, { CallBackProps, EVENTS, STATUS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import { useTour } from '@/hooks/useTour';
import { useTourStore } from '@/stores/useTourStore';
import { staffingSteps, planningSteps, varianceSteps, forecastSteps, volumeSettingsSteps, npSettingsSteps } from './tourSteps';
import { TourTooltip } from './TourTooltip';
import { getNextSection, injectSectionMetadata } from './tourConfig';
import { useMemo } from 'react';

const TAB_SEQUENCE = ['summary', 'planning', 'variance', 'forecasts', 'volume-settings', 'np-settings'];
const TOUR_KEY_MAP: Record<string, string> = {
  summary: 'staffing',
  planning: 'staffing-planning',
  variance: 'staffing-variance',
  forecasts: 'staffing-forecasts',
  'volume-settings': 'staffing-volume-settings',
  'np-settings': 'staffing-np-settings',
};

const RAW_STEPS_MAP: Record<string, any[]> = {
  summary: staffingSteps,
  planning: planningSteps,
  variance: varianceSteps,
  forecasts: forecastSteps,
  'volume-settings': volumeSettingsSteps,
  'np-settings': npSettingsSteps,
};

interface StaffingTourProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function StaffingTour({ activeTab = 'summary', onTabChange }: StaffingTourProps) {
  const navigate = useNavigate();
  const tourKey = TOUR_KEY_MAP[activeTab] || 'staffing';
  const rawSteps = RAW_STEPS_MAP[activeTab] || staffingSteps;
  const steps = useMemo(() => injectSectionMetadata(rawSteps, tourKey), [rawSteps, tourKey]);
  const { run, setRun, completeTour } = useTour(tourKey);

  const handleNextSection = () => {
    const nextSection = getNextSection(tourKey);
    if (!nextSection) return;

    // Same page (different tab)
    if (nextSection.page === '/staffing' && nextSection.tab && onTabChange) {
      onTabChange(nextSection.tab);
      setTimeout(() => {
        useTourStore.getState().startTour(nextSection.tourKey);
      }, 500);
    } else if (nextSection.page) {
      // Different page
      navigate(`${nextSection.page}?tab=${nextSection.tab}&tour=true`);
    }
  };

  const resetScrollContainers = () => {
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'instant' });
      (mainContainer as HTMLElement).style.overflow = '';
      (mainContainer as HTMLElement).style.overflowX = '';
      (mainContainer as HTMLElement).style.overflowY = '';
    }
    document.querySelectorAll(
      '[class*="overflow-auto"], [class*="overflow-y-auto"], [class*="overflow-x-auto"], [class*="overflow-y-scroll"], [class*="overflow-x-scroll"]'
    ).forEach(el => {
      (el as HTMLElement).style.overflow = '';
      (el as HTMLElement).style.overflowX = '';
      (el as HTMLElement).style.overflowY = '';
    });
  };

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
      setTimeout(resetScrollContainers, 100);
      setTimeout(resetScrollContainers, 300);

      const { skipMode, clearSkipMode } = useTourStore.getState();

      if (status === STATUS.SKIPPED) {
        if (skipMode === 'section') {
          clearSkipMode();
          handleNextSection();
        } else if (skipMode === 'all') {
          clearSkipMode();
          // skipAllTours already marked everything complete
        } else {
          // Plain skip (no skip mode) — do nothing extra
        }
      } else {
        // FINISHED — auto-continue to next section
        handleNextSection();
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
