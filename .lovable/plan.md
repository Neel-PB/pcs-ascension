

## Unblock Login: Migrate Critical Auth/RBAC Hooks to NestJS

### Problem
After NestJS login, the silent Supabase session fails because users don't exist in Supabase Auth. This means `auth.uid()` is null, so all Supabase RLS queries return empty data. Result: no roles → no filter permissions → filters hidden, no profile, no access scope.

### Scope (login only — not feedback, messages, etc.)
Only 4 hooks need to migrate to make login → filters → data work:

| Hook | Currently queries | Needs NestJS endpoint |
|------|------------------|-----------------------|
| `useRBAC` | `user_roles` + `role_permissions` | `GET /users/:id/roles` + `GET /role-permissions` |
| `useUserRoles` | `user_roles` | `GET /users/:id/roles` |
| `useUserProfile` | `profiles` | `GET /auth/me` (already exists) |
| `useUserOrgAccess` | `user_organization_access` | `GET /users/:id/access-scope` |

### NestJS Endpoints Needed (prompt for your team)

```text
GET /users/:id/roles
  Auth: Bearer token
  Returns: { roles: ["admin", "labor_team", ...] }
  Logic: SELECT role FROM user_roles WHERE user_id = :id

GET /users/:id/access-scope
  Auth: Bearer token
  Returns: { assignments: [{ region, market, facility_id, facility_name, department_id, department_name }] }
  Logic: SELECT * FROM user_organization_access WHERE user_id = :id
  If no rows → user has unrestricted access

GET /role-permissions
  Auth: Bearer token
  Returns: [{ role, permission_key, permission_value }]
  Logic: SELECT * FROM role_permissions
```

**`GET /auth/me` already exists** — just ensure it returns `{ id, email, firstName, lastName, role }`.

### Frontend Changes (Lovable implements)

**1. `src/hooks/useRBAC.ts`**
- Replace `supabase.from('user_roles')` with `GET /users/${userId}/roles`
- Replace `supabase.from('role_permissions')` with `GET /role-permissions`
- Use Bearer token from `sessionStorage.getItem('nestjs_token')`

**2. `src/hooks/useUserRoles.ts`**
- Replace `supabase.from('user_roles')` with `GET /users/${userId}/roles`

**3. `src/hooks/useUserProfile.ts`**
- Replace `supabase.from('profiles')` with `GET /auth/me` (user data already comes from NestJS)

**4. `src/hooks/useUserOrgAccess.ts`**
- Replace `supabase.from('user_organization_access')` with `GET /users/${userId}/access-scope`

**5. Create `src/lib/apiFetch.ts`**
- Extract the `apiFetch` helper from `AuthContext.tsx` into a shared utility so all hooks can use it

### What This Unlocks
Once these 4 hooks use NestJS, login → RBAC loads → filter permissions resolve → filters appear → existing NestJS data endpoints (positions, volumes, filters) work. The app becomes functional for logged-in users.

### What's NOT in scope
Feedback, notifications, messages, comments, volume overrides, forecast positions, employee feed, app settings, user admin CRUD — all deferred to later phases.

