import type { Step } from 'react-joyride';

export const employeesTourSteps: Step[] = [
  {
    target: '[data-tour="filter-bar"]',
    title: 'Filter Bar',
    content: 'Use these filters to narrow the employee roster by Region, Market, Facility, and Department.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-tabs"]',
    title: 'Tab Navigation',
    content: 'Switch between Employees, Contractors, and Open Positions views.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-search-bar"]',
    title: 'Search & Actions',
    content: 'Search by name, position number, job title, or department. Use the filter button for advanced filtering by status, employment type, shift, and FTE range.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-table"]',
    title: 'Data Table',
    content: 'Click any row to open the employee detail sheet with full position information and comments. Columns can be resized, reordered, and toggled.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const contractorsTourSteps: Step[] = [
  {
    target: '[data-tour="filter-bar"]',
    title: 'Filter Bar',
    content: 'Use these filters to narrow the contractor roster by Region, Market, Facility, and Department.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-tabs"]',
    title: 'Tab Navigation',
    content: 'Switch between Employees, Contractors, and Open Positions views.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-search-bar"]',
    title: 'Search & Actions',
    content: 'Search by name, position number, job title, or department. Use the filter button for advanced filtering by employment type, shift, and FTE range.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-table"]',
    title: 'Data Table',
    content: 'Click any row to open the contractor detail sheet with full position information and comments. Columns can be resized, reordered, and toggled.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const requisitionsTourSteps: Step[] = [
  {
    target: '[data-tour="filter-bar"]',
    title: 'Filter Bar',
    content: 'Use these filters to narrow open positions by Region, Market, Facility, and Department.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-tabs"]',
    title: 'Tab Navigation',
    content: 'Switch between Employees, Contractors, and Open Positions views.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-search-bar"]',
    title: 'Search & Actions',
    content: 'Search by position number, job title, or department. Use the filter button for advanced filtering by vacancy age, lifecycle stage, shift, and employment type.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-table"]',
    title: 'Data Table',
    content: 'Click any row to open the requisition detail sheet. Vacancy age badges indicate urgency. Columns can be resized, reordered, and toggled.',
    placement: 'top',
    disableBeacon: true,
  },
];
