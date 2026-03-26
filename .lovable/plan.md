

## Capitalize Shift Values in Forecast Table

### Problem
Shift values from the API come as lowercase (e.g., "night", "day") but should display as Title Case ("Night", "Day") per UI standards.

### Fix

**File: `src/components/forecast/ForecastBalanceTableRow.tsx`** (line 61)

Capitalize the shift display:

```tsx
// Current
<div className="px-2 text-sm">{row.shift}</div>

// Updated
<div className="px-2 text-sm">
  {row.shift ? row.shift.charAt(0).toUpperCase() + row.shift.slice(1) : '—'}
</div>
```

Single line change, consistent with existing shift capitalization standard used in ShiftCell.

