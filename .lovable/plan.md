
# Fix Multi-Role Display Bug and Clean Demo Director Data

## Problem Summary

The Demo Director user has **two roles** in the database:
- `director` (assigned first)
- `admin` (assigned later, causing Admin module access)

The UI only displays "Director" because `useUsers.ts` uses `.find()` which returns only the first matching role. This creates a confusing situation where:
- The sidebar shows Admin module (because RBAC correctly aggregates all roles)
- The Users table only shows "Director" (because display logic is broken)

## Root Cause

### Database Issue
```sql
-- Current state: Demo Director has TWO roles
user_roles table:
| role     | created_at          |
|----------|---------------------|
| director | 2026-01-28 12:08:35 |
| admin    | 2026-01-28 12:14:20 |
```

### Code Issue
```typescript
// src/hooks/useUsers.ts line 42
const userRole = userRoles.find(ur => ur.user_id === profile.id);
// ^^^ Only returns FIRST role, not all roles!
```

## Solution

### Part 1: Clean the Data
Remove the incorrect `admin` role from Demo Director user so they only have `director` role.

### Part 2: Fix the Code (Optional - for future multi-role support)
Update `useUsers.ts` to fetch and display ALL roles a user has, not just the first one.

However, if the system design is that users should only have ONE role at a time, then:
- The data cleanup is the fix
- The code should prevent multiple role assignments

## Recommended Changes

### Database Change
Delete the extra `admin` role from Demo Director:

```sql
DELETE FROM user_roles 
WHERE user_id = '4f08a81b-af3e-4e91-98a4-8c742e8b585f' 
AND role = 'admin';
```

### Code Changes (to show all roles in UI)

**File: `src/hooks/useUsers.ts`**

Change from `.find()` to `.filter()` to get all roles:

```typescript
// Before (line 42):
const userRole = userRoles.find(ur => ur.user_id === profile.id);

// After:
const userRolesList = userRoles.filter(ur => ur.user_id === profile.id);
```

Update the `UserWithProfile` interface to support multiple roles:

```typescript
// Change from:
role: UserRole;

// To:
roles: UserRole[];  // Array of roles
```

**File: `src/components/admin/UserManagementTable.tsx`**

Update to display multiple role badges:

```tsx
// Before:
<Badge variant={getRoleBadgeVariant(user.role)}>
  {getRoleDisplayName(user.role)}
</Badge>

// After:
{user.roles.map(role => (
  <Badge key={role} variant={getRoleBadgeVariant(role)}>
    {getRoleDisplayName(role)}
  </Badge>
))}
```

## Recommended Approach

Since your current design appears to be **one role per user** (the form only allows selecting one role), I recommend:

1. **Data fix only** - Remove the duplicate admin role from Demo Director
2. **No code changes** - Keep the current single-role display

If you want proper multi-role support, we would need to update:
- `useUsers.ts` - fetch all roles
- `UserWithProfile` type - change `role` to `roles[]`
- `UserManagementTable` - display multiple badges
- `UserFormSheet` - multi-select for roles
- Update mutation - handle multiple roles on save

## Files to Modify

| Change | Files |
|--------|-------|
| Database cleanup | Run SQL to remove duplicate role |
| (Optional) Multi-role UI | `src/hooks/useUsers.ts`, `src/components/admin/UserManagementTable.tsx`, `src/components/admin/UserFormSheet.tsx` |

## Decision Needed

Which approach do you prefer?
1. **Quick fix**: Just clean up the database (remove duplicate admin role)
2. **Full fix**: Clean database + add multi-role support to UI

