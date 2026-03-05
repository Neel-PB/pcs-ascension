

## Fix: Make Shift Cells Read-Only on Contractor, Contractor Requisition, and Open Position Tabs

### Problem
The `ShiftCell` component always renders an editable popover with a pencil icon for "special shifts" (rotating, weekend option, evening), even when no `onSave` prop is passed. This makes shifts appear editable on tabs where they should be read-only.

**Affected tabs**: Contractor, Contractor Requisition, Open Position (RequisitionsTab)
**Correct behavior**: Only Employee and Open Requisition tabs should have editable shifts.

### Solution
Replace `ShiftCell` with `TruncatedTextCell` in the three read-only column configs:

1. **`src/config/contractorColumns.tsx`** — Change the shift column `renderCell` from `<ShiftCell value={row.shift} />` to `<TruncatedTextCell value={row.shift} maxLength={30} />`. Remove the `ShiftCell` import.

2. **`src/config/requisitionColumns.tsx`** — Same change: shift column renders `<TruncatedTextCell value={row.shift} maxLength={30} />` instead of `<ShiftCell>`. This config is used by the Open Position tab (RequisitionsTab).

3. **`src/pages/positions/ContractorRequisitionTab.tsx`** — Uses `createRequisitionColumnsWithComments` from requisitionColumns, so the fix in #2 covers it automatically.

### No changes needed
- `src/config/employeeColumns.tsx` — Employee shift stays editable (correct)
- `src/pages/positions/OpenRequisitionTab.tsx` — Already overrides shift column with editable `ShiftCell` with `onSave` (correct)
- `ShiftCell` component itself — No changes needed; it's correct for editable contexts

