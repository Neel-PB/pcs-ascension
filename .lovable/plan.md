

## Fix: "More Filters" button height to match other filter triggers

The "More Filters" dropdown trigger is shorter than the primary filter triggers because it uses the default Button outline styling (`border` = 1px, default padding) instead of the standardized filter trigger styling.

### Change

**File: `src/components/staffing/CombinedOptionalFilters.tsx`** (line 54)

Update the Button's className to match the filter trigger standard:
- Change `border border-input` to `border-2 border-input` (constant 2px border)
- Add `px-4 py-3` padding to match the ~48px height of other filter triggers
- Keep everything else (icon, label, chevron, badge) as-is

This aligns the "More Filters" trigger with the established filter trigger consistency rules used by Region, Market, Facility, and Department selects.

