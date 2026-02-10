

# Match Variance Analysis Dividers and Background to Reference Image

## What Changes

**File:** `src/pages/staffing/VarianceAnalysis.tsx`

### 1. Horizontal Group Dividers (line 432)

Change the border color from the current blue-tinted `border-muted-foreground/40` to a neutral gray that matches the reference image:

```
border-t-2 border-muted-foreground/40
```
becomes:
```
border-t-2 border-gray-300 dark:border-gray-600
```

This produces a clean, neutral gray horizontal rule between Overheads, Clinical Staff, Support Staff, and TOTAL -- exactly as shown in the reference image.

### 2. No other changes needed

The existing `!bg-primary/10` row background already matches the light blue tint visible in the reference image. The vertical separators (`border-l-2 border-muted-foreground/30`) also align with the reference. Only the horizontal divider color needs updating.

