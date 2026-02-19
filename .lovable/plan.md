

## Fix: Simplify Table Cell Tour Scrolling (Stop Removing Overflow)

### Root Cause

The current approach has a fundamental flaw:

1. Manually scroll the horizontal container to center the cell -- this works
2. Then set `overflow: visible` on all parent containers -- this **destroys the scroll context**

Once `overflow: visible` is applied, the container is no longer scrollable. The table renders at its full natural width (2000px+), and the cell that was in view is now positioned far off-screen to the right in layout coordinates. The spotlight and tooltip appear at coordinates that are outside the viewport.

**The overflow changes are unnecessary.** Joyride's spotlight uses `position: fixed` and measures element position via `getBoundingClientRect()`. As long as the cell is scrolled into the visible area within its container, the spotlight will appear at the correct screen position without needing to modify any overflow properties.

### Fix

Rewrite the table cell step handler in `PositionsTour.tsx` to:

1. Scroll the horizontal container (`overflow-x-auto`) to center the target cell
2. Scroll the virtual body vertically to center the cell
3. Fire resize events so Joyride recalculates the spotlight position
4. **Do NOT change overflow or contain properties at all**

Also remove the `restoreTableContainment()` call at the start of each step since we're no longer modifying overflow.

### Implementation

**File: `src/components/tour/PositionsTour.tsx`**

Replace the table cell handling block (lines 79-115) with:

```typescript
if (isTableCellStep) {
  // Horizontal: manually scroll the container to center the cell
  const scrollContainer = el.closest('.overflow-x-auto') as HTMLElement;
  if (scrollContainer) {
    const cellRect = el.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const cellOffsetLeft = cellRect.left - containerRect.left + scrollContainer.scrollLeft;
    const centerOffset = cellOffsetLeft - (containerRect.width / 2) + (cellRect.width / 2);
    scrollContainer.scrollLeft = Math.max(0, centerOffset);
  }

  // Vertical: scroll cell into center of the virtual body
  const virtualBody = el.closest('[data-tour-virtual-body]') as HTMLElement;
  if (virtualBody) {
    const cellRect = el.getBoundingClientRect();
    const bodyRect = virtualBody.getBoundingClientRect();
    const cellOffsetTop = cellRect.top - bodyRect.top + virtualBody.scrollTop;
    const centerOffset = cellOffsetTop - (bodyRect.height / 2) + (cellRect.height / 2);
    virtualBody.scrollTop = Math.max(0, centerOffset);
  }

  // Let scroll settle, then force Joyride to recalculate spotlight position
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  });
}
```

Also remove the `restoreTableContainment()` function and its calls since overflow/contain are no longer modified during cell steps. Keep the cleanup in the FINISHED/SKIPPED handler as a safety net.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Simplify cell step: scroll only, no overflow changes. Remove `restoreTableContainment` from step handler. |

### Why This Works

- The cell is physically scrolled into the visible viewport area
- `getBoundingClientRect()` returns correct screen coordinates because the cell is visible within its scrollable container
- Joyride's fixed-position spotlight aligns to those coordinates
- No DOM mutation of overflow/contain means the scroll position stays stable

