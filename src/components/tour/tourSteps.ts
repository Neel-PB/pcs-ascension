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
    target: '[data-tour="kpi-sections"]',
    title: 'KPI Cards',
    content: 'All staffing metrics are organized into three draggable sections: FTE, Volume, and Productive Resources. Each card shows a key metric. Drag section headers to reorder them.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-chart-action"]',
    title: 'Trend Chart',
    content: 'Click the chart icon on any KPI card to view a detailed trend line, historical data, and breakdowns by skill type.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-info-action"]',
    title: 'Definition and Calculation',
    content: 'Click the eye icon to see what this KPI measures and the exact formula used to calculate it.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="volume-section"]',
    title: 'Target and Override Volume Colors',
    content: 'Volume cards use color to show status: a green border means the calculated Target Volume is in use; an orange border means a manual Override Volume is active and superseding the target.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-split-badge"]',
    title: 'Employment Type Split',
    content: 'This badge shows the FT/PT/PRN staffing mix. The target is 70% Full-Time, 20% Part-Time, 10% PRN. Click to compare current vs target variance.',
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

export const volumeSettingsSteps: Step[] = [
  {
    target: '[data-tour="volume-settings-stats"]',
    title: 'Status Summary',
    content: 'This banner shows how many departments require an override, how many are using the calculated target volume, and how many overrides are expiring soon.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="volume-settings-table"]',
    title: 'Override Table',
    content: 'Each row represents a department. Enter an override volume to replace the calculated target, then set an expiration date. Both are saved together. Use the Revert button to clear an override.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="volume-settings-target"]',
    title: 'Target Volume Details',
    content: 'Click the target volume value to see historical analysis: the 3-month low average, N-month average, spread percentage, and a chart highlighting the lowest months.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const npSettingsSteps: Step[] = [
  {
    target: '[data-tour="np-settings-stats"]',
    title: 'Status Summary',
    content: 'This banner shows how many NP overrides are active, expiring soon, or not yet set.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="np-settings-table"]',
    title: 'Override Table',
    content: 'Each row represents a department. The target NP% is fixed at 10% for all departments. Enter an override NP% and set an expiration date to apply a custom value.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="np-settings-override"]',
    title: 'Two-Step Save',
    content: 'Overrides use a two-step save: enter a value (shown as Pending), then select an expiration date to commit both to the database.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const checklistTourSteps: Step[] = [
  {
    target: '[data-tour="checklist-header"]',
    title: 'Positions Checklist',
    content: 'This is the Positions Checklist. It provides a real-time summary of FTE gaps for your selected facility. Press Ctrl+Shift+W or click the edge trigger to toggle.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="checklist-tabs"]',
    title: 'KPI / Shortage / Surplus Tabs',
    content: 'Switch between KPIs, Shortage, and Surplus tabs. KPIs show summary cards; Shortage and Surplus tabs show detailed checklist tables.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="checklist-kpis"]',
    title: 'KPI Cards',
    content: 'These cards summarize key workforce metrics like total shortages, surpluses, and open requisitions for your current filter scope.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="checklist-table"]',
    title: 'Checklist Table',
    content: 'The checklist groups positions by Location, then by Department/Skill/Shift. Click any group to expand and see individual position details.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const aiHubTourSteps: Step[] = [
  {
    target: '[data-tour="ai-hub-welcome"]',
    title: 'PCS AI Assistant',
    content: 'This is PCS AI, your staffing assistant. Ask questions about headcount, forecasts, variance analysis, or request recommendations.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="ai-hub-input"]',
    title: 'Chat Input',
    content: 'Type your question here. You can also attach files (images, PDFs, spreadsheets) for analysis. Use the microphone for voice input.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="ai-hub-panel"]',
    title: 'Keyboard Shortcut',
    content: 'Press Ctrl+Shift+K to toggle the AI Hub from anywhere in the app.',
    placement: 'left',
    disableBeacon: true,
  },
  {
    target: '[data-tour="ai-hub-input"]',
    title: 'Clear & Minimize',
    content: 'Use the menu to clear the conversation history or minimize the panel back to the edge trigger.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const feedbackTourSteps: Step[] = [
  {
    target: '[data-tour="feedback-screenshot"]',
    title: 'Screenshot Capture',
    content: 'Optionally capture a screenshot before submitting. Click the trigger button to draw a selection area on your screen.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="feedback-form"]',
    title: 'Feedback Form',
    content: 'Fill in the title, select a type (Bug, Feature, Improvement, Question), set priority, and provide a detailed description.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="feedback-footer"]',
    title: 'Submit & Shortcut',
    content: 'Submit your feedback with the button below. You can also press ⌘+Shift+F to toggle this panel from anywhere.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const adminUsersTourSteps: Step[] = [
  {
    target: '[data-tour="admin-tabs"]',
    title: 'Tab Navigation',
    content: 'Switch between Users, Feed, RBAC, Audit Log, and Settings tabs to manage different aspects of the admin panel.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-users-add"]',
    title: 'Add User',
    content: 'Click Add User to invite a new user. Assign one or more roles, set their name and email, and they will receive a setup link.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-users-search"]',
    title: 'Search',
    content: 'Search users by name or email to quickly find and manage specific accounts.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-users-table"]',
    title: 'User Table',
    content: 'Click any row to edit the user\'s profile, roles, and permissions. Columns can be resized, reordered, and sorted.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-users-actions"]',
    title: 'Actions',
    content: 'Use the edit (pencil) icon to open a user\'s profile, or the delete (trash) icon to permanently remove their account. Deletion requires confirmation.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-users-scope"]',
    title: 'Access Scope',
    content: 'Expand the Access Scope Restrictions section to limit which Regions, Markets, Facilities, and Departments a user can access. Selections cascade: choosing a Region filters available Markets.',
    placement: 'bottom',
    disableBeacon: true,
  },
];

export const adminFeedTourSteps: Step[] = [
  {
    target: '[data-tour="admin-tabs"]',
    title: 'Tab Navigation',
    content: 'Switch between Users, Feed, RBAC, Audit Log, and Settings tabs to manage different aspects of the admin panel.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-feed-composer"]',
    title: 'Feed Composer',
    content: 'Compose announcements and updates for all users. Format text with bold, italic, and lists. Attach images, PDFs, or spreadsheets.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-feed-history"]',
    title: 'Feed History',
    content: 'View all published posts in reverse chronological order. Admins can delete posts from the feed.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const adminRbacTourSteps: Step[] = [
  {
    target: '[data-tour="admin-tabs"]',
    title: 'Tab Navigation',
    content: 'Switch between Users, Feed, RBAC, Audit Log, and Settings tabs to manage different aspects of the admin panel.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-rbac-views"]',
    title: 'View Mode Toggle',
    content: 'Switch between Matrix (grid of all role-permission combinations), Role Detail (expandable cards per role), and Permission List (grouped by category) views.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-rbac-actions"]',
    title: 'Add Role / Permission',
    content: 'Create new roles or permissions. Roles are assigned to users; permissions are toggled per role to control access.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-rbac-content"]',
    title: 'RBAC Content',
    content: 'Toggle permissions on or off for each role. Changes are saved immediately and logged to the Audit Log.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const adminAuditTourSteps: Step[] = [
  {
    target: '[data-tour="admin-tabs"]',
    title: 'Tab Navigation',
    content: 'Switch between Users, Feed, RBAC, Audit Log, and Settings tabs to manage different aspects of the admin panel.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-audit-filters"]',
    title: 'Audit Filters',
    content: 'Filter audit entries by action type (Created, Updated, Deleted, Granted, Revoked) and target type (Roles, Permissions, Role Permissions).',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-audit-table"]',
    title: 'Audit Table',
    content: 'Each row shows the timestamp, action, target, and who made the change. Click rows with a chevron to expand and see the previous and new values.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const adminSettingsTourSteps: Step[] = [
  {
    target: '[data-tour="admin-tabs"]',
    title: 'Tab Navigation',
    content: 'Switch between Users, Feed, RBAC, Audit Log, and Settings tabs to manage different aspects of the admin panel.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-settings-tabs"]',
    title: 'Settings Sub-Tabs',
    content: 'Switch between UI Settings (feedback visibility controls) and Volume Config (target volume calculation rules).',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-settings-content"]',
    title: 'Settings Content',
    content: 'Toggle settings and adjust configuration values. Changes require clicking Save to take effect.',
    placement: 'top',
    disableBeacon: true,
  },
];

export const feedbackPageTourSteps: Step[] = [
  {
    target: '[data-tour="feedback-search"]',
    title: 'Search',
    content: 'Search feedback by title or description to quickly find specific submissions.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="feedback-filters"]',
    title: 'Filters',
    content: 'Filter feedback by Type, PCS Status, and PB Status to narrow down the list. Combine multiple filters for precise results.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="feedback-table"]',
    title: 'Feedback Table',
    content: 'Each row shows the title, type, description, screenshot, author, and timestamps. Click the type or priority badges to change them inline.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="feedback-pcs-status"]',
    title: 'Status Management',
    content: 'Manage the dual-status workflow: PCS Status (Pending, Approved, Disregard, Backlog) controls triage. Setting PCS to Disregard or Backlog automatically locks PB Status to Closed.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="feedback-comments"]',
    title: 'Comments & Actions',
    content: 'Click the comments icon to view or add discussion on any feedback item. Use the trash icon to delete a submission (requires confirmation).',
    placement: 'bottom',
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
