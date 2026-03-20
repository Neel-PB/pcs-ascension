

## Fix: FilterBar Missing After Login

### Root Cause

Two issues are causing the missing filter bar:

**Issue 1: `VITE_API_BASE_URL` is `http://127.0.0.1:8080`**
The Lovable preview runs in the cloud, so requests to `127.0.0.1` fail. All NestJS API calls (`/users/:id/roles`, `/role-permissions`, `/auth/me`) fail with "Failed to fetch". The env var needs to be set to your deployed NestJS URL: `https://ascension-api-213151693504.us-central1.run.app`

**Issue 2: No fallback when roles API fails**
When `GET /users/:id/roles` fails, `useRBAC` returns `roles = []` (empty array). The permission calculation loop iterates over zero roles → zero permissions → all filter dropdowns hidden. The user's role IS available from the login response (`AppUser.role = "admin"`) but `useRBAC` ignores it.

### Fix Plan

**1. `src/hooks/useRBAC.ts`** — Add fallback to auth context role
- When the roles API call fails or returns empty, fall back to `user.role` from `AuthContext`
- This ensures that if the user logged in successfully (NestJS returned `role: "admin"`), RBAC still works even if the `/users/:id/roles` endpoint is unreachable

```
// Effective roles: API data, or fallback to auth context role
const effectiveRoles = roles.length > 0 
  ? roles 
  : (user?.role ? [user.role as AppRole] : []);
```

Then use `effectiveRoles` instead of `roles` in the permission calculation and `hasRole`.

**2. `src/hooks/useUserRoles.ts`** — Same fallback pattern
- Accept an optional `fallbackRole` parameter from auth context

**3. `src/hooks/useRBAC.ts` and `src/hooks/useUserOrgAccess.ts`** — Graceful error handling
- Add `retry: 1` to react-query options so failed API calls don't retry infinitely
- Add `placeholderData` or handle error state so the UI doesn't hang

**4. Environment variable**
- Set `VITE_API_BASE_URL` to `https://ascension-api-213151693504.us-central1.run.app` (your deployed NestJS backend)

### What This Fixes
- FilterBar appears immediately after login using the role from the login response
- Even if the roles/permissions API endpoints are temporarily unreachable, the hardcoded defaults for the user's role kick in
- No more infinite retry loops visible in network tab

### Files Changed
- `src/hooks/useRBAC.ts` — fallback to `user.role`, add `retry: 1`
- `src/hooks/useUserRoles.ts` — fallback to `user.role`
- `src/hooks/useUserOrgAccess.ts` — add `retry: 1`

