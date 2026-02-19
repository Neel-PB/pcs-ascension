

## Fix: Comments Tour Step Scrolling + Preview Positioning

### Problem 1: Comments spotlight missing

The `[data-tour="positions-comments"]` target is a `<span>` inside the **column header row** (not a body cell like Active FTE and Shift). It wraps the MessageSquare icon in the last column. Since it's at the far-right edge of the table, it needs horizontal scrolling to become visible.

The current scroll logic in `PositionsTour.tsx` correctly finds `.overflow-x-auto` via `.closest()`, but there's a subtle issue: the Comments header target is **not inside `[data-tour-virtual-body]`** (it's in the sticky `TableHeader`). The code still works for horizontal scrolling since both header and body share the same `.overflow-x-auto` parent. However, the Comments step is being treated as a "table cell step" which applies virtual body scrolling logic that's unnecessary for a header element.

The real issue is that the Comments column header `<span>` is very small (just an icon), and the `cellRect` measurements used for centering may be inaccurate because the element might not be rendered/visible when first queried (it's off-screen to the right).

### Problem 2: Preview looks odd for Active FTE, Shift, and Comments

The demo previews for these steps use `placement: 'left'` which positions the wide tooltip (560px) to the left of cells that are in the right portion of the table. When the cell is scrolled to center, the tooltip can overlap the table or get pushed into awkward positions. For cells that have been scrolled into the center-right of the viewport, `placement: 'left'` works well. But for the Comments header (which is now scrolled to center), the tooltip may need to use `placement: 'bottom'` or `'top'` since it's a header element.

### Fix

**File: `src/components/tour/PositionsTour.tsx`**

1. Differentiate between **body cell** targets (`positions-active-fte-cell`, `positions-shift-cell`) and **header** targets (`positions-comments`). Both need horizontal scrolling, but only body cells need vertical virtual body scrolling.
2. For header targets, scroll horizontally then trigger resize events -- no vertical scroll needed.
3. Add a small delay before measuring `cellRect` to allow the browser to complete the horizontal scroll first, ensuring the element is in the viewport when measured.

**File: `src/components/tour/positionsTourSteps.ts`**

4. Change the Comments step `placement` from `'left'` to `'bottom'` since the target is a header element (sitting at the top of the table). A `'left'` placement on a far-right header icon pushes the wide tooltip awkwardly.
5. Keep Active FTE and Shift as `placement: 'left'` since they target body cells that are scrolled to center -- the tooltip renders nicely to their left.

### Technical Details

**`src/components/tour/PositionsTour.tsx`** changes:

Split `tableCellTargets` into two arrays:

```text
tableCellTargets (body cells that need both horizontal + vertical scroll):
  - [data-tour="positions-active-fte-cell"]
  - [data-tour="positions-shift-cell"]

tableHeaderTargets (header elements that need only horizontal scroll):
  - [data-tour="positions-comments"]
```

Update the `STEP_BEFORE` handler:
- For body cell targets: keep existing logic (horizontal scroll + vertical scroll + resize events)
- For header targets: horizontal scroll only + resize events (skip virtual body scroll)

**`src/components/tour/positionsTourSteps.ts`** changes:

For all three tab step arrays (employees, contractors, requisitions), change the Comments step placement from `'left'` to `'bottom'`.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsTour.tsx` | Split targets into body cells vs header targets; apply appropriate scroll logic for each |
| `src/components/tour/positionsTourSteps.ts` | Change Comments step placement to `'bottom'` for all three tabs |
