import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import type { Step } from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import { useTour } from '@/hooks/useTour';
import { useTourStore } from '@/stores/useTourStore';
import { TourTooltip } from './TourTooltip';
import { injectSectionMetadata, getNextSection } from './tourConfig';
import { useMemo } from 'react';

interface OverlayTourProps {
  tourKey: string;
  steps: Step[];
}

export function OverlayTour({ tourKey, steps }: OverlayTourProps) {
  const navigate = useNavigate();
  const microTourStep = useTourStore(s => s.microTourStep);
  const isOnboarding = useTourStore(s => s.isOnboarding);
  const clearMicroTour = useTourStore(s => s.clearMicroTour);
  const isMicro = microTourStep && microTourStep.tourKey === tourKey;
  const enrichedSteps = useMemo(() => {
    const base = isMicro ? [steps[microTourStep.stepIndex]] : steps;
    return injectSectionMetadata(base, tourKey);
  }, [steps, tourKey, isMicro, microTourStep?.stepIndex]);
  const { run, setRun, completeTour } = useTour(tourKey, { autoStart: false });

  const handleNextSection = () => {
    const { singleSection } = useTourStore.getState();
    if (isMicro || singleSection) return;

    const nextSection = getNextSection(tourKey);
    if (!nextSection) return;

    if (!nextSection.page) {
      setTimeout(() => {
        useTourStore.getState().startTour(nextSection.tourKey);
      }, 500);
    } else {
      navigate(
        `${nextSection.page}${nextSection.tab ? `?tab=${nextSection.tab}&tour=true` : '?tour=true'}`
      );
    }
  };

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      document.body.style.overflow = '';
      completeTour();

      if (isMicro) clearMicroTour();
      const { skipMode, clearSkipMode } = useTourStore.getState();

      if (status === STATUS.FINISHED) {
        handleNextSection();
      } else if (skipMode === 'section') {
        handleNextSection();
      }

      if (skipMode) clearSkipMode();

      const resetScroll = () => {
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
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

      setTimeout(resetScroll, 100);
      setTimeout(resetScroll, 300);
    }
  };

  return (
    <Joyride
      steps={enrichedSteps}
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
        disableFlip: true,
      }}
    />
  );
}
