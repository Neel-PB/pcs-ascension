

## Shorten X-Axis Date Labels for 28-Day Charts

### Problem
The x-axis labels use `"MMM d"` format (e.g., "Feb 15", "Mar 1") which is too wide for 28 daily data points, causing overlap.

### Change

**`src/pages/staffing/StaffingSummary.tsx`** — Line 385

Change the date format from `'MMM d'` to `'MM/dd'`:
```typescript
// Before
return !isNaN(parsed.getTime()) ? format(parsed, 'MMM d') : d;

// After
return !isNaN(parsed.getTime()) ? format(parsed, 'MM/dd') : d;
```

This produces compact labels like `02/15`, `03/01` instead of `Feb 15`, `Mar 1`, fitting all 28 days without overlap.

### Files Changed
- `src/pages/staffing/StaffingSummary.tsx`

