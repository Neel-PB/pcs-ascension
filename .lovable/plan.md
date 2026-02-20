

## Update Position Details Tour Preview to Match Actual Detail Sheet

### What Changes

Redesign the `PositionDetailsPreview` component in `src/components/tour/PositionsDemoPreview.tsx` to closely mirror the real `EmployeeDetailsSheet` layout shown in the screenshot.

### Current vs. New

The current preview shows a flat "Detail Sheet" header with a simple 2-column grid. The new version will replicate the actual sheet structure:

1. **Header area** -- Employee name (bold), job title subtitle, and an "Active" badge (top-right)
2. **Details / Comments toggle** -- Pill-style toggle with "Details" selected (matching the `ToggleButtonGroup` look)
3. **Position Information section** -- Rounded card (`bg-muted/50 rounded-xl`) with 2-column fields: Position Number, Job Title, Job Code, Job Family, FTE, Shift, Standard Hours
4. **Employment Details section** -- Same card style with: Employee Type, Employment Type, Employment Flag, Employee ID
5. **Location section** -- Same card style with: Market, Facility, Department
6. **Close button** -- Bottom-right blue rounded button

### File Changed

| File | Change |
|------|--------|
| `src/components/tour/PositionsDemoPreview.tsx` | Rewrite `PositionDetailsPreview` component (lines 171-199) to match the real detail sheet layout with sectioned cards, header with badge, and close button |

### Technical Detail

Replace the current `PositionDetailsPreview` with a miniaturized wireframe that uses:
- A header row with name "Abagayle Peaden", subtitle "RN-Pediatric ICU", and a small green "Active" badge
- A pill toggle bar showing "Details" as active (filled) and "Comments" as inactive
- Three `bg-muted/50 rounded-lg` sections matching the real sheet's card groupings
- 2-column field grids with label (tiny muted text) and value (slightly larger medium text)
- A "Close" button aligned bottom-right in primary/ascension style

Sample data will match the screenshot: Position Number 5963, Job Title RN-Pediatric ICU, Job Code 801210, Job Family Nursing, FTE 0.9, Shift Rotating, Standard Hours 36, etc.
