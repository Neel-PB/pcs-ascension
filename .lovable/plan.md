

## RBAC Page: Remove Action Buttons & Fix Checkbox Sizing

### Changes

#### 1. `src/pages/admin/AccessControlPage.tsx` — Remove "+ Permission" and "+ Role" buttons
**Lines 163-184**: Remove the separator div and the action buttons block entirely (the `<div className="h-6 w-px bg-border" />` and the `<div className="flex items-center gap-2" data-tour="admin-rbac-actions">` with both buttons).

Also remove the related state, handlers, and dialog components:
- `isPermissionFormOpen` state and `setIsPermissionFormOpen`
- `isRoleFormOpen` state, `setIsRoleFormOpen`, `selectedRoleForEdit`
- `handleRoleFormSubmit` and `handlePermissionFormSubmit` functions
- `RoleFormDialog` and `PermissionFormDialog` components at the bottom
- Their imports: `RoleFormDialog`, `PermissionFormDialog`, `Plus`
- Remove `createRole`, `updateRole` from `useDynamicRoles` destructure
- Remove `createPermission` from `usePermissions` destructure

#### 2. `src/components/admin/RoleDetailView.tsx` — Fix checkbox size
**Line 165**: The checkbox has `className="h-3.5 w-3.5"` which makes it 14px — too small, causing the check icon to look cramped/odd. Change to `h-4 w-4` (16px) for proper proportions matching the default checkbox size.

Also check `PermissionMatrix.tsx` for similar checkbox sizing issues.

### Files Changed
- `src/pages/admin/AccessControlPage.tsx`
- `src/components/admin/RoleDetailView.tsx`

