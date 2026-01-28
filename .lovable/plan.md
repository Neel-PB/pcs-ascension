
# Fix Role Display Bug in User Profile Modal

## Problem Summary

The User Profile Modal (visible when clicking on your avatar) has a hardcoded display bug that shows incorrect role labels. For any role that isn't "admin", it displays "Labor Team" instead of the actual role name (Director, Manager, CNO, etc.).

This is why the user saw "Labor Team" badge when logged in as Demo Director.

## Code Location

**File**: `src/components/profile/UserProfileModal.tsx` (lines 107-115)

**Current buggy code**:
```tsx
roles.map((role) => (
  <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
    {role === 'admin' ? 'Admin' : 'Labor Team'}  // BUG: All non-admin roles show as "Labor Team"
  </Badge>
))
```

## Solution

Import the `ROLE_METADATA` mapping from `rbacConfig.ts` and use it to display the correct label for each role.

**Fixed code**:
```tsx
import { ROLE_METADATA, type AppRole } from "@/config/rbacConfig";

// Inside the component:
roles.map((role) => (
  <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
    {ROLE_METADATA[role as AppRole]?.label || role}
  </Badge>
))
```

## Changes Required

| File | Change |
|------|--------|
| `src/components/profile/UserProfileModal.tsx` | Import ROLE_METADATA and update role display logic |

## Verification

After the fix:
- Log in as Demo Director
- Open Profile modal (click avatar)
- Should show "Director" badge (not "Labor Team")

## Additional Notes

- The actual RBAC permissions are working correctly - Director users don't see Admin or Feedback modules in the sidebar
- This was only a UI display bug in the profile modal, not a security issue
- The earlier fix that removed the duplicate admin role from Demo Director resolved the main access control issue
