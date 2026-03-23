

## Fix: Rename "Labor Management" to "Labor Team"

### Problem
In `src/config/rbacConfig.ts`, the `labor_team` role has `label: "Labor Management"` instead of `"Labor Team"`. This label propagates to the role dropdown, RBAC views, and demo login.

### Change

**`src/config/rbacConfig.ts`** — Update 2 occurrences:
- Line 23: `label: "Labor Management"` → `label: "Labor Team"`
- Line 335: `label: "Labor Management"` → `label: "Labor Team"`

