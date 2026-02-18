

## Add Rich Previews to Forecasts, Volume Settings, and NP Settings Tours

### Overview

Add real-data visual previews to 3 tour sections (9 steps total) following the established pattern. All previews will be housed in a single new file `SettingsDemoPreview.tsx` (for Volume + NP) alongside updates to existing forecast steps.

---

### Forecasts Tour (3 steps)

| # | Step | Current | New Preview |
|---|------|---------|-------------|
| 1 | Forecast KPI Cards | `forecast-cards` from TourDemoPreview | Enhanced `forecast-kpi-preview`: Two side-by-side cards matching the real layout (FTE Shortage: +5.0 / Positions to Open: 3) and (FTE Surplus: -3.2 / Positions to Close: 2) with orange/primary borders and click-to-filter hint |
| 2 | Forecast Table Header | Plain text | `forecast-table-preview`: Compact table wireframe with the real 8 columns (Market, Facility, Department, Skill Type, Shift, FTE Gap, Status) and 3 sample rows using real data (Baltimore, RN Day +2.4 Shortage; Florida, PCT Night -1.8 Surplus; Illinois, CL Day +0.6 Split Issue) |
| 3 | Expandable Detail | `expandable-row` | `forecast-detail-preview`: Two-panel wireframe showing "Current Hired FTE" bar chart on left vs "Recommended Changes" list on right (Cancel Req, Open Position), matching the BalanceTwoPanel pattern |

**New component**: `ForecastDemoPreview.tsx` with 3 variants.

#### `forecast-kpi-preview` -- Enhanced KPI Cards
Replicates the actual `ForecastKPICards` layout with:
- Left card: Orange border, "FTE Shortage: +5.0 | Positions to Open: 3" with vertical separator
- Right card: Primary border, "FTE Surplus: -3.2 | Positions to Close: 2" with vertical separator
- Small hint text: "Click a card to filter the table"

#### `forecast-table-preview` -- Compact Forecast Table
Miniature version of the real table header + 3 rows:
```text
|   | Market    | Facility          | Department       | Skill | Shift | Gap  | Status   |
|---|-----------|-------------------|------------------|-------|-------|------|----------|
| > | Baltimore | Mercy Ctr Aurora  | Cardiac Care     | RN    | Day   | +2.4 | Shortage |
| > | Florida   | Saint Thomas Mid  | Adult ECMO 001   | PCT   | Night | -1.8 | Surplus  |
| > | Illinois  | Alexian Brothers  | Cardiac Crit Care| CL    | Day   | +0.6 | Split    |
```

#### `forecast-detail-preview` -- Two-Panel Expandable Detail
Shows what an expanded row reveals:
- Left panel: "Current Hired FTE" with colored percentage bars (FT: 70%, PT: 15%, PRN: 5%)
- Right panel: "Recommended Changes" with prioritized actions (1. Cancel Open Req RN-Day, 2. Open Position PCT-Night)
- Note about priority: "Cancels open reqs before closing filled positions"

---

### Volume Settings Tour (3 steps)

| # | Step | Current | New Preview |
|---|------|---------|-------------|
| 1 | Status Summary | Plain text | `volume-stats-preview`: Replica of the stats banner with colored dots (2 Require Override in red, 5 Using Target Volume in blue, 1 Expiring Soon in yellow) |
| 2 | Override Table | Plain text | `volume-table-preview`: Compact table showing 3 sample rows with columns: Department, Target Volume, Override Volume (with Mandatory/Optional badges), Expiration Date, Status (Active/Pending/Not Set badges) |
| 3 | Target Volume Details | Plain text | `volume-target-preview`: Mini replica of the TargetVolumePopover showing 3M Low Avg, N-Month Avg, Spread %, and a tiny bar chart highlighting the 3 lowest months |

**New component**: `SettingsDemoPreview.tsx` with 6 variants (3 Volume + 3 NP).

#### `volume-stats-preview`
```text
[red dot] 2 Require Override   [blue dot] 5 Using Target Volume   [yellow dot] 1 Expiring Soon
```

#### `volume-table-preview`
```text
| Department        | Target Vol | Override Vol      | Expiration   | Status     |
|-------------------|-----------|-------------------|--------------|------------|
| Cardiac Care      | 18.5      | [Mandatory] --    | --           | Not Set    |
| Adult ECMO 001    | 22.3      | [Optional] 25.0   | Mar 15, 2026 | Active     |
| Cardiac Crit Care | 14.8      | [Optional] 16.0   | Pending...   | Pending    |
```

#### `volume-target-preview`
Shows the popover content:
- "3M Low Avg: 18.5" and "12M Avg: 21.2" side by side
- "Spread: 12.7%" with a check mark (within 15% threshold)
- Mini bar chart with 12 bars, 3 lowest highlighted in primary color
- Note: "Using 3M Low (spread within 15% threshold)"

---

### NP Settings Tour (3 steps)

| # | Step | Current | New Preview |
|---|------|---------|-------------|
| 1 | Status Summary | Plain text | `np-stats-preview`: Stats banner replica (3 Active in green, 1 Expiring Soon in yellow, 4 Not Set in gray) |
| 2 | Override Table | Plain text | `np-table-preview`: Compact table with columns: Department, Target NP % (all 10%), Override NP %, Max Expiration, Expiration Date, Status |
| 3 | Two-Step Save | Plain text | `np-two-step-preview`: Visual workflow showing Step 1 (enter value -> Pending badge) and Step 2 (select date -> Active badge), with a Revert button at the end |

#### `np-stats-preview`
```text
[green dot] 3 Active   [yellow dot] 1 Expiring Soon   [gray dot] 4 Not Set
```

#### `np-table-preview`
```text
| Department        | Target NP% | Override NP% | Max Expiry   | Expiration   | Status  |
|-------------------|-----------|-------------|--------------|--------------|---------|
| Cardiac Care      | 10%       | 12%         | Jun 30, 2026 | Mar 15, 2026 | Active  |
| Adult ECMO 001    | 10%       | --          | Jun 30, 2026 | --           | Not Set |
| Cardiac Crit Care | 10%       | 8%          | Jun 30, 2026 | Pending...   | Pending |
```

#### `np-two-step-preview`
Visual workflow diagram:
```text
Step 1: Enter Override NP%
  [input: 12%] --> [Pending badge]
         |
         v
Step 2: Select Expiration Date
  [calendar: Mar 15] --> [Active badge]
         |
         v
  [Revert button] --> Clears both values
```

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/ForecastDemoPreview.tsx` | New file -- 3 variants: `forecast-kpi-preview`, `forecast-table-preview`, `forecast-detail-preview` |
| `src/components/tour/SettingsDemoPreview.tsx` | New file -- 6 variants: `volume-stats-preview`, `volume-table-preview`, `volume-target-preview`, `np-stats-preview`, `np-table-preview`, `np-two-step-preview` |
| `src/components/tour/tourSteps.ts` | Import both new preview components, add `forecastDemoContent` and `settingsDemoContent` helpers, update all 9 steps across `forecastSteps`, `volumeSettingsSteps`, and `npSettingsSteps` to use rich previews |

