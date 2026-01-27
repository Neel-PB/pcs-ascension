

# Remove Permission Counts from Access Control Page

## Overview

Remove all permission count badges and indicators from the Access Control page (Matrix view and Detail view) to simplify the UI as requested.

---

## Current State

The Access Control page displays permission counts in multiple locations:

**Matrix View (`PermissionMatrix.tsx`):**
1. Permission count badge under each role name (e.g., "18", "17", "14")
2. Permission count badge next to each category name (e.g., "MODULES 7")

**Detail View (`RoleDetailView.tsx`):**
1. Permission count badge in the role list sidebar
2. "X enabled" badge in the role detail header
3. "X/Y" count badge in each permission category card header

---

## Changes Required

### File 1: `src/components/admin/PermissionMatrix.tsx`

**Remove role column permission count badge (lines 179-182):**
```tsx
// DELETE this entire block:
<div className="flex items-center gap-1">
  <Badge variant="secondary" className="text-[10px] h-4 px-1">
    {effectivePerms.length}
  </Badge>
  ...
</div>
```
Keep only the override indicator (amber dot) if overrides exist.

**Remove category permission count badge (lines 226-228):**
```tsx
// DELETE this Badge:
<Badge variant="outline" className="text-[10px] h-4 px-1 ml-auto">
  {categoryPermissions.length}
</Badge>
```

**Cleanup:**
- Remove unused `effectivePerms` variable from the role header (line 134)
- Remove Badge import if no longer used elsewhere

---

### File 2: `src/components/admin/RoleDetailView.tsx`

**Remove permission count from CompactRoleCard (lines 72-74):**
```tsx
// DELETE this Badge:
<Badge variant="secondary" className="text-xs shrink-0 h-5 px-1.5">
  {permissionCount}
</Badge>
```

**Update CompactRoleCard props interface (lines 38-46):**
- Remove `permissionCount` prop

**Update CompactRoleCard component usage (lines 327-338):**
- Remove `permissionCount` prop from the component call

**Remove "X enabled" badge from role detail header (lines 348-350):**
```tsx
// DELETE this Badge:
<Badge variant="secondary" className="text-xs">
  {effectivePermissions.length} enabled
</Badge>
```

**Remove count badge from CompactPermissionCard header (lines 209-211):**
```tsx
// DELETE this Badge:
<Badge variant="secondary" className="text-xs h-4 px-1">
  {enabledCount}/{entries.length}
</Badge>
```

**Cleanup:**
- Remove unused `enabledCount` calculation (lines 201-203)
- Remove unused `permissionCount` calculation from the roles map (line 332)
- Check if Badge import can be removed

---

## Files Summary

| File | Changes |
|------|---------|
| `src/components/admin/PermissionMatrix.tsx` | Remove role column count badge, remove category count badge |
| `src/components/admin/RoleDetailView.tsx` | Remove role list count badge, remove detail header count badge, remove category count badge |

---

## Result

The Access Control page will show:
- **Matrix View:** Role names with menu, override dots only (no count badges)
- **Category headers:** Just the category name (no count badges)
- **Detail View Sidebar:** Role labels with override dots only
- **Detail Header:** Role name and System badge only
- **Permission Cards:** Category name only (no enabled/total counts)

All permission toggle functionality remains intact.

