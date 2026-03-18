

## Use Pie Charts with Skill-Mix Data for Hired FTEs, Open Reqs, and Target FTEs

### Overview
Add pie chart support to `KPIChartModal` and feed real skill-shift data (aggregated by `skill_mix`) into the Hired FTEs, Open Reqs, and Target FTEs KPI cards. Target FTEs will only include nursing unit records.

### Changes

**1. Modified: `src/components/staffing/KPIChartModal.tsx`**
- Add `chartType: "pie"` to the type union
- Import `PieChart`, `Pie`, `Cell` from `recharts`
- Define a color palette (6-8 distinct colors) for pie slices
- When `chartType === "pie"`, expect `chartData` items to have `{ value, name }` shape
- Render a `PieChart` with labeled slices using shadcn `ChartContainer` + `ChartTooltip`
- Each slice color mapped via the palette; legend shows skill-mix names
- Skip the High/Average/Low stats for pie charts (not meaningful); show a total instead

**2. Modified: `src/pages/staffing/StaffingSummary.tsx`**
- Add a `useMemo` that aggregates `skillShiftData` by `skill_mix`:
  - `hiredPieData`: `{ name: skill_mix, value: sum(hired_total_fte) }[]`
  - `openReqsPieData`: `{ name: skill_mix, value: sum(open_reqs_total_fte) }[]`
  - `targetPieData`: same but filtered to nursing records only (`nursing_flag`)
- Filter out entries with value = 0, sort descending by value
- Wire into KPI configs:
  - `hired-ftes`: `chartData = hiredPieData`, `chartType = "pie"`
  - `open-reqs`: `chartData = openReqsPieData`, `chartType = "pie"`
  - `target-ftes`: `chartData = targetPieData`, `chartType = "pie"`

### Pie Chart Design
- Uses recharts `PieChart` + `Pie` inside shadcn `ChartContainer`
- Outer labels show skill-mix name + percentage
- Tooltip shows skill-mix name + FTE value (locale-formatted)
- Color palette generated dynamically into the `ChartConfig` so shadcn theming works
- Table view for pie data shows Skill Mix | FTE | % columns

