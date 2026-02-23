

## Show FTE Totals Without Widening Columns

### Approach
Revert the column widths back to their original 120px/100px and instead stack the total below the label text using a two-line layout. This keeps the column width unchanged while still displaying the sum.

### Changes

**File: `src/config/employeeColumns.tsx`**

1. **Revert widths** for both `FTE` and `actual_fte` columns back to `width: 120, minWidth: 100`.

2. **Change header layout** from horizontal (`flex items-center gap-1.5`) to vertical (`flex flex-col`) for both Hired FTE and Active FTE headers. The total will appear on a second line in a smaller muted font:

```
Hired FTE
(2,234.5)
```

Instead of the current side-by-side: `Hired FTE (2,234.5)` which overflows.

Specifically:
- Line 146-149: Change `renderHeader` for FTE from horizontal flex to vertical flex-col
- Line 157-160: Change `renderHeader` for actual_fte from horizontal flex to vertical flex-col

### Example Rendering
```tsx
renderHeader: () => (
  <span className="flex flex-col">
    <span>Hired FTE</span>
    <span className="text-[10px] text-muted-foreground font-normal leading-tight">
      ({totals.totalHiredFTE.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })})
    </span>
  </span>
)
```

### Files Changed
- `src/config/employeeColumns.tsx` -- revert widths to 120/100, stack totals vertically below labels
