

## Unify All Filter Triggers to Match Region/Market Style

### Problem
Three different filter implementations produce different heights, border widths, and interaction states:
- Region/Market: 2px border, ~48px height, blue chevron rotation, primary border on open
- Facility/Department: 1px border, 40px height (h-10), manually styled chevron
- Submarket/Level2/PSTAT: Override to 1px border, inconsistent with base Select

### Solution
Standardize all filters to match the Region/Market Select trigger style (the "source of truth" defined in `select.tsx`).

### Technical Changes

#### 1. `src/components/staffing/FilterBar.tsx`

**Facility trigger (line 355):** Change Button classes from `border-border` (1px, h-10 py-2) to match Select dimensions:
- Remove the implicit `h-10 py-2` from Button's default size
- Add `border-2 border-input px-4 py-3 text-sm` to match SelectTrigger base
- Add `transition-colors` and conditional `border-primary` when open (matching `data-[state=open]:border-primary`)
- Result: same 2px border, same padding/height as Region/Market

**Department trigger (line 445):** Same changes as Facility above.

**Submarket trigger (line 568):** Remove the override `border border-input` so the base SelectTrigger `border-2 border-input` is preserved. Clean up to just `w-[150px] rounded-lg bg-background disabled:opacity-50 disabled:cursor-not-allowed`.

**Level 2 trigger (line 586):** Same cleanup -- remove `border border-input` override. Keep `w-[200px] rounded-lg bg-background`.

**PSTAT trigger (line 604):** Same cleanup -- remove `border border-input` override. Keep `w-[200px] rounded-lg bg-background`.

#### 2. No changes to `select.tsx` or `button.tsx`
The base Select component already has the correct styling. We just need the FilterBar to stop overriding it for optional filters, and to make the Popover-based triggers (Facility/Department) match by applying equivalent classes.

### Visual Result
All filter triggers will share:
- 2px border (`border-2 border-input`)
- Same height via `px-4 py-3` padding
- Blue chevron (`text-[#1D69D2]`) with 180-degree rotation animation on open
- Primary border color when open/focused
- `rounded-lg` corners
- Facility and Department retain their searchable popover dropdowns

