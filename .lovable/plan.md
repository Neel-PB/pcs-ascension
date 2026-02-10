

# Redesign Active FTE Popover - Cleaner Visual Layout

## Current Issues

The current popover form has deeply nested `AnimatePresence` blocks, inconsistent spacing, and the Shared Position layout with its cascading Market/Facility/Department selects feels cramped and disjointed. Fields appear/disappear with animations that can feel jittery.

## Proposed Improvements

### 1. Structured Section Grouping

Replace the flat field list with clearly grouped sections using subtle dividers:

- **Section 1: Status** -- The status/reason dropdown (always visible)
- **Section 2: FTE Settings** -- Active FTE value + Expiry Date side-by-side where possible
- **Section 3: Shared Position** (conditional) -- Share With badge/selector, Shared FTE, Shared Expiry grouped with a subtle background card
- **Section 4: Comment** -- Optional comment textarea

### 2. Simplified Animations

Replace the multiple nested `AnimatePresence` wrappers with a single content transition. Instead of animating each field individually (which causes layout jitter), the entire dynamic section below the status dropdown will use a single `AnimatePresence` that swaps between two layouts:

- **Standard layout**: FTE select + Expiry date + Comment
- **Shared Position layout**: FTE select + Share With + Shared FTE + Shared Expiry + Comment

### 3. Shared Position Section Card

When "Shared Position" is selected, the sharing fields (Share With, Shared FTE, Shared Expiry) will be visually grouped in a subtle `bg-muted/30 rounded-lg p-2.5` card to clearly delineate them from the main FTE fields.

### 4. Inline FTE + Expiry Row

For non-shared statuses, place the FTE dropdown and Expiry Date button on the same row using a 2-column grid (`grid grid-cols-2 gap-2`) to reduce vertical height and make better use of the 320px width.

### 5. Max Expiry Hint as Tooltip

Move the "(max: Jun 30, 2026)" text from below the label into a tooltip on an info icon, reducing label clutter.

## Technical Changes

**File: `src/components/editable-table/cells/EditableFTECell.tsx`**

- Restructure the JSX from line ~284 to ~631 (the popover content area)
- Replace 5 separate `AnimatePresence` wrappers with a single one keyed on `isSharedPosition`
- Add `grid grid-cols-2 gap-2` layout for FTE + Expiry in standard mode
- Wrap shared position fields in a subtle card container
- Keep all existing state management, handlers, and save logic unchanged
- All functions (`handleSave`, `handleRevert`, `handleStatusChange`, cascading market/facility/department logic, date selection, FTE validation) remain identical

## Visual Before/After

**Before (Standard status):**
```text
+---------------------------+
| Status / Reason    [v]    |
| Active FTE         [v]    |
| Expiry Date               |
| [  Select date...      ]  |
| Comment (optional)        |
| [                       ] |
| [Revert]     [Save]      |
+---------------------------+
```

**After (Standard status):**
```text
+---------------------------+
| Status / Reason    [v]    |
|                           |
| Active FTE   | Expiry     |
| [  0.5  v]   | [Jun 30 ] |
|                           |
| Comment (optional)        |
| [                       ] |
|---------------------------|
| [Revert]     [Save]      |
+---------------------------+
```

**After (Shared Position):**
```text
+---------------------------+
| Status / Reason    [v]    |
|                           |
| Active FTE         [v]    |
| ,.........................|
| . Share With              |
| . [Dept Name badge] [x]  |
| . Shared FTE  | Expiry    |
| . [ 0.5 v]   | [Jun 30]  |
| '.........................|
|                           |
| Comment (optional)        |
| [                       ] |
|---------------------------|
| [Revert]     [Save]      |
+---------------------------+
```

## What Stays the Same

- All business logic (status rules, FTE validation, max expiry calculation)
- All state variables and handlers
- Save/Revert functionality
- Cascading Market/Facility/Department selection for Shared Position
- Badge collapse behavior for selected department
- Calendar lazy loading
- Popover positioning strategy (avoidCollisions, sideOffset, collisionPadding)
- Comment field with 500 char limit

