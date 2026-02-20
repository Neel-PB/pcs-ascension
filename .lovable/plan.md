

## Add "Position Details" Tour Step to Positions Tour

### What Changes

Add a new Joyride step to the Employees, Contractors, and Open Position (requisitions) tours that highlights clicking a table row to open the Position Details sheet. The step will include a demo preview wireframe showing the detail sheet layout.

### Implementation

**1. Add `data-tour="positions-row"` to the first table row**

In `src/components/editable-table/VirtualizedTableBody.tsx`, add a `data-tour` attribute to the first row's wrapper div (when `virtualRow.index === 0`).

**2. Add a demo preview variant for the detail sheet**

In `src/components/tour/PositionsDemoPreview.tsx`:
- Add a new variant `'position-details'` to the type
- Create a `PositionDetailsPreview` component showing a mini wireframe of the detail sheet (Position Information section with fields like Position Number, Job Title, FTE, Shift, plus the Details/Comments tab switcher)

**3. Add the new step to all three tour step arrays**

In `src/components/tour/positionsTourSteps.ts`, insert a new step after the "Data Table" step (index 5 for employees, index 4 for contractors, index 4 for requisitions):

```
{
  target: '[data-tour="positions-row"]',
  title: 'Position Details',
  content: <demo content showing detail sheet wireframe>,
  placement: 'bottom',
  disableBeacon: true,
  data: { wideTooltip: true },
}
```

**4. Update PositionsTour scroll handling**

In `src/components/tour/PositionsTour.tsx`, the new `positions-row` target doesn't need special horizontal scrolling (it's in the visible area), but ensure it scrolls vertically into view if needed.

**5. Update tab navigation text**

Also update the "Tab Navigation" step content from "Employees, Contractors, and Open Positions" to reflect the new 5-tab structure.

### Files Changed

| File | Change |
|------|--------|
| `src/components/editable-table/VirtualizedTableBody.tsx` | Add `data-tour="positions-row"` to the first row wrapper div |
| `src/components/tour/PositionsDemoPreview.tsx` | Add `position-details` variant with detail sheet wireframe |
| `src/components/tour/positionsTourSteps.ts` | Insert "Position Details" step after "Data Table" in all three arrays; update Tab Navigation text |
| `src/components/tour/PositionsTour.tsx` | No changes needed (existing scroll logic handles non-table-cell targets) |

