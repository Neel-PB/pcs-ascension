import type { Step } from 'react-joyride';

export const headerTourSteps: Step[] = [
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
    content: 'Click the bell to open the notification panel. A red badge appears when you have unread items.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="header-theme"]',
    title: 'Theme Toggle',
    content: 'Click to cycle between Light, Dark, and System themes. The icon updates to reflect the current mode.',
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
