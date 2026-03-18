

## Show All 3 Vacancy Rate Chart Options for Selection

### Goal
Render all three chart options inside the Vacancy Rate chart modal so you can visually compare and pick the best one.

### Data Preparation (`src/pages/staffing/StaffingSummary.tsx`)
Compute per-department vacancy data from `skillShiftData`:

```typescript
const vacancyByDept = useMemo(() => {
  if (!skillShiftData?.length) return [];
  const byDept: Record<string, { hired: number; target: number }> = {};
  skillShiftData.forEach(r => {
    const dept = r.department_description || 'Unknown';
    if (!byDept[dept]) byDept[dept] = { hired: 0, target: 0 };
    byDept[dept].hired += Number(r.hired_total_fte ?? 0);
    byDept[dept].target += Number(r.target_fte_total ?? 0);
  });
  return Object.entries(byDept)
    .map(([name, v]) => ({
      name,
      hired: Math.round(v.hired * 10) / 10,
      target: Math.round(v.target * 10) / 10,
      gap: Math.round((v.target - v.hired) * 10) / 10,
      vacancyRate: v.target > 0 ? Math.round(Math.abs((v.hired - v.target) / v.target) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.vacancyRate - a.vacancyRate);
}, [skillShiftData]);
```

Update vacancy-rate config:
- `chartType: "bar"` (revert from radial)
- `chartData: vacancyByDept` (pass the full department-level array)
- Add a new prop `showAllOptions: true` to signal the modal to render all 3 side by side

### Chart Modal Changes (`src/components/staffing/KPIChartModal.tsx`)

Add a new prop `showAllOptions?: boolean`. When true and `chartType === "bar"`, render 3 sections vertically (each ~250px) instead of the normal single chart:

**Option A — Horizontal Bar (Vacancy Rate %)**
- Recharts `BarChart` with `layout="vertical"`, YAxis showing department names, XAxis showing %
- Each bar color-coded: green (<10%), amber (10-20%), red (>20%) using a custom `<Cell>` per bar

**Option B — Stacked Bar (Hired + Gap)**
- Recharts `BarChart` (vertical), X = departments, two stacked `<Bar>`: hired (blue) + gap (orange/red)
- Total height = target FTEs

**Option C — Grouped Bar (Hired vs Target)**
- Recharts `BarChart` (vertical), X = departments, two side-by-side `<Bar>`: hired (blue) + target (gray)

Each section gets a label header: "Option A: Horizontal Bar", "Option B: Stacked Bar", "Option C: Grouped Bar". The Chart/Table toggle is hidden while `showAllOptions` is active.

### Type Updates
- Add `showAllOptions?: boolean` to `KPIChartModalProps`
- Pass through from `KPICard` → `KPIChartModal`
- Update `KPICardProps` to include `showAllOptions`

### Files Changed
1. `src/pages/staffing/StaffingSummary.tsx` — compute `vacancyByDept`, update vacancy-rate config
2. `src/components/staffing/KPIChartModal.tsx` — add 3-option rendering
3. `src/components/staffing/KPICard.tsx` — pass through `showAllOptions`

