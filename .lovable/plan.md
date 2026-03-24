

# Fix Feedback Screenshot Capture Quality

## Problem
The captured screenshot appears washed out, blurry, and incorrectly scaled compared to the actual UI. Two root causes:

1. **Scroll offset not accounted for** — The selection overlay records `clientX/clientY` (viewport-relative coordinates), but `html2canvas` renders the entire `document.body` including scrolled-off content. The crop coordinates must include `window.scrollX/scrollY` to align correctly.

2. **Double-scaled capture** — `html2canvas` v1.4.1 already applies `window.devicePixelRatio` internally when the `scale` option is set. The current code uses `scale: devicePixelRatio * 1.5`, which over-scales the canvas, then crops using that same multiplier — causing misalignment and blurry/washed output.

## Changes

### 1. `src/lib/capturePageScreenshot.ts` — Fix scaling and scroll offset

- **Remove the 1.5x multiplier**: Change `scale: window.devicePixelRatio * 1.5` to just `scale: window.devicePixelRatio`. This prevents double-scaling.
- **Add scroll offset to crop coordinates**: When cropping, add `window.scrollX` to `area.x` and `window.scrollY` to `area.y` so the crop aligns with the correct region of the full-page canvas.
- **Update scaleFactor** to match: `const scaleFactor = window.devicePixelRatio` (remove `* 1.5`).
- **Add `windowWidth` / `windowHeight`** options to html2canvas to ensure it captures at the correct viewport dimensions.

### 2. `src/components/feedback/FeedbackTrigger.tsx` — Add extra frame delay

- Add a third `requestAnimationFrame` wait before capture to ensure the overlay is fully removed from the DOM and repaint is complete.

## Files Modified
- `src/lib/capturePageScreenshot.ts`
- `src/components/feedback/FeedbackTrigger.tsx`

