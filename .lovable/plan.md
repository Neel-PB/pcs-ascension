

## Fix: Auto-Scroll Table to Reveal Off-Screen Tour Targets

### Problem
When the tour reaches the Active FTE, Shift, or Comments steps, the column headers are off-screen to the right because the table scrolls horizontally. Joyride only handles vertical page scrolling, not horizontal scrolling within a scrollable container.

### Solution
Add logic in the `PositionsTour` callback to programmatically scroll the target element into view before each step renders. When Joyride fires a `step:before` event, find the target DOM element and call `scrollIntoView({ inline: 'center', block: 'nearest' })` to horizontally scroll the table container so the spotlight lands on a visible element.

### Technical Changes

#### `src/components/tour/PositionsTour.tsx`
- Enhance the `handleCallback` function to listen for `EVENTS.STEP_BEFORE` (or `type === 'step:before'`)
- On each step transition, query the DOM for the step's target selector
- Call `element.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })` on the target element
- Add a small delay (e.g., 100ms) before Joyride positions the tooltip, to allow the scroll animation to settle

The same fix will also be applied to the Staffing and Admin tour components for consistency, though the immediate need is in the Positions tour.

### Why This Works
- `scrollIntoView` with `inline: 'center'` scrolls the nearest horizontally scrollable ancestor (the `overflow-x-auto` table container) to center the column header
- `block: 'nearest'` avoids unnecessary vertical scrolling
- Joyride then recalculates the spotlight position after the scroll completes
