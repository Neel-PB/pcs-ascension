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
    target: '[data-tour="workforce-trigger"]',
    title: 'Workforce Drawer',
    content: 'Click this tab to open the Workforce Drawer for a detailed breakdown of positions.',
    placement: 'left',
    disableBeacon: true,
  },
];
