

## Highlight All KPI Sections in the Tour

### Problem
The "KPI Cards" tour step (step 3) targets `[data-tour="fte-section"]`, which only highlights the FTE section. The user wants all three sections (FTE, Volume, Productive Resources) highlighted together.

### Solution
Add a `data-tour="kpi-sections"` attribute to the parent wrapper `div` in `DraggableSectionsContainer.tsx` that wraps all three sections. Then update the tour step target from `[data-tour="fte-section"]` to `[data-tour="kpi-sections"]`.

### Technical Changes

#### 1. `src/components/staffing/DraggableSectionsContainer.tsx`
- Line 121: Add `data-tour="kpi-sections"` to the `<div className="space-y-8 pl-6">` wrapper

#### 2. `src/components/tour/tourSteps.ts`
- Change step 3 target from `[data-tour="fte-section"]` to `[data-tour="kpi-sections"]`

No other files need changes.

