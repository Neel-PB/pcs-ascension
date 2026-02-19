

## Fix KPI Step Tooltip Placement and Add Cross-Tab Tour Continuation

### Issue 1: KPI Cards Tooltip Shown Below Instead of Top

Step 9 (`[data-tour="kpi-sections"]`) targets the entire KPI sections container which spans most of the viewport. With `placement: 'top'`, Joyride tries to place it above but the element is near the top of the page, so it falls back to below and gets cut off.

**Fix**: Change placement from `'top'` to `'auto'` in `tourSteps.ts` for the KPI sections step (line 133). This lets Joyride pick the best available position. Additionally, scroll `main` to top before this step in the `StaffingTour.tsx` callback to ensure the KPI sections element is fully visible.

### Issue 2: Cross-Tab Tour Continuation (Summary to Planning, etc.)

When the Summary tour finishes, offer the user an option to continue to the next tab's tour. This is implemented by:

1. Adding a "Continue to Next Tab" option in the `TourTooltip` when the user is on the last step
2. Using the `useTourStore` to signal the next tour and updating the active tab in the parent page

**Approach**: Instead of complex cross-component communication, add a final step to each sub-tour that asks "Continue to the next section?" with the Next button labeled accordingly. When the Staffing tour finishes (not skipped), automatically navigate to the next tab and start its tour.

### Technical Details

**`src/components/tour/tourSteps.ts`** (line 133):
- Change `placement: 'top'` to `placement: 'auto'` for the KPI sections step

**`src/components/tour/StaffingTour.tsx`**:
- On `STATUS.FINISHED` (not skipped), determine the next tab in sequence
- Use a callback prop `onTabChange` to switch the parent tab
- Start the next tab's tour via `useTourStore.startTour()`
- Add a 500ms delay before starting the next tour to allow tab content to render

**`src/pages/staffing/StaffingSummary.tsx`**:
- Pass `onTabChange={setActiveTab}` to `StaffingTour`

**`src/components/tour/TourTooltip.tsx`**:
- On the last step, change "Finish" label to "Finish Tour" (no other changes needed; the auto-continuation handles the cross-tab flow)

### Tab Continuation Sequence

```text
Summary (30 steps) -> Planned/Active Resources -> Variance Analysis -> Forecasts -> Volume Settings -> NP Settings
```

When a tour finishes (user clicks "Finish"), the next tab is activated and its tour starts automatically. When skipped, no continuation happens.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/tourSteps.ts` | Change KPI sections placement from `'top'` to `'auto'` |
| `src/components/tour/StaffingTour.tsx` | Add `onTabChange` prop, auto-navigate to next tab on finish, start next tour |
| `src/pages/staffing/StaffingSummary.tsx` | Pass `onTabChange={setActiveTab}` to StaffingTour |
| `src/components/tour/TourTooltip.tsx` | Update last step button label to "Finish Tour" |

