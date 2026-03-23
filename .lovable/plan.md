

## Swap Inner/Outer Rings + Move Ring Labels to Shared Legend

### Changes

#### 1. `src/pages/staffing/StaffingSummary.tsx` — Swap inner/outer assignments

For both Hired FTEs (~lines 570-579) and Open Reqs (~lines 636-645), swap so **Night = inner, Day = outer**:
```
inner: { shift: 'Night', slices: ...Night..., total: ... }
outer: { shift: 'Day', slices: ...Day..., total: ... }
```

#### 2. `src/components/staffing/KPIChartModal.tsx` — Move ring labels to legend row

**Remove** the per-chart "Inner: Day (value) / Outer: Night (value)" text block next to each donut (lines 967-970).

**Add** a second legend row below the skill-mix legend showing ring meaning without values:
```
● Inner: Night   ○ Outer: Day
```

Use two small concentric ring icons (or simple styled spans) to indicate inner vs outer. No FTE values — those are already in the footer totals.

### Files Changed
- `src/pages/staffing/StaffingSummary.tsx`
- `src/components/staffing/KPIChartModal.tsx`

