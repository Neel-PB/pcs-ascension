

## Better Approach: Handle 401 Directly in `apiFetch`

### Why the previous plan wasn't ideal
The CustomEvent + listener pattern adds unnecessary complexity — two files coordinating via a browser event when a simpler solution exists.

### Better approach
Handle everything in `apiFetch` itself. On a 401 response (excluding auth endpoints), clear session storage and do a hard redirect to `/auth`. No custom events, no React state coordination needed. A hard redirect (`window.location.href`) guarantees all React state, query caches, and stale data are wiped clean — which is exactly what you want after session expiry.

### Changes

#### `src/lib/apiFetch.ts`
After the fetch response, before the generic error throw:
- Check `res.status === 401` and the path is NOT `/auth/login`, `/auth/register`, `/auth/check-email`, or `/auth/set-initial-password`
- If 401: clear all session keys (`nestjs_token`, `nestjs_user`, `nestjs_must_change_password`), then `window.location.href = '/auth'`
- This is a hard redirect — React unmounts, all caches reset, user sees login page fresh

No changes needed in `AuthContext.tsx` or anywhere else. One file, ~5 lines added.

### Files Changed
- `src/lib/apiFetch.ts`

