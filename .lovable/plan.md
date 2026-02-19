

## Fix: Positions Tour Not Starting - Missing `data-tour="filter-bar"` Attribute

### Root Cause

The Positions tour's first step targets `[data-tour="filter-bar"]`, but this attribute is **missing** from the PositionsPage. On the Staffing page, the FilterBar wrapper has `data-tour="filter-bar"` (StaffingSummary.tsx line 482), but on the Positions page (PositionsPage.tsx line 98), the wrapper div has no `data-tour` attribute.

Since the very first step cannot find its target element, Joyride silently fails to render anything -- making it look like the tour doesn't work at all.

### Fix

**File: `src/pages/positions/PositionsPage.tsx`** (line 98)

Add `data-tour="filter-bar"` to the FilterBar wrapper div:

```text
Before:  <div className="flex-shrink-0 py-2">
After:   <div className="flex-shrink-0 py-2" data-tour="filter-bar">
```

This is a one-line change. All other `data-tour` attributes already exist:
- `positions-tabs` -- on line 116 of PositionsPage.tsx
- `positions-search`, `positions-refresh`, `positions-filter-btn`, `positions-table` -- in EmployeesTab.tsx (and the other tab components)
- `positions-active-fte-cell`, `positions-shift-cell` -- dynamically added in EmployeesTab.tsx
- `positions-comments` -- in the column config

### Files Changed

| File | Change |
|------|--------|
| `src/pages/positions/PositionsPage.tsx` | Add `data-tour="filter-bar"` to FilterBar wrapper div (line 98) |

