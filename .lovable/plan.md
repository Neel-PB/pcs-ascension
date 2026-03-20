

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

**2. `src/pages/SetupPasswordPage.tsx`**

- Replace `supabase.auth.updateUser({ password })` with `POST ${API_BASE_URL}/auth/change-password` using Bearer token from `sessionStorage`.
- On success, clear `mustChangePassword` flag in context and navigate to `/`.

**3. `src/App.tsx`**

- Read `mustChangePassword` from auth context.
- In `AppContent`, if user is logged in and `mustChangePassword` is true, redirect all routes to `/auth/setup-password`.

**4. No changes needed**
- `AuthPage.tsx` — already calls `signIn`/`signUp` from context
- `DemoLogin.tsx` — already calls `signIn()` from context
- `ShellLayout.tsx` — already checks `user` from `useAuth()`

### Data Access Strategy
Supabase client stays for all data queries. The silent `supabase.auth.signInWithPassword` call after NestJS login ensures `auth.uid()` is populated for RLS. Users never see Supabase auth — NestJS is the authority.

