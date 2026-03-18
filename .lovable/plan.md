

## Vacancy Rate — Radial Gauge Chart

### Current state
- Vacancy Rate = `(FTE Variance / Target FTEs) × 100` — this is correct and already computed
- Currently rendered as a **bar chart** with fake declining trend data (`generateDeclineTrend`)
- The data is a **single percentage value**, not a time series — a bar/line trend is misleading

### Why a Radial Bar (Gauge) chart
Vacancy Rate is a single percentage (e.g. 13.9%). The best chart for a single % metric is a **radial progress/gauge** — it instantly communicates "how full/empty" the staffing is. Recharts supports `RadialBarChart` which shadcn charts wrap via `ChartContainer`.

### Formula (unchanged)
```
Vacancy Rate = (FTE Variance / Target FTEs) × 100

Where:
  FTE Variance = Hired FTEs − Target FTEs  (negative = understaffed)
  
Example: Hired = 37.4, Target = 43.4
  Variance = 37.4 − 43.4 = −6.0
  Rate = (−6.0 / 43.4) × 100 = −13.8%
  Display as: 13.8% (absolute value, since it's a "vacancy" rate)
```

### Changes

**`src/components/staffing/KPIChartModal.tsx`**
1. Add `RadialBarChart`, `RadialBar`, `PolarAngleAxis` imports from recharts
2. Add a new chart type: `"radial"`
3. When `chartType === "radial"`, render a gauge-style radial bar:
   - Single radial bar from 0–100% with the vacancy % filled
   - Green fill when < 10%, amber 10–20%, red > 20%
   - Center text showing the percentage value
   - Background track in muted color
4. Keep Chart/Table toggle; table view shows Hired, Target, Variance, Rate

**`src/pages/staffing/StaffingSummary.tsx`**
1. Change vacancy-rate config:
   - `chartType: "radial"`
   - `chartData: [{ value: Math.abs(vacancyRate), name: "Vacancy Rate" }]` — single data point
2. Remove `generateDeclineTrend` call for this KPI

**`src/components/staffing/KPICard.tsx`** — update type to accept `"radial"` in `chartType` union (already passed through, just needs type update)

