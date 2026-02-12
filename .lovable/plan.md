

## Replace Role Badges with Uppercase Text

### Change

**File: `src/config/userColumns.tsx`**

In the `roles` column's `renderCell`, replace the `Badge` components with plain uppercase text spans:

- Remove `Badge` import usage for roles
- Render each role as a simple `<span>` with `text-xs font-medium uppercase text-muted-foreground` styling
- Separate multiple roles with a comma or middot
- For "No Role" fallback, use a plain muted text span instead of a Badge

### Result
- Roles display as clean uppercase text (e.g., "ADMIN", "LABOR TEAM", "MANAGER")
- Simpler, less cluttered appearance in the table
- Consistent with a minimal typographic style

