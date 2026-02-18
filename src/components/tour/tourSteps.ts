import type { Step } from 'react-joyride';
import { createElement } from 'react';
import { FilterDemoPreview } from './FilterDemoPreview';

const filterContent = (text: string, preview: { variant: 'simple' | 'searchable' | 'labels'; items?: string[] | { name: string; id: string }[]; labels?: string[] }) =>
  createElement('div', { className: 'space-y-3' },
    createElement('p', null, text),
    createElement(FilterDemoPreview, preview as any)
  );

export const staffingSteps: Step[] = [
  {
    target: '[data-tour="filter-bar"]',
    title: 'Filter Bar',
    content: 'Use these cascading filters to narrow staffing data. Selecting a higher-level filter updates the options available in lower-level filters.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="filter-region"]',
    title: 'Region Filter',
    content: filterContent(
      'Select a Region to scope all data to that geographic area. Choosing a region updates the available Markets, Facilities, and Departments below.',
      { variant: 'simple', items: ['All Regions', 'East', 'Gulf Coast', 'West'] }
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="filter-market"]',
    title: 'Market Filter',
    content: filterContent(
      'Select a Market within the chosen Region. This further narrows Facility and Department options.',
      { variant: 'simple', items: ['All Markets', 'Indianapolis', 'Nashville', 'Wichita'] }
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="filter-facility"]',
    title: 'Facility Filter',
    content: filterContent(
      'Search and select a specific Facility. Type a name or ID to find it quickly. Selecting a facility scopes Departments to that location.',
      { variant: 'searchable', items: [
        { name: 'St. Vincent Hospital', id: 'FAC001' },
        { name: 'Sacred Heart Medical', id: 'FAC002' },
        { name: 'Providence Clinic', id: 'FAC003' },
      ]}
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="filter-department"]',
    title: 'Department Filter',
    content: filterContent(
      'Search and select a Department. Also searchable by name or ID. Once selected, all KPIs and tables reflect only that department\'s data.',
      { variant: 'searchable', items: [
        { name: 'ICU', id: 'DEP101' },
        { name: 'Emergency', id: 'DEP202' },
        { name: 'Med-Surg', id: 'DEP303' },
      ]}
    ),
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="filter-clear"]',
    title: 'Clear Filters',
    content: 'Click this button to reset all filters back to their defaults. It is disabled when no filters are active.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="filter-more"]',
    title: 'More Filters',
    content: filterContent(
      'Additional filters for finer-grained analysis without changing the primary hierarchy.',
      { variant: 'labels', labels: ['Submarket', 'Level 2', 'PSTAT'] }
    ),
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
  // Individual KPI steps
  {
    target: '[data-tour="kpi-vacancy-rate"]',
    title: 'Vacancy Rate',
    content: 'Percentage of approved budgeted positions currently unfilled.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-hired-ftes"]',
    title: 'Hired FTEs',
    content: 'Total Full-Time, Part-Time, and PRN employees currently on staff.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-target-ftes"]',
    title: 'Target FTEs',
    content: 'Number of FTEs needed to meet budgeted staffing levels based on volume.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-fte-variance"]',
    title: 'FTE Variance',
    content: 'Gap between Target FTEs and Hired FTEs. Positive means understaffed.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-open-reqs"]',
    title: 'Open Reqs',
    content: 'Count of approved requisitions not yet filled.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-req-variance"]',
    title: 'Req Variance',
    content: 'Remaining gap after accounting for open requisitions against FTE variance.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-12m-monthly"]',
    title: '12M Average',
    content: 'Rolling 12-month average monthly volume of patient encounters or units of service.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-12m-daily"]',
    title: '12M Daily Average',
    content: 'Average daily volume over the past 12 months.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-3m-low"]',
    title: '3M Low',
    content: 'Average daily volume during the 3 lowest-volume months. Used for minimum staffing.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-3m-high"]',
    title: '3M High',
    content: 'Average daily volume during the 3 highest-volume months. Used for peak staffing.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-target-vol"]',
    title: 'Target Volume',
    content: 'Expected daily volume used for staffing calculations. Green border means it is active.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-override-vol"]',
    title: 'Override Volume',
    content: 'Manually set volume that supersedes the target. Orange border means it is active.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-paid-ftes"]',
    title: 'Paid FTEs',
    content: 'Total labor resources the organization pays for, productive and non-productive.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-contract-ftes"]',
    title: 'Contract FTEs',
    content: 'FTEs supplied by external agencies — travel nurses, agency staff, temp contractors.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-overtime-ftes"]',
    title: 'Overtime FTEs',
    content: 'Hours worked above regular commitment, converted to FTE equivalent.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-total-prn"]',
    title: 'Total PRN',
    content: 'PRN staff hours converted to FTE equivalent. Used for flex coverage.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-total-np"]',
    title: 'Total NP%',
    content: 'Percentage of paid hours not spent on direct patient care (PTO, training, admin).',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="kpi-total-fullpart-ftes"]',
    title: 'Employed Productive FTEs',
    content: 'Full-Time and Part-Time productive FTEs after excluding non-productive hours.',
    placement: 'bottom',
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
  {
    target: '[data-tour="kpi-hired-split-badge"]',
    title: 'Hired and Open Reqs Split',
    content: 'This orange badge shows the actual FT/PT/PRN mix across your Hired FTEs and Open Requisitions combined. Click to compare the current split against the 70/20/10 target and see the variance.',
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
    placement: 'auto',
    disableBeacon: true,
  },
  {
    target: '[data-tour="volume-settings-target"]',
    title: 'Target Volume Details',
    content: 'Click the target volume value to see historical analysis: the 3-month low average, N-month average, spread percentage, and a chart highlighting the lowest months.',
    placement: 'auto',
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
    placement: 'auto',
    disableBeacon: true,
  },
  {
    target: '[data-tour="np-settings-override"]',
    title: 'Two-Step Save',
    content: 'Overrides use a two-step save: enter a value (shown as Pending), then select an expiration date to commit both to the database.',
    placement: 'auto',
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
    title: 'Manage Role Permissions',
    content: 'Check or uncheck the boxes to grant or revoke specific permissions for each role. A checked box means the role has that permission; unchecking it removes access. Changes are saved immediately and logged to the Audit Log.',
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
    placement: 'auto',
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
  {
    target: '[data-tour="ui-settings-card"]',
    title: 'Feedback Visibility',
    content: 'Toggle the floating feedback button, screenshot capture, and sidebar navigation link on or off for all users.',
    placement: 'auto',
    disableBeacon: true,
  },
  {
    target: '[data-tour="ui-settings-save"]',
    title: 'Save UI Settings',
    content: 'Click Save to apply your visibility changes. The button activates when you modify a toggle.',
    placement: 'auto',
    disableBeacon: true,
  },
  {
    target: '[data-tour="admin-settings-tabs"]',
    title: 'Switch to Volume Config',
    content: 'Click the Volume Config tab to configure target volume calculation rules. The following steps cover that section.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="volume-config-mode"]',
    title: 'Scope Mode',
    content: 'Choose Universal to set rules for all departments, or Department-Specific to create custom overrides for individual departments.',
    placement: 'auto',
    disableBeacon: true,
  },
  {
    target: '[data-tour="volume-config-matrix"]',
    title: 'Rule Matrix Preview',
    content: 'Expand this card to see how your threshold settings translate into override requirements based on historical data availability.',
    placement: 'auto',
    disableBeacon: true,
  },
  {
    target: '[data-tour="volume-config-fields"]',
    title: 'Configuration Fields',
    content: 'Left: set rule thresholds (min months, spread %). Right: configure fiscal year, volume floor, and backfill settings.',
    placement: 'auto',
    disableBeacon: true,
  },
  {
    target: '[data-tour="volume-config-save"]',
    title: 'Save Changes',
    content: 'Click Save to commit your configuration. For Department-Specific mode, select a Market, Facility, and Department before saving.',
    placement: 'auto',
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
