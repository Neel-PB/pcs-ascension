

## Nested Donut Charts for Hired FTEs & Open Reqs (Nursing + Non-Nursing)

### Summary
Add a new chart type `"nested-pie"` that renders two stacked nested donuts — one for Nursing (inner=Day, outer=Night) and one for Non-Nursing (inner=Day, outer=Night) — for the Hired FTEs and Open Reqs KPI modals.

### Data Changes

#### `src/pages/staffing/StaffingSummary.tsx` — Extend `skillMixPieData` aggregation

Add nursing-split fields to the aggregation (~line 221):
- `hiredDayNursing`, `hiredNightNursing`, `hiredDayNonNursing`, `hiredNightNonNursing`
- `openReqsDayNursing`, `openReqsNightNursing`, `openReqsDayNonNursing`, `openReqsNightNonNursing`

Uses existing `nursing_flag` check and `open_reqs_day_fte` / `open_reqs_night_fte` fields from SkillShiftRecord.

Return 8 new sorted arrays from the memo.

#### `src/pages/staffing/StaffingSummary.tsx` — Update Hired FTEs & Open Reqs KPI configs (~lines 534, 585)

Switch both to `chartType: "nested-pie"` when data is available. Pass chartData as:
```typescript
chartData: [
  { category: 'Nursing', inner: { shift: 'Day', slices: [...], total: X }, outer: { shift: 'Night', slices: [...], total: Y } },
  { category: 'Non-Nursing', inner: { shift: 'Day', slices: [...], total: X }, outer: { shift: 'Night', slices: [...], total: Y } },
]
```

### Rendering Changes

#### `src/components/staffing/KPIChartModal.tsx`

1. Add `"nested-pie"` to `chartType` union
2. Add `isNestedPie` boolean alongside `isDualPie`, `isPie`
3. Exclude `nested-pie` from `stats` calculation (no High/Avg/Low)

**Chart tab** — new nested-pie renderer:
- Two vertically stacked sections, each with a category label ("Nursing" / "Non-Nursing")
- Each section: single `PieChart` with two `<Pie>` components — inner ring (Day, smaller radius) and outer ring (Night, larger radius)
- Center label shows combined total
- Shared legend below both sections

```text
┌──────────────────────────────┐
│  Hired FTEs          40.9   │
├──────────────────────────────┤
│  ── Nursing ──               │
│     ╭──────────╮             │
│     │ (Night)  │             │
│     │ ╭──────╮ │             │
│     │ │(Day) │ │             │
│     │ ╰──────╯ │             │
│     ╰──────────╯             │
│  ── Non-Nursing ──           │
│     ╭──────────╮             │
│     │ (Night)  │             │
│     │ ╭──────╮ │             │
│     │ │(Day) │ │             │
│     │ ╰──────╯ │             │
│     ╰──────────╯             │
│    [shared legend]           │
└──────────────────────────────┘
```

**Table tab** — nested-pie handler:
Table with columns: Skill Mix | Nrs Day | Nrs Night | Non-Nrs Day | Non-Nrs Night

**Footer** — show category totals instead of High/Avg/Low

### Files Changed
- `src/pages/staffing/StaffingSummary.tsx`
- `src/components/staffing/KPIChartModal.tsx`

