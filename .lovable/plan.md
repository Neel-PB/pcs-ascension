

## Move "Facility Required" Tooltip Below the Filter Bar

### Problem
Currently the tour tooltip floats above the empty state content area, obscuring the page. You want the tooltip to sit below the filter bar, pointing at the filters, so the "Select a Facility" empty state content remains fully visible underneath.

### Solution
Change the target of both empty-state steps from the empty state container to the filter bar (`[data-tour="filter-bar"]`), and set placement to `bottom` so the tooltip appears just below the filters, pointing up at them. The empty state content stays visible naturally below.

### Changes

**`src/components/tour/tourSteps.ts`** -- 2 steps updated:

1. `volumeSettingsSteps[0]` (line 278):
   - `target`: change from `[data-tour="volume-settings-empty"]` to `[data-tour="filter-bar"]`
   - `placement`: change from `top` to `bottom`

2. `npSettingsSteps[0]` (line 340):
   - `target`: change from `[data-tour="np-settings-empty"]` to `[data-tour="filter-bar"]`
   - `placement`: change from `top` to `bottom`

No other files need changes. The `data-tour="filter-bar"` attribute already exists on the filter bar wrapper on the staffing page.

### Result
- Tooltip appears directly below the filter bar, pointing up at the filters
- The "Select a Facility" empty state content remains fully visible below
- User can still interact with filters (disableOverlay is already true)
