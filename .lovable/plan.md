

# Match Variance Analysis Dividers to FTE Skill Shift Analysis

## Problem

The two tables use different divider colors:
- **FTE Skill Shift Analysis**: `border-t-2 border-primary/20` (light blue, matching the row background)
- **Variance Analysis**: `border-t-2 border-gray-300 dark:border-gray-600` (neutral gray)

Both reference images show the same subtle light-blue divider that blends with the blue-tinted group row background. The Variance Analysis needs to match.

## Fix

**File:** `src/pages/staffing/VarianceAnalysis.tsx` (line 432)

Change:
```
border-t-2 border-gray-300 dark:border-gray-600
```
To:
```
border-t-2 border-primary/20
```

This aligns the Variance Analysis group row dividers with the FTE Skill Shift Analysis styling, producing the same subtle light-blue horizontal rule visible in both reference images.

