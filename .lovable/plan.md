

## Fix: FTE/Shift activity logs showing as plain comments + "Unknown User"

### Root Cause

Two issues:

1. **`updatedBy` never passed** — Both `EmployeesTab` and `ContractorsTab` call the FTE and Shift mutation hooks without passing the current user's ID. The API receives `updatedBy: null`, so it can't record who made the change → "Unknown User".

2. **`ContractorsTab` shift handler missing `overrideId` and `previousOverride`** — The contractor shift handler only passes `id`, `originalShift`, and `value` — no `overrideId` or `previousOverride`, so the API can't attach the activity log to the correct override.

### Changes

**1. `src/pages/positions/EmployeesTab.tsx`**
- Import `useAuthContext` 
- Get `user` and `msalUser` from auth context
- Pass `updatedBy: user?.id || msalUser?.id` to both `updateActualFte.mutate()` and `updateShiftOverride.mutate()`

**2. `src/pages/positions/ContractorsTab.tsx`**
- Same auth context import + `updatedBy` for both mutations
- Fix `handleShiftOverrideUpdate` to accept and pass `overrideId` and `previousOverride` (same pattern as EmployeesTab)

**3. `src/config/contractorColumns.tsx`**
- Update the shift column `onSave` to pass `row.overrideId` and `row.shift_override` (same fix already applied to employeeColumns)

