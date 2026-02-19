

## Fix: Scroll Table to Active FTE Cell Before Showing Spotlight

### Root Cause

The current code flow for table cell steps is:

1. Call `scrollIntoView({ inline: 'center' })` on the cell
2. Immediately set `overflow: visible` on all parent containers up to `[data-tour="positions-table"]`

Step 2 destroys the scroll context. Once `overflow` becomes `visible`, the container is no longer scrollable -- the horizontal scroll position resets and the cell that was scrolled into view becomes invisible again. The tooltip appears pointing at a hidden element off the right edge.

### Fix

Restructure the table cell step logic in `src/components/tour/PositionsTour.tsx` to:

1. Find the horizontal scroll container (`overflow-x-auto` div inside EditableTable)
2. Manually calculate and set its `scrollLeft` to center the target cell
3. Wait a frame for the scroll to settle
4. THEN set `overflow: visible` on parent containers and remove `contain: layout`
5. Fire resize events after everything is positioned

**File: `src/components/tour/PositionsTour.tsx`**

Replace the table cell handling block (lines 79-106) with:

```typescript
if (isTableCellStep) {
  // Step 1: Find the horizontal scroll container and scroll the cell into view
  const scrollContainer = el.closest('.overflow-x-auto') as HTMLElement;
  if (scrollContainer) {
    const cellRect = el.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    // Calculate how much to scroll so the cell is centered horizontally
    const cellOffsetLeft = cellRect.left - containerRect.left + scrollContainer.scrollLeft;
    const centerOffset = cellOffsetLeft - (containerRect.width / 2) + (cellRect.width / 2);
    scrollContainer.scrollLeft = Math.max(0, centerOffset);
  }

  // Also center vertically within the table body
  const virtualBody = el.closest('[data-tour-virtual-body]');
  if (virtualBody) {
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
  }

  // Step 2: After scroll settles, remove overflow clipping so spotlight can highlight
  requestAnimationFrame(() => {
    if (virtualBody) (virtualBody as HTMLElement).style.contain = 'none';

    let parent = el.parentElement;
    while (parent) {
      const computed = getComputedStyle(parent);
      if (computed.overflow !== 'visible' || computed.overflowX !== 'visible') {
        parent.setAttribute('data-tour-orig-overflow', parent.style.overflow);
        parent.setAttribute('data-tour-orig-overflow-x', parent.style.overflowX);
        parent.style.overflow = 'visible';
        parent.style.overflowX = 'visible';
      }
      if (parent.matches('[data-tour="positions-table"]')) break;
      parent = parent.parentElement;
    }

    setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  });
} else {
  el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
  const mainEl = document.querySelector('main');
  if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' });
  setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
  setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
}
```

### Why This Works

- The scroll container's `scrollLeft` is set manually while it still has `overflow-x: auto`, so the cell physically moves into the visible area
- Only after the scroll is done (next animation frame) do we switch to `overflow: visible` for spotlight rendering
- The cell is now centered in the viewport when the spotlight and tooltip appear

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Rewrite table cell scroll logic: manually scroll the horizontal container first, then set overflow visible in the next frame |

### What stays unchanged
- All step definitions, demo previews, and tooltip styling
- Non-cell step behavior (filter bar, search, tabs)
- Tour flow, section transitions, cleanup logic
