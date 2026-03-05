

## Fix: Pass `overrideId` to FTE and Shift mutation calls

### Root Cause
When you revert (or update) Active FTE or Shift, the mutation hooks (`useUpdateActualFte`, `useUpdateShiftOverride`) check for `overrideId` to decide whether to PUT (update existing) or POST (create new). However, the handler functions in `EmployeesTab.tsx` and `ContractorsTab.tsx` never pass `overrideId` from the row data. This means every call hits the POST/create branch, and the API returns 500 because:
- It tries to create a new override for a position that already has one (duplicate), or
- It rejects creating an override with null values (revert scenario)

### Fix

**1. `src/pages/positions/EmployeesTab.tsx`**
- Update `handleActualFteUpdate` to accept and pass `overrideId`:
  ```ts
  const handleActualFteUpdate = useCallback((
    id: string, previousFte, previousExpiry, previousStatus,
    data: { ... },
    overrideId?: string | null  // add this
  ) => {
    updateActualFte.mutate({ id, overrideId, ...data, previousFte, previousExpiry, previousStatus });
  }, [updateActualFte]);
  ```
- Update `handleShiftOverrideUpdate` to accept and pass `overrideId`:
  ```ts
  const handleShiftOverrideUpdate = useCallback((
    id: string, originalShift: string | null, value: string | null, overrideId?: string | null
  ) => {
    updateShiftOverride.mutate({ id, overrideId, shift_override: value, originalShift });
  }, [updateShiftOverride]);
  ```

**2. `src/pages/positions/ContractorsTab.tsx`** — Same changes as above.

**3. Column config call sites** — Update where `handleActualFteUpdate` and `handleShiftOverrideUpdate` are invoked (in the `renderCell` callbacks within `EmployeesTab` and `ContractorsTab`) to pass `row.overrideId`.

This requires tracing exactly where the cell components call these handlers to include the `overrideId` parameter. The `EditableFTECell` and `ShiftCell` components receive callbacks, and those callbacks need to forward `row.overrideId` from the column config's `renderCell`.

