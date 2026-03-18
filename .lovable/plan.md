

## Show All 3 Paid FTEs Chart Options for Selection

### Goal
Render three chart visualizations inside the Paid FTEs KPI modal for comparison, using the same pattern as the Vacancy Rate comparison view.

### Data Preparation (`src/pages/staffing/StaffingSummary.tsx`)
Aggregate `prKpiData` (productive-resources-kpi) by department:

```typescript
const paidByDept = useMemo(() => {
  if (!prKpiData?.length) return [];
  const byDept: Record<string, { paid: number; employed: number; contractor: number; overtime: number; prn: number }> = {};
  prKpiData.forEach(r => {
    const dept = r.department_description || 'Unknown';
    if (!byDept[dept]) byDept[dept] = { paid: 0, employed: 0, contractor: 0, overtime: 0, prn: 0 };
    byDept[dept].paid += Number(r.paid_fte ?? 0);
    byDept[dept].employed += Number(r.employed_productive_fte ?? 0);
    byDept[dept].contractor += Number(r.contractor_fte ?? 0);
    byDept[dept].overtime += Number(r.overtime_fte ?? 0);
    byDept[dept].prn += Number(r.total_prn ?? 0);
  });
  return Object.entries(byDept)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.paid - a.paid);
}, [prKpiData]);
```

Update `paid-ftes` config to pass `paidByDept` as `chartData` and add `showAllOptions: true`.

### Chart Modal Changes (`src/components/staffing/KPIChartModal.tsx`)
Extend the `showAllOptions` rendering to detect the `paid-ftes` KPI (check title or add a `kpiId` prop). When it's Paid FTEs, render:

**Option A — Donut by Department**
- Recharts `PieChart` with `innerRadius`/`outerRadius` donut, total Paid FTEs in center, vertical side legend showing department name + FTE + %. Slices < 3% grouped into "Other".

**Option B — Horizontal Bar by Department**
- `BarChart layout="vertical"`, YAxis = department names, XAxis = FTEs. Single blue bars sorted by highest.

**Option C — Stacked Composition Bar**
- `BarChart` (vertical), X = departments. Four stacked `<Bar>` segments: Employed Productive (blue), Contractor (orange), Overtime (red), PRN (purple). Shows the composition of Paid FTEs.

Each section labeled "Option A", "Option B", "Option C" with description. Uses the same native scrollable div (`overflow-y-auto`, `max-height: calc(85vh - 140px)`).

### Files Changed
1. `src/pages/staffing/StaffingSummary.tsx` — compute `paidByDept`, update paid-ftes KPI config
2. `src/components/staffing/KPIChartModal.tsx` — add Paid FTEs 3-option rendering logic

