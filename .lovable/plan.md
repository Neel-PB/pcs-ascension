
## Fix Employed Productive FTEs Font Size

### Problem
The "Employed Productive FTEs" KPI card shows its value "35.3 / 5.6" in a small font (text-sm) instead of the large bold font (text-2xl font-bold) used by all other KPI cards.

### Root Cause
In `KPICard.tsx` line 125, the placeholder detection logic uses:
```ts
const isPlaceholder = typeof value === 'string' && isNaN(Number(String(value).replace('%', '')));
```
The value `"35.3 / 5.6"` fails the `Number()` parse due to the slash, so it's incorrectly classified as a placeholder (like "Select Department" or "No Override Found"), which applies `text-sm` instead of `text-2xl font-bold`.

### Fix

#### `src/components/staffing/KPICard.tsx`
Update the placeholder detection to be smarter -- instead of checking if the value parses as a single number, check if it matches known placeholder strings or if it contains at least one digit (real data always has numbers):

```ts
const isPlaceholder = typeof value === 'string' && !/\d/.test(value);
```

This way:
- `"35.3 / 5.6"` -- contains digits, NOT a placeholder (gets text-2xl)
- `"13.9%"` -- contains digits, NOT a placeholder (gets text-2xl)
- `"Select Department"` -- no digits, IS a placeholder (gets text-sm)
- `"No Override Found"` -- no digits, IS a placeholder (gets text-sm)

### KPI Drag and Drop
The section-level drag and drop (reordering the FTE, Volume, and Productive Resources sections) is still implemented and functional. The drag handle appears as a vertical bar on the left side of each section title on hover. No code changes needed here -- it should work as before.

### Files Changed
- `src/components/staffing/KPICard.tsx` -- fix placeholder detection logic (1 line change)
