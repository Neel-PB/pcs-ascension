

## Fix: Show "Support" Category in Detail and List Views

The "Support" category with "Add FAQ" permission only appears in the Matrix view because you already added it there. The Detail view (card layout, which you're currently looking at) and the List view both have their own hardcoded category references that are missing "Support".

### Changes

| File | Change |
|------|--------|
| `src/components/admin/RoleDetailView.tsx` | Add a new `CompactPermissionCard` for "Support" using `PERMISSION_CATEGORIES.support.permissions`, placed after the "Approvals" card |
| `src/components/admin/PermissionListView.tsx` | Add `"support"` to the `CATEGORY_ORDER` array (line 43) so the Support category renders in the list view as well |

### Details

**RoleDetailView.tsx** -- Around line 591-600, after the Approvals `CompactPermissionCard`, add:
```tsx
<CompactPermissionCard
  title="Support"
  permissions={PERMISSION_CATEGORIES.support.permissions}
  role={selectedRoleName}
  displayPermissions={displayPermissions}
  ...
/>
```

**PermissionListView.tsx** -- Line 43, update:
```tsx
const CATEGORY_ORDER = ["modules", "settings", "filters", "subfilters", "approvals", "support"];
```

This ensures the "Add FAQ" permission shows up in all three RBAC views (Matrix, Detail, and List).
