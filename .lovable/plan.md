

## Add KPI-Style Previews for Target Volume and Override Volume Tour Steps

### What Changes

Replace the current generic chart-based previews for the **Target Vol** and **Override Vol** tour steps with dedicated KPI-card-style previews that visually match the actual cards users see in the Staffing Summary.

### Design

**Target Volume Preview** -- A mini KPI card with:
- Green left border (emerald-500) indicating system-calculated volume is active
- Title "Target Vol" with value "20.8"
- A small badge showing "12-Mo Avg" calculation source
- Subtle green highlight background matching the real card's `isHighlighted` style

**Override Volume Preview** -- A mini KPI card with:
- Orange left border (orange-500) indicating manual override is active
- Title "Override Vol" with value "24.7"
- A small badge showing "Manual" source
- Subtle orange highlight background matching the real card's `isNegative` style
- An expiry indicator (e.g., "Expires: Mar 15, 2026")

Both cards will include the chart and info icon hints (non-interactive) to mirror the real KPI card layout, plus a brief note about what the border color means.

### Technical Details

**File: `src/components/tour/TourDemoPreview.tsx`**

1. Add two new variants to the `TourDemoVariant` type: `'target-vol-preview'` and `'override-vol-preview'`
2. Create `TargetVolPreview` component -- mini KPI card with green border, value, calculation source badge, and border color explanation
3. Create `OverrideVolPreview` component -- mini KPI card with orange border, value, manual badge, expiry date, and border color explanation
4. Add both cases to the `switch` in the main export

**File: `src/components/tour/tourSteps.ts`**

5. Update the `target-vol` step (line 147) to use `demoContent('...', 'target-vol-preview')` instead of `demoContent('...', 'kpi-compact', { kpiId: 'target-vol' })`
6. Update the `override-vol` step (line 148) to use `demoContent('...', 'override-vol-preview')` instead of `demoContent('...', 'kpi-compact', { kpiId: 'override-vol' })`

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourDemoPreview.tsx` | Add `TargetVolPreview` and `OverrideVolPreview` components with KPI card styling |
| `src/components/tour/tourSteps.ts` | Switch target-vol and override-vol steps to use new preview variants |
