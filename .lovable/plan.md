

## Increase Fixed Column Widths

The headers for Position No, Skill Mix, Hired FTE, and Active FTE are truncating ("POSITI...", "SK...", "HIRE...", "ACTIVE..."). Comments column already has `maxWidth: 60` so it's correctly fixed — it's not stealing space. The issue is the base widths on these columns are too tight.

### Width Changes

| Column | Current | New | maxWidth |
|--------|---------|-----|----------|
| Position No | 110px | 130px | 130px |
| Skill Mix | 80px | 100px | 100px |
| Hired FTE | 90px | 110px | 110px |
| Active FTE | 110px | 130px | 130px |

### Files to Update
1. **`src/config/employeeColumns.tsx`** — Position No, Skill Mix, Hired FTE, Active FTE
2. **`src/config/contractorColumns.tsx`** — Position No, Skill Mix, Hired FTE
3. **`src/config/requisitionColumns.tsx`** — Position No, Skill Mix, Hired FTE

Same width/maxWidth/minWidth values across all tabs for consistency.

