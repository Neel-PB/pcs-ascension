

## Fix Header Layout: Title Left, Value Right

### Problem
The Hired FTE and Open Reqs headers show label and value clustered together with a small gap instead of being spread across the full width.

### Fix
**File: `src/components/forecast/BalanceTwoPanel.tsx`** — lines 23 and 45

Change `flex items-baseline gap-2` → `flex items-baseline justify-between` on both header divs so the label sits left and the value sits right.

### Files Modified
1. `src/components/forecast/BalanceTwoPanel.tsx` — 2 lines changed

