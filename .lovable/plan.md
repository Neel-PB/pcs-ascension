

## Replace DataRefreshButton Supabase Query with Data-Derived Dates

### Summary
Remove the Supabase dependency from `DataRefreshButton`. Instead of querying `data_refresh_log`, the component will accept a `lastUpdated` date prop derived from the data already fetched by each tab's NestJS-backed hooks.

### How It Works

Each tab already fetches data that contains timestamp fields:
- **Summary / Variance / Planning tabs** use `usePatientVolume` → `curated_data_load_ts` and `useProductiveResourcesKpi` → `load_ts`
- **Volume Settings** uses `usePatientVolume` → `curated_data_load_ts`
- **NP Settings** uses `usePatientVolume` → `curated_data_load_ts`

We take the max date from the loaded data and pass it as a simple prop.

### Changes

**1. Refactor `DataRefreshButton` (`src/components/dashboard/DataRefreshButton.tsx`)**
- Remove `supabase` import, `useQuery`, and the Supabase fetch logic
- Replace `dataSources` prop with `lastUpdated: string | null`
- Show a simple popover with the formatted date and relative time ("2 hours ago")
- Keep the status dot (green/yellow/red) based on hours since `lastUpdated`
- No network call — purely presentational

**2. Delete `DataRefreshPanel` (`src/components/dashboard/DataRefreshPanel.tsx`)**
- Dead code — not imported anywhere

**3. Update consumers to pass `lastUpdated` prop**

Each file that renders `<DataRefreshButton>` will compute the latest date from its already-fetched data:

- **`StaffingSummary.tsx`** — derive from `patientVolumeData[0]?.curated_data_load_ts`
- **`VarianceAnalysis.tsx`** — derive from `skillShiftData` (or accept as prop from parent)
- **`PositionPlanning.tsx`** — derive from skill-shift data (or accept as prop from parent)
- **`EmployeesTab.tsx`**, **`ContractorsTab.tsx`**, **`RequisitionsTab.tsx`**, **`OpenRequisitionTab.tsx`**, **`ContractorRequisitionTab.tsx`** — derive from their `usePositionsByFlag` data's latest date field

### Result
- Supabase fully removed from DataRefresh components
- No new API endpoint needed
- "Last Updated" derived from the actual data on screen — always accurate
- 1 dead file deleted, 1 component simplified, ~8 consumers updated

