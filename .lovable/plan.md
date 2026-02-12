

## Fix Sonner Toast to Match Helix Snackbar Spec Exactly

### What's Wrong

Comparing the Helix Snackbar spec (from the PDF) with our current CSS, there are several spacing and styling mismatches:

| Property | Helix Spec | Current Code | Fix |
|---|---|---|---|
| Left padding | 12px | 16px (`px-4`) | Change to `pl-3` (12px) |
| Right padding | 4px | 16px (`px-4`) | Change to `pr-1` (4px) |
| Top/Bottom padding | 12px | 12px (`py-3`) | Already correct |
| Container border-radius | ~8px (rounded) | 12px (`rounded-xl`) | Change to `rounded-lg` (8px) |
| Close button border-radius | 12px | 9999px (full circle) | Change to `12px` |
| Close button size | Icon Button (per spec) | 24px | Keep 24px |
| Layout order | Icon, Text, ACTION, Close X | Correct order | Already correct |
| Gap between items | 12px | 12px (`gap-3`) | Already correct |

### Files to Change

**`src/components/ui/sonner.tsx`**
- Update toast className: change `px-4` to `pl-3 pr-1`, change `rounded-xl` to `rounded-lg`
- Update close button className: change `rounded-full` to `rounded-[12px]`

**`src/index.css`**
- Update `[data-sonner-toast] [data-close-button]` rule: change `border-radius: 9999px` to `border-radius: 12px`

### Technical Details

Changes in `sonner.tsx` toast classNames:
- `group-[.toaster]:rounded-xl` becomes `group-[.toaster]:rounded-lg`
- `group-[.toaster]:px-4` becomes `group-[.toaster]:pl-3 group-[.toaster]:pr-1`
- Close button: `group-[.toast]:!rounded-full` becomes `group-[.toast]:!rounded-[12px]`

Changes in `index.css`:
- `border-radius: 9999px !important;` becomes `border-radius: 12px !important;`

These are small, surgical CSS changes -- no structural or logic changes needed.

