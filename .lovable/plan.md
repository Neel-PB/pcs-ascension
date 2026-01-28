

# Enable Multi-Select Roles for New User Invitations

## Problem Summary

The user form already has multi-select checkboxes for roles, but when **inviting a new user**, only the first selected role is sent to the backend. The **edit user** flow already supports multiple roles correctly.

## Current Behavior

| Action | Roles Supported |
|--------|-----------------|
| Edit User | Multiple roles (works correctly) |
| Invite New User | Only first role is used |

## Changes Required

### 1. Update UserFormSheet.tsx

Change the new user submission to send all selected roles instead of just the first one.

**Current (line 106-113):**
```typescript
onSubmit({
  email: data.email,
  firstName: data.firstName,
  lastName: data.lastName,
  bio: data.bio,
  role: data.roles[0], // Only first role
});
```

**New:**
```typescript
onSubmit({
  email: data.email,
  firstName: data.firstName,
  lastName: data.lastName,
  bio: data.bio,
  roles: data.roles, // All selected roles
});
```

### 2. Update useUsers.ts - createUser Mutation

Change the mutation to accept an array of roles.

**Current (lines 66-71):**
```typescript
mutationFn: async (userData: {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;  // Single role
  bio?: string;
})
```

**New:**
```typescript
mutationFn: async (userData: {
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];  // Array of roles
  bio?: string;
})
```

### 3. Update invite-user Edge Function

Modify the edge function to insert multiple roles.

**Current (lines 71-82):**
```typescript
const { role } = await req.json();
// ... single role insert
const { error: roleError } = await supabaseAdmin
  .from('user_roles')
  .insert({ user_id: userData.user.id, role: role });
```

**New:**
```typescript
const { roles } = await req.json(); // Accept array
// ... multiple role insert
const roleInserts = roles.map(role => ({
  user_id: userData.user.id,
  role: role,
}));
const { error: roleError } = await supabaseAdmin
  .from('user_roles')
  .insert(roleInserts);
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/UserFormSheet.tsx` | Send `roles` array instead of single `role` |
| `src/hooks/useUsers.ts` | Accept `roles: UserRole[]` in createUser mutation |
| `supabase/functions/invite-user/index.ts` | Insert multiple roles when inviting |

## Summary

After this change, both new user invitations and user edits will support assigning multiple roles via the same multi-select checkbox UI.

