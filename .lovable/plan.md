

# Ultra-Compact Shared Position Layout

## Problem

From the screenshot, the shared position form has visible excess vertical spacing between every field, generous padding around edges, and the layout feels loose/odd. We need to squeeze out every unnecessary pixel.

## Changes

**File: `src/components/editable-table/cells/EditableFTECell.tsx`**

### 1. Minimize top-level padding (line 287)
- Change shared mode padding from `p-2.5 space-y-2.5` to `p-2 space-y-1.5`

### 2. Remove gap between Status/Reason label and its select (line 289)
- Change `space-y-1.5` to `space-y-0.5` for the Status/Reason wrapper (shared mode only -- or globally since it's tight enough)

### 3. Reduce shared motion.div outer gap (line 412)
- Change `space-y-2` to `space-y-1.5`

### 4. Reduce grid gap (line 415)
- Change `gap-2` to `gap-1.5`

### 5. Tighten left column field spacing (line 417)
- Change `space-y-1.5` to `space-y-1`

### 6. Remove label-to-input gaps (lines 418, 434, 492, 568, 585)
- Change all remaining `space-y-1` to `space-y-0.5` -- this puts the label almost touching its input, which is the tightest readable spacing

### 7. Reduce right column padding (line 490)
- Change `pl-2` to `pl-1.5`

### 8. Right column field spacing (line 490)
- Change `space-y-1.5` to `space-y-1`

### 9. Comment section (line 634)
- Change `space-y-1.5` to `space-y-0.5`
- Keep `min-h-[36px]` (already single-line)

### 10. Footer padding (line 652)
- Change `p-3 pt-3` to `p-2 pt-2` for the action buttons area

## Summary of spacing values after changes

| Element | Before | After |
|---------|--------|-------|
| Top-level padding | p-2.5, space-y-2.5 | p-2, space-y-1.5 |
| Status label-to-select | space-y-1.5 | space-y-0.5 |
| Shared outer gap | space-y-2 | space-y-1.5 |
| Grid gap | gap-2 | gap-1.5 |
| Left column fields | space-y-1.5 | space-y-1 |
| Label-to-input (all) | space-y-1 | space-y-0.5 |
| Right column fields | space-y-1.5 | space-y-1 |
| Right column pl | pl-2 | pl-1.5 |
| Comment section | space-y-1.5 | space-y-0.5 |
| Footer | p-3 pt-3 | p-2 pt-2 |

## What Stays the Same

- All field controls, logic, handlers, save/revert
- Two-column grid structure and 440px popover width
- Standard (non-shared) layout untouched
- All select heights (h-7) and font sizes (text-xs)

