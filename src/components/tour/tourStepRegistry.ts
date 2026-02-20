import type { Step } from 'react-joyride';
import {
  staffingSteps, planningSteps, varianceSteps, forecastSteps,
  volumeSettingsSteps, npSettingsSteps,
  adminUsersTourSteps, adminFeedTourSteps, adminRbacTourSteps,
  adminAuditTourSteps, adminSettingsTourSteps,
  feedbackTourSteps, aiHubTourSteps, checklistTourSteps,
} from './tourSteps';
import { employeesTourSteps, contractorsTourSteps, requisitionsTourSteps, openRequisitionTourSteps, contractorRequisitionTourSteps } from './positionsTourSteps';
import { headerTourSteps } from './headerTourSteps';

export const TOUR_STEP_REGISTRY: Record<string, Step[]> = {
  'staffing': staffingSteps,
  'staffing-planning': planningSteps,
  'staffing-variance': varianceSteps,
  'staffing-forecasts': forecastSteps,
  'staffing-volume-settings': volumeSettingsSteps,
  'staffing-np-settings': npSettingsSteps,
  'positions-employees': employeesTourSteps,
  'positions-open-requisition': openRequisitionTourSteps,
  'positions-contractors': contractorsTourSteps,
  'positions-requisitions': requisitionsTourSteps,
  'positions-contractor-requisition': contractorRequisitionTourSteps,
  'admin-users': adminUsersTourSteps,
  'admin-feed': adminFeedTourSteps,
  'admin-access-control': adminRbacTourSteps,
  'admin-audit-log': adminAuditTourSteps,
  'admin-settings': adminSettingsTourSteps,
  'header': headerTourSteps,
  'feedback': feedbackTourSteps,
  'ai-hub': aiHubTourSteps,
  'checklist': checklistTourSteps,
};

export function getStepTitle(step: Step): string {
  return (step.title as string) || `Step`;
}
