

# Compact Shared Position Layout

## Problem

The two-column shared position layout still has too much vertical space due to generous spacing between fields, label gaps, and the comment textarea height.

## Changes

**File: `src/components/editable-table/cells/EditableFTECell.tsx`**

### 1. Reduce outer spacing
- Change `space-y-3` (12px gaps) on the shared motion.div (line 412) to `space-y-2` (8px gaps)

### 2. Reduce grid gap
- Change `gap-3` on the two-column grid (line 415) to `gap-2`

### 3. Tighten inner field spacing
- Change both column containers from `space-y-2` (lines 417, 490) to `space-y-1.5`
- Change all `space-y-1.5` label-to-input gaps (lines 418, 434, 492, 568, 585) to `space-y-1`

### 4. Reduce cascading select gaps
- Change `space-y-1` (line 519) for cascading Market/Facility/Department selects to `space-y-0.5`

### 5. Shrink comment textarea
- Reduce `min-h-[52px]` (line 642) to `min-h-[36px]` for a single-line-height textarea

### 6. Reduce top-level padding
- Change `p-3 space-y-3` on the main content area (line 287) to `p-2.5 space-y-2.5` only when in shared mode -- or apply globally to keep it consistent

### 7. Compact border-left column padding
- Change `pl-3` on the right column (line 490) to `pl-2`

## What Stays the Same

- All field controls, logic, handlers, save/revert
- Two-column grid structure (cols-2)
- Dynamic popover width (440px for shared)
- Standard (non-shared) layout untouched

