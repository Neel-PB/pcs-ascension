

## Add Demo Previews to Positions Module Tour Steps

### Overview

Add visual demo previews to the Active FTE, Shift Override, and Comments tour steps for both the Employees and Contractors tours. This follows the existing pattern used in Staffing tours where `createElement` builds JSX-rich tooltip content with inline mockup previews.

### New File: `src/components/tour/PositionsDemoPreview.tsx`

Create a new preview component with three variants:

1. **`active-fte-steps`** -- Shows the Active FTE popover workflow:
   - Step 1: Default cell with hired FTE value (e.g., `1.0`) and pencil icon
   - Step 2: Popover opened -- status dropdown showing options (LOA, Orientation, Separation, Shared Position), FTE input, expiry date, comment field
   - Step 3: Saved state -- blue override value with status badge and expiry, revert icon
   - Uses the same `CellStateRow`-style layout from `SettingsDemoPreview`

2. **`shift-override-steps`** -- Shows the Shift Override workflow:
   - Step 1: Special shift value (e.g., "Rotating") with pencil icon
   - Step 2: Popover with Day/Night selector
   - Step 3: Modified display showing `~~Rotating~~ -> Day` with revert icon
   - Compact three-state visual walkthrough

3. **`comments-preview`** -- Shows the comments/activity timeline:
   - Mini mockup of the detail sheet Comments tab
   - Activity log entry (FTE change with primary-tinted bubble)
   - Regular comment entry
   - Comment composer bar at the bottom

### Updated File: `src/components/tour/positionsTourSteps.ts`

Convert from plain string `content` to JSX `content` using `createElement` (same pattern as `tourSteps.ts`) for these three steps in both `employeesTourSteps` and `contractorsTourSteps`:

- **Active FTE step** (index 6): Add `PositionsDemoPreview` with `active-fte-steps` variant
- **Shift Override step** (index 7): Add `PositionsDemoPreview` with `shift-override-steps` variant
- **Comments step** (index 8): Add `PositionsDemoPreview` with `comments-preview` variant

### Technical Details

**`PositionsDemoPreview.tsx` structure:**

```
PositionsDemoPreview
  |-- ActiveFteStepsPreview (3-state walkthrough)
  |     |-- CellStateRow: Default cell [1.0] + pencil icon
  |     |-- CellStateRow: Popover mockup (status select, FTE input, expiry)
  |     |-- CellStateRow: Saved state [0.5 blue] + LOA badge + expiry + revert
  |
  |-- ShiftOverrideStepsPreview (3-state walkthrough)
  |     |-- CellStateRow: "Rotating" + pencil icon
  |     |-- CellStateRow: Day/Night selector mockup
  |     |-- CellStateRow: "Rotating" strikethrough -> "Day" + revert
  |
  |-- CommentsPreview (timeline mockup)
        |-- Activity entry (FTE change, primary-tinted bubble)
        |-- Comment entry (regular comment)
        |-- Composer bar wireframe
```

**`positionsTourSteps.ts` changes:**

```typescript
import { createElement } from 'react';
import { PositionsDemoPreview } from './PositionsDemoPreview';

const positionsDemoContent = (text: string, variant: string) =>
  createElement('div', { className: 'space-y-3' },
    createElement('p', null, text),
    createElement(PositionsDemoPreview, { variant } as any)
  );

// Then replace content strings for Active FTE, Shift, and Comments steps:
// content: positionsDemoContent('Click the Active FTE cell to adjust...', 'active-fte-steps'),
```

**Tooltip width:** The `TourTooltip` component's `max-w` will need to accommodate the wider preview content (matching the `max-w-[400px]` pattern used by other demo previews).

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsDemoPreview.tsx` | New file -- 3 preview variants (active-fte-steps, shift-override-steps, comments-preview) |
| `src/components/tour/positionsTourSteps.ts` | Import PositionsDemoPreview, use `createElement` for Active FTE, Shift, and Comments steps in all 3 step arrays |
| `src/components/tour/TourTooltip.tsx` | May need max-width adjustment if not already wide enough |

