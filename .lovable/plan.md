

## Wire Productive Resources KPIs to the new API

### Current State
The 6 Productive Resources KPI cards (Paid FTEs, Contract FTEs, Overtime FTEs, Total PRN, Total NP%, Employed Productive FTEs) in the Staffing Summary tab use hardcoded mock values (e.g., "38.2", "5.7", "2.1").

### Goal
Fetch real data from `GET /productive-resources-kpi` and populate these KPI cards with actual values.

### Plan

**1. Create `useProductiveResourcesKpi` hook** (`src/hooks/useProductiveResourcesKpi.ts`)
- Follow the same pattern as `useSkillShift` / `usePatientVolume`: sanitize API URL, attach MSAL Bearer token, handle `{ data: T[] }` response wrapper.
- Accept filters: `region`, `market`, `facility` (businessUnit), `department` (departmentId), `submarket`, `level2`, `pstat`.
- Fetch with `take=50000` to get all records. Deduplicate if needed.
- Define `ProductiveResourcesKpiRecord` interface based on API response fields (to be inferred from the view columns — likely includes fields like `paid_ftes`, `contract_ftes`, `overtime_ftes`, `prn_ftes`, `np_percent`, `employed_productive_ft_ftes`, `employed_productive_pt_ftes`, etc.).

**2. Update `StaffingSummary.tsx`**
- Import and call the new hook with the same filter set used by patient-volume/skill-shift.
- Aggregate the returned records (sum across departments/facilities as needed).
- Replace hardcoded values in the `productivityKPIs` useMemo with computed values from the API data.
- Show loading state gracefully (dash "—" while loading, same as volume KPIs).

### Technical Details

```text
New file:
  src/hooks/useProductiveResourcesKpi.ts
    - fetchProductiveResourcesKpi(filters) → GET /productive-resources-kpi?region=...&market=...&take=50000
    - useProductiveResourcesKpi(filters) → useQuery wrapper

Modified file:
  src/pages/staffing/StaffingSummary.tsx
    - Import useProductiveResourcesKpi
    - Call hook with current filters
    - Aggregate records into: paidFtes, contractFtes, overtimeFtes, totalPrn, npPercent, employedFt, employedPt
    - Wire aggregated values into productivityKPIs array (lines ~418-529)
```

### Open Question
I don't have a sample response from the `/productive-resources-kpi` endpoint to know the exact field names. I'll need to either:
- Hit the endpoint to inspect the schema, or
- Have you share a sample response or the view column names.

Should I proceed and try fetching from the live API to discover the schema, or can you share the column names from `vw_productive_resources_kpi_curated_final`?

