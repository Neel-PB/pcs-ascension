

## Fix: Volume Settings and NP Settings Tour Tooltip Visibility

### Problem
The tour for Volume Settings and NP Settings renders its overlay but the tooltip card (with Next/Skip/Back buttons) is clipped by the `main` container's `overflow-y-scroll overflow-x-hidden`. The table fills most of the viewport, so `placement: 'top'` puts the tooltip above the visible area. With `disableOverlayClose` enabled, the UI becomes completely unresponsive.

### Solution
Two changes across two files:

### 1. `src/components/tour/tourSteps.ts`
Change `placement` from `'top'` to `'auto'` on the table-targeting steps so Joyride can dynamically position the tooltip wherever space is available:

- `volumeSettingsSteps`: Change placement to `'auto'` for `volume-settings-table` and `volume-settings-target` steps
- `npSettingsSteps`: Change placement to `'auto'` for `np-settings-table` and `np-settings-override` steps

### 2. `src/components/tour/StaffingTour.tsx`
Remove `disableOverlayClose` so users can dismiss the tour by clicking the overlay if the tooltip is ever clipped, preventing the "stuck/unresponsive" trap. This matches a safer UX pattern while still keeping the tour functional.

### Technical Detail
```text
tourSteps.ts changes:
  volumeSettingsSteps[1] (volume-settings-table):  placement: 'top'  -> 'auto'
  volumeSettingsSteps[2] (volume-settings-target): placement: 'top'  -> 'auto'
  npSettingsSteps[1] (np-settings-table):          placement: 'top'  -> 'auto'
  npSettingsSteps[2] (np-settings-override):       placement: 'top'  -> 'auto'

StaffingTour.tsx:
  Remove disableOverlayClose prop from Joyride
```
