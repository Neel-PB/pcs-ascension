

# Remove Badge Styling from Job Family Column

## What changes

The Job Family column currently renders inside a `BadgeCell` (outlined badge with blue tint). It will be switched to a plain `TruncatedTextCell` -- consistent with how Job Title is displayed.

## Files to update

All three column config files have the same pattern:

1. **`src/config/requisitionColumns.tsx`** (lines 94-99) -- replace `BadgeCell` with `TruncatedTextCell`
2. **`src/config/employeeColumns.tsx`** (lines 59-64) -- same change
3. **`src/config/contractorColumns.tsx`** (lines 59-64) -- same change

### Before
```tsx
renderCell: (row) => (
  <BadgeCell
    value={row.jobFamily}
    variant="outline"
    className="bg-primary/10"
    maxLength={30}
  />
),
```

### After
```tsx
renderCell: (row) => (
  <TruncatedTextCell value={row.jobFamily} maxLength={30} />
),
```

## What stays the same

- Column width, sorting, draggable settings
- All other badge-styled columns (Vacancy Age, Status, etc.)
- No new dependencies or imports needed (`TruncatedTextCell` is already imported in all three files)

