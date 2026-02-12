

## Fix Filter Flickering on Region and Market Selects

### Root Cause

The `SelectTrigger` component in `src/components/ui/select.tsx` has `transition-all` in its class list. When a Select opens, it changes from a 1px border to a 2px border (`data-[state=open]:border-b-2 data-[state=open]:border-primary`). The `transition-all` animates this border-width change, causing a visible flicker/jump.

Facility and Department filters don't flicker because they use Popover + Command (combobox pattern) instead of the Select component.

### Fix

**File: `src/components/ui/select.tsx`**

Replace `transition-all` with `transition-colors` on the `SelectTrigger`. This allows color transitions (like border color changes) to remain smooth while preventing the border-width change from being animated.

Additionally, to fully eliminate the layout shift from border width changing (1px to 2px), switch to using a constant `border-2` and control visibility via border color instead:
- Default state: `border-2 border-input` (or `border-transparent` on one side)
- Open state: `data-[state=open]:border-primary`

This ensures zero layout shift since the border width never changes.

### Summary of Change
- Line 21 of `select.tsx`: Replace `border border-input ... transition-all data-[state=open]:border-b-2 data-[state=open]:border-primary` with `border-2 border-input ... transition-colors data-[state=open]:border-primary`
- Also update the focus state from `focus:border-b-2 focus:border-primary` to just `focus:border-primary` since border is already 2px

This matches the existing Helix UI focus state spec (constant 2px border width to prevent layout shifts).
