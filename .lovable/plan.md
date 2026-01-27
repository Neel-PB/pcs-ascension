

# Improved Roles & Permissions UI

## Overview

Redesign the Roles and Permissions management interface to provide a unified, visual experience that makes it easy to understand and manage access control. The new design will combine roles and permissions into a single, cohesive view with a permission matrix pattern.

---

## Current Pain Points

| Issue | Impact |
|-------|--------|
| Roles and Permissions are separate tabs | Context switching when understanding what a role can do |
| Permission grid is cramped (5 categories in 2 columns) | Difficult to scan and compare |
| User Form shows only 2 hardcoded roles | Doesn't leverage the dynamic roles system |
| No way to see role-permission relationships at a glance | Admins can't quickly compare roles |
| No search/filter in roles management | Hard to find specific roles with many entries |

---

## Proposed Design: Unified Permission Matrix

### Layout Structure

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  Access Control                                           [+ Add Role]       │
│  Manage roles and their permissions                       [+ Add Permission] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Search roles/permissions...]                    View: [Matrix ▼]           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                 │ Admin │ Labor │ Leader │ CNO │ Director │ Manager    │ │
│  ├─────────────────┼───────┼───────┼────────┼─────┼──────────┼────────────┤ │
│  │ MODULES                                                                 │ │
│  ├─────────────────┼───────┼───────┼────────┼─────┼──────────┼────────────┤ │
│  │ Admin Access    │  ✓    │  ✓    │        │     │          │            │ │
│  │ Feedback Access │  ✓    │  ✓    │        │     │          │            │ │
│  │ Staffing        │  ✓    │  ✓    │   ✓    │  ✓  │    ✓     │     ✓      │ │
│  │ Positions       │  ✓    │  ✓    │   ✓    │  ✓  │    ✓     │     ✓      │ │
│  │ ...             │       │       │        │     │          │            │ │
│  ├─────────────────┼───────┼───────┼────────┼─────┼──────────┼────────────┤ │
│  │ APPROVALS                                                               │ │
│  ├─────────────────┼───────┼───────┼────────┼─────┼──────────┼────────────┤ │
│  │ Approve Open    │  ✓    │  ✓    │   ✓    │  ✓  │    ✓     │            │ │
│  │ Approve Close   │  ✓    │  ✓    │   ✓    │  ✓  │    ✓     │            │ │
│  │ Volume Override │  ✓    │  ✓    │        │     │          │            │ │
│  │ ...             │       │       │        │     │          │            │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Legend: ✓ Enabled  ● Overridden from default  🔒 System role/permission    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Key Features

1. **Full Permission Matrix View**
   - Horizontal scrolling for many roles
   - Sticky first column (permission names)
   - Sticky header row (role names)
   - Category groupings with collapsible sections

2. **Inline Editing**
   - Click any cell to toggle permission
   - Visual indicator for overridden values (amber dot)
   - Hover to see permission description
   - Click role header to edit role details

3. **Quick Actions**
   - "Add Role" button opens a slide-out sheet
   - "Add Permission" button opens a dialog
   - Column header dropdown for role actions (Edit, Delete, Clone, Reset)
   - Row hover shows permission actions (Edit, Delete)

4. **View Modes**
   - **Matrix View** (default): Full grid of all roles × permissions
   - **Role Detail View**: Current left-panel + right-panel design (for deep editing)
   - **List View**: Simple permission list with role badges

---

## Component Architecture

### New Components

| Component | Description |
|-----------|-------------|
| `AccessControlPage.tsx` | Combined page replacing separate Roles/Permissions tabs |
| `PermissionMatrix.tsx` | Main matrix grid component with sticky headers |
| `PermissionMatrixCell.tsx` | Individual toggle cell with override indicator |
| `PermissionMatrixRow.tsx` | Permission row with category grouping |
| `PermissionMatrixHeader.tsx` | Role column header with actions dropdown |
| `RoleQuickEditSheet.tsx` | Slide-out for editing role details |
| `BulkPermissionActions.tsx` | Toolbar for bulk operations |

### Enhanced Components

| Component | Enhancement |
|-----------|-------------|
| `UserFormSheet.tsx` | Use dynamic roles instead of hardcoded options |
| `RoleFormDialog.tsx` | Add "Clone from" dropdown to copy another role's permissions |
| `PermissionFormDialog.tsx` | Add "Assign to roles" multi-select |

---

## Detailed UI Specifications

### Permission Matrix Grid

**Headers:**
- Role names displayed horizontally with permission count badge
- System roles marked with lock icon
- Hover shows role description
- Click opens quick-edit sheet
- Dropdown menu for Edit, Clone, Reset, Delete

**Rows:**
- Grouped by category (collapsible)
- Permission label with hover tooltip for description
- System permissions marked with lock
- Row actions appear on hover (edit, delete)

**Cells:**
- Checkbox for toggle
- Amber dot overlay when overridden from default
- Disabled state for system-protected combinations
- Click to toggle, with optimistic update

**Category Headers:**
- Full-width row spanning all columns
- Collapse/expand toggle
- Category badge with count (e.g., "Modules 4/7")

### Keyboard Navigation

- Arrow keys to move between cells
- Space/Enter to toggle
- Tab to move to next row
- Escape to deselect

### Responsive Behavior

- On smaller screens, switch to "Role Detail View" (current design)
- Matrix view requires minimum 1024px width
- Horizontal scroll for many roles on medium screens

---

## User Form Enhancement

Update `UserFormSheet.tsx` to dynamically load roles:

```text
┌──────────────────────────────────────┐
│ Role                                 │
├──────────────────────────────────────┤
│ [Select role...            ▼]        │
│ ┌──────────────────────────────────┐ │
│ │ ● Admin         (System) 🔒     │ │
│ │ ● Labor Team    (System)        │ │
│ │   Leadership                    │ │
│ │   CNO                           │ │
│ │   Director                      │ │
│ │   Manager                       │ │
│ │   Custom Role                   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Selected: Admin                      │
│ 21 permissions enabled               │
└──────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Combine Roles & Permissions Tab
1. Create new `AccessControlPage.tsx` component
2. Add view mode toggle (Matrix / Detail / List)
3. Update `AdminPage.tsx` to use single "Access Control" tab instead of Roles + Permissions

### Phase 2: Build Permission Matrix
1. Create `PermissionMatrix.tsx` with virtualized scrolling
2. Implement sticky headers (role names) and sticky column (permission names)
3. Add collapsible category groupings
4. Implement cell toggle with optimistic updates
5. Add override indicators and tooltips

### Phase 3: Enhance Quick Actions
1. Add role column header dropdowns (Edit, Clone, Reset, Delete)
2. Add permission row actions on hover
3. Implement "Clone Role" functionality
4. Add bulk permission operations toolbar

### Phase 4: Update User Management
1. Modify `UserFormSheet.tsx` to fetch dynamic roles
2. Replace hardcoded RadioGroup with dynamic Select
3. Show permission count for each role option
4. Add multi-role support (if needed in future)

### Phase 5: Polish & Accessibility
1. Add keyboard navigation
2. Implement responsive breakpoints
3. Add loading states and skeletons
4. Test with screen readers

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `src/pages/admin/AccessControlPage.tsx` | Combined roles & permissions management |
| `src/components/admin/PermissionMatrix.tsx` | Main matrix grid component |
| `src/components/admin/PermissionMatrixCell.tsx` | Individual toggle cell |
| `src/components/admin/RoleColumnHeader.tsx` | Role column header with actions |
| `src/components/admin/PermissionCategoryRow.tsx` | Collapsible category header |
| `src/components/admin/RoleQuickEditSheet.tsx` | Slide-out for role editing |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/admin/AdminPage.tsx` | Replace Roles + Permissions tabs with single Access Control tab |
| `src/components/admin/UserFormSheet.tsx` | Load dynamic roles, replace hardcoded options |
| `src/components/admin/RoleFormDialog.tsx` | Add "Clone from" functionality |
| `src/hooks/useDynamicRoles.ts` | Add `cloneRole` mutation |

### Files to Remove (Optional)

| File | Reason |
|------|--------|
| `src/pages/admin/RolesManagement.tsx` | Replaced by AccessControlPage |
| `src/pages/admin/PermissionsManagement.tsx` | Replaced by AccessControlPage |

---

## Visual Design Notes

1. **Matrix cells**: Use subtle grid lines with `border-border/30`
2. **Override indicator**: Small amber dot in top-right corner of cell
3. **System badge**: Muted outline badge with lock icon
4. **Category headers**: Slightly darker background `bg-muted/50`
5. **Hover state**: Highlight entire row and column on cell hover
6. **Focus state**: Blue ring around focused cell for keyboard nav

---

## Technical Considerations

### Performance

- Use virtualization for large permission/role sets
- Implement optimistic updates for cell toggles
- Batch permission changes for bulk operations
- Memoize cell components to prevent re-renders

### Data Structure

Permission categories are already defined in `rbacConfig.ts`. The matrix will:
1. Fetch all permissions from database (dynamic)
2. Fetch all roles from database (dynamic)  
3. Fetch all role_permissions mappings
4. Compute effective permissions (defaults + overrides)

### Backwards Compatibility

- Keep existing hooks (`useRolePermissions`, `useDynamicRoles`, `usePermissions`)
- The matrix is a UI-only change; backend logic remains the same
- Existing `RolesManagement.tsx` can be kept as "Detail View" mode

