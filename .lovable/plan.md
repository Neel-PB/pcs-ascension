

# Align Dropdown Menu and User Menu to Helix Menu Spec

## Helix Menu Spec Summary (from PDF)

| Property | Helix Value | Current Implementation |
|----------|------------|----------------------|
| Width | 210px | `min-w-[8rem]` (128px) / `w-56` (224px) on user menu |
| Corner radius | rounded-sm (8px) | `rounded-md` (10px) |
| Top padding | 12px | `p-1` (4px all sides) |
| Bottom padding | 4px | `p-1` (4px all sides) |
| Left/Right padding | 0 (items provide 16px) | `p-1` (4px) + item `px-2` (8px) = 12px total |
| Item horizontal padding | 16px | `px-2` (8px) |
| Item vertical padding | ~8px (flush between items) | `py-1.5` (6px) |
| Item corner radius | None (flush, rectangular) | `rounded-sm` (individual rounded corners) |
| Separator | Full-width divider | `-mx-1` (compensates container padding) |
| Outline variant | Optional visible border | Always has `border` |

## Plan

### 1. `src/components/ui/dropdown-menu.tsx` -- Update base component styling

**DropdownMenuContent** (container):
- Corner radius: `rounded-md` to `rounded-sm` (8px per Helix)
- Padding: `p-1` to `pt-3 pb-1 px-0` (12px top, 4px bottom, no horizontal -- items handle their own 16px padding)
- Min width: `min-w-[8rem]` to `min-w-[210px]` (210px per Helix)
- Same changes for `DropdownMenuSubContent`

**DropdownMenuItem** (option items):
- Padding: `px-2 py-1.5` to `px-4 py-2` (16px horizontal, 8px vertical)
- Remove: `rounded-sm` (items should be flush/rectangular per Helix, no individual rounding)

**DropdownMenuSubTrigger**:
- Match item styling: `px-2 py-1.5` to `px-4 py-2`, remove `rounded-sm`

**DropdownMenuLabel** (header):
- Padding: `px-2 py-1.5` to `px-4 py-1.5` (16px horizontal to match spec's header alignment)

**DropdownMenuSeparator**:
- Margin: `-mx-1 my-1` to `mx-0 my-1` (no negative margin needed since container has no horizontal padding)

**DropdownMenuCheckboxItem / DropdownMenuRadioItem**:
- Update horizontal padding from `pl-8 pr-2` to `pl-8 pr-4`
- Remove `rounded-sm`

### 2. `src/components/shell/AppHeader.tsx` -- User menu refinement

- Width: `w-56` (224px) to `w-[210px]` (exact Helix spec)
- The label (name + email) and items (Profile, Log out) will inherit the new base styles automatically

### 3. No changes to ContextMenu (separate component)

ContextMenu is a different interaction pattern (right-click) and not the user's current focus. Can be updated in a follow-up if desired.

## Files to Edit

1. **`src/components/ui/dropdown-menu.tsx`** -- Base dropdown styling (6 sub-components updated)
2. **`src/components/shell/AppHeader.tsx`** -- User menu width from `w-56` to `w-[210px]`

## What Changes Visually

- All dropdown menus will have 8px corner radius (slightly tighter), 210px minimum width, and 16px internal horizontal padding
- Items will be flush/rectangular instead of individually rounded
- The user menu will be exactly 210px wide
- Header labels (user name/email) will be properly aligned with 16px left padding
- Overall appearance matches the Helix "Menu" component spec

