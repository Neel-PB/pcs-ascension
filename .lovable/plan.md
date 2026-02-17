

## Fix: Volume Settings and NP Settings Tour Tooltip Clipping

### Problem
The Volume Settings and NP Settings tours have the same issues previously fixed for Admin tours:
1. Joyride's built-in scroll (`scrollToFirstStep`) pushes the `main` container, hiding the tab navigation bar and clipping the tooltip (Next/Skip buttons not visible).
2. No manual scroll reset on step transitions or tour completion.

### Root Cause
`StaffingTour.tsx` uses `scrollToFirstStep` (defaults to true) and lacks the `main` container scroll reset logic that was added to `AdminTour.tsx`.

### Solution
Apply the same pattern from `AdminTour` to `StaffingTour`:

### File: `src/components/tour/StaffingTour.tsx`

1. **Disable Joyride's internal scroll**: Set `scrollToFirstStep={false}`.

2. **Add manual scroll resets to `handleCallback`**:
   - On `STEP_BEFORE`: After `scrollIntoView` on the target element, reset `main` container scroll to top (`behavior: 'instant'`).
   - On `FINISHED` or `SKIPPED`: Reset both the `main` container and any inner `overflow-y-auto` container to top before calling `completeTour()`.

This is the exact same pattern already proven in `AdminTour.tsx`, applied to the single `StaffingTour.tsx` file.

### Technical Detail

```text
Current StaffingTour handleCallback:
  STEP_BEFORE -> scrollIntoView (target only)
  FINISHED/SKIPPED -> completeTour()

Updated StaffingTour handleCallback:
  STEP_BEFORE -> scrollIntoView (target) + main.scrollTo(0) 
  FINISHED/SKIPPED -> main.scrollTo(0) + inner scroll reset + completeTour()

Also: scrollToFirstStep={false} added to Joyride props
```

