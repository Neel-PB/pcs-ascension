

## Remove Workforce Drawer Tour Step

### What Changes
Remove the last tour step (step 9) that references `[data-tour="workforce-trigger"]` / "Workforce Drawer" from the staffing tour, since this element doesn't exist in the app.

### Technical Changes

#### `src/components/tour/tourSteps.ts`
- Delete the final step object targeting `[data-tour="workforce-trigger"]` (lines ~64-70)
- The tour will now be 8 steps total, ending on the "Employment Type Split" step

#### `src/pages/staffing/StaffingSummary.tsx`
- Remove the `data-tour="workforce-trigger"` attribute from the `WorkforceDrawerTrigger` component (if present), since it's no longer needed

No other files need changes.

