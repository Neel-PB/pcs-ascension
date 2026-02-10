

# Fix Shared Position Layout Overflow

## Problem

When "Shared Position" is selected, the form has too many stacked fields (Active FTE + Share With cascading selects + Shared FTE + Shared Expiry + Comment), causing the popover to overflow vertically.

## Solution

Make the shared layout more compact by:

1. **Inline Active FTE + Expiry on one row** (same as standard layout) -- currently Active FTE is full-width in shared mode, wasting space
2. **Move Shared FTE + Shared Expiry into a 2-column grid inside the card** (already done, keep it)
3. **Make the Share With cascading selects more compact** -- stack Market/Facility/Department in a tighter layout with smaller gaps
4. **Apply inline X clear button** for Shared Expiry (same fix as standard expiry) -- currently the "Clear" text button stacks below, adding extra height
5. **Reduce inner padding/spacing** in the shared card from `p-2.5 space-y-2.5` to `p-2 space-y-2`

## Technical Changes

**File: `src/components/editable-table/cells/EditableFTECell.tsx`**

### Change 1: Replace full-width Active FTE with inline FTE + Expiry grid (lines 414-429)
Instead of Active FTE being full-width, use the same `grid grid-cols-2 gap-2 items-end` pattern as the standard layout, putting Active FTE and Expiry Date side-by-side (not inside the shared card).

### Change 2: Tighten the shared card (line 432)
Change `p-2.5 space-y-2.5` to `p-2 space-y-2` for tighter spacing.

### Change 3: Remove Shared Expiry from the card, keep only Share With + Shared FTE inside the card (lines 509-570)
Restructure so the card only contains:
- Share With (badge or cascading selects)
- Shared FTE (single select, full-width inside card)

The Shared Expiry moves outside the card, displayed as a standalone field below.

### Change 4: Fix Shared Expiry inline clear (lines 559-568)
Replace the stacked "Clear" text button with an inline X icon button (same pattern as the standard expiry fix).

### Change 5: Reduce cascading select gaps (line 461)
Change `space-y-1.5` to `space-y-1` for the Market/Facility/Department cascading selects.

## Visual After

```text
+---------------------------+
| Status / Reason    [v]    |
|                           |
| Active FTE   | Expiry     |
| [  0.5  v]   | [Jun 30 x]|
| ,.........................|
| . Share With              |
| . [Dept Name badge] [x]  |
| . Shared FTE    [0.3 v]  |
| '.........................|
| Shared Expiry  [Jun 30 x]|
|                           |
| Comment (optional)        |
| [                       ] |
|---------------------------|
| [Revert]     [Save]      |
+---------------------------+
```

## What Stays the Same

- All business logic, state management, handlers
- Cascading Market/Facility/Department selection logic
- Badge collapse behavior
- Save/Revert functionality
- Calendar lazy loading
- Popover positioning strategy

