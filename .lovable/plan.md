

## Vacancy Rate Chart — Better Options

### Available Data
Each `skillShiftData` record has `department_description`, `market`, `skill_mix`, `hired_total_fte`, `target_fte_total`, and `open_reqs_total_fte`. So we can compute **vacancy rate per department** (or per market/skill).

### Chart Recommendations

**Option A — Horizontal Bar Chart by Department** (Recommended)
- One bar per department showing its vacancy rate %
- Bars color-coded: green (<10%), amber (10-20%), red (>20%)
- Sorted highest vacancy first — instantly shows problem areas
- Best fit because: multiple departments, single metric, easy comparison

**Option B — Stacked Bar: Hired vs Gap by Department**
- Each department gets a stacked bar: green = hired FTEs, red/orange = vacancy gap
- Total bar height = target FTEs
- Shows both absolute staffing levels AND the gap visually

**Option C — Grouped Bar: Hired vs Target by Department**
- Side-by-side bars per department (hired in blue, target in gray)
- The visual difference IS the vacancy
- Cleaner when you want to see both numbers explicitly

### Formula (unchanged)
```
Per-department Vacancy Rate = |(Hired FTEs - Target FTEs) / Target FTEs| × 100
```

### Implementation
- Group `skillShiftData` by `department_description`
- Compute vacancy rate per group
- Pass as `chartData` array to `KPIChartModal`
- Add horizontal bar rendering in `KPIChartModal.tsx` (using Recharts `BarChart` with `layout="vertical"`)
- Update vacancy-rate config: `chartType: "bar"`, pass department-level data

Which option do you prefer?

