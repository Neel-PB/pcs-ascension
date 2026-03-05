

## Increase Status column width by 20px across all position tabs

**Files to change:**

1. **`src/config/employeeColumns.tsx`** — Status column: `width: 120 → 140`, `maxWidth: 120 → 140`
2. **`src/config/contractorColumns.tsx`** — Status column: `width: 120 → 140`, `maxWidth: 120 → 140`

These are the only two column configs with a Status column (requisition tabs don't have Status per the design spec).

