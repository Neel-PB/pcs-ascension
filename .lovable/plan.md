

## Fix Truncated Totals in Hired FTE and Active FTE Column Headers

### Problem
The Hired FTE and Active FTE column headers are truncating the aggregate totals (e.g., "HIRED FTE (2,23..." and "ACTIVE FTE (2,2...") because the columns are only 120px wide, which is too narrow to display the label plus the total number.

### Fix

**File: `src/config/employeeColumns.tsx`**

Widen the two columns to accommodate the totals:

1. **Hired FTE column** (line 60): Change `width: 120` to `width: 160` and `minWidth: 100` to `minWidth: 140`
2. **Active FTE column** (line 71): Change `width: 120` to `width: 160` and `minWidth: 100` to `minWidth: 140`

This adds 40px of extra space per column, enough to fit labels like "Hired FTE (2,234.5)" and "Active FTE (2,234.0)" without truncation.

### Files Changed
- `src/config/employeeColumns.tsx` -- increase width of Hired FTE and Active FTE columns from 120px to 160px

