

## Fix: Activity logs for Shift and FTE changes not appearing in comments

### Problems Identified

1. **Shift mutations don't pass `previousOverride`** -- When a shift is already overridden and changed again, the old override value is lost. The `ContractorsTab` also doesn't pass `overrideId`.

2. **Neither mutation invalidates comment queries** -- After a shift or FTE change, the comments panel doesn't refresh, so the new activity log entry is invisible until the user closes and reopens the panel.

3. **`updatedBy` not passed in shift handlers** -- The shift override handler doesn't send the current user ID, so the API can't record who made the change.

### Changes

**1. `src/hooks/useUpdateShiftOverride.ts`** -- Add comment query invalidation on success:
- Import `useQueryClient` (already done) and invalidate `["position-comments", positionKey]` and `["position-comment-counts"]` in `onSuccess`.

**2. `src/hooks/useUpdateActualFte.ts`** -- Add comment query invalidation on success:
- Invalidate `["position-comments", positionKey]` and `["position-comment-counts"]` in `onSuccess`.

**3. `src/pages/positions/EmployeesTab.tsx`** -- Pass `previousOverride` and `updatedBy` to the shift handler:
```ts
handleShiftOverrideUpdate(
  row.id, row.shift, val, row.overrideId
  // Also need: previousOverride = row.shift_override, updatedBy = user.id
)
```
Update the callback signature and mutation call to include `previousOverride: row.shift_override` and `updatedBy: user?.id`.

**4. `src/pages/positions/ContractorsTab.tsx`** -- Same: pass `overrideId`, `previousOverride`, and `updatedBy` to the shift handler.

**5. `src/config/employeeColumns.tsx`** -- Update column `onSave` to pass `row.shift_override` as `previousOverride`.

**6. `src/config/contractorColumns.tsx`** -- Same update for contractor shift column.

