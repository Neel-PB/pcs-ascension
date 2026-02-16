

## Add Tour Guides for the Admin Module

### Overview
Create a tab-aware tour system for the Admin module (Users, Feed, RBAC, Audit Log, Settings), following the same `StaffingTour` / `PositionsTour` pattern. Each tab gets its own set of steps highlighting the key UI elements within that view.

### Tour Steps by Tab

#### Users Tour (4 steps)
1. **Tab Navigation** -- `[data-tour="admin-tabs"]` -- "Switch between Users, Feed, RBAC, Audit Log, and Settings tabs to manage different aspects of the admin panel."
2. **Add User** -- `[data-tour="admin-users-add"]` -- "Click Add User to invite a new user. Assign one or more roles, set their name and email, and they will receive a setup link."
3. **Search** -- `[data-tour="admin-users-search"]` -- "Search users by name or email to quickly find and manage specific accounts."
4. **User Table** -- `[data-tour="admin-users-table"]` -- "Click any row to edit the user's profile, roles, and permissions. Columns can be resized, reordered, and sorted."

#### Feed Tour (3 steps)
1. **Tab Navigation** -- `[data-tour="admin-tabs"]`
2. **Feed Composer** -- `[data-tour="admin-feed-composer"]` -- "Compose announcements and updates for all users. Format text with bold, italic, and lists. Attach images, PDFs, or spreadsheets."
3. **Feed History** -- `[data-tour="admin-feed-history"]` -- "View all published posts in reverse chronological order. Admins can delete posts from the feed."

#### RBAC Tour (4 steps)
1. **Tab Navigation** -- `[data-tour="admin-tabs"]`
2. **View Mode Toggle** -- `[data-tour="admin-rbac-views"]` -- "Switch between Matrix (grid of all role-permission combinations), Role Detail (expandable cards per role), and Permission List (grouped by category) views."
3. **Add Role / Permission** -- `[data-tour="admin-rbac-actions"]` -- "Create new roles or permissions. Roles are assigned to users; permissions are toggled per role to control access."
4. **RBAC Content** -- `[data-tour="admin-rbac-content"]` -- "Toggle permissions on or off for each role. Changes are saved immediately and logged to the Audit Log."

#### Audit Log Tour (3 steps)
1. **Tab Navigation** -- `[data-tour="admin-tabs"]`
2. **Audit Filters** -- `[data-tour="admin-audit-filters"]` -- "Filter audit entries by action type (Created, Updated, Deleted, Granted, Revoked) and target type (Roles, Permissions, Role Permissions)."
3. **Audit Table** -- `[data-tour="admin-audit-table"]` -- "Each row shows the timestamp, action, target, and who made the change. Click rows with a chevron to expand and see the previous and new values."

#### Settings Tour (3 steps)
1. **Tab Navigation** -- `[data-tour="admin-tabs"]`
2. **Settings Sub-Tabs** -- `[data-tour="admin-settings-tabs"]` -- "Switch between UI Settings (feedback visibility controls) and Volume Config (target volume calculation rules)."
3. **Settings Content** -- `[data-tour="admin-settings-content"]` -- "Toggle settings and adjust configuration values. Changes require clicking Save to take effect."

### Technical Changes

#### `src/components/tour/tourSteps.ts`
- Add five new exported arrays:
  - `adminUsersTourSteps: Step[]` (4 steps)
  - `adminFeedTourSteps: Step[]` (3 steps)
  - `adminRbacTourSteps: Step[]` (4 steps)
  - `adminAuditTourSteps: Step[]` (3 steps)
  - `adminSettingsTourSteps: Step[]` (3 steps)

#### New: `src/components/tour/AdminTour.tsx`
- Follows the `StaffingTour` / `PositionsTour` pattern
- Accepts `activeTab` prop (`'users'` | `'feed'` | `'access-control'` | `'audit-log'` | `'settings'`)
- Maps each tab to its `tourKey` (`admin-users`, `admin-feed`, `admin-access-control`, `admin-audit-log`, `admin-settings`) and step array
- Uses the same Joyride config, `TourTooltip`, and `useTour` hook

#### `src/pages/admin/AdminPage.tsx`
- Import and render `<AdminTour activeTab={activeTab} />`
- Add `data-tour="admin-tabs"` on the `ToggleButtonGroup` wrapper div

#### `src/pages/admin/UsersManagement.tsx`
- Add `data-tour="admin-users-add"` on the Add User button
- Add `data-tour="admin-users-search"` on the `SearchField`
- Add `data-tour="admin-users-table"` wrapper on the table container

#### `src/pages/admin/AccessControlPage.tsx`
- Add `data-tour="admin-rbac-views"` on the `ToggleGroup` wrapper
- Add `data-tour="admin-rbac-actions"` on the action buttons container
- Add `data-tour="admin-rbac-content"` on the `AnimatePresence` content wrapper

#### `src/pages/admin/RBACAuditLog.tsx`
- Add `data-tour="admin-audit-filters"` on the filters row
- Add `data-tour="admin-audit-table"` on the table wrapper

#### Admin Settings area in `AdminPage.tsx`
- Add `data-tour="admin-settings-tabs"` on the sub-tab `TabsList`
- Add `data-tour="admin-settings-content"` on a wrapper around `TabsContent` elements

### Tour Trigger Behavior
- Each tab's tour auto-starts on first visit (tracked via localStorage keys like `helix-tour-admin-users-completed`)
- Re-triggerable via "Take a Tour" dropdown using the `admin` key -- the `useTour` hook's base-path matching will trigger whichever admin tab is currently active
- Uses `zIndex: 10000` (same as StaffingTour)

