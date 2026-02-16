import type { Step } from 'react-joyride';

export const staffingSteps: Step[] = [
  {
    target: '[data-tour="filter-bar"]',
    title: 'Filter Bar',
    content: 'Use these filters to narrow data by Region, Market, Facility, and Department. Filters cascade: selecting a Region updates the available Markets.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="tab-navigation"]',
    title: 'Tab Navigation',
    content: 'Switch between Summary, Planned/Active Resources, Variance Analysis, Forecasts, and Settings views.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="fte-section"]',
    title: 'FTE KPI Section',
    content: 'These cards show key staffing metrics like Vacancy Rate, Hired FTEs, and Target FTEs. Click any card for a detailed chart. Drag to reorder.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="volume-section"]',
    title: 'Volume KPI Section',
    content: 'Volume metrics track patient encounters. The highlighted Target Volume card drives staffing calculations.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="productivity-section"]',
    title: 'Productive Resources',
    content: 'Track actual paid labor including contract staff, overtime, and PRN usage.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-chart-action"]',
    title: 'KPI Trend Chart',
    content: 'Click the chart icon on any KPI card to view detailed trend data, historical charts, and breakdowns by category.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-info-action"]',
    title: 'KPI Definition & Calculation',
    content: 'Click the eye icon to see what this KPI measures and how it\'s calculated.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-split-badge"]',
    title: 'Employment Type Split',
    content: 'This shows the FT/PT/PRN staffing mix. The target is 70% Full-Time, 20% Part-Time, 10% PRN. Click to see current vs target variance.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const varianceSteps: Step[] = [
  {
    target: '[data-tour="variance-header"]',
    title: 'Variance Analysis',
    content: 'This table shows FTE variance by skill type across your selected scope. Data adapts automatically based on your filter selections (Region, Market, Facility, Department).',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="variance-legend"]',
    title: 'FTE Legend',
    content: 'Positive (+) values indicate an FTE Shortage. Negative (-) values indicate an FTE Surplus.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="variance-skill-headers"]',
    title: 'Skill Column Headers',
    content: 'Variance is broken down by skill type: CL (Clinical Lead), RN (Registered Nurse), PCT (Patient Care Tech), HUC (Health Unit Coordinator), and Overhead.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="variance-table"]',
    title: 'Expandable Groups',
    content: 'Rows are grouped by Region, Submarket, or Facility depending on your filter level. Click any group row to expand and see individual breakdowns.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="variance-actions"]',
    title: 'Action Buttons',
    content: 'Use these buttons to refresh data, download the table as CSV, or expand to a full-screen view.',
    placement: 'bottom',
    disableBeacon: true,
  },
];

export const forecastSteps: Step[] = [
  {
    target: '[data-tour="forecast-kpi-cards"]',
    title: 'Forecast KPI Cards',
    content: 'These cards summarize FTE Shortages (positions to open) and FTE Surpluses (positions to close). Click a card to filter the table below by that gap type; click again to show all.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="forecast-table-header"]',
    title: 'Forecast Table',
    content: 'Each row represents a department-skill-shift combination with an FTE gap. Columns show Market, Facility, Department, Skill Type, Shift, FTE Gap, and Status.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="forecast-table-body"]',
    title: 'Expandable Detail View',
    content: 'Click any row to expand a two-panel detail view comparing current hired FTE against recommended changes. Recommendations prioritize canceling open requisitions before closing filled positions.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const planningSteps: Step[] = [
  {
    target: '[data-tour="planning-header"]',
    title: 'FTE Skill Shift Analysis',
    content: 'This view breaks down your staffing by skill type and shift (Day/Night), showing Target FTEs, Hired/Active FTEs, Open Requisitions, and Variance.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="planning-hired-toggle"]',
    title: 'Hired / Active Toggle',
    content: 'Switch between Hired (all employees including those on leave) and Active (currently available staff adjusted by department leaders).',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="planning-nursing-toggle"]',
    title: 'Nursing / Non-Nursing Toggle',
    content: 'Filter between Nursing (clinical departments with full Target/Variance columns) and Non-Nursing (showing only Hired and Open Reqs). When a specific department is selected, this auto-sets based on the department type.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="planning-legend"]',
    title: 'FTE Legend',
    content: 'Positive values indicate an FTE surplus. Orange negative values indicate an FTE shortage that needs attention.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="planning-table"]',
    title: 'Expandable Skill Groups',
    content: 'Skills are grouped into Overheads, Clinical Staff, and Support Staff. Click any group row to expand and see individual skill breakdowns.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="planning-actions"]',
    title: 'Action Buttons',
    content: 'Use these buttons to refresh data, download the table as CSV, or expand to a full-screen view.',
    placement: 'bottom',
    disableBeacon: true,
  },
];
