

## Problem

The chart and eye icons are anchored to `top-3`, placing them at the top-right of the card. User wants them at the bottom-right instead.

## Fix

**File: `src/components/staffing/KPICard.tsx`** (line 103)

Change the icon container positioning from `top-3` to `bottom-3`:

```
- <div className="absolute right-3 top-3 flex flex-col items-center gap-1">
+ <div className="absolute right-3 bottom-3 flex flex-col items-center gap-1">
```

Single line change. Icons will anchor to the bottom-right corner of the card.

