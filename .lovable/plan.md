

## Add Tour Step for Hired and Open Reqs Split Badge

### What Changes
Add a second split-badge tour step in the Staffing Summary tour so users learn about both breakdown badges:
1. The existing green **Target FTEs** split badge (70/20/10 target)
2. A new step for the orange **Hired and Open Reqs** split badge (actual current mix)

### File 1: `src/components/staffing/DraggableKPISection.tsx`
Add a `data-tour="kpi-hired-split-badge"` attribute to the Hired/Open Reqs badge container (the `col-span-3` div at line 129).

### File 2: `src/components/tour/tourSteps.ts`
Insert a new step after the existing `kpi-split-badge` step in `staffingSteps`:

```
{
  target: '[data-tour="kpi-hired-split-badge"]',
  title: 'Hired and Open Reqs Split',
  content: 'This orange badge shows the actual FT/PT/PRN mix across your Hired FTEs and Open Requisitions combined. Click to compare the current split against the 70/20/10 target and see the variance.',
  placement: 'top',
  disableBeacon: true,
}
```

This gives the tour two consecutive steps: first the green Target split badge, then the orange Hired/Open Reqs split badge.
