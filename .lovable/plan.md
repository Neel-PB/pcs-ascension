

# Stronger Row Dividers for Region/Group Rows

## What Changes

**File:** `src/pages/staffing/VarianceAnalysis.tsx`

**Line 432** -- Update the `GroupRow` border class from the current subtle `border-t border-border` to a thicker, more visible divider matching the reference image:

Change:
```
border-t border-border
```
To:
```
border-t-2 border-muted-foreground/40
```

This gives a 2px solid border with enough contrast (40% opacity foreground color) to clearly separate region groups, matching the visual weight shown in the first reference image where each group (Overheads, Clinical Staff, Support Staff, TOTAL) has a distinct horizontal line above it.

