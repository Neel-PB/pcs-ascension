

## Add Demo Previews to KPI and Other Tour Steps

### Overview

Extend the `FilterDemoPreview` pattern to add visual mockups inside tour tooltips for KPI-related steps and other steps across the Staffing Summary, Variance, Forecast, and Planning tours. Users will see mini demos of charts, info modals, badges, and table rows without any real data fetching.

### New Component

**`src/components/tour/TourDemoPreview.tsx`** -- A new companion to `FilterDemoPreview` with these variants:

| Variant | Used In Step | What It Shows |
|---------|-------------|---------------|
| `mini-chart` | Trend Chart | A tiny SVG sparkline with 6 dots and connecting lines, plus "High / Avg / Low" stat row beneath |
| `kpi-info` | Definition and Calculation | A mini card showing "Definition: ..." and "Calculation: formula..." in a styled box |
| `volume-colors` | Target and Override Volume Colors | Two small side-by-side mock cards: one with green border labeled "Target (active)", one with orange border labeled "Override (active)" |
| `split-badge` | Employment Type Split / Hired Split | A mock pill badge showing "70% FT . 20% PT . 10% PRN" with the correct color variant |
| `tab-pills` | Tab Navigation | A row of small pill buttons showing "Summary / Planning / Variance / Forecasts / Settings" |
| `legend` | FTE Legend (Variance + Planning) | Two colored rows: green "+2.0 Surplus" and orange "-3.5 Shortage" |
| `expandable-row` | Expandable Groups / Skill Groups | A mini table with a chevron row that shows expanded child rows beneath |
| `forecast-cards` | Forecast KPI Cards | Two mini side-by-side cards: orange "Shortage: +5.0" and blue "Surplus: -3.2" |
| `toggle-pair` | Hired/Active, Nursing/Non-Nursing | Two toggle buttons showing the active/inactive states |

### Updated Tour Steps

**Staffing Summary (`staffingSteps`):**

| Step | Preview Added |
|------|--------------|
| Tab Navigation | `tab-pills` showing the 5 tab labels |
| KPI Cards (overview) | No change (text is sufficient for the overview) |
| Trend Chart | `mini-chart` sparkline with High/Avg/Low stats |
| Definition and Calculation | `kpi-info` showing mock definition + formula |
| Target and Override Volume Colors | `volume-colors` with green/orange mock cards |
| Employment Type Split | `split-badge` green variant showing 70/20/10 |
| Hired and Open Reqs Split | `split-badge` orange variant showing example mix |

**Variance (`varianceSteps`):**

| Step | Preview Added |
|------|--------------|
| FTE Legend | `legend` showing surplus/shortage color coding |
| Expandable Groups | `expandable-row` showing a group with children |

**Forecast (`forecastSteps`):**

| Step | Preview Added |
|------|--------------|
| Forecast KPI Cards | `forecast-cards` showing shortage/surplus mini cards |
| Expandable Detail View | `expandable-row` showing expanded two-panel hint |

**Planning (`planningSteps`):**

| Step | Preview Added |
|------|--------------|
| Hired / Active Toggle | `toggle-pair` showing two toggle states |
| Nursing / Non-Nursing Toggle | `toggle-pair` with nursing labels |
| FTE Legend | `legend` showing surplus/shortage |
| Expandable Skill Groups | `expandable-row` |

### Technical Details

**`src/components/tour/TourDemoPreview.tsx`**
- New file with a single exported component accepting a `variant` prop and optional config data
- Uses the same styling patterns as `FilterDemoPreview` (rounded borders, `bg-muted/50`, themed colors)
- The `mini-chart` variant renders a small inline SVG (no Recharts dependency) with 6 data points connected by lines and dots
- The `volume-colors` variant renders two small divs with `border-emerald-500` and `border-orange-500`
- All variants are purely visual (no state, no data fetching)

**`src/components/tour/tourSteps.ts`**
- Import `TourDemoPreview` alongside `FilterDemoPreview`
- Create a `demoContent` helper (similar to `filterContent`) that wraps text + `TourDemoPreview` in a div
- Update the 7 staffing summary steps, 2 variance steps, 2 forecast steps, and 4 planning steps listed above to use JSX content with the demo previews

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourDemoPreview.tsx` | New component with 9 visual variants |
| `src/components/tour/tourSteps.ts` | Update ~15 steps across staffingSteps, varianceSteps, forecastSteps, and planningSteps to embed demo previews |
