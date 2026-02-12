

## Fix Rounded Corners on All Filter Triggers

### Problem
The filter bar uses different components for different filters, so the `rounded-lg` change to `SelectTrigger` only affected Region and Market. Facility, Department, and the optional filters still have sharp corners due to separate styling.

### Root Cause

| Filter | Component Used | Current Radius |
|---|---|---|
| Region, Market | `SelectTrigger` | `rounded-lg` (fixed) |
| Facility, Department | `Button variant="outline"` (Popover trigger) | `rounded-md` (6px, from button base) |
| Submarket, Level 2, PSTAT | `SelectTrigger` with explicit `rounded-sm` override | `rounded-sm` (overrides the base) |
| More Filters button | `Button` with explicit `rounded-sm` override | `rounded-sm` |

### Changes

**File: `src/components/staffing/FilterBar.tsx`**
- Facility trigger (line 355): Add `rounded-lg` to the Button className
- Department trigger (line 445): Add `rounded-lg` to the Button className
- Submarket trigger (line 568): Change `rounded-sm` to `rounded-lg`
- Level 2 trigger (line 586): Change `rounded-sm` to `rounded-lg`
- PSTAT trigger (line 604): Change `rounded-sm` to `rounded-lg`

**File: `src/components/staffing/CombinedOptionalFilters.tsx`**
- "More Filters" button (line 51): Change `rounded-sm` to `rounded-lg`

### Result
All filter triggers in the FilterBar will consistently use 8px rounded corners (`rounded-lg`), matching the Helix field spec.

