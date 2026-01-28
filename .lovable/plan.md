
# Fix Access Scope Selection Not Saving

## Problem

The Access Scope selection UI works correctly (users can select regions, markets, facilities, and departments), but the selections are **never saved to the database**. 

### Root Cause

The `AccessScopeManager` component exposes a save function via `window.__accessScopeSave`, but the parent `UserFormSheet` component never calls this function when the form is submitted.

**Current flow:**
1. User opens Edit User sheet
2. User expands Access Scope section
3. User selects regions/markets/facilities/departments (works correctly)
4. User clicks "Update" button
5. `handleSubmit` is called, which only saves profile + roles
6. Access Scope selections are **lost** (never saved)

## Solution

Modify `UserFormSheet` to call the `__accessScopeSave` function when the form is submitted in edit mode.

### Code Change

**File: `src/components/admin/UserFormSheet.tsx`**

Update the `handleSubmit` function to also trigger the Access Scope save:

```tsx
const handleSubmit = async (data: UserFormValues) => {
  if (isEditMode) {
    // Trigger access scope save if available
    if ((window as any).__accessScopeSave) {
      await (window as any).__accessScopeSave();
    }
    
    onSubmit({
      userId: user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      roles: data.roles,
    });
  } else {
    onSubmit({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      roles: data.roles,
    });
  }
};
```

### Alternative (Better Architecture)

Instead of using `window` global, pass a ref or callback pattern. However, the window approach is already in place and works, so the minimal fix is to simply call the exposed function.

## Technical Details

| File | Change |
|------|--------|
| `src/components/admin/UserFormSheet.tsx` | Call `window.__accessScopeSave()` in `handleSubmit` when in edit mode |

## Testing Steps

1. Navigate to Admin → Users
2. Click Edit on any user
3. Expand "Access Scope Restrictions"
4. Select a Region, Market, Facility, or Department
5. Click "Update"
6. Re-open the same user's edit form
7. Verify the selections persist
