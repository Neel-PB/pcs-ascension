

# Fix Logout Not Fully Signing Out User

## Problem Analysis

The user clicks logout, sees "Signed out successfully" toast, but is immediately logged back in without actually signing out. The previous fix eliminated the "auth missing" error, but didn't solve the underlying problem that logout isn't fully clearing the authentication state.

### Root Causes

1. **Incomplete Session Cleanup**: `supabase.auth.signOut()` may not be fully clearing the session from browser storage
2. **Background `getUser()` Calls**: Multiple hooks still call `supabase.auth.getUser()` directly instead of using the centralized auth context:
   - `useFeedback.ts`
   - `useFeedbackComments.ts`
   - `useAddActivityLog.ts`
   - `useNPOverrides.ts`
   - `usePositionComments.ts`
   - `useEmployeeFeed.ts` (3 mutations)
   - `useVolumeOverrides.ts`
   - `useMessages.ts`
   - `PositionCommentSection.tsx`

3. **Race Condition in Navigation**: The navigation to `/auth` happens immediately after `signOut()` completes, but the `onAuthStateChange` listener might fire afterward, potentially re-initializing state

4. **ShellLayout Auth Check**: The `ShellLayout` redirects to `/auth` if no user, but there might be a timing issue where the user state hasn't fully cleared yet

## Solution Strategy

### Phase 1: Ensure Complete Session Cleanup

Update the `signOut` function to use `signOut({ scope: 'local' })` to forcefully clear all local session data and wait for the auth state change to propagate before navigating.

### Phase 2: Add Navigation Delay

Add a small delay after clearing the cache and signing out to ensure all listeners have processed the logout event before navigation occurs.

### Phase 3: Refactor Remaining Direct Auth Calls

Convert all remaining `supabase.auth.getUser()` calls to use the centralized `useAuth()` hook to prevent stale auth checks.

## Detailed Implementation

### File 1: `src/contexts/AuthContext.tsx`

**Changes:**
- Use `signOut({ scope: 'local' })` to forcefully clear local storage
- Add a flag to track logout state
- Prevent auth state updates during logout transition
- Return a promise that resolves only after session is fully cleared

```tsx
const [isSigningOut, setIsSigningOut] = useState(false);

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('[AuthContext] Auth event:', event, 'Session:', !!session);
      
      // Don't update state if we're actively signing out
      if (!isSigningOut) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }
  );

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!isSigningOut) {
      setSession(session);
      setUser(session?.user ?? null);
    }
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, [isSigningOut]);

const signOut = useCallback(async (queryClient?: QueryClient) => {
  console.log('[AuthContext] Starting sign out...');
  setIsSigningOut(true);
  
  // Clear all queries first to prevent refetches
  if (queryClient) {
    queryClient.clear();
  }
  
  // Forcefully clear local session
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  
  // Manually clear auth state immediately
  setSession(null);
  setUser(null);
  
  // Don't show error toast for expected session-related errors
  if (error && !error.message?.includes('session')) {
    console.error('[AuthContext] Sign out error:', error);
    toast.error(error.message);
    setIsSigningOut(false);
    return { error };
  }

  console.log('[AuthContext] Sign out complete');
  toast.success("Signed out successfully!");
  
  // Reset flag after a brief delay to allow state to settle
  setTimeout(() => setIsSigningOut(false), 100);
  
  return { error: null };
}, []);
```

### File 2: `src/components/shell/AppHeader.tsx`

**Changes:**
- Wait for signOut to complete before navigating
- Add a small delay to ensure all state updates have propagated

```tsx
const handleSignOut = async () => {
  console.log('[AppHeader] Initiating logout...');
  await signOut(queryClient);
  
  // Small delay to ensure all auth state changes have propagated
  setTimeout(() => {
    console.log('[AppHeader] Navigating to /auth');
    navigate("/auth", { replace: true });
  }, 150);
};
```

### File 3: `src/pages/AuthPage.tsx`

**Changes:**
- Remove the useEffect that auto-redirects when user exists (this might be causing a redirect loop)
- Only show the early return null check without navigation

```tsx
// Remove this useEffect completely - it might be causing issues
// useEffect(() => {
//   if (user) {
//     navigate("/");
//   }
// }, [user, navigate]);

// Keep the early return
if (user) {
  return null;
}
```

### File 4: `src/hooks/useFeedback.ts`

**Changes:**
- Replace `supabase.auth.getUser()` with `useAuth()` hook

```tsx
import { useAuth } from "@/hooks/useAuth";

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Add this

  const createFeedback = useMutation({
    mutationFn: async (input: CreateFeedbackInput) => {
      if (!user) throw new Error('Not authenticated'); // Use context user
      
      // Remove: const { data: userData } = await supabase.auth.getUser();
      // Remove: if (!userData.user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from("feedback")
        .insert({
          user_id: user.id, // Use context user
          // ... rest
        })
        .select()
        .single();
        
      // ...
    },
  });
}
```

### File 5: `src/hooks/useFeedbackComments.ts`

Similar refactor - use `useAuth()` instead of `getUser()`

### File 6: `src/hooks/useAddActivityLog.ts`

Similar refactor - use `useAuth()` instead of `getUser()`

### File 7: `src/hooks/useNPOverrides.ts`

Similar refactor - use `useAuth()` instead of `getUser()`

### File 8: `src/hooks/usePositionComments.ts`

Similar refactor - use `useAuth()` instead of `getUser()`

### File 9: `src/hooks/useEmployeeFeed.ts`

Refactor all 3 mutations to use `useAuth()` instead of `getUser()`

### File 10: `src/hooks/useVolumeOverrides.ts`

Similar refactor - use `useAuth()` instead of `getUser()`

### File 11: `src/hooks/useMessages.ts`

Similar refactor - use `useAuth()` instead of `getUser()`

### File 12: `src/components/positions/PositionCommentSection.tsx`

Replace the `useState` with direct access to user from context

### File 13: `src/components/feedback/FeedbackForm.tsx`

Refactor to use `useAuth()` hook

## Implementation Priority

### Critical (Fix Logout Flow)
1. AuthContext - Add signout flag and force local scope
2. AppHeader - Add navigation delay
3. AuthPage - Remove auto-redirect useEffect

### High (Prevent Auth Calls After Logout)
4-13. Refactor all hooks to use centralized auth context

## Expected Outcome

- User clicks "Log out"
- React Query cache is cleared
- Session is forcefully removed from local storage
- Auth state is set to null immediately
- User sees "Signed out successfully" toast
- After brief delay, navigates to `/auth` page
- No background queries attempt to fetch user data
- User remains on login page, fully logged out
- Can log back in with any demo account

## Testing Steps

1. Log in with any demo account
2. Navigate to any page (e.g., Admin)
3. Click "Log out" from user menu
4. Verify:
   - Toast shows "Signed out successfully"
   - Navigates to `/auth` page
   - No automatic re-login occurs
   - Can manually log back in
5. Test with each demo role to ensure consistent behavior

## Technical Notes

**Why `{ scope: 'local' }`?**
Supabase has two scopes for signOut:
- `local`: Clears session from current browser only
- `global`: Invalidates session on server (requires network call)

Using `local` ensures immediate, guaranteed cleanup even if there are network issues.

**Why the delays?**
React state updates and auth listeners are asynchronous. The delays ensure:
1. Auth state change propagates through all listeners
2. Component re-renders complete before navigation
3. No race conditions between logout and background queries

**Why remove AuthPage useEffect?**
The redirect logic in `ShellLayout` already handles authenticated users trying to access protected routes. The AuthPage useEffect creates a potential redirect loop:
- User logs out → navigates to /auth
- AuthPage detects user is null → does nothing (correct)
- BUT if user still exists (due to incomplete logout) → redirects to / → ShellLayout redirects back to /auth → loop

