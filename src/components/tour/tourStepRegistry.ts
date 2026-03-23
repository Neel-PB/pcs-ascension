import type { Step } from 'react-joyride';
import {
  staffingSteps, planningSteps, varianceSteps, forecastSteps,
  volumeSettingsSteps, npSettingsSteps,
  adminUsersTourSteps, adminFeedTourSteps, adminRbacTourSteps,
  adminAuditTourSteps: _unused, adminSettingsTourSteps,
  feedbackTourSteps, aiHubTourSteps, checklistTourSteps,
  feedbackPageTourSteps, analyticsTourSteps, reportsTourSteps,
} from './tourSteps';
import { employeesTourSteps, contractorsTourSteps, requisitionsTourSteps, openRequisitionTourSteps, contractorRequisitionTourSteps } from './positionsTourSteps';
import { headerTourSteps } from './headerTourSteps';
import { sidebarTourSteps } from './sidebarTourSteps';

export const TOUR_STEP_REGISTRY: Record<string, Step[]> = {
  'staffing': staffingSteps,
  'staffing-planning': planningSteps,
  'staffing-variance': varianceSteps,
  'staffing-forecasts': forecastSteps,
  'staffing-volume-settings': volumeSettingsSteps,
  'staffing-np-settings': npSettingsSteps,
  'positions-employees': employeesTourSteps,
  'positions-open-requisition': openRequisitionTourSteps,
  'positions-requisitions': requisitionsTourSteps,
  'positions-contractors': contractorsTourSteps,
  'positions-contractor-requisition': contractorRequisitionTourSteps,
  'admin-users': adminUsersTourSteps,
  'admin-feed': adminFeedTourSteps,
  'admin-access-control': adminRbacTourSteps,
  'admin-audit-log': adminAuditTourSteps,
  'admin-settings': adminSettingsTourSteps,
  'header': headerTourSteps,
  'sidebar': sidebarTourSteps,
  'feedback': feedbackTourSteps,
  'feedback-page': feedbackPageTourSteps,
  'ai-hub': aiHubTourSteps,
  'checklist': checklistTourSteps,
  'analytics': analyticsTourSteps,
  'reports': reportsTourSteps,
};

export function getStepTitle(step: Step): string {
  return (step.title as string) || `Step`;
}
