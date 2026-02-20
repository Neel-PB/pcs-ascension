import type { Step } from 'react-joyride';
import { createElement } from 'react';
import { PositionsDemoPreview } from './PositionsDemoPreview';

const positionsDemoContent = (text: string, variant: string) =>
  createElement('div', { className: 'space-y-1.5' },
    createElement('p', { className: 'text-[13px] leading-relaxed' }, text),
    createElement(PositionsDemoPreview, { variant } as any)
  );

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
    content: 'Switch between Employee, Open Requisition, Open Position, Contractor, and Contractor Requisition views.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-search"]',
    title: 'Search',
    content: 'Type to search by name, position number, job title, or department. Results filter as you type.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-refresh"]',
    title: 'Refresh Data',
    content: 'Click to manually refresh the data and see the latest updates from the source system.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-filter-btn"]',
    title: 'Advanced Filters',
    content: 'Open the filter panel for advanced filtering by status, employment type, shift, and FTE range.',
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
  {
    target: '[data-tour="positions-row"]',
    title: 'Position Details',
    content: positionsDemoContent('Click any row to open the Position Details sheet. View all position information, make edits, and switch to the Comments tab to see activity history and add notes.', 'position-details'),
    placement: 'bottom',
    disableBeacon: true,
    data: { wideTooltip: true },
  },
  {
    target: '[data-tour="positions-active-fte-cell"]',
    title: 'Active FTE',
    content: positionsDemoContent('Click the Active FTE cell to adjust a position\'s working FTE. Select a status reason (LOA, Orientation, Separation, etc.), set an expiration date, and optionally add a comment. Overrides appear in blue and automatically revert when expired.', 'active-fte-steps'),
    placement: 'left',
    disableBeacon: true,
    data: { wideTooltip: true },
  },
  {
    target: '[data-tour="positions-shift-cell"]',
    title: 'Shift Override',
    content: positionsDemoContent('For special shifts (Rotating, Weekend Option, Evening), click the pencil icon to assign a Day or Night selection. The original shift is shown with strikethrough alongside the new value. Use the reset icon to revert.', 'shift-override-steps'),
    placement: 'left',
    disableBeacon: true,
    data: { wideTooltip: true },
  },
  {
    target: '[data-tour="positions-comments"]',
    title: 'Comments',
    content: positionsDemoContent('The comment icon shows how many notes exist for each position. Click any row to open the detail sheet, then switch to the Comments tab to view the activity timeline and add notes.', 'comments-preview'),
    placement: 'bottom',
    disableBeacon: true,
    data: { wideTooltip: true },
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
    target: '[data-tour="positions-search"]',
    title: 'Search',
    content: 'Type to search by name, position number, job title, or department. Results filter as you type.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-refresh"]',
    title: 'Refresh Data',
    content: 'Click to manually refresh the data and see the latest updates from the source system.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-filter-btn"]',
    title: 'Advanced Filters',
    content: 'Open the filter panel for advanced filtering by employment type, shift, and FTE range.',
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
  {
    target: '[data-tour="positions-row"]',
    title: 'Position Details',
    content: positionsDemoContent('Click any row to open the Position Details sheet. View all position information, make edits, and switch to the Comments tab to see activity history and add notes.', 'position-details'),
    placement: 'bottom',
    disableBeacon: true,
    data: { wideTooltip: true },
  },
  {
    target: '[data-tour="positions-active-fte-cell"]',
    title: 'Active FTE',
    content: positionsDemoContent('Click the Active FTE cell to adjust a contractor\'s working FTE. Select a status reason (LOA, Orientation, Separation, etc.), set an expiration date, and optionally add a comment. Overrides appear in blue and automatically revert when expired.', 'active-fte-steps'),
    placement: 'left',
    disableBeacon: true,
    data: { wideTooltip: true },
  },
  {
    target: '[data-tour="positions-shift-cell"]',
    title: 'Shift Override',
    content: positionsDemoContent('For special shifts (Rotating, Weekend Option, Evening), click the pencil icon to assign a Day or Night selection. The original shift is shown with strikethrough alongside the new value. Use the reset icon to revert.', 'shift-override-steps'),
    placement: 'left',
    disableBeacon: true,
    data: { wideTooltip: true },
  },
  {
    target: '[data-tour="positions-comments"]',
    title: 'Comments',
    content: positionsDemoContent('The comment icon shows how many notes exist for each contractor. Click any row to open the detail sheet, then switch to the Comments tab to view the activity timeline and add notes.', 'comments-preview'),
    placement: 'bottom',
    disableBeacon: true,
    data: { wideTooltip: true },
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
    target: '[data-tour="positions-search"]',
    title: 'Search',
    content: 'Type to search by position number, job title, or department. Results filter as you type.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-refresh"]',
    title: 'Refresh Data',
    content: 'Click to manually refresh the data and see the latest updates from the source system.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-filter-btn"]',
    title: 'Advanced Filters',
    content: 'Open the filter panel for advanced filtering by vacancy age, lifecycle stage, shift, and employment type.',
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
  {
    target: '[data-tour="positions-row"]',
    title: 'Position Details',
    content: positionsDemoContent('Click any row to open the Position Details sheet. View vacancy information, lifecycle stage, and switch to the Comments tab to see activity history and add notes.', 'position-details'),
    placement: 'bottom',
    disableBeacon: true,
    data: { wideTooltip: true },
  },
  {
    target: '[data-tour="positions-comments"]',
    title: 'Comments',
    content: 'The comment icon shows how many notes exist for each open position. Click any row to open the detail sheet, then switch to the Comments tab to view the activity timeline and add notes.',
    placement: 'bottom',
    disableBeacon: true,
    data: { wideTooltip: true },
  },
];

export const openRequisitionTourSteps: Step[] = [
  {
    target: '[data-tour="filter-bar"]',
    title: 'Filter Bar',
    content: 'Use these filters to narrow open requisitions by Region, Market, Facility, and Department.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-tabs"]',
    title: 'Tab Navigation',
    content: 'Switch between Employee, Open Requisition, Open Position, Contractor, and Contractor Requisition views.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-search"]',
    title: 'Search',
    content: 'Type to search by requisition number, job title, or status. Results filter as you type.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-table"]',
    title: 'Data Table',
    content: 'View open requisitions with requisition number, job title, shift, employment type, and status columns. Columns can be reordered and sorted.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const contractorRequisitionTourSteps: Step[] = [
  {
    target: '[data-tour="filter-bar"]',
    title: 'Filter Bar',
    content: 'Use these filters to narrow contractor requisitions by Region, Market, Facility, and Department.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-tabs"]',
    title: 'Tab Navigation',
    content: 'Switch between Employee, Open Requisition, Open Position, Contractor, and Contractor Requisition views.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-search"]',
    title: 'Search',
    content: 'Type to search by requisition number, job title, or status. Results filter as you type.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="positions-table"]',
    title: 'Data Table',
    content: 'View contractor requisitions with requisition number, job title, shift, employment type, and status columns. Columns can be reordered and sorted.',
    placement: 'top',
    disableBeacon: true,
  },
];
