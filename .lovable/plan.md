

## Update User Form: Single Role, No Bio, Inline Access Scope

### Summary
Simplify the UserFormSheet to match the NestJS API: single role select instead of multi-select, remove bio field, and show Access Scope inline (not inside a collapsible).

### Changes

**1. `src/components/admin/UserFormSheet.tsx`**
- **Remove bio field** entirely (form schema, default values, reset logic, submit payload, and the Textarea)
- **Change roles from array to single string**: Update zod schema from `z.array(z.string())` to `z.string()`. Replace `MultiSelectChips` with a standard `Select` dropdown for picking one role
- **Remove Collapsible wrapper** around Access Scope — render `AccessScopeManager` directly inline in the form (always visible, no expand/collapse)
- **Update submit handler**: Send `role` as a single string (or wrap in array for API compatibility) instead of `roles` array. Remove `bio` from payload
- **Clean up imports**: Remove `Textarea`, `MultiSelectChips`, `Collapsible` components, `ChevronDown` icon

**2. `src/hooks/useUsers.ts`**
- **Update `UserWithProfile`**: Change `roles: UserRole[]` to `role: UserRole` (single role). Remove `bio` field
- **Update `mapApiUser`**: Map single role from `u.roles[0]?.role` or fallback to `'user'`
- **Update create/update mutations**: Send `role` (single string) instead of `roles` array. Remove `bio` from payloads
- **Update mutation input types** accordingly

**3. `src/pages/admin/UsersManagement.tsx`**
- Update sort case from `'roles'` to `'role'` (single value comparison)

**4. `src/components/admin/UserManagementTable.tsx`**
- Update any reference from `user.roles` (array) to `user.role` (string) for badge display

### API Alignment
- `POST /users` sends `{ email, first_name, last_name, role: "admin", accessScope: [...] }`
- `PATCH /users/:id` sends `{ first_name, last_name, role: "admin" }`
- Single `role` field aligns with the NestJS User entity's `role` column

