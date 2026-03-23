

## Migrate User List & Add User to NestJS API

### Summary
Replace all Supabase calls in `useUsers.ts` with NestJS API calls via `apiFetch`. No changes needed to UI components — they consume the same `UserWithProfile` interface.

### API Mapping (from User entity)

Based on the entity you shared, the NestJS response uses snake_case (`first_name`, `last_name`, `created_at`) with `roles` as a relation array and `accessScope` as a relation array.

### Changes

**`src/hooks/useUsers.ts`** — Full rewrite, remove all Supabase imports

1. **List users** — `GET /users`
   - Map response to `UserWithProfile[]`
   - Extract role names from the `roles` relation (each item likely has a `.role` field)
   - Map `is_active`, `avatar_url`, `bio`, `email`, `first_name`, `last_name`, `created_at`
   - Default roles to `['user']` if empty

2. **Create user** — `POST /users`
   - Send `{ email, first_name, last_name, roles, bio, accessScope }`
   - Replace `supabase.functions.invoke('invite-user')`

3. **Update user** — `PATCH /users/:id`
   - Send `{ first_name, last_name, bio, roles }`
   - Replace multi-step Supabase profile + role updates

4. **Delete user** — `DELETE /users/:id`
   - Replace `supabase.functions.invoke('delete-user')`

### Response Mapping Logic

```text
GET /users returns array of User objects:
  {
    id, email, first_name, last_name, is_active, must_change_password,
    role, created_at, updated_at,
    roles: [{ id, role, ... }],        // from UserRoleTable relation
    accessScope: [{ id, region, market, ... }]  // from UserOrganizationAccess relation
  }

Map to UserWithProfile:
  - avatar_url: null (not in NestJS entity — field doesn't exist there)
  - bio: null (not in NestJS entity)
  - roles: user.roles.map(r => r.role)
```

### What stays the same
- `UserWithProfile` interface (unchanged)
- `UserFormSheet`, `UserManagementTable`, `UsersManagement` page — no changes
- Toast messages remain identical
- react-query invalidation pattern stays

### Notes
- The NestJS User entity does NOT have `avatar_url` or `bio` columns. These will be set to `null` in the mapping. If you need them, they'd need to be added to the NestJS entity.
- `is_active` from the entity can be used later for filtering active/inactive users.

