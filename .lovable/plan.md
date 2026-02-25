

## Fix: Show "Support" Permission Category in Roles Permission Matrix

### Problem
The `support.add_faq` permission exists in `CORE_PERMISSIONS` and renders in the matrix, but it appears at the very bottom with no proper label because `PermissionMatrix.tsx` doesn't include `"support"` in its `CATEGORY_ORDER` or `CATEGORY_LABELS` constants.

### Fix

| File | Change |
|------|--------|
| `src/components/admin/PermissionMatrix.tsx` | Add `"support"` to `CATEGORY_ORDER` array and add `support: "Support"` to `CATEGORY_LABELS` object |

### Details

Line 46-53 in `PermissionMatrix.tsx`:
- `CATEGORY_ORDER`: Add `"support"` after `"approvals"`
- `CATEGORY_LABELS`: Add `support: "Support"`

This ensures the "Support" category with the "Add FAQ" permission appears as a properly labeled, collapsible section in the permission matrix alongside Modules, Settings, Filters, etc.
