

## Forecast API Integration

### Overview
Replace the current Supabase-based `useForecastBalance` hook with a new hook that fetches from the NestJS `/forecast` API, then adapt the UI components to render the new data shape.

### Data Flow
```text
GET /forecast?region=...&market=...&businessUnit=...&departmentId=...
  → paginated rows from vw_forecast_curated
  → client groups by facility+dept+skill_mix+shift
  → sums hired_fte, open_reqs_fte, target_fte; merges fte_headcount_json
  → renders in existing table + expanded detail panels
```

### Changes

#### 1. New Hook: `src/hooks/useForecastBalance.ts` (rewrite)

- Replace Supabase queries with `apiFetch('/forecast?...')` using paginated fetching (while loop, `take=1000`)
- Pass filter params: region, market, businessUnit (facilityId), departmentId, level2, pstat
- **Client-side grouping** by `market + business_unit + department_id + skill_mix + shift` key
- For each group, aggregate:
  - `hired_fte` → sum
  - `open_reqs_fte` → sum
  - `target_fte` → sum
  - `total_fte_req` → sum (used for FTE Gap display)
  - `addressed_fte` / `unaddressed_fte` → sum
  - `fte_headcount_json` → merge into array
  - `staffing_status` → take worst (shortage > surplus > balanced)
  - `action_type` → collect unique values
  - `nursing_flag` → boolean OR across group
- Filter: only show rows where `nursing_flag = true` for expanded detail; show non-nursing rows in table but disable expand
- **Interfaces updated**:
  - `ForecastBalanceRow` gains: `staffingStatus`, `actionType`, `addressedFte`, `unaddressedFte`, `totalFteReq`, `fteHeadcountJson[]`, `nursingFlag`, `employmentType`
  - Keep `hiredFTE` (simplified — just `{ total, employmentType? }`) and `openReqsFTE` (same)
  - Remove old `recommendation`, `aiSummary` fields — right panel now driven by API data directly

#### 2. Left Panel: `src/components/forecast/BalanceTwoPanel.tsx`

- **Props change**: Accept new API-driven data instead of old `FTEBreakdown`/`RecommendedChanges`
- **Hired FTE column (left)**:
  - If `employment_type !== 'NA'` → show employment_type label + hired_fte value (no FT/PT/PRN split)
  - If `employment_type === 'NA'` → show FT/PT/PRN breakdown with percentage bars (current behavior, derived from grouped data)
- **Open Reqs column (right)**: Same logic — show total or split based on employment_type
- **Summary section**: Replace AI-generated summary with a data-driven summary using addressed/unaddressed FTE

#### 3. Right Panel: Positions to Close / Open

**Positions to Close (surplus rows)**:
- Show `total_fte_req` bold against "Position to Close" title
- If `open_reqs_fte === 0` → action_type = "NO_ACTION", show addressed/unaddressed FTE text
- If `open_reqs_fte > 0` → action_type = "CANCEL_OPEN_REQ", show text like: "{addressed_fte} open positions to be cancelled and {unaddressed_fte} unaddressed"

**Positions to Open (shortage rows)**:
- Show `total_fte_req` (negative value) bold against "Position to Open" title as "FTE Gap"
- Parse `fte_headcount_json` and show each entry:
  - Format: `{employee_type}: {fte_value} FTE × {hc}`
  - Could be 1 or more entries

**Non-nursing rows**: Expanded panel disabled (no detail shown)

#### 4. Table Row: `src/components/forecast/ForecastBalanceTableRow.tsx`

- Map `staffing_status` → status badge (shortage=orange, surplus=blue, balanced=green)
- Map `total_fte_req` → FTE Gap column
- Non-nursing rows: clicking does not expand

#### 5. KPI Cards: `src/components/forecast/ForecastKPICards.tsx`

- Compute shortage/surplus totals from grouped rows using `staffing_status` and `unaddressed_fte`
- No structural changes, just data source

#### 6. ForecastTab: `src/pages/staffing/ForecastTab.tsx`

- Update filter mapping to pass `businessUnit` instead of `facilityId` to the hook
- Skill Type filter maps to `skill_mix`
- Shift filter stays the same

### Files Modified
1. `src/hooks/useForecastBalance.ts` — full rewrite to use NestJS API
2. `src/components/forecast/BalanceTwoPanel.tsx` — new props, conditional employment_type display, API-driven right panel
3. `src/components/forecast/ForecastBalanceTableRow.tsx` — use new fields, disable expand for non-nursing
4. `src/components/forecast/ForecastBalanceTable.tsx` — minor: pass nursingFlag
5. `src/components/forecast/ForecastKPICards.tsx` — no structural change, just data mapping
6. `src/pages/staffing/ForecastTab.tsx` — filter mapping updates

### Not Changed
- No database migrations needed
- No edge functions needed
- UI layout (45/55 split, two-column left panel) stays the same

