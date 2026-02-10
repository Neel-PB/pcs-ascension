

# Fix Missing Divider Between Region Rows in Variance Analysis

## Problem

When viewing at the Regions level (default view), Region 1 and Region 2 are both group rows (`!bg-primary/10`) sitting directly next to each other when collapsed. The current divider (`border-t-2 border-primary/20`) is a very light blue line on a light blue background, making it nearly invisible. In the FTE Skill Shift Analysis, group rows always have child rows between them providing natural visual separation -- but in Variance Analysis, consecutive group rows touch each other.

## Fix

**File:** `src/pages/staffing/VarianceAnalysis.tsx` (line 432)

Increase the divider opacity from `border-primary/20` to `border-primary/40` so the line is clearly visible even between two adjacent blue-tinted group rows:

```
border-t-2 border-primary/20
```
becomes:
```
border-t-2 border-primary/40
```

This keeps the same light-blue color family (matching the FTE Skill Shift Analysis) but makes it strong enough to be visible between consecutive group rows. When group rows have child rows between them (like in the submarket view), the divider will still look consistent since child rows have a white background providing natural contrast.

