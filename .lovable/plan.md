

## Equalize KPI Card Padding

### Problem
Currently `CardContent` uses `p-3 pr-9` — the right side has extra padding (36px) to make room for the action icons, while top/bottom/left are 12px. This creates uneven visual spacing.

### Solution
**File: `src/components/staffing/KPICard.tsx`** — Line 96

Change `p-3 pr-9` to `p-3` (uniform 12px on all sides) and reposition the action icons to sit inside the card with absolute positioning that works within the uniform padding. The icons already use `absolute right-3 bottom-3`, so they'll overlap slightly with content — we keep that but ensure the value text doesn't run into icons by adding a small `pr-6` or using `max-w` on the value text instead.

Actually, the cleaner approach: use uniform `p-4` (16px all sides) for better visual balance, and keep the icons absolutely positioned at `right-2 bottom-2`. The title and value text naturally won't extend to the far right edge.

**Change:**
```
// Line 96: from
p-3 pr-9 relative flex flex-col justify-center min-h-[90px]

// to
p-4 relative flex flex-col justify-center min-h-[90px]
```

Also update icon positioning from `right-3 bottom-3` to `right-2 bottom-2` to stay proportional within the uniform padding.

Single file, two line changes.

