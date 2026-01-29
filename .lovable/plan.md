

# Dynamic Height Animation for Active FTE Popover

## Problem

The current implementation uses `min-h-[280px]` to prevent popover repositioning, but this creates excessive empty space when showing fewer fields (like FMLA status which only has 3 fields as shown in the screenshot).

## Solution: Animated Height with `motion.div` Layout

Replace the fixed min-height container with Framer Motion's `layout` animation that smoothly animates height changes. Use a single `AnimatePresence` with proper key management to handle the transition between different form states.

---

## Technical Changes

### File: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Replace Fixed Min-Height with Animated Container

Remove `min-h-[280px]` and instead use `motion.div` with `layout` prop to animate height changes smoothly.

```typescript
// Line 291 - BEFORE:
<div className="min-h-[280px] relative overflow-hidden mt-3">

// AFTER:
<motion.div 
  layout
  transition={{ 
    layout: { 
      type: "spring", 
      stiffness: 500, 
      damping: 35 
    }
  }}
  className="relative overflow-hidden mt-3"
>
```

#### Change 2: Add Layout Animation to Child Sections

Wrap each conditional section in `motion.div` with `layout` prop so height transitions animate smoothly:

```typescript
// For the Active FTE dropdown (line 295-317):
<AnimatePresence mode="sync">
  {editStatus && (
    <motion.div
      key="fte-field"
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        opacity: { duration: 0.15 },
        layout: { type: "spring", stiffness: 500, damping: 35 }
      }}
      className="space-y-1.5"
    >
      {/* Active FTE dropdown */}
    </motion.div>
  )}
</AnimatePresence>

// For non-shared Expiry Date (line 321-377):
<AnimatePresence mode="sync">
  {editStatus && !isSharedPosition && (
    <motion.div
      key="expiry-field"
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        opacity: { duration: 0.15 },
        layout: { type: "spring", stiffness: 500, damping: 35 }
      }}
      className="space-y-1.5 mt-3"
    >
      {/* Expiry Date field */}
    </motion.div>
  )}
</AnimatePresence>

// For Shared Position fields (line 380-570):
<AnimatePresence mode="sync">
  {isSharedPosition && (
    <motion.div
      key="shared-fields"
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        opacity: { duration: 0.15 },
        layout: { type: "spring", stiffness: 500, damping: 35 }
      }}
      className="space-y-3 mt-3"
    >
      {/* All shared position fields */}
    </motion.div>
  )}
</AnimatePresence>
```

#### Change 3: Close the Wrapper with `motion.div`

```typescript
// Line 572 - BEFORE:
</div>

// AFTER:
</motion.div>
```

#### Change 4: Add `layout` to Nested Animated Elements

For the cascading selects that animate in/out, add `layout` prop to ensure parent container animates smoothly:

```typescript
// Lines 453-474 (facility select) and 480-501 (department select):
<motion.div
  key="facility-select"
  layout
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 'auto' }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ 
    opacity: { duration: 0.12 },
    height: { duration: 0.15 },
    layout: { type: "spring", stiffness: 500, damping: 35 }
  }}
  className="overflow-hidden"
>
```

---

## Animation Behavior

| State | Fields Shown | Height | Transition |
|-------|--------------|--------|------------|
| FMLA selected | Status + Active FTE + Expiry | ~180px | Smooth spring shrink |
| Shared Position | Status + FTE + Share With (3) + Shared FTE + Shared Expiry | ~350px | Smooth spring grow |
| Cascading select | +1 dropdown at a time | +28px each | Accordion-style |

---

## Why This Works

1. **`layout` prop**: Tells Framer Motion to automatically animate this element's position/size when it changes
2. **Spring physics**: `stiffness: 500, damping: 35` creates snappy but smooth transitions (matching existing tab indicator pattern from memory)
3. **No fixed height**: Container naturally fits content, animation handles the transition
4. **Popover stability**: The spring animation is fast enough that Radix doesn't reposition mid-animation

---

## Expected Visual Result

- **FMLA/LOA**: Compact form with just 3 fields, no wasted space
- **Switch to Shared Position**: Form smoothly expands to accommodate all fields
- **Cascading selects**: Each dropdown slides in with height animation
- **Switch back**: Form smoothly contracts to original size

