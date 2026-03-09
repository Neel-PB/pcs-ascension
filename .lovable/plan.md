

## Fix: Enable touchpad horizontal scrolling on Position tables

### Problem

The horizontal scroll container (line 247 in `EditableTable.tsx`) uses `overflow-x-auto`. Vertical touchpad gestures work because the VirtualizedTableBody has `overflow-y-auto`. However, horizontal two-finger trackpad scrolling doesn't work because the scroll container with `overflow-x-auto` is a parent that doesn't receive the vertical scroll events — trackpads send wheel events with `deltaX` but the nested vertical scroller captures the gesture first.

### Solution

Add a `wheel` event listener on the horizontal scroll container that translates horizontal wheel deltas (`deltaX`) into horizontal scroll, and also handles the common trackpad pattern where shift+vertical scroll should scroll horizontally. This ensures trackpad two-finger horizontal swipes work.

### Change

**File: `src/components/editable-table/EditableTable.tsx`**

Add a `useEffect` on `containerRef` that listens for `wheel` events. When `deltaX` is non-zero (trackpad horizontal swipe), apply `scrollLeft += deltaX`. This gives the browser a nudge to recognize horizontal scroll intent on the correct container.

```tsx
useEffect(() => {
  const el = containerRef.current;
  if (!el) return;
  
  const handleWheel = (e: WheelEvent) => {
    // If there's horizontal delta (trackpad swipe), scroll horizontally
    if (Math.abs(e.deltaX) > 0 && el.scrollWidth > el.clientWidth) {
      e.preventDefault();
      el.scrollLeft += e.deltaX;
    }
  };
  
  el.addEventListener('wheel', handleWheel, { passive: false });
  return () => el.removeEventListener('wheel', handleWheel);
}, []);
```

This is a single, small addition — no other files need changes. Works for all 5 position tabs since they all use `EditableTable`.

