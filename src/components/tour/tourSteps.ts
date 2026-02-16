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
  {
    target: '[data-tour="workforce-trigger"]',
    title: 'Workforce Drawer',
    content: 'Click this tab to open the Workforce Drawer for a detailed breakdown of positions.',
    placement: 'left',
    disableBeacon: true,
  },
];
