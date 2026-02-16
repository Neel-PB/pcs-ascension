

## Make "Skip" Button Skip the Entire Tour

### Problem
The "Skip" button currently uses `closeProps` from react-joyride, which closes only the current step (fires `ACTION.CLOSE`). It should use `skipProps` to skip the entire tour and mark it as completed.

### Fix

#### `src/components/tour/TourTooltip.tsx`
- Add `skipProps` to the destructured props from `TooltipRenderProps`
- Replace `{...closeProps}` on the Skip button with `{...skipProps}`

That single change ensures clicking "Skip" fires `STATUS.SKIPPED`, which the existing `handleCallback` in `StaffingTour.tsx` already handles by calling `completeTour()`.

