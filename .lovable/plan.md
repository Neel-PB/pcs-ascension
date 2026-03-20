

## Problem

1. **Uneven padding**: `CardContent` uses `p-4 pr-10` — top/bottom are 16px but right is 40px to make room for icons. The visual result is unbalanced padding.
2. **Eye icon centering**: When only the Eye icon is present (no chart icon), the icon container uses `top-1/2 -translate-y-1/2` which vertically centers the single icon. User wants the Eye icon to stay in its fixed bottom position (below where the chart icon would be), not float to center.

## Fix

**File: `src/components/staffing/KPICard.tsx`**

1. **Uniform padding**: Change `p-4 pr-10` to `p-3 pr-9` (12px all sides, 36px right for icon space) — this equalizes the visible padding while still reserving icon space.

2. **Fix icon positioning**: Change from `top-1/2 -translate-y-1/2` (