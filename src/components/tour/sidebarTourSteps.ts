import type { Step } from 'react-joyride';

export const sidebarTourSteps: Step[] = [
  {
    target: '[data-tour="sidebar-nav"]',
    title: 'Sidebar Navigation',
    content: 'This is your main navigation sidebar. It stays visible on every page so you can quickly switch between modules with a single click.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-staffing"]',
    title: 'Staffing',
    content: 'Access staffing summaries, planned resources, variance analysis, forecasts, and volume/NP settings — all in one place.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-positions"]',
    title: 'Positions',
    content: 'Manage employees, open requisitions, contractors, and contractor requisitions across your facilities.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-analytics"]',
    title: 'Analytics',
    content: 'View volume trend charts broken down by region, market, and facility to spot patterns and anomalies.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-reports"]',
    title: 'Reports',
    content: 'Browse and export pre-built report cards for leadership reviews and operational insights.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-support"]',
    title: 'Support',
    content: 'Find FAQs, user guides, and troubleshooting resources. You can also launch guided tours for any module from here.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-admin"]',
    title: 'Admin',
    content: 'Manage users, roles, permissions, audit logs, and application settings. This module is only visible if you have admin access.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-feedback"]',
    title: 'Feedback',
    content: 'This bottom-pinned module lets you submit and track feedback, bug reports, and feature requests.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-nav"]',
    title: 'Active Indicator',
    content: 'The highlighted background follows the currently active module with a smooth spring animation, so you always know where you are.',
    placement: 'right',
    disableBeacon: true,
  },
];
