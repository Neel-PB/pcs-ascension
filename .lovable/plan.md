

## Replace Static FTE Split with Live API Data

### Overview
Replace the hardcoded `employmentBreakdown: { ft: 62, pt: 23, prn: 15 }` on the Hired FTEs KPI with real data from the new `GET /positions-employment-split` endpoint, aggregated by selected filters.

### Changes

**New file: `src/hooks/useEmploymentSplit.ts`**
- Fetch `GET /positions-employment-split` with filter params (region, market, businessUnit, departmentId, submarket, level2, pstat)
- Uses same auth header pattern as other hooks
- Returns raw records with `department_id`, `employment_type`, `total_fte`
- Aggregates client-side: groups by employment_type (Full-Time, Part-Time, PRN), sums `total_fte`, computes percentages using the formula `SUM(type_fte) / SUM(all_fte) * 100`
- Exposes `{ ft, pt, prn }` percentage object ready for `employmentBreakdown`

**Modified: `src/pages/staffing/StaffingSummary.tsx`**
- Import and call `useEmploymentSplit` with the same filter params as other hooks
- Compute the `{ ft, pt, prn }` breakdown from the hook result
- Replace the static `{ ft: 62, pt: 23, prn: 15 }` on `hired-ftes` with the live computed values
- Keep `target-ftes` breakdown static at `{ ft: 70, pt: 20, prn: 10 }` (that's the target split, not actual)

### API Contract Assumed
```
GET /positions-employment-split?region=...&market=...&businessUnit=...&departmentId=...
Response: { data: [{ department_id, employment_type, total_fte, ... }] }
```
Employment types expected: `"Full-Time"`, `"Part-Time"`, `"PRN"`

