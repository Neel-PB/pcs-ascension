

## Fix Active FTE Highlighting and Missing Next/Skip Buttons

### Issue 1: Staffing Tour Missing Next/Back Buttons

**Root cause**: The `TourTooltip` footer renders step dots for every step. With 30 steps in the Staffing Summary tour, the dots alone consume ~270px of horizontal space. Combined with the Skip button and Back/Next buttons, the total exceeds the card's `max-w-[400px]`, causing the buttons to overflow and become invisible.

**Fix in `TourTooltip.tsx`**:
- When step count exceeds 10, hide the individual dots and show only the text counter (e.g., "1/30") alongside the progress bar at top
- Always ensure Back/Next buttons remain visible by giving them `shrink-0` and placing dots in a container that can overflow hidden
- Restructure the footer so buttons are always rendered regardless of dot overflow

### Issue 2: Active FTE Cell Not Highlighted

**Root cause**: The Active FTE column is positioned far right in the table, outside the initial viewport. When Joyride tries to calculate the spotlight position, the element is inside a horizontally scrollable container (`overflow-x-auto`). Even though `scrollIntoView` runs in `STEP_BEFORE`, the spotlight SVG overlay calculates coordinates relative to the viewport but the element may still not be properly measured because:
1. The resize dispatch at 50ms may not be enough time for the browser to complete the scroll and repaint
2. The `disableScrolling={false}` setting causes Joyride to also attempt its own scrolling, which can conflict with the manual `scrollIntoView`

**Fix in `PositionsTour.tsx`**:
- Set `disableScrolling={true}` so only our manual `scrollIntoView` handles positioning (prevents Joyride's own scroll logic from conflicting)
- Increase the resize dispatch delay from 50ms to 150ms to ensure the scroll and repaint have fully completed before Joyride measures
- Add a second resize dispatch at 300ms as a fallback

### Technical Details

**`src/components/tour/TourTooltip.tsx`**:
```
Footer layout changes:
- Wrap dots in a container with overflow-hidden and max-width
- When size > 10: hide dots entirely, rely on progress bar + "X/Y" text
- Ensure Back/Next buttons use flex-shrink-0 so they never get pushed off
- Move buttons into a guaranteed-visible container
```

**`src/components/tour/PositionsTour.tsx`**:
```
- Change disableScrolling from false to true
- Increase setTimeout delay: 50ms -> 150ms
- Add second setTimeout at 300ms for fallback recalc
```

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourTooltip.tsx` | Hide dots when steps > 10, ensure buttons always visible with flex-shrink-0 |
| `src/components/tour/PositionsTour.tsx` | Set `disableScrolling={true}`, increase resize dispatch delays to 150ms + 300ms |

