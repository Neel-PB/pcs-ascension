

## Update FTE Variance and Req Variance Formulas

### Changes

In `src/pages/staffing/StaffingSummary.tsx` (~line 220-221):

**Current:**
- `FTE Variance = Target FTEs − Hired FTEs`
- `Req Variance = FTE Variance − Open Reqs`

**New:**
- `FTE Variance = Hired FTEs − Target FTEs`
- `Req Variance = FTE Variance + Open Reqs`

Vacancy Rate formula also needs updating to use the new FTE Variance direction (absolute value or sign flip depending on intent — will use `Math.abs(fteVariance) / targetFtes * 100` or keep consistent sign).

### File
- `src/pages/staffing/StaffingSummary.tsx` — two lines changed in the `fteKpiValues` useMemo

