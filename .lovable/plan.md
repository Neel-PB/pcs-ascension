

# Fix Dynamic Height Animation for Active FTE Popover

## Problem Analysis

The current implementation doesn't animate height smoothly because:

1. **Opacity-only animations**: The `motion.div` sections use `initial={{ opacity: 0 }}` and `animate={{ opacity: 1 }}` but don't include height transitions
2. **Layout prop limitations**: The `layout` prop alone doesn't animate height when children appear/disappear - it only animates position/size when the element's **own** dimensions change due to layout shifts
3. **Missing coordination**: Multiple `AnimatePresence` blocks need a `LayoutGroup` to coordinate their animations

## Solution

Use explicit `height: 0` → `height: "auto"` animations combined with `LayoutGroup` for smooth, coordinated height transitions.

---

## Technical Changes

### File: `src/components/editable-table/cells/EditableFTECell.tsx`

#### Change 1: Import LayoutGroup

```typescript
// Line 10 - BEFORE:
import { motion, AnimatePresence } from 'framer-motion';

// AFTER:
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
```

#### Change 2: Wrap Dynamic Content in LayoutGroup

The `LayoutGroup` coordinates all layout animations within it, preventing jumpy transitions.

```typescript
// Line 290-291 - BEFORE:
{/* Dynamic content area with animated height */}
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

// AFTER:
{/* Dynamic content area with animated height */}
<LayoutGroup>
  <motion.div 
    layout
    transition={{ 
      layout: { 
        type: "spring", 
        stiffness: 500, 
        damping: 35 
      }
    }}
    className="relative mt-3"
  >
```

#### Change 3: Add Height Animation to Child Sections

For each animated section, add explicit `height: 0` → `height: "auto"` transitions:

```typescript
// Active FTE dropdown (around line 305-330)
<AnimatePresence mode="sync">
  {editStatus && (
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
      {/* ... */}
    </motion.div>
  )}
</AnimatePresence>
```

```typescript
// Expiry Date field (around line 337-394)
<AnimatePresence mode="sync">
  {editStatus && !isSharedPosition && (
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
      {/* ... */}
    </motion.div>
  )}
</AnimatePresence>
```

```typescript
// Shared Position fields (around line 400-601)
<AnimatePresence mode="sync">
  {isSharedPosition && (
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
      {/* ... */}
    </motion.div>
  )}
</AnimatePresence>
```

#### Change 4: Close LayoutGroup

```typescript
// Line 604 - BEFORE:
</motion.div>

// AFTER:
  </motion.div>
</LayoutGroup>
```

---

## Animation Breakdown

| Element | Initial | Animate | Exit |
|---------|---------|---------|------|
| Container | - | `layout` spring | - |
| Active FTE | `opacity: 0, height: 0` | `opacity: 1, height: "auto"` | `opacity: 0, height: 0` |
| Expiry Date | `opacity: 0, height: 0` | `opacity: 1, height: "auto"` | `opacity: 0, height: 0` |
| Shared Fields | `opacity: 0, height: 0` | `opacity: 1, height: "auto"` | `opacity: 0, height: 0` |
| Cascading Selects | Already have `height: 0` → `height: "auto"` | Same | Same |

---

## Why This Works

1. **`height: "auto"`**: Framer Motion can interpolate from 0 to "auto" height smoothly
2. **`overflow-hidden`**: Prevents content from overflowing during height transition
3. **`LayoutGroup`**: Coordinates all nested layout animations so they happen together
4. **Spring physics**: Matching `stiffness: 500, damping: 35` creates consistent, snappy feel

---

## Expected Visual Behavior

- **Select LOA/FMLA**: Form expands smoothly to show 3 fields
- **Switch to Shared Position**: Current fields animate out (shrink), shared fields animate in (grow)
- **Cascading selects**: Each new dropdown slides in with height animation
- **Switch back**: Shared fields collapse smoothly, expiry date expands in

