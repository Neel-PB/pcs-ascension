

# Add Content Animations to Active FTE Popover

## Current State

The popover currently animates:
- **Height**: `height: 0` to `height: "auto"` (working)
- **Opacity**: `opacity: 0` to `opacity: 1` (working)

But the content itself doesn't have any movement - it just fades in/out while the container resizes.

## Enhancement: Add Slide/Transform Animations

Add `y` (vertical slide) animations to content sections so they slide up/down while fading in/out, creating a more polished feel.

---

## Technical Changes

### File: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Add Y-Slide to Active FTE Field (Lines 306-316)

```typescript
// BEFORE:
<motion.div
  key="fte-field"
  layout
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ 
    opacity: { duration: 0.15 },
    height: { type: "spring", stiffness: 500, damping: 35 },
    layout: { type: "spring", stiffness: 500, damping: 35 }
  }}
  className="space-y-1.5 overflow-hidden"
>

// AFTER:
<motion.div
  key="fte-field"
  layout
  initial={{ opacity: 0, height: 0, y: -8 }}
  animate={{ opacity: 1, height: "auto", y: 0 }}
  exit={{ opacity: 0, height: 0, y: -8 }}
  transition={{ 
    opacity: { duration: 0.15 },
    y: { type: "spring", stiffness: 500, damping: 35 },
    height: { type: "spring", stiffness: 500, damping: 35 },
    layout: { type: "spring", stiffness: 500, damping: 35 }
  }}
  className="space-y-1.5 overflow-hidden"
>
```

#### Change 2: Add Y-Slide to Expiry Date Field (Lines 339-350)

```typescript
// BEFORE:
<motion.div
  key="expiry-field"
  layout
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ 
    opacity: { duration: 0.15 },
    height: { type: "spring", stiffness: 500, damping: 35 },
    layout: { type: "spring", stiffness: 500, damping: 35 }
  }}
  className="space-y-1.5 mt-3 overflow-hidden"
>

// AFTER:
<motion.div
  key="expiry-field"
  layout
  initial={{ opacity: 0, height: 0, y: -8 }}
  animate={{ opacity: 1, height: "auto", y: 0 }}
  exit={{ opacity: 0, height: 0, y: -8 }}
  transition={{ 
    opacity: { duration: 0.15 },
    y: { type: "spring", stiffness: 500, damping: 35 },
    height: { type: "spring", stiffness: 500, damping: 35 },
    layout: { type: "spring", stiffness: 500, damping: 35 }
  }}
  className="space-y-1.5 mt-3 overflow-hidden"
>
```

#### Change 3: Add X-Slide to Shared Position Fields (Lines 403-414)

Use horizontal slide (`x`) for the shared position section to create a "page switch" effect when transitioning between non-shared and shared modes:

```typescript
// BEFORE:
<motion.div
  key="shared-fields"
  layout
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ 
    opacity: { duration: 0.15 },
    height: { type: "spring", stiffness: 500, damping: 35 },
    layout: { type: "spring", stiffness: 500, damping: 35 }
  }}
  className="space-y-3 mt-3 overflow-hidden"
>

// AFTER:
<motion.div
  key="shared-fields"
  layout
  initial={{ opacity: 0, height: 0, x: 12 }}
  animate={{ opacity: 1, height: "auto", x: 0 }}
  exit={{ opacity: 0, height: 0, x: -12 }}
  transition={{ 
    opacity: { duration: 0.15 },
    x: { type: "spring", stiffness: 500, damping: 35 },
    height: { type: "spring", stiffness: 500, damping: 35 },
    layout: { type: "spring", stiffness: 500, damping: 35 }
  }}
  className="space-y-3 mt-3 overflow-hidden"
>
```

#### Change 4: Add Y-Slide to Cascading Selects (Lines 479-489 and 511-521)

```typescript
// Facility Select - BEFORE:
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

// AFTER:
<motion.div
  key="facility-select"
  layout
  initial={{ opacity: 0, height: 0, y: -6 }}
  animate={{ opacity: 1, height: 'auto', y: 0 }}
  exit={{ opacity: 0, height: 0, y: -6 }}
  transition={{ 
    opacity: { duration: 0.12 },
    y: { type: "spring", stiffness: 500, damping: 35 },
    height: { type: "spring", stiffness: 500, damping: 35 },
    layout: { type: "spring", stiffness: 500, damping: 35 }
  }}
  className="overflow-hidden"
>
```

Apply the same pattern to Department Select (lines 511-521).

---

## Animation Summary

| Element | Enter Animation | Exit Animation |
|---------|-----------------|----------------|
| Active FTE | Fade in + slide down from -8px | Fade out + slide up to -8px |
| Expiry Date | Fade in + slide down from -8px | Fade out + slide up to -8px |
| Shared Fields | Fade in + slide from right (12px) | Fade out + slide left (-12px) |
| Facility/Dept | Fade in + slide down from -6px | Fade out + slide up to -6px |

---

## Visual Result

- **Status selection**: Active FTE field slides down smoothly from above
- **LOA/FMLA**: Expiry date slides down beneath the FTE field
- **Switch to Shared Position**: Expiry slides out left, Shared section slides in from right (page-switch feel)
- **Cascading selects**: Each dropdown slides down as it appears
- **All transitions**: Combined with height animation for smooth container resizing

