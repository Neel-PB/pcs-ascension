

## Enforce 5-Role Enum Across Admin Module

### Problem
The admin module currently includes `cno` as a 6th manageable role. The strict enum should be: `admin`, `leadership`, `labor_team`, `director`, `manager` only.

### Changes

#### 1. `src/config/rbacConfig.ts`
- **Remove `cno` from `CORE_ROLES`** array (lines 36-43)
- **Move `cno` to `LEGACY_ROLES`** alongside moderator, user, nurse_manager
- **Remove `cno` from `MANAGEABLE_ROLES`** (line 365) — now only 5 entries
- Keep `cno` in `DEFAULT_ROLE_PERMISSIONS` and `ROLE_METADATA` for backward compatibility (existing users with cno role still need permissions to resolve)

#### 2. `src/components/auth/DemoLogin.tsx`
- **Remove `cno` from `DEMO_CREDENTIALS`** (no demo.cno entry)
- Remove `cno` icon from `ROLE_ICONS`
- The component already iterates `MANAGEABLE_ROLES`, so removing cno there handles the UI automatically

#### 3. `supabase/functions/seed-demo-users/index.ts`
- **Remove the `demo.cno@ascension.org` entry** from the seed array

#### 4. `src/hooks/useMessages.ts`
- **Remove `cno` option** from the target roles list (line 74)

### Not changed
- `kpiVisibility.ts` — cno is not referenced there, no change needed
- DB `app_role` enum — cno stays in the DB enum for backward compatibility with existing users; it just won't appear in the admin UI
- `DEFAULT_ROLE_PERMISSIONS` and `ROLE_METADATA` — keep cno entries so existing cno users don't break

