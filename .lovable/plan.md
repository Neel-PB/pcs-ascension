

## Expand Employee Type Abbreviations in Headcount Breakdown

### Problem
The headcount breakdown shows raw abbreviations ("FT", "PT", "PRN") which aren't user-friendly. These should display as full labels: "Full Time", "Part Time", "PRN".

### Fix

**File: `src/components/forecast/BalanceTwoPanel.tsx`** — `HeadcountBreakdown` component

Add a label map and use it when rendering:

```typescript
const employeeTypeLabels: Record<string, string> = {
  FT: 'Full Time',
  PT: 'Part Time',
  PRN: 'PRN',
};

// In render:
const label = employeeTypeLabels[type] || type;
```

Also apply the previously approved aggregation logic (grouping duplicate employee types by summing HC and FTE) in the same change.

### Display format per row
```
Full Time: 129 HC    = 128.8 FTE
PRN: 5 HC            = 5.0 FTE
```

### Files Modified
1. `src/components/forecast/BalanceTwoPanel.tsx` — label map + aggregation

