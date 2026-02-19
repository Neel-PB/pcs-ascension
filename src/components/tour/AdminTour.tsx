import Joyride, { CallBackProps, EVENTS, STATUS } from 'react-joyride';
import { useTour } from '@/hooks/useTour';
import { useTourStore } from '@/stores/useTourStore';
import {
  adminUsersTourSteps,
  adminFeedTourSteps,
  adminRbacTourSteps,
  adminAuditTourSteps,
  adminSettingsTourSteps,
} from './tourSteps';
import { TourTooltip } from './TourTooltip';
import { getNextSection, injectSectionMetadata } from './tourConfig';
import { useMemo } from 'react';

const TAB_SEQUENCE = ['users', 'feed', 'access-control', 'audit-log', 'settings'];
const TOUR_KEY_MAP: Record<string, string> = {
  users: 'admin-users',
  feed: 'admin-feed',
  'access-control': 'admin-access-control',
  'audit-log': 'admin-audit-log',
  settings: 'admin-settings',
};

const tabConfig: Record<string, { tourKey: string; steps: any[] }> = {
  users: { tourKey: 'admin-users', steps: adminUsersTourSteps },
  feed: { tourKey: 'admin-feed', steps: adminFeedTourSteps },
  'access-control': { tourKey: 'admin-access-control', steps: adminRbacTourSteps },
  'audit-log': { tourKey: 'admin-audit-log', steps: adminAuditTourSteps },
  settings: { tourKey: 'admin-settings', steps: adminSettingsTourSteps },
};

interface AdminTourProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export function AdminTour({ activeTab, onTabChange }: AdminTourProps) {
  const config = tabConfig[activeTab] || tabConfig.users;
  const steps = useMemo(() => injectSectionMetadata(config.steps, config.tourKey), [config.steps, config.tourKey]);
  const { run, setRun, completeTour } = useTour(config.tourKey);

  const handleNextSection = () => {
    const nextSection = getNextSection(config.tourKey);
    if (!nextSection) return;

    if (nextSection.page === '/admin' && nextSection.tab && onTabChange) {
      onTabChange(nextSection.tab);
      setTimeout(() => {
        useTourStore.getState().startTour(nextSection.tourKey);
      }, 500);
    } else if (nextSection.tourKey === 'header') {
      // Header is an overlay tour
      setTimeout(() => {
        useTourStore.getState().startTour('header');
      }, 500);
    }
  };

  const handleCallback = (data: CallBackProps) => {
    const { status, type, step } = data;
    if (type === EVENTS.STEP_BEFORE && step?.target) {
      const el = document.querySelector(step.target as string);
      if (el) {
        el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' });
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      const mainContainer = document.querySelector('main');
      if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'instant' });
      const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
      if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
      completeTour();

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
