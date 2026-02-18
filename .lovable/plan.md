

## Add Mini-Chart Previews to Volume KPI Tour Steps

### Overview

Add the existing `mini-chart` demo preview from `TourDemoPreview` to the 6 Volume KPI card steps (12M Average, 12M Daily Average, 3M Low, 3M High, Target Volume, Override Volume) so users see a sparkline visualization in each tooltip, matching the pattern already used for the Trend Chart step.

### Changes

**`src/components/tour/tourSteps.ts`** -- Update 6 steps to use `demoContent` with `mini-chart`:

| Step Target | Title | Current | New |
|-------------|-------|---------|-----|
| `kpi-12m-monthly` | 12M Average | Plain text | `demoContent(text, 'mini-chart')` |
| `kpi-12m-daily` | 12M Daily Average | Plain text | `demoContent(text, 'mini-chart')` |
| `kpi-3m-low` | 3M Low | Plain text | `demoContent(text, 'mini-chart')` |
| `kpi-3m-high` | 3M High | Plain text | `demoContent(text, 'mini-chart')` |
| `kpi-target-vol` | Target Volume | Plain text | `demoContent(text, 'mini-chart')` |
| `kpi-override-vol` | Override Volume | Plain text | `demoContent(text, 'mini-chart')` |

No new components needed -- reuses the existing `mini-chart` variant from `TourDemoPreview` and the existing `demoContent` helper.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/tourSteps.ts` | Wrap 6 Volume KPI step `content` values with `demoContent(..., 'mini-chart')` |

