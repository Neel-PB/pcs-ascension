

# Add Manual Save for RBAC Permission Changes

## Overview

Change the RBAC permission editing from auto-save (immediate database updates) to manual save where changes are tracked locally and only persisted when the user clicks "Save" or "Update Settings".

---

## Current Behavior

When a user toggles a permission checkbox:
1. `handleToggle()` is called
2. It immediately calls `setPermission.mutateAsync()` which saves to the database
3. Toast notification shows "Permission granted/revoked for [role]"

This happens in both:
- **RoleDetailView** (Detail view - the default)
- **PermissionMatrix** (Matrix view)

---

## Proposed Behavior

1. User toggles permission checkboxes → changes stored in local state (not database)
2. Visual indicator shows unsaved changes (e.g., badge showing "X unsaved changes")
3. User clicks "Save" button → all pending changes saved to database at once
4. Option to "Discard" unsaved changes
5. Warning if user switches roles or views with unsaved changes

---

## Implementation Approach

### 1. Add Pending Changes State

Track local changes that haven't been saved yet:

```typescript
// Map of role -> permission -> new value
type PendingChanges = Map<AppRole, Map<PermissionKey, boolean | null>>;
const [pendingChanges, setPendingChanges] = useState<PendingChanges>(new Map());
```

### 2. Update Toggle Handler

Instead of saving immediately, update local state:

```typescript
const handleToggle = (permission: PermissionKey, value: boolean) => {
  setPendingChanges(prev => {
    const next = new Map(prev);
    const roleChanges = next.get(selectedRoleName) || new Map();
    roleChanges.set(permission, value);
    next.set(selectedRoleName, roleChanges);
    return next;
  });
};
```

### 3. Compute Display State

Merge database state with pending changes for display:

```typescript
const getDisplayPermissions = (role: AppRole): PermissionKey[] => {
  const effective = getEffectivePermissions(role);
  const pending = pendingChanges.get(role);
  if (!pending) return effective;
  
  const result = new Set(effective);
  pending.forEach((value, key) => {
    if (value === true) result.add(key);
    else if (value === false) result.delete(key);
    else if (value === null) { /* reset logic */ }
  });
  return Array.from(result);
};
```

### 4. Add Save/Discard UI

Add a sticky footer or header bar when changes exist:

```tsx
{pendingCount > 0 && (
  <div className="flex items-center justify-between p-3 border-t bg-muted/30">
    <span className="text-sm text-muted-foreground">
      {pendingCount} unsaved change{pendingCount !== 1 ? 's' : ''}
    </span>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleDiscard}>
        Discard
      </Button>
      <Button size="sm" onClick={handleSave} disabled={isSaving}>
        <Save className="h-4 w-4 mr-1" />
        Save Changes
      </Button>
    </div>
  </div>
)}
```

### 5. Save Handler

Use the existing `bulkUpdatePermissions` mutation or iterate through changes:

```typescript
const handleSave = async () => {
  setIsSaving(true);
  try {
    for (const [role, changes] of pendingChanges) {
      for (const [permission, value] of changes) {
        await setPermission.mutateAsync({ role, permission, value });
      }
    }
    setPendingChanges(new Map());
    toast.success("Changes saved successfully");
  } finally {
    setIsSaving(false);
  }
};
```

### 6. Unsaved Changes Warning

Warn when switching roles with pending changes:

```typescript
const handleRoleSelect = (roleName: AppRole) => {
  if (hasPendingChanges && roleName !== selectedRoleName) {
    // Show confirmation dialog
    setConfirmSwitchRole(roleName);
    setShowUnsavedWarning(true);
  } else {
    setSelectedRoleName(roleName);
  }
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/RoleDetailView.tsx` | Add pending state, update toggle handlers, add Save/Discard UI, add unsaved warning dialog |
| `src/components/admin/PermissionMatrix.tsx` | Same pattern - add pending state and Save/Discard UI |

---

## UI Changes

### Detail View Header (when changes exist):
```text
┌────────────────────────────────────────────────────┐
│ Admin                    [System]                  │
│                                                    │
│  3 unsaved changes    [Discard] [💾 Save Changes]  │
└────────────────────────────────────────────────────┘
```

### Visual Indicators:
- Pending changes shown with a different indicator (e.g., blue dot instead of amber)
- Checkboxes with pending changes have subtle highlight
- "Unsaved changes" badge in the role list if that role has pending changes

---

## Confirmation Dialogs

**When switching roles with unsaved changes:**
```
┌─────────────────────────────────────────┐
│ Unsaved Changes                         │
│                                         │
│ You have unsaved changes for Admin.     │
│ What would you like to do?              │
│                                         │
│   [Discard]  [Save & Switch]  [Cancel]  │
└─────────────────────────────────────────┘
```

---

## Result

- Permission changes are no longer auto-saved
- Users explicitly save with "Save Changes" button
- Clear visual feedback for unsaved changes
- Warning before losing unsaved changes
- Both Matrix and Detail views follow the same pattern

