

## Increase Column Widths for Position No, Skill Mix, Hired FTE

Current → New widths:

| Column | Current | New |
|--------|---------|-----|
| Position No | 130px | 150px |
| Skill Mix | 100px | 120px |
| Hired FTE | 110px | 130px |

### Files to Update
1. **`src/config/employeeColumns.tsx`** — update width/minWidth/maxWidth for Position No (150), Skill Mix (120), Hired FTE (130)
2. **`src/config/contractorColumns.tsx`** — same three columns
3. **`src/config/requisitionColumns.tsx`** — same three columns
4. **`src/stores/useColumnStore.ts`** — bump version from 5 → 6 to clear cached widths

