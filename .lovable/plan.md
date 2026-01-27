

# Remove Permission Count from Role Selection

## Overview

Remove the permission count badges and text from the role selection dropdown in the User Form, simplifying the UI.

---

## Current State

The role selector currently shows:
1. A badge with permission count next to each role name in the dropdown
2. A description or fallback text showing "{X} permissions enabled" below the selector

---

## Changes Required

### File: `src/components/admin/UserFormSheet.tsx`

**Remove these elements:**

1. **Permission count badge in dropdown items** (lines 211-213)
   - Remove the `<Badge>` component showing `permsCount`

2. **Permission count variables** (lines 184-186, 205)
   - Remove `permissionCount` calculation for selected role
   - Remove `permsCount` calculation inside the map

3. **Fallback text with permission count** (line 222)
   - Change `{selectedRole.description || \`${permissionCount} permissions enabled\`}` to just show `{selectedRole.description}` 
   - Only show the description paragraph if `selectedRole.description` exists

4. **Remove unused imports**
   - Remove `Badge` import from `@/components/ui/badge`
   - Remove `useRolePermissions` hook import (no longer needed)
   - Remove `AppRole` type import (no longer needed)

---

## Result

The role selector will show:
- Lock icon for system roles
- Role label
- Role description below (only if description exists)

No permission counts will be displayed.

