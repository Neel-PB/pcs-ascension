

# Fix: Stabilize Popover Position When Selecting Shared Position

## Problem

When selecting "Shared Position" status, the form content switches from:
- **Non-shared mode**: Active FTE + Expiry Date (2 fields)
- **Shared mode**: Active FTE + Share With (3 cascading selects) + Shared FTE + Shared Expiry (5+ fields)

This height change causes the popover to reposition/jump, creating a jarring experience.

---

## Root Cause

1. **Dynamic height + collision detection**: The popover has `avoidCollisions={true}`, so when content grows, Radix recalculates positioning
2. **AnimatePresence `mode="wait"`**: Fields exit before new ones enter, causing a momentary collapse
3. **No minimum height**: The popover shrinks/grows freely with content

---

## Solution: Fixed Height Container with Internal Scrolling

Reserve consistent vertical space for the form content so the popover dimensions stay stable regardless of which status is selected.

### Technical Changes

**File**: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Use Fixed/Min Height Container

Wrap the dynamic content area in a container with a consistent minimum height that accommodates the largest possible form state (Shared Position with all fields).

```typescript
// Around line 272-273, wrap the dynamic content
<div className="p-3">
  {/* Status dropdown - always visible, no animation needed */}
  <div className="space-y-1.5">
    <Label className="text-xs font-medium">Status / Reason</Label>
    <Select ...>...</Select>
  </div>

  {/* Dynamic content area with stable height */}
  <div className="min-h-[280px] relative">
    {/* All animated fields go here */}
  </div>

  {/* Actions - outside stable area */}
  <div className="flex gap-2 pt-3">...</div>
</div>
```

#### Change 2: Switch from `mode="wait"` to `mode="sync"`

Allow overlapping transitions so fields don't collapse before new ones appear:

```typescript
// Change all AnimatePresence mode from "wait" to "sync" or remove mode entirely
<AnimatePresence mode="sync">
  {editStatus && !isSharedPosition && (
    <motion.div ...>
      {/* Expiry Date field */}
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence mode="sync">
  {isSharedPosition && (
    <motion.div ...>
      {/* Shared Position fields */}
    </motion.div>
  )}
</AnimatePresence>
```

#### Change 3: Use Absolute Positioning for Transitions

For smoother transitions, use absolute positioning during animations so fields overlay during transition rather than push each other:

```typescript
// Dynamic content wrapper
<div className="min-h-[280px] relative overflow-hidden">
  <AnimatePresence mode="sync">
    {editStatus && (
      <motion.div
        key="fte-field"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="pt-3"
      >
        {/* Active FTE dropdown */}
      </motion.div>
    )}
  </AnimatePresence>

  {/* Non-shared fields */}
  <AnimatePresence mode="sync">
    {editStatus && !isSharedPosition && (
      <motion.div
        key="expiry-field"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="pt-3"
      >
        {/* Expiry Date */}
      </motion.div>
    )}
  </AnimatePresence>

  {/* Shared Position fields */}
  <AnimatePresence mode="sync">
    {isSharedPosition && (
      <motion.div
        key="shared-fields"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="pt-3"
      >
        {/* All shared position fields */}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

#### Change 4: Remove Layout Animation from Actions

The `layout` prop on the actions div causes additional position calculations:

```typescript
// Line 573 - remove layout prop
<div className="flex gap-2 pt-3 border-t">  {/* No motion.div needed */}
```

---

## Visual Behavior After Fix

| Action | Before | After |
|--------|--------|-------|
| Select "Shared Position" | Popover jumps, fields collapse then expand | Smooth crossfade, popover stays in place |
| Switch away from "Shared Position" | Popover shrinks abruptly | Content fades with consistent container height |
| Cascading selects appear | Each pushes content down | Each appears within stable bounds |

---

## Animation Design

Use horizontal slide transitions to differentiate between non-shared and shared field sets:

- **Non-shared → Shared**: Non-shared slides left and fades out, Shared slides in from right
- **Shared → Non-shared**: Reverse direction

This creates a "page switching" metaphor that feels intentional rather than the popover "breaking".

---

## Testing Checklist

1. Click Active FTE cell → select "LOA" → verify smooth animation
2. Change to "Shared Position" → verify popover doesn't jump
3. Complete cascading selection → verify form stays stable
4. Switch from "Shared Position" to "FMLA" → verify smooth transition
5. Test on rows near top and bottom of table → popover positioning consistent

