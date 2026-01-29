
# Stabilize Form Layout During Animations

## Problem

The current implementation uses Framer Motion's `layout` prop extensively, which causes form elements to shift position when:
1. Selecting a status shows/hides the Active FTE field
2. Switching between Shared Position and non-shared modes
3. Cascading selects appear/disappear during "Share With" selection

The `layout` prop animates an element's position when its layout changes. Combined with `height: 0` → `height: "auto"` animations, this causes fields to "slide into" new positions rather than staying fixed.

---

## Solution

Remove the `layout` prop from child elements and rely only on `height` + `opacity` animations. The container will naturally expand/contract, but content inside won't slide around.

---

## Technical Changes

### File: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Remove `layout` from Active FTE Field (Line 314)

```typescript
// BEFORE:
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

// AFTER:
<motion.div
  key="fte-field"
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ 
    opacity: { duration: 0.15 },
    height: { type: "spring", stiffness: 500, damping: 35 }
  }}
```

#### Change 2: Remove `layout` from Expiry Date Field (Line 348)

```typescript
// BEFORE:
<motion.div
  key="expiry-field"
  layout
  initial={{ opacity: 0, height: 0, y: -8 }}
  ...

// AFTER:
<motion.div
  key="expiry-field"
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ 
    opacity: { duration: 0.15 },
    height: { type: "spring", stiffness: 500, damping: 35 }
  }}
```

#### Change 3: Remove `layout` and `x` slide from Shared Position Fields (Line 413)

```typescript
// BEFORE:
<motion.div
  key="shared-fields"
  layout
  initial={{ opacity: 0, height: 0, x: 12 }}
  animate={{ opacity: 1, height: "auto", x: 0 }}
  exit={{ opacity: 0, height: 0, x: -12 }}
  ...

// AFTER:
<motion.div
  key="shared-fields"
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ 
    opacity: { duration: 0.15 },
    height: { type: "spring", stiffness: 500, damping: 35 }
  }}
```

#### Change 4: Remove `layout` and `y` slide from Cascading Selects (Lines 490, 523)

```typescript
// Facility Select - BEFORE:
<motion.div
  key="facility-select"
  layout
  initial={{ opacity: 0, height: 0, y: -6 }}
  ...

// AFTER:
<motion.div
  key="facility-select"
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: "auto" }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ 
    opacity: { duration: 0.12 },
    height: { type: "spring", stiffness: 500, damping: 35 }
  }}
```

Apply same pattern to Department Select.

#### Change 5: Remove `LayoutGroup` Wrapper (Lines 297-298)

Since we're no longer using `layout` prop on children, the `LayoutGroup` wrapper is unnecessary:

```typescript
// BEFORE:
<LayoutGroup>
  <motion.div 
    layout
    transition={{ ... }}
    className="relative mt-3"
  >

// AFTER:
<div className="relative mt-3">
```

And close with `</div>` instead of `</motion.div></LayoutGroup>`.

---

## Animation Summary

| Element | Before | After |
|---------|--------|-------|
| Active FTE | height + y + layout | height + opacity only |
| Expiry Date | height + y + layout | height + opacity only |
| Shared Fields | height + x + layout | height + opacity only |
| Cascading Selects | height + y + layout | height + opacity only |

---

## Visual Result

- **Forms stay fixed**: Fields don't shift position when siblings appear/disappear
- **Smooth expansion**: Container still expands/contracts smoothly via `height: "auto"`
- **Clean fade**: Content fades in/out without sliding
- **Stable UX**: Users can focus on filling forms without visual distraction
