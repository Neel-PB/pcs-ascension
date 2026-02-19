

## Fix Active FTE Cell Spotlight -- Root Cause and Solution

### Root Cause

The Active FTE cell is inside a virtualized table body that uses `contain: 'layout'` (CSS containment) and `position: absolute` row positioning. This creates a layout isolation boundary that prevents Joyride from correctly computing the spotlight SVG mask cutout coordinates, even though it can find the element for tooltip placement.

The DOM nesting chain causing the issue:

```text
EditableTable (overflow-hidden)
  -> Container (overflow-x-auto)
    -> VirtualizedTableBody (overflow-y-auto, contain: 'layout')  <-- problem
      -> Relative container
        -> Absolute row (transform: translateY)
          -> Grid cell (overflow-hidden)
            -> data-tour="positions-active-fte-cell"
```

### Solution

Temporarily neutralize `contain: 'layout'` and `overflow-hidden` on ancestor containers when Joyride is on a step targeting elements inside the virtualized table. Restore them when moving to a non-table step or when the tour ends.

### Changes

**File: `src/components/tour/PositionsTour.tsx`**

In the `STEP_BEFORE` handler, when the current step targets a cell inside the table (Active FTE, Shift, or Comments), find and temporarily modify the VirtualizedTableBody container:

1. Query the target element's closest ancestor with `contain: layout` and temporarily set `contain: 'none'`
2. Set `overflow: visible` on the VirtualizedTableBody scroll container
3. Store references to modified elements
4. Restore original values when moving to a non-table step, or on tour finish/skip

```typescript
// In STEP_BEFORE handler
const tableCellTargets = [
  '[data-tour="positions-active-fte-cell"]',
  '[data-tour="positions-shift-cell"]',
  '[data-tour="positions-comments"]',
];
const isTableCellStep = tableCellTargets.includes(step.target as string);

if (isTableCellStep && el) {
  // Remove contain: layout from VirtualizedTableBody
  const virtualBody = el.closest('[style*="contain"]');
  if (virtualBody) {
    (virtualBody as HTMLElement).style.contain = 'none';
  }
  // Set overflow visible on scroll ancestors
  let parent = el.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (style.overflow !== 'visible' || style.overflowX !== 'visible') {
      parent.dataset.tourOriginalOverflow = parent.style.overflow;
      parent.dataset.tourOriginalOverflowX = parent.style.overflowX;
      parent.style.overflow = 'visible';
      parent.style.overflowX = 'visible';
    }
    if (parent.matches('[data-tour="positions-table"]')) break;
    parent = parent.parentElement;
  }
}
```

On tour finish/skip (in the `STATUS.FINISHED || STATUS.SKIPPED` handler), restore all modified containers:

```typescript
// Restore contain and overflow
document.querySelectorAll('[data-tour-original-overflow]').forEach(el => {
  (el as HTMLElement).style.overflow = el.getAttribute('data-tour-original-overflow') || '';
  el.removeAttribute('data-tour-original-overflow');
});
// Restore contain: layout
const virtualBody = document.querySelector('.flex-1.min-h-0.overflow-y-auto');
if (virtualBody) (virtualBody as HTMLElement).style.contain = 'layout';
```

**File: `src/components/editable-table/VirtualizedTableBody.tsx`**

Add a `data-tour-virtual-body` attribute to the scroll container so it can be reliably queried:

```typescript
<div
  ref={parentRef}
  data-tour-virtual-body
  className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
  style={{ contain: 'layout' }}
>
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Temporarily neutralize `contain` and `overflow` for table cell steps, restore on finish/skip |
| `src/components/editable-table/VirtualizedTableBody.tsx` | Add `data-tour-virtual-body` attribute for reliable querying |

