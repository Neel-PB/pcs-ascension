
# Fix Auth Missing Error on Logout

## Problem

When logging out from any demo role (especially manager), an "auth missing" toast error appears. This happens because:

1. **React Query cache** has active queries that try to refetch after logout
2. **Background mutations** may still call `supabase.auth.getUser()` after the session is cleared
3. Multiple hooks (useNotifications, useRBAC, etc.) are subscribed to user data and react to the session change

## Root Cause Analysis

The current `signOut` function in `AuthContext.tsx`:
```tsx
const signOut = useCallback(async () => {
  const { error } = await supabase.auth.signOut();
  // Error displayed if getUser() is called by other hooks after this
  if (error) {
    toast.error(error.message);
    return { error };
  }
  toast.success("Signed out successfully!");
  return { error: null };
}, []);
```

After `signOut()` completes:
- User state becomes `null`
- React Query queries try to refetch based on stale cache
- Realtime subscriptions may still be active momentarily
- Any pending `getUser()` calls return "Auth session missing"

## Solution

### 1. Clear React Query Cache on Logout

Modify `AuthContext.tsx` to accept a `queryClient` and clear all queries before signing out.

### 2. Update AppHeader to Handle Logout Properly

Ensure navigation happens only after signout is fully complete.

### 3. Add Error Suppression for Expected Auth Errors

The `onAuthStateChange` listener receives a `SIGNED_OUT` event which triggers queries to refetch with no user - we should handle this gracefully.

## Files to Modify

### File 1: `src/contexts/AuthContext.tsx`

**Changes:**
- Import `useQueryClient` from React Query
- Clear query cache before calling `supabase.auth.signOut()`
- Prevent error toasts for expected auth errors during logout

```tsx
// Add a flag to suppress auth errors during logout
const [isLoggingOut, setIsLoggingOut] = useState(false);

const signOut = useCallback(async (queryClient?: QueryClient) => {
  setIsLoggingOut(true);
  
  // Clear all queries first to prevent refetches
  if (queryClient) {
    queryClient.clear();
  }
  
  const { error } = await supabase.auth.signOut();
  
  // Don't show error toast for expected logout behavior
  if (error && !error.message?.includes('session')) {
    toast.error(error.message);
    setIsLoggingOut(false);
    return { error };
  }

  setIsLoggingOut(false);
  toast.success("Signed out successfully!");
  return { error: null };
}, []);
```

### File 2: `src/components/shell/AppHeader.tsx`

**Changes:**
- Get `queryClient` from React Query
- Pass it to `signOut()` function
- Ensure navigation happens after signOut completes

```tsx
import { useQueryClient } from "@tanstack/react-query";

// Inside component:
const queryClient = useQueryClient();

const handleSignOut = async () => {
  // Pass queryClient to clear cache before signout
  await signOut(queryClient);
  navigate("/auth");
};
```

### File 3: `src/hooks/useNotifications.ts`

**Changes:**
- In `useMarkAllNotificationsRead`, use the user from context instead of calling `getUser()`

```tsx
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
```

## Implementation Summary

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Accept queryClient param, clear cache before signOut |
| `src/components/shell/AppHeader.tsx` | Pass queryClient to signOut |
| `src/hooks/useNotifications.ts` | Use context user instead of getUser() |

## Expected Result

- No more "auth missing" toast when logging out
- Clean transition to the auth page
- All cached data cleared properly
- No stale queries trying to refetch after logout

## Technical Notes

The fix follows the centralized auth pattern already established in the codebase:
- Uses `useAuthContext` for user state
- Avoids direct `supabase.auth.getUser()` calls where possible
- Properly cleans up React Query cache during auth state transitions
