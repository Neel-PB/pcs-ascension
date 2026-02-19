

## Redesign Volume Colors Preview: Two Scenarios with KPI Card Style

### What's Being Fixed

The current `volume-colors` preview shows two simple colored boxes labeled "Target (active)" and "Override (active)". The user wants **two scenarios** that demonstrate how the cards look depending on which volume source is active:

1. **Scenario 1**: Target Vol is active (green border) and Override Vol is default (neutral border)
2. **Scenario 2**: Override Vol is active (orange border) and Target Vol is default (neutral border)

Each card should use the actual KPI card styling (matching the `WorkforceKPICard` layout) rather than generic colored boxes.

### Design

```text
+--------------------------------------------------+
| Scenario 1: Target Active                        |
| +---------------------+  +---------------------+ |
| | TARGET VOL     [i]  |  | OVERRIDE VOL   [i]  | |
| | 20.8           [c]  |  | 24.7           [c]  | |
| | [12-Mo Avg]         |  | [Manual] Exp: Mar.. | |
| | (green border)      |  | (neutral border)    | |
| +---------------------+  +---------------------+ |
|                                                   |
| Scenario 2: Override Active                       |
| +---------------------+  +---------------------+ |
| | TARGET VOL     [i]  |  | OVERRIDE VOL   [i]  | |
| | 20.8           [c]  |  | 24.7           [c]  | |
| | [12-Mo Avg]         |  | [Manual] Exp: Mar.. | |
| | (neutral border)    |  | (orange border)     | |
| +---------------------+  +---------------------+ |
+--------------------------------------------------+
```

### Technical Details

**File: `src/components/tour/TourDemoPreview.tsx`**

Replace the `VolumeColors` component with a new implementation that shows two rows:

- **Row 1 ("Target Active")**: Target Vol card with green left border + emerald badge; Override Vol card with neutral border + muted badge
- **Row 2 ("Override Active")**: Target Vol card with neutral border + muted badge; Override Vol card with orange left border + orange badge

Each mini-card mirrors the KPI card layout: label, value, icon placeholders, and source badge. A small section label above each row explains the scenario.

The existing `TargetVolPreview` and `OverrideVolPreview` components (used by the individual KPI steps) remain unchanged.

### Files Changed

| File | Change |
|------|--------|
| `src/components/tour/TourDemoPreview.tsx` | Rewrite `VolumeColors` component to show two scenario rows with KPI-card-styled Target and Override cards |

