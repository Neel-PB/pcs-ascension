

## Replace Supabase Auth with NestJS Auth

### Overview
Route all credential flows (signIn, signUp, signOut) through NestJS API while silently maintaining a Supabase session so the 23+ files using RLS-protected data queries continue to work.

### Changes

**1. `src/contexts/AuthContext.tsx`** — Major rewrite

- Add `AppUser` interface: `{ id, email, firstName, lastName, role }`
- Add `mustChangePassword` state flag
- **`signIn`**: Call `POST ${API_BASE_URL}/auth/login`. Store NestJS JWT + user in `sessionStorage`. If `must_change_password` is true, set flag. Silently call `supabase.auth.signInWithPassword` with same credentials to keep RLS queries working.
- **`signUp`**: Call `POST ${API_BASE_URL}/auth/register`. Store NestJS JWT. Silently create Supabase session with same credentials.
- **`signOut`**: Clear `sessionStorage` (NestJS JWT, user, MSAL tokens). Call `supabase.auth.signOut`. Clear query cache.
- **On mount**: Check `sessionStorage` for stored NestJS user/JWT. Validate via `GET ${API_BASE_URL}/auth/me` with Bearer token. If valid, set user state. Supabase session restores itself via `onAuthStateChange`.
- Expose `mustChangePassword` in context type.
- Keep `signInWithMicrosoft` as-is but also store JWT from its response consistently.
- **`checkEmail`**: Call `GET ${API_BASE_URL}/auth/check-email?email=...` to determine if user exists and is registered.
- **`setInitialPassword`**: Call `POST ${API_BASE_URL}/auth/set-initial-password` for first-time password setup.

**2. `src/pages/AuthPage.tsx`** — Multi-step login flow

- Single-card state machine: `email` → `unauthorized` | `password` | `setup`
- Step email: email input + Continue button, Microsoft SSO above
- Step unauthorized: error card with support contact
- Step password: email (readonly) + password + Sign In
- Step setup: email (readonly) + create/confirm password + Set Password

**3. `src/pages/SetupPasswordPage.tsx`**

- Replace `supabase.auth.updateUser({ password })` with `POST ${API_BASE_URL}/auth/change-password` using Bearer token from `sessionStorage`.
- On success, clear `mustChangePassword` flag in context and navigate to `/`.

**4. `src/App.tsx`**

- Read `mustChangePassword` from auth context.
- In `AppContent`, if user is logged in and `mustChangePassword` is true, redirect all routes to `/auth/setup-password`.

**5. No changes needed**
- `DemoLogin.tsx` — already calls `signIn()` from context (no longer rendered on AuthPage)
- `ShellLayout.tsx` — already checks `user` from `useAuth()`

### Data Access Strategy
Supabase client stays for all data queries. The silent `supabase.auth.signInWithPassword` call after NestJS login ensures `auth.uid()` is populated for RLS. Users never see Supabase auth — NestJS is the authority.

### Critical Hooks Migrated to NestJS (Phase 1)

**6. `src/lib/apiFetch.ts`** — Shared API helper
- Extracted from AuthContext, reads `nestjs_token` from sessionStorage, prepends `VITE_API_BASE_URL`.

**7. `src/hooks/useRBAC.ts`** — Migrated to NestJS
- Roles: `GET /users/:id/roles`
- Permission overrides: `GET /role-permissions`

**8. `src/hooks/useUserRoles.ts`** — Migrated to NestJS
- `GET /users/:id/roles`

**9. `src/hooks/useUserProfile.ts`** — Migrated to NestJS
- `GET /auth/me` (maps NestJS response to profile shape)

**10. `src/hooks/useUserOrgAccess.ts`** — Migrated to NestJS
- `GET /users/:id/access-scope`

### NestJS Endpoints Required

```text
GET /auth/check-email?email=user@domain.com
  Returns: { exists: boolean, registered: boolean }

POST /auth/set-initial-password
  Body: { email, password }
  Returns: { access_token, user }

GET /users/:id/roles
  Auth: Bearer token
  Returns: { roles: ["admin", "labor_team", ...] }

GET /users/:id/access-scope
  Auth: Bearer token
  Returns: { assignments: [{ region, market, facility_id, facility_name, department_id, department_name }] }

GET /role-permissions
  Auth: Bearer token
  Returns: [{ role, permission_key, permission_value }]
```
