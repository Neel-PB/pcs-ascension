

## Dual Day/Night Donut Charts for Vacancy Rate & Target FTEs

### Summary
Replace the single donut chart for **Vacancy Rate** and **Target FTEs** KPI modals with two side-by-side donut charts — one for Day shift and one for Night shift — both broken down by skill mix. The `SkillShiftRecord` already provides `hired_day_fte`, `hired_night_fte`, `target_fte_day`, `target_fte_night` fields.

### Changes

#### 1. `src/pages/staffing/StaffingSummary.tsx` — Build Day/Night breakdowns

Update the `skillMixPieData` useMemo (~line 220) to also produce day/night variants:
- `hired_day`, `hired_night` — from `hired_day_fte`, `hired_night_fte`
- `target_day`, `target_night` — from `target_fte_day`, `target_fte_night`

Update `vacancyBySkillMix` to also produce day/night vacancy data using the day/night hired and target values.

Pass these as `chartData` in a new structure for `vacancy-rate` and `target-ftes` KPI configs. Use a new `chartType` value (e.g., `"dual-pie"`) to signal the modal to render two side-by-side donuts.

The chartData shape for dual-pie:
```typescript
chartData: [
  { shift: 'day', slices: [{ name: 'RN', value: 5.2 }, ...], total: 12.5 },
  { shift: 'night', slices: [{ name: 'RN', value: 3.1 }, ...], total: 8.0 },
]
```

#### 2. `src/components/staffing/KPIChartModal.tsx` — Render dual-pie layout

Add a `"dual-pie"` chart type handler:
- Renders two donuts side-by-side, each with a "Day" / "Night" label above
- Each donut shows skill mix breakdown with center total
- Shared color palette and legend below both charts
- Reuses existing PIE_COLORS and tooltip patterns

```text
┌─────────────────────────────────────────┐
│  Vacancy Rate                    12.5%  │
├─────────────────────────────────────────┤
│   ┌──── Day ────┐  ┌──── Night ───┐    │
│   │   (donut)   │  │   (donut)    │    │
│   │  total: X   │  │  total: Y    │    │
│   └─────────────┘  └──────────────┘    │
│         [shared legend below]           │
└─────────────────────────────────────────┘
```

#### 3. `src/components/staffing/KPIChartModal.tsx` — Update type
Add `"dual-pie"` to the `chartType` prop union: `"line" | "bar" | "area" | "pie" | "radial" | "dual-pie"`

### Technical Details
- The `SkillShiftRecord` interface already has all needed day/night fields
- For Vacancy Rate donuts: each slice shows `hired_day_fte` / `hired_night_fte` by skill (same as current single donut but split)
- For Target FTEs donuts: each slice shows `target_fte_day` / `target_fte_night` by skill
- Nursing flag filtering still applies for target data

