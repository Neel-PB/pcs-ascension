

## Fix: Enforce 5-Role Enum in `useDynamicRoles` and `useUserRoles`

### Problem
Two files still reference `cno` as a valid/visible role:
1. `src/hooks/useDynamicRoles.ts` line 168 — `cno` not in the legacy exclusion list, so it still appears in role dropdowns (user add/edit) and RBAC views
2. `src/hooks/useUserRoles.ts` line 4 & 17 — `UserRole` type and `availableRoles` array still include `cno`

### Changes

#### 1. `src/hooks/useDynamicRoles.ts` — Line 168
Add `"cno"` to the legacy exclusion:
```typescript
const legacyNames = ["moderator", "user", "nurse_manager", "cno"];
```

#### 2. `src/hooks/useUserRoles.ts` — Lines 4 and 17
Remove `cno` from the `UserRole` type and `availableRoles`:
```typescript
export type UserRole = 'admin' | 'labor_team' | 'leadership' | 'director' | 'manager' | 'nurse_manager' | 'moderator' | 'user';

const availableRoles: UserRole[] = ['admin', 'labor_team', 'leadership', 'director', 'manager'];
```

These two changes ensure every role dropdown and RBAC view in the admin module strictly follows the 5-role enum.

