export interface TourSection {
  page: string | null;
  tab: string | null;
  tourKey: string;
  name: string;
}

export const APP_TOUR_SEQUENCE: TourSection[] = [
  { page: '/staffing', tab: 'summary', tourKey: 'staffing', name: 'Summary' },
  { page: '/staffing', tab: 'planning', tourKey: 'staffing-planning', name: 'Planned Resources' },
  { page: '/staffing', tab: 'variance', tourKey: 'staffing-variance', name: 'Variance Analysis' },
  { page: '/staffing', tab: 'forecasts', tourKey: 'staffing-forecasts', name: 'Forecasts' },
  { page: '/staffing', tab: 'volume-settings', tourKey: 'staffing-volume-settings', name: 'Volume Settings' },
  { page: '/staffing', tab: 'np-settings', tourKey: 'staffing-np-settings', name: 'NP Settings' },
  { page: '/positions', tab: 'employees', tourKey: 'positions-employees', name: 'Employees' },
  { page: '/positions', tab: 'open-requisition', tourKey: 'positions-open-requisition', name: 'Open Requisition' },
  { page: '/positions', tab: 'open-position', tourKey: 'positions-requisitions', name: 'Open Positions' },
  { page: '/positions', tab: 'contractors', tourKey: 'positions-contractors', name: 'Contractors' },
  { page: '/positions', tab: 'contractor-requisition', tourKey: 'positions-contractor-requisition', name: 'Contractor Requisition' },
  { page: '/admin', tab: 'users', tourKey: 'admin-users', name: 'Admin Users' },
  { page: '/admin', tab: 'feed', tourKey: 'admin-feed', name: 'Admin Feed' },
  { page: '/admin', tab: 'access-control', tourKey: 'admin-access-control', name: 'RBAC' },
  { page: '/admin', tab: 'audit-log', tourKey: 'admin-audit-log', name: 'Audit Log' },
  { page: '/admin', tab: 'settings', tourKey: 'admin-settings', name: 'Admin Settings' },
  { page: null, tab: null, tourKey: 'header', name: 'Header' },
  { page: null, tab: null, tourKey: 'feedback', name: 'Feedback Panel' },
  { page: null, tab: null, tourKey: 'ai-hub', name: 'AI Assistant' },
  { page: null, tab: null, tourKey: 'checklist', name: 'Positions Checklist' },
];

const TOUR_PREFIX = 'helix-tour-';

export function getNextSection(currentTourKey: string): TourSection | null {
  const idx = APP_TOUR_SEQUENCE.findIndex(s => s.tourKey === currentTourKey);
  if (idx >= 0 && idx < APP_TOUR_SEQUENCE.length - 1) {
    return APP_TOUR_SEQUENCE[idx + 1];
  }
  return null;
}

export function getCurrentSection(tourKey: string): TourSection | undefined {
  return APP_TOUR_SEQUENCE.find(s => s.tourKey === tourKey);
}

export function getSectionIndex(tourKey: string): number {
  return APP_TOUR_SEQUENCE.findIndex(s => s.tourKey === tourKey);
}

export function markAllToursCompleted() {
  APP_TOUR_SEQUENCE.forEach(s => {
    localStorage.setItem(`${TOUR_PREFIX}${s.tourKey}-completed`, 'true');
  });
}

export function injectSectionMetadata(steps: any[], tourKey: string) {
  const sectionIndex = getSectionIndex(tourKey);
  const current = getCurrentSection(tourKey);
  const next = getNextSection(tourKey);
  
  return steps.map(step => ({
    ...step,
    data: {
      ...step.data,
      sectionName: current?.name || '',
      sectionIndex,
      totalSections: APP_TOUR_SEQUENCE.length,
      nextSectionName: next?.name || null,
      isLastSection: sectionIndex === APP_TOUR_SEQUENCE.length - 1,
    },
  }));
}
