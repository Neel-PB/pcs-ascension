

## Adjust Employee Table Column Widths and Order

### Problem
- Hired FTE and Active FTE columns are 180px wide, which is excessive for small numeric values like "0.9" or "0"
- The Comments column (80px) can be made slightly narrower
- Position # should appear as the first column, but Employee Name currently comes first

### Changes

**File: `src/config/employeeColumns.tsx`**

1. **Reorder columns** -- Move `positionNum` to index 0 (before `employeeName`), and mark it as `locked: true` so it stays first
2. **Reduce widths**:
   - `FTE` (Hired FTE): 180px / 170px min --> 120px / 100px min
   - `actual_fte` (Active FTE): 180px / 170px min --> 120px / 100px min
   - `comments`: 80px / 80px min --> 60px / 60px min
3. **Unlock Employee Name** -- remove `locked: true` from `employeeName` since Position # is now the anchored first column

### Updated Column Order and Widths

| Column | Width | Min Width | Position |
|---|---|---|---|
| Position # | 160px | 150px | 1st (locked) |
| Employee Name | 240px | 220px | 2nd |
| Job Title | 240px | 200px | 3rd |
| Hired FTE | 120px | 100px | 4th |
| Active FTE | 120px | 100px | 5th |
| Shift | 180px | 160px | 6th |
| Status | 140px | 130px | 7th |
| Full/Part Time | 180px | 170px | 8th |
| Comments | 60px | 60px | 9th |

### Note
Since column states are persisted in localStorage, users who already have saved column preferences will keep their existing order/widths. The version key (`employees-columns-v2`) may need to be bumped to `v3` in the consuming component to force a reset so the new defaults take effect.

