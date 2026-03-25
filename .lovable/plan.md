

## Remove Supabase from AuthContext.tsx

You're right — `AuthContext.tsx` still has leftover Supabase calls even though NestJS is the auth authority. These are remnants from the original setup and serve no purpose now.

### What to remove

**File: `src/contexts/AuthContext.tsx`**

1. Remove `import { supabase }` line
2. Remove the `supabase.auth.onAuthStateChange` useEffect (lines ~68-74) — NestJS handles auth, this does nothing
3. In `signIn`: Remove the "Silent Supabase session" block (`supabase.auth.signInWithPassword`) — no longer needed once all data hooks use `apiFetch`
4. In `signUp`: Remove the "Silent Supabase signup" block (`supabase.auth.signUp`)
5. In `signOut`: Remove `supabase.auth.signOut()` call
6. In `setInitialPassword`: Remove the "Silent Supabase session" block

**File: `src/App.tsx`**

7. Remove `import { supabase }` and the `supabase.from('profiles')` onboarding check — replace with `apiFetch('/auth/me')` or similar NestJS call

### Why these existed

The "silent Supabase session" was kept so that hooks using `supabase.from()` directly (with RLS) would have an authenticated session. Once all those hooks migrate to `apiFetch`, this workaround becomes dead code.

### Result

- `AuthContext.tsx` becomes purely NestJS-based (which it logically already is)
- No behavioral change — NestJS token in sessionStorage continues to drive all auth
- 2 files changed, ~30 lines removed

