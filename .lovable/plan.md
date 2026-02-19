

## Fix: Comments Spotlight + Preview Layout for Active FTE, Shift, and Comments

### Problem 1: Comments spotlight not appearing

The Comments target (`<span data-tour="positions-comments">`) is a small icon inside the sticky header. When Joyride tries to highlight it, the element is off-screen to the right. The current code measures `getBoundingClientRect()` before scrolling completes, so the initial measurement is inaccurate. Additionally, for header elements that are off-screen, Joyride may skip the step entirely because it can't find a valid target position.

The fix: For header targets, first scroll the container to reveal the element, wait for the scroll to settle, then re-query the element and fire resize events so Joyride recalculates. We need to use a two-phase approach -- scroll first using a rough estimate, then measure accurately after a short delay.

### Problem 2: Preview text and spacing

The `positionsDemoContent` helper uses `space-y-3` (12px vertical gap) between the description text and the demo preview, creating too much whitespace. The wrapper also uses `text-center` which doesn't help readability. The text within the previews is very small (7-9px) and hard to read.

### Changes

**File: `src/components/tour/PositionsTour.tsx`**

Update the scroll handler for both cell and header targets to use a two-phase scroll approach:
1. First, scroll the container to make the target visible (using scrollWidth-based calculation for elements that are off-screen)
2. After a short delay (50ms), re-measure the element position and fire resize events

For header targets specifically, since the header `<span>` is very small and may not have `.closest('[data-tour-virtual-body]')`, skip the vertical scroll entirely and only do horizontal scrolling.

**File: `src/components/tour/positionsTourSteps.ts`**

1. Reduce spacing in `positionsDemoContent`: change `space-y-3` to `space-y-1.5` and remove `text-center`
2. Make the description paragraph more readable: add `text-[13px] leading-relaxed` class

**File: `src/components/tour/PositionsDemoPreview.tsx`**

3. Increase text sizes in all three preview variants for better readability:
   - Bump workflow labels from `text-[8px]` to `text-[9px]`
   - Bump field values from `text-[9px]` to `text-[10px]`
   - Bump timestamps from `text-[7px]` to `text-[8px]`
   - Reduce top margin on preview container from `mt-2` to `mt-1`

### Technical Details

**`src/components/tour/PositionsTour.tsx`** -- Updated scroll logic:

For header targets, the element starts off-screen so `getBoundingClientRect()` returns coordinates relative to its hidden position. Instead:
- Query the scroll container's `scrollWidth` and the element's `offsetLeft` relative to the scroll container to calculate the correct scroll position
- Use `setTimeout` after scrolling to let the browser complete the layout, then dispatch resize events

```text
if (isTableCellStep || isTableHeaderStep) {
  const scrollContainer = el.closest('.overflow-x-auto');
  if (scrollContainer) {
    // Use offsetLeft relative to scrollable parent for accurate positioning
    const tableContent = scrollContainer.querySelector('[style*="min-width"]');
    const elRect = el.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const cellOffsetLeft = elRect.left - containerRect.left + scrollContainer.scrollLeft;
    const centerOffset = cellOffsetLeft - (containerRect.width / 2) + (elRect.width / 2);
    scrollContainer.scrollLeft = Math.max(0, centerOffset);
  }

  // Vertical (body cells only)
  if (isTableCellStep) { ... }

  // Two-phase: wait for scroll to settle, then re-measure and trigger resize
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  }, 50);
}
```

**`src/components/tour/positionsTourSteps.ts`** -- Tighter content layout:

```text
const positionsDemoContent = (text, variant) =>
  createElement('div', { className: 'space-y-1.5' },
    createElement('p', { className: 'text-[13px] leading-relaxed' }, text),
    createElement(PositionsDemoPreview, { variant })
  );
```

Remove the extra `flex justify-center` wrapper div since the preview is already full-width.

**`src/components/tour/PositionsDemoPreview.tsx`** -- Slightly larger text:

- All three preview components: bump font sizes by 1px across the board
- Reduce `mt-2` to `mt-0` on the outer container (spacing now handled by parent `space-y-1.5`)
- Reduce internal `space-y-2.5` to `space-y-2` for tighter vertical rhythm

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Add delay after scroll before firing resize events; ensure header targets scroll correctly |
| `src/components/tour/positionsTourSteps.ts` | Reduce gap between text and preview; remove text-center; increase text size |
| `src/components/tour/PositionsDemoPreview.tsx` | Bump font sizes for readability; tighten vertical spacing |

