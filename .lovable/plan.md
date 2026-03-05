

## Fix: Comments fail for MSAL-authenticated users

### Root Cause
In `usePositionComments.ts`, the `useAddPositionComment` hook does:
```typescript
const { user } = useAuth();
// ...
if (!user) throw new Error("Not authenticated");
```

For MSAL users, `user` (Supabase User) is `null`. Only `msalUser` is populated. The error fires before any API call is made.

The same issue exists in `useUpdatePositionComment` and `useDeletePositionComment` — they also rely on `user.id` for the `updatedBy` field.

### Fix

**File: `src/hooks/usePositionComments.ts`**

1. Import `useAuthContext` instead of `useAuth` to access both `user` and `msalUser`
2. In `useAddPositionComment`, derive `currentUserId` from `user?.id || msalUser?.id`
3. Use `currentUserId` in the auth check and in the API payload (`userId` / `updatedBy`)
4. Apply the same pattern in `useUpdatePositionComment` and `useDeletePositionComment` if they reference `user`

This is the same pattern already used in other hooks like `useUpdateShiftOverride` which passes `updatedBy` without checking Supabase auth.

