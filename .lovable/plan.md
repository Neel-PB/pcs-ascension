

## Add Charts for 5 Remaining Productivity KPIs

Each KPI gets unique chart types tailored to what makes sense for that metric — not cookie-cutter.

### Data Changes — `src/pages/staffing/StaffingSummary.tsx`

1. Add `npByDept` memo: aggregate `non_productive_percentage` weighted by `paid_fte` per department, outputting `{ name, npPercent, paidHours, npHours }`.
2. Set `showAllOptions: true` on all 5 KPIs.
3. Pass `paidByDept` as `chartData` for Employed Productive, Contract, Overtime, Total PRN.
4. Pass `npByDept` as `chartData` for Total NP%.

### Chart Options per KPI — `src/components/staffing/KPIChartModal.tsx`

Add title-matching branches inside the `showAllOptions` block (same pattern as Paid FTEs / Vacancy Rate).

**1. Employed Productive FTEs**
- **A: Donut by Department** — employed field, center total, side legend, 3% "Other" grouping
- **B: Horizontal Bar** — employed per department, sorted descending
- **C: Grouped Bar — Employed vs Paid** — shows what share of paid FTEs are productive per department

**2. Contract FTEs**
- **A: Horizontal Bar** — contractor per department (sorted), orange bars — simple ranking view makes most sense for smaller numbers
- **B: Grouped Bar — Contractor vs Employed** — shows contractor reliance relative to employed staff
- **C: Donut** — contractor distribution across departments

**3. Overtime FTEs**
- **A: Horizontal Bar — color-coded** — overtime per department, bars colored green (<2 FTE) / amber (2-5) / red (>5) — mirrors the Vacancy Rate health pattern
- **B: Stacked Bar — Overtime vs Regular** — overtime stacked on top of employed per department
- **C: Donut** — overtime distribution across departments

**4. Total PRN**
- **A: Donut by Department** — PRN distribution, center total
- **B: Horizontal Bar** — PRN per department sorted
- **C: Grouped Bar — PRN vs Employed** — shows PRN supplement level relative to core staff

**5. Total NP%**
- **A: Horizontal Bar — color-coded** — NP% per department, green (<10%) / amber (10-15%) / red (>15%) with legend
- **B: Grouped Bar — NP Hours vs Productive Hours** — raw hours side by side per department
- **C: Donut — NP% Distribution** — shows which departments consume the most non-productive hours as share of total

### Files Changed
1. `src/pages/staffing/StaffingSummary.tsx` — npByDept memo, showAllOptions + chartData on 5 KPIs
2. `src/components/staffing/KPIChartModal.tsx` — 5 new title-matching branches with 3 chart options each

