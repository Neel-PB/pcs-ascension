
# Roles Management UI Redesign

## Overview

Redesign the current accordion-based roles management UI to a split-panel table layout with:
- **Left panel**: Clickable list of roles
- **Right panel**: Permission list with checkboxes/switches to add/remove permissions for the selected role

---

## New UI Layout

```text
+--------------------------------------------------+
| Role Permissions                                 |
| Configure permissions for each role...           |
+--------------------------------------------------+
|                                                  |
| +----------------+  +---------------------------+|
| |  ROLES         |  |  PERMISSIONS              ||
| +----------------+  +---------------------------+|
| |                |  |                           ||
| | > Admin        |  | Module Access             ||
| |   Labor Mgmt   |  | +-----------------------+ ||
| |   Leadership   |  | | [x] Admin Module      | ||
| |   CNO          |  | | [x] Feedback Module   | ||
| |   Director     |  | | [x] Staffing          | ||
| |   Manager      |  | | [x] Positions         | ||
| |                |  | | [x] Analytics         | ||
| |                |  | | [x] Reports           | ||
| |                |  | | [x] Support           | ||
| |                |  | +-----------------------+ ||
| |                |  |                           ||
| |                |  | Settings Access           ||
| |                |  | +-----------------------+ ||
| |                |  | | [x] Volume Override   | ||
| |                |  | | [x] NP Override       | ||
| |                |  | +-----------------------+ ||
| |                |  |                           ||
| |                |  | Filter Access             ||
| |                |  | +-----------------------+ ||
| |                |  | | [x] Region Filter     | ||
| |                |  | | [x] Market Filter     | ||
| |                |  | | [x] Facility Filter   | ||
| |                |  | | [x] Department Filter | ||
| |                |  | +-----------------------+ ||
| |                |  |                           ||
| |                |  | Sub-filter Access         ||
| |                |  | +-----------------------+ ||
| |                |  | | [x] Submarket Filter  | ||
| |                |  | | [x] Level 2 Filter    | ||
| |                |  | | [x] PSTAT Filter      | ||
| +----------------+  +---------------------------+|
+--------------------------------------------------+
```

---

## Component Structure

### Left Panel - Role List
- Vertical list of role cards
- Each card shows:
  - Role name (bold)
  - Role description (muted, smaller)
  - Badge showing permission count
  - Override indicator if any overrides exist
- Selected role highlighted with primary color border/background
- Click to select and show permissions on right

### Right Panel - Permission Editor
- Header with selected role name + "Reset All" button (if overrides exist)
- Grouped permission sections:
  - Module Access
  - Settings Access
  - Filter Access
  - Sub-filter Access
- Each permission row shows:
  - Checkbox (checked = enabled)
  - Permission label
  - "Override" badge if different from default
  - Hover: Reset button to revert to default

---

## Implementation Details

### File to Modify
- `src/pages/admin/RolesManagement.tsx`

### Component Breakdown

1. **RolesManagement** (main container)
   - Uses flex layout with two columns
   - Manages `selectedRole` state
   - Renders RoleList and PermissionEditor

2. **RoleList** (left panel)
   - Maps through `MANAGEABLE_ROLES`
   - Each role as a clickable card
   - Shows role metadata, permission count, override count

3. **PermissionEditor** (right panel)
   - Receives selected role as prop
   - Groups permissions by category
   - Each permission as a checkbox row
   - Shows override indicators
   - Reset buttons on hover

4. **PermissionRow** (individual permission)
   - Checkbox for enable/disable
   - Label + description
   - Override badge if applicable
   - Reset button on hover

### Visual Enhancements
- Smooth transitions when selecting roles
- Loading states while permissions update
- Visual feedback (checkmark animations)
- Alternating row backgrounds for readability

---

## Technical Approach

### State Management
```text
- selectedRole: AppRole (defaults to first manageable role)
- Uses existing useRolePermissions hook for all data/mutations
```

### Event Handlers
- `onRoleSelect(role)`: Updates selectedRole state
- `onPermissionToggle(permission, value)`: Calls setPermission mutation
- `onResetPermission(permission)`: Calls setPermission with null
- `onResetAll()`: Calls resetToDefaults mutation

### Styling
- Left panel: ~250px fixed width, border-r
- Right panel: flex-1, scrollable
- Use existing Checkbox component from ui/checkbox
- Cards with rounded borders and hover states
- Consistent with app design system

---

## Summary

This redesign transforms the accordion layout into a more intuitive master-detail pattern where:
1. Users quickly scan all roles on the left
2. Select a role to see/edit its permissions on the right
3. Checkboxes provide clear visual feedback
4. Override indicators show what differs from defaults
5. Reset buttons allow quick reversion to defaults
