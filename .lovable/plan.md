

# Add Access Scope to New User Invitation Flow

## Goal
Enable administrators to define Access Scope restrictions when inviting a new user, not just when editing existing users.

---

## Current Behavior

- Access Scope Manager is only visible in **Edit Mode** (`isEditMode && user`)
- The component requires a `userId` to fetch/save data to `user_organization_access` table
- New users don't have an ID until after the invitation is sent

---

## Solution Overview

Refactor the Access Scope Manager to support two modes:
1. **Edit Mode** (existing): Fetch existing scope from DB, save on form submit
2. **Create Mode** (new): Collect selections in local state, return them to parent form

The parent form will:
- Pass selections to the edge function when creating a user
- Edge function saves access scope after user creation

---

## Technical Changes

### 1. Update `AccessScopeManager` Component

**File:** `src/components/admin/AccessScopeManager.tsx`

Add a callback prop to expose selected access scope data to parent:

```tsx
interface AccessScopeManagerProps {
  userId?: string;  // Optional now
  isEditMode: boolean;
  onAccessChange?: (access: SelectedAccess) => void;  // New callback
}
```

**Changes:**
- Make `userId` optional
- Add `onAccessChange` callback prop
- Call `onAccessChange(selectedAccess)` whenever selections change
- Skip fetching from DB when `!userId` (create mode)
- In edit mode, continue using the `window.__accessScopeSave` pattern

### 2. Update `UserFormSheet` Component

**File:** `src/components/admin/UserFormSheet.tsx`

**Changes:**
- Add local state to hold pending access scope for new users
- Show Access Scope section for both create and edit modes
- Pass access scope data to `onSubmit` when creating new user
- Add `onAccessChange` handler to update local state

```tsx
const [pendingAccessScope, setPendingAccessScope] = useState<{
  regions: string[];
  markets: string[];
  facilities: string[];
  departments: string[];
} | null>(null);

const handleAccessChange = (access: SelectedAccess) => {
  setPendingAccessScope({
    regions: Array.from(access.regions),
    markets: Array.from(access.markets),
    facilities: Array.from(access.facilities),
    departments: Array.from(access.departments),
  });
};
```

In `handleSubmit` for create mode:
```tsx
onSubmit({
  email: data.email,
  firstName: data.firstName,
  lastName: data.lastName,
  bio: data.bio,
  roles: data.roles,
  accessScope: pendingAccessScope,  // Include access scope
});
```

### 3. Update `useUsers` Hook

**File:** `src/hooks/useUsers.ts`

**Changes:**
- Add `accessScope` to the `createUser` mutation input type
- Pass access scope data to the edge function

```tsx
const createUser = useMutation({
  mutationFn: async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
    bio?: string;
    accessScope?: {
      regions: string[];
      markets: string[];
      facilities: string[];
      departments: string[];
    };
  }) => {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: userData.roles,
        bio: userData.bio,
        accessScope: userData.accessScope,  // Pass to edge function
      },
      // ...
    });
  },
});
```

### 4. Update `invite-user` Edge Function

**File:** `supabase/functions/invite-user/index.ts`

**Changes:**
- Accept `accessScope` in request body
- After user creation, insert access scope entries

```typescript
const { email, firstName, lastName, roles, bio, accessScope } = await req.json();

// ... existing user creation code ...

// Save access scope if provided
if (accessScope && userData.user) {
  const entries = [];
  
  // Add region entries
  (accessScope.regions || []).forEach((region: string) => {
    entries.push({
      user_id: userData.user.id,
      region,
      market: null,
      facility_id: null,
      facility_name: null,
      department_id: null,
      department_name: null,
    });
  });
  
  // Add market entries
  (accessScope.markets || []).forEach((market: string) => {
    entries.push({
      user_id: userData.user.id,
      region: null,
      market,
      facility_id: null,
      facility_name: null,
      department_id: null,
      department_name: null,
    });
  });
  
  // Add facility entries
  (accessScope.facilities || []).forEach((item: any) => {
    entries.push({
      user_id: userData.user.id,
      region: null,
      market: item.market || null,
      facility_id: item.facility_id,
      facility_name: item.facility_name || null,
      department_id: null,
      department_name: null,
    });
  });
  
  // Add department entries
  (accessScope.departments || []).forEach((item: any) => {
    entries.push({
      user_id: userData.user.id,
      region: null,
      market: item.market || null,
      facility_id: item.facility_id || null,
      facility_name: item.facility_name || null,
      department_id: item.department_id,
      department_name: item.department_name || null,
    });
  });
  
  if (entries.length > 0) {
    await supabaseAdmin.from('user_organization_access').insert(entries);
  }
}
```

---

## Data Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│                      UserFormSheet                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Form Fields: Name, Email, Roles, Bio                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ AccessScopeManager                                        │  │
│  │   - Region: [Region 1]                                    │  │
│  │   - Market: [FLORIDA]                                     │  │
│  │   - Facility: [Sacred Heart]                              │  │
│  │   - Department: [ICU]                                     │  │
│  │                                                           │  │
│  │   onAccessChange → pendingAccessScope state               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Send Invite] → handleSubmit()                                 │
│    ↓                                                            │
│  { email, name, roles, accessScope } → createUser mutation      │
│    ↓                                                            │
│  invite-user Edge Function                                      │
│    ↓                                                            │
│  1. Create user via auth.admin.inviteUserByEmail()              │
│  2. Update profile                                              │
│  3. Insert user_roles                                           │
│  4. Insert user_organization_access (NEW)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/AccessScopeManager.tsx` | Make `userId` optional, add `onAccessChange` callback |
| `src/components/admin/UserFormSheet.tsx` | Show Access Scope in create mode, track pending selections, pass to submit |
| `src/hooks/useUsers.ts` | Add `accessScope` to createUser mutation type |
| `supabase/functions/invite-user/index.ts` | Accept and save access scope entries after user creation |

---

## Expected Outcome

- When clicking "Add User", the Access Scope section appears in the form (collapsible)
- Administrators can pre-configure Region/Market/Facility/Department restrictions
- When the invitation is sent, access scope is saved along with the new user
- The user will have their access restrictions in place before they even log in

