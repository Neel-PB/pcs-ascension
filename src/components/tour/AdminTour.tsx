import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useTour } from '@/hooks/useTour';
import {
  adminUsersTourSteps,
  adminFeedTourSteps,
  adminRbacTourSteps,
  adminAuditTourSteps,
  adminSettingsTourSteps,
} from './tourSteps';
import { TourTooltip } from './TourTooltip';

interface AdminTourProps {
  activeTab: string;
}

const tabConfig: Record<string, { tourKey: string; steps: typeof adminUsersTourSteps }> = {
  users: { tourKey: 'admin-users', steps: adminUsersTourSteps },
  feed: { tourKey: 'admin-feed', steps: adminFeedTourSteps },
  'access-control': { tourKey: 'admin-access-control', steps: adminRbacTourSteps },
  'audit-log': { tourKey: 'admin-audit-log', steps: adminAuditTourSteps },
  settings: { tourKey: 'admin-settings', steps: adminSettingsTourSteps },
};

export function AdminTour({ activeTab }: AdminTourProps) {
  const config = tabConfig[activeTab] || tabConfig.users;
  const { run, setRun, completeTour } = useTour(config.tourKey);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      completeTour();
    }
  };

  return (
    <Joyride
      key={activeTab}
      steps={config.steps}
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
