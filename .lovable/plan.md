

# Fix Search Field Focus Flicker on Positions Page

## Root Cause

The `SearchField` component in `src/components/ui/search-field.tsx` changes border width on focus:
- Default: `border` (1px)
- Focused: `focus-visible:border-2` (2px)

This 1px increase on all sides causes a visible layout shift (the input shrinks inward and neighboring elements adjust), producing the flicker the user sees when clicking the search on Employees, Contractors, and Open Positions tabs.

## Solution

Use an inset box-shadow or outline to simulate a 2px border on focus without changing the element's box model. This keeps the input dimensions stable.

Replace `focus-visible:border-2 focus-visible:border-primary` with `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset` -- or more simply, keep `border` at 1px always and use a 1px inset shadow to add the extra visual weight:

**Approach**: Change default border to `border-2 border-transparent` (reserve 2px space always) and on focus just swap the color to `border-primary`. This way the box size never changes.

## File to Edit

**`src/components/ui/search-field.tsx`**

### Changes:
- Replace `border border-input` with `border-2 border-input` (always 2px, no size change on focus)
- Replace `focus-visible:border-2 focus-visible:border-primary` with just `focus-visible:border-primary` (color change only)
- Adjust padding by 1px if needed to compensate for the slightly thicker default border

**`src/components/ui/command.tsx`** (CommandInput has the same pattern)

### Changes:
- Same fix: `border border-input` to `border-2 border-input`, remove `focus-visible:border-2`

This ensures all pill-shaped search inputs across the app have a stable size on focus, eliminating the flicker.

