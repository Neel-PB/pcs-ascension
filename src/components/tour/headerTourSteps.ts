import { createElement, type ReactNode } from 'react';
import type { Step } from 'react-joyride';
import { HeaderDemoPreview } from './HeaderDemoPreview';

const headerDemoContent = (text: string, variant: 'notification-panel' | 'theme-cycle'): ReactNode =>
  createElement('div', null,
    createElement('p', null, text),
    createElement(HeaderDemoPreview, { variant }),
  );

export const headerTourSteps: Step[] = [
  {
    target: '[data-tour="org-switcher"]',
    title: 'Organization Logo',
    content: 'Click the organization logo to navigate back to the Staffing Summary — the home page of the application.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar-nav"]',
    title: 'Sidebar Navigation',
    content: 'The sidebar provides quick access to all modules: Staffing, Positions, Analytics, Reports, Admin, Feedback, and Support. Click any icon to navigate. The active module is highlighted with a primary-colored background.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="header-search"]',
    title: 'Global Search',
    content: 'Click the search bar or press Ctrl+K to open the command palette. Search across all pages and navigation items.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="header-notifications"]',
    title: 'Notifications',
    content: headerDemoContent(
      'Click the bell to open the notification panel. A red badge appears when you have unread items.',
      'notification-panel',
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="header-theme"]',
    title: 'Theme Toggle',
    content: headerDemoContent(
      'Click to cycle between Light, Dark, and System themes. The icon updates to reflect the current mode.',
      'theme-cycle',
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="header-user-menu"]',
    title: 'User Menu',
    content: 'Click your avatar to access your Profile, take a guided Tour of the current page, view all User Guides, or Log Out.',
    placement: 'bottom',
    disableBeacon: true,
  },
];
