import { OverlayTour } from './OverlayTour';
import { headerTourSteps } from './headerTourSteps';

export function HeaderTour() {
  return <OverlayTour tourKey="header" steps={headerTourSteps} />;
}
